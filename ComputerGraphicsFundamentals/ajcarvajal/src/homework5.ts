/// <reference path="../library/fluxions/Fluxions.ts" />
/// <reference path="Teaching.ts"/>

class Homework5App {
  renderingContext: FxRenderingContext;
  scenegraph: MyScenegraph;
  t0 = 0;
  t1 = 0;
  dt = 0;
  eyeRotation = 0;
  uiUpdateTime = 0;
  gridCounter = new GridCounter(2 * (STACKS + 1) * (SLICES + 1), 7, 1); // we have three lectures modes with 32 * 16 steps to work through
  maze = new MyTileMap();
  //cdt = new CollisionDetectionTest();
  sceneGraphPath = "../ajcarvajal/library/hw5/hw5.scn";
  sceneGraphName = "hw5.scn";
  cameraMatrix = new Matrix4();

  shaderProgram: null | WebGLProgram = null;
  aVertexLocation = -1;
  aTexCoordLocation = -1;
  aColorLocation = -1;
  aNormalLocation = -1;

  uProjectionMatrixLocation: WebGLUniformLocation | null = null;
  uCameraMatrixLocation: WebGLUniformLocation | null = null;
  uModelViewMatrixLocation: WebGLUniformLocation | null = null;
  uTextureMatrix: WebGLUniformLocation | null = null;
  uTextureMapLocation: WebGLUniformLocation | null = null;
  uRenderMode: WebGLUniformLocation | null = null;
  positionBuffer: WebGLBuffer | null = null;

  player1Texture: WebGLTexture | null = null;
  player2Texture: WebGLTexture | null = null;
  missile1Texture: WebGLTexture | null = null;
  missile2Texture: WebGLTexture | null = null;
  ballTexture: WebGLTexture | null = null;

  mySprites: MyImageArray = new MyImageArray("../assets/spritesheet.png", 8, 8);

  player1WorldMatrix = new Matrix4();
  player2WorldMatrix = new Matrix4();
  missile1WorldMatrix = new Matrix4();
  missile2WorldMatrix = new Matrix4();
  ballWorldMatrix = new Matrix4();

  whiteTexture: WebGLTexture | null = null;
  randomImage = new MyImage(64, 64, true);
  randomTexture: WebGLTexture | null = null;
  randomTextureMatrix = new Matrix4();
  spriteImage = new MyImage(8, 8, true);
  spriteTexture: WebGLTexture | null = null;
  spriteBuffer: WebGLBuffer | null = null;
  xhrSpriteSheetImage: HTMLImageElement | null = null;
  spriteSheetImage = new MyImage(0, 0, true);
  spriteSheetTexture: WebGLTexture | null = null;
  spriteSheetBuffer: WebGLBuffer | null = null;

  world2D: MyWorld2D;

  renderConfig: RenderConfig | null = null;

  keysPressed: Map<string, boolean> = new Map<string, boolean>();

  constructor(public width: number = 512, public height: number = 384) {
    hflog.logElement = "log";
    width = Math.floor(document.body.clientWidth) | 0;
    height = Math.floor((width * 3.0) / 4.0) | 0;
    this.renderingContext = new FxRenderingContext(width, height, "app");
    this.width = this.renderingContext.canvas.width;
    this.height = this.renderingContext.canvas.height;
    if (!this.renderingContext) {
      throw "Unable to create rendering context.";
    }
    this.scenegraph = new MyScenegraph(this.renderingContext);
    this.scenegraph.AddRenderConfig(
      "default",
      "shaders/gbuffer.vert",
      "shaders/gooch.frag"
    );

    this.scenegraph.Load(this.sceneGraphPath);

    this.world2D = new MyWorld2D(
      "../assets/test-tilemap.txt",
      "../assets/test-entities.txt",
      "../assets/maze-tilesheet.png",
      16,
      16
    );
    this.cameraMatrix = Matrix4.makeIdentity();
  }

  run(): void {
    this.init();
    this.mainloop(0);
  }

  private init(): void {
    this.loadInput();
    this.loadShaders();
    this.loadScenegraph();
    this.loadTextures();
  }

  private loadInput(): void {
    //
    // This function is an example on how to add a keyboard handler to the main html window
    //
    // Notice the lambda functions to handle the event
    //
    // Notice how we capture the `this` pointer by assigning it to a local variable self which
    // can be used by the lambda functions

    let self = this;
    document.onkeydown = e => {
      if (e.key == "F12") return;
      if (e.ctrlKey) return;
      e.preventDefault();
      self.keysPressed.set(e.key, true);
    };

    document.onkeyup = e => {
      if (e.key == "F12") return;
      if (e.ctrlKey) return;
      e.preventDefault();
      self.keysPressed.set(e.key, false);
    };
  }

  private loadShaders(): void {
    let gl = this.renderingContext.gl;

    const vsSource = `#version 100
        #extension GL_OES_standard_derivatives: enable
        // ABOVE IS NEW FOR LECTURE 12

        attribute vec4 aVertexPosition;
        attribute vec4 aTexCoord;
        attribute vec4 aColor;

        // NEW FOR LECTURE 12
        attribute vec3 aNormal;
        // ABOVE IS NEW FOR LECTURE 12

        varying vec2 vTexCoord;
        varying vec4 vColor;

        // NEW FOR LECTURE 12
        varying vec3 vNormal;
        varying vec3 vPosition;
        // ABOVE IS NEW FOR LECTURE 12

        uniform mat4 uModelViewMatrix;
        uniform mat4 uCameraMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uTextureMatrix;

        void main() {
            // NEW FOR LECTURE 12
            vNormal = mat3(uModelViewMatrix) * aNormal;
            vPosition = (uModelViewMatrix * aVertexPosition).xyz;
            // ABOVE IS NEW FOR LECTURE 12

            // multiply our 2 component vector with a 4x4 matrix and return resulting x, y
            vec2 temp = (uTextureMatrix * aTexCoord).xy;
            vTexCoord = vec2(temp.s, 1.0 - temp.t);
            vColor = aColor;            
            gl_Position = uProjectionMatrix * uCameraMatrix * uModelViewMatrix * aVertexPosition;
            gl_PointSize = 3.0;
        }
        `;
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);

    const fsSource = `#version 100
        #extension GL_OES_standard_derivatives: enable
        // ABOVE IS NEW FOR LECTURE 12

        precision mediump float;
        uniform sampler2D uTextureMap;
        uniform int uRenderMode;

        varying vec2 vTexCoord;
        varying vec4 vColor;

        // NEW FOR LECTURE 12
        varying vec3 vNormal;
        varying vec3 vPosition;
        // ABOVE IS NEW FOR LECTURE 12

        void main() {
            // NEW FOR LECTURE 12
            vec3 N;
            if (length(vNormal) < 0.1) {
              vec3 dp1 = dFdx(vPosition);
              vec3 dp2 = dFdy(vPosition);
              N = normalize(cross(dp1, dp2));
            }
            else {
              N = normalize(vNormal);
            }
            // ABOVE IS NEW FOR LECTURE 12

            vec4 texel = texture2D(uTextureMap, vTexCoord);
            if (texel.a < 0.1) discard;
            if (uRenderMode == 0) {
                gl_FragColor = vec4(vColor.rgb * texel.rgb, 1.0);
            }

            // NEW FOR LECTURE 12
            // Question: What is the (X * 0.5 + 0.5) CALCULATION FOR?            
            if (uRenderMode == 1) {
                vec3 Ncolored = 0.5 * N.rgb + 0.5;
                gl_FragColor = vec4(0.5 * (texel.rgb + Ncolored) * vColor.rgb, 1.0);
                //gl_FragColor = vec4(0.5 * (texel.rgb + Ncolored), 1.0); //from hw4
                //gl_FragColor = vec4(vTexCoord.st, 0.0, 1.0);
            }
            // ABOVE IS NEW FOR LECTURE 12
        }
        `;

    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    if (shaderProgram && vertexShader && fragmentShader) {
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        hflog.error(
          "Unable to initialize shader program: " +
            gl.getProgramInfoLog(shaderProgram)
        );
        this.shaderProgram = null;
      }

      this.shaderProgram = shaderProgram;

      this.aVertexLocation = gl.getAttribLocation(
        shaderProgram,
        "aVertexPosition"
      );
      this.aTexCoordLocation = gl.getAttribLocation(shaderProgram, "aTexCoord");
      this.aColorLocation = gl.getAttribLocation(shaderProgram, "aColor");
      this.aNormalLocation = gl.getAttribLocation(
        shaderProgram,
        "aNormalLocation"
      );
      this.uModelViewMatrixLocation = gl.getUniformLocation(
        shaderProgram,
        "uModelViewMatrix"
      );
      this.uCameraMatrixLocation = gl.getUniformLocation(
        shaderProgram,
        "uCameraMatrix"
      );
      this.uProjectionMatrixLocation = gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      );
      this.uTextureMatrix = gl.getUniformLocation(
        shaderProgram,
        "uTextureMatrix"
      );
      this.uTextureMapLocation = gl.getUniformLocation(
        shaderProgram,
        "uTextureMap"
      );
      this.uRenderMode = gl.getUniformLocation(shaderProgram, "uRenderMode");

      //this.cdt.setShader(gl, this.shaderProgram);
    }
  }

  private loadShader(type: number, source: string): null | WebGLShader {
    let gl = this.renderingContext.gl;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      hflog.error(
        "An error occurred compiling the shaders: " +
          gl.getShaderInfoLog(shader)
      );
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private loadScenegraph(): void {
    let gl = this.renderingContext.gl;

    let v0 = Vector2.make(-1.0, -1.0); // lower left
    let v1 = Vector2.make(1.0, 1.0); // upper right
    let st0 = Vector2.make(0.0, 0.0); // lower left
    let st1 = Vector2.make(1.0, 1.0); // upper right
    const positionsTexCoords = [
      v0.x,
      v1.y,
      st0.x,
      st1.y,
      v0.x,
      v0.y,
      st0.x,
      st0.y,
      v1.x,
      v1.y,
      st1.x,
      st1.y,
      v1.x,
      v0.y,
      st1.x,
      st0.y
    ];

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positionsTexCoords),
      gl.STATIC_DRAW
    );
  }

  private createRectVertexBuffer(
    width: number,
    height: number
  ): WebGLBuffer | null {
    let gl = this.renderingContext.gl;
    let buffer = gl.createBuffer();

    let v0 = Vector2.make(0, 0); // lower left
    let v1 = Vector2.make(width, height); // upper right
    let st0 = Vector2.make(0.0, 0.0); // lower left
    let st1 = Vector2.make(1.0, 1.0); // upper right
    const positionsTexCoords = [
      v0.x,
      v1.y,
      st0.x,
      st1.y,
      v0.x,
      v0.y,
      st0.x,
      st0.y,
      v1.x,
      v1.y,
      st1.x,
      st1.y,
      v1.x,
      v0.y,
      st1.x,
      st0.y
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positionsTexCoords),
      gl.DYNAMIC_DRAW
    );

    return buffer;
  }

  private loadTextures(): void {
    let gl = this.renderingContext.gl;

    let tmap = new ImageData(
      new Uint8ClampedArray([
        255,
        255,
        0,
        255,
        0,
        0,
        255,
        255,
        0,
        0,
        255,
        255,
        255,
        255,
        0,
        255
      ]),
      2,
      2
    );

    let texture = gl.createTexture();
    if (texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tmap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    this.whiteTexture = gl.createTexture();
    if (this.whiteTexture) {
      gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1)
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    // BEGIN XHR CODE
    // Task: Load image asynchronously to load sprite sheet
    // Problems to solve
    // * Image data cannot be directly read
    // * Image may not load
    // * Image is loaded asynchronously
    let self = this;
    this.xhrSpriteSheetImage = new Image();
    this.xhrSpriteSheetImage.addEventListener("load", e => {
      if (!self.xhrSpriteSheetImage) return;
      hflog.info("loaded " + self.xhrSpriteSheetImage.src);
      // Step 1: Copy the image data out
      // we have to create a canvas with a '2d' context
      // then we draw our image into the canvas
      // then we copy the image data out
      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");
      if (!context) return;
      let img = self.xhrSpriteSheetImage;
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      let data = context.getImageData(0, 0, img.width, img.height);

      // Step 2: the entire image into our MyImage class
      self.spriteSheetImage = new MyImage(img.width, img.height);
      for (let i = 0; i < data.data.length; i++) {
        self.spriteSheetImage.pixels[i] = data.data[i];
      }

      // Step 3: create the texture
      self.spriteSheetTexture = self.spriteSheetImage.createTexture(gl);
    });
    this.xhrSpriteSheetImage.src = "../assets/spritesheet.png";

    // END XHR CODE
  }

  private mainloop(timestamp: number): void {
    let self = this;
    this.t0 = this.t1;
    this.t1 = timestamp / 1000.0;
    this.dt = this.t1 - this.t0;
    if (timestamp - this.uiUpdateTime > 50) {
      this.uiUpdateTime = timestamp;
      this.updateUI();
    }
    if (this.dt < 1.0 / 30) {
      setTimeout(() => {}, 17);
    }
    window.requestAnimationFrame((t: number) => {
      self.update();
      self.display();
      //self.displayUI();
      self.draw3DGraphics();

      self.mainloop(t);
    });
  }

  private updateUI(): void {}

  private update(): void {
    this.gridCounter.update(((SLICES * STACKS) / 5) * this.dt);
    //this.cdt.update(this.dt);

    // This is where we would handle user input
    let dx = 0;
    let headTurn = 0;
    let jawDown = 0;
    const speed = 1;

    let eyes = this.scenegraph.GetNode(this.sceneGraphName, "eye");
    let jaw = this.scenegraph.GetNode(this.sceneGraphName, "jaw");
    let head = this.scenegraph.GetNode(this.sceneGraphName, "skull");

    if (this.keysPressed.get("a") || this.keysPressed.get("ArrowLeft")) {
      dx -= 10.0;
    }
    if (this.keysPressed.get("d") || this.keysPressed.get("ArrowRight")) {
      dx += 10.0;
    }
    if (this.keysPressed.get("s") || this.keysPressed.get("ArrowDown")) {
      jawDown = -1.0;
    }

    if (jaw) {
      jaw.posttransform.LoadIdentity();
      jaw.posttransform.Translate(0, jawDown, 0);
    }

    if (eyes) {
      eyes.posttransform.LoadIdentity();
      eyes.posttransform.Rotate(dx, 0, 1, 0);
    }

    for (let i = 0; i < 10; i++) {
      const x = Math.random() * (this.randomImage.width - 1);
      const y = Math.random() * (this.randomImage.height - 1);
      const color = new MyColor(
        (Math.random() * 255) | 0,
        (Math.random() * 255) | 0,
        (Math.random() * 255) | 0,
        255
      );
      this.randomImage.setPixel(x | 0, y | 0, color);
    }
    this.randomTextureMatrix.Rotate(this.dt * 20.0, 0.0, 0.0, 1.0);

    // Try some collision detection here
  }

  private display(): void {
    let gl = this.renderingContext.gl;
    let sine = Math.sin(this.t1);
    gl.clearColor(sine * 0.3, sine * 0.1, sine * 0.2, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  private draw3DGraphics() {
    let gl = this.renderingContext.gl;

    const fieldOfView = 45;
    const aspect = this.renderingContext.aspectRatio;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = Matrix4.makePerspectiveY(
      fieldOfView,
      aspect,
      zNear,
      zFar
    );
    const rotX = Matrix4.makeRotation(this.t0 * 30.0, 1.0, 0.0, 0.0);
    const rotY = Matrix4.makeRotation(this.t0 * 30.0, 0.0, 1.0, 0.0);
    const rotZ = Matrix4.makeRotation(this.t0 * 30.0, 0.0, 0.0, 1.0);
    const translationMatrix = Matrix4.makeTranslation(0, 0, -10);
    const rotationMatrix = Matrix4.multiply3(rotX, rotY, rotZ);
    const modelViewMatrix = Matrix4.multiply(translationMatrix, rotationMatrix);
    const s = Math.sin(this.t1 / 10);
    const c = Math.cos(this.t1 / 10);
    const cameraMatrix = Matrix4.makeLookAt(
      Vector3.make(4 * c, 3, 4 * s),
      Vector3.make(0, 0, 0),
      Vector3.make(0, 1, )
    );

    let rc = this.scenegraph.UseRenderConfig("default");
    if (rc) {
      this.scenegraph.SetGlobalParameters(rc);
      rc.SetMatrix4f("CameraMatrix", this.cameraMatrix);
      rc.SetMatrix4f("ProjectionMatrix", projectionMatrix);
      rc.SetMatrix4f("WorldMatrix", Matrix4.makeIdentity());

      /*
      let node = this.scenegraph.GetNode(this.sceneGraphName, "skull");
      if (node) {
        node.posttransform.LoadIdentity();
        node.posttransform.Rotate(this.t1 * 30, 0, 1, 0);
      } */

      this.scenegraph.RenderScene("default", this.sceneGraphName);
    } else {
      this.randomTexture = this.randomImage.createTexture(
        gl,
        MyImageRepeatMode.MIRRORED_REPEAT,
        MyImageFilterMode.NEAREST
      );
      if (this.randomTexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.randomTexture);
      }

      //this.scenegraph.UseTexture("test_texture.png", 0);
      gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);

      // configure shader program
      gl.useProgram(this.shaderProgram);
      if (this.uProjectionMatrixLocation)
        gl.uniformMatrix4fv(
          this.uProjectionMatrixLocation,
          false,
          projectionMatrix.toColMajorArray()
        );
      if (this.uModelViewMatrixLocation)
        gl.uniformMatrix4fv(
          this.uModelViewMatrixLocation,
          false,
          modelViewMatrix.toColMajorArray()
        );
      if (this.uCameraMatrixLocation)
        gl.uniformMatrix4fv(
          this.uCameraMatrixLocation,
          false,
          cameraMatrix.toColMajorArray()
        );
      // Uncomment if we want weird textures
      if (this.uTextureMatrix)
        // gl.uniformMatrix4fv(this.uTextureMatrix, false, this.randomTextureMatrix.toColMajorArray());
        gl.uniformMatrix4fv(
          this.uTextureMatrix,
          false,
          Matrix4.makeIdentity().toColMajorArray()
        );
      if (this.uTextureMapLocation) gl.uniform1i(this.uTextureMapLocation, 0);
      if (this.uRenderMode) gl.uniform1i(this.uRenderMode, 1);

      // Do our original render code here
      //this.cdt.draw(gl);

      if (this.uRenderMode) gl.uniform1i(this.uRenderMode, 0);
    }
  }
}
