/*function MyBezier(t: number,
    P0: Vector3,
    P1: Vector3,
    P2: Vector3,
    P3: Vector3): Vector3 {
    let one_minus_t = 1.0 - t;
    let one_minus_t_squared = one_minus_t * one_minus_t;
    let J3_0 = one_minus_t * one_minus_t_squared;
    let J3_1 = 3 * t * one_minus_t_squared;
    let J3_2 = 3 * t * t * one_minus_t;
    let J3_3 = t * t * t;
    return Vector3.make(
        P0.x * J3_0 + P1.x * J3_1 + P2.x * J3_2 + P3.x * J3_3,
        P0.y * J3_0 + P1.y * J3_1 + P2.y * J3_2 + P3.y * J3_3,
        P0.z * J3_0 + P1.z * J3_1 + P2.z * J3_2 + P3.z * J3_3
    ); 
} */

class Homework3App {
  renderingContext: FxRenderingContext;
  scenegraph: Scenegraph;
  t0 = 0;
  t1 = 0;
  dt = 0;
  uiUpdateTime = 0;

  shaderProgram: null | WebGLProgram = null;
  aVertexLocation = -1;
  aTexCoordLocation = -1;
  aColorLocation = -1;
  uProjectionMatrixLocation: WebGLUniformLocation | null = null;
  uModelViewMatrixLocation: WebGLUniformLocation | null = null;
  uTextureMatrix: WebGLUniformLocation | null = null;
  uTextureMapLocation: WebGLUniformLocation | null = null;
  positionBuffer: WebGLBuffer | null = null;
  aScaleLocation = -1;

  skeleIdle: MyImageArray = new MyImageArray(
    "../ajcarvajal/library/skele_idle.png",
    32,
    32
  );
  skeleJump: MyImageArray = new MyImageArray(
    "../ajcarvajal/library/skele_jump.png",
    32,
    32
  );
  skeleDie: MyImageArray = new MyImageArray(
    "../ajcarvajal/library/skele_die.png",
    32,
    32
  );
  skeleRunRight: MyImageArray = new MyImageArray(
    "../ajcarvajal/library/skele_runright.png",
    32,
    32
  );
  skeleRunLeft: MyImageArray = new MyImageArray(
    "../ajcarvajal/library/skele_runleft.png",
    32,
    32
  );
  skeleWaveRight: MyImageArray = new MyImageArray(
    "../ajcarvajal/library/skele_waveright.png",
    32,
    32
  );
  skeleWaveLeft: MyImageArray = new MyImageArray(
    "../ajcarvajal/library/skele_waveleft.png",
    32,
    32
  );
  skeleAnimations: MyImageArray[] = [
    this.skeleIdle,
    this.skeleJump,
    this.skeleDie,
    this.skeleRunRight,
    this.skeleRunLeft,
    this.skeleWaveRight,
    this.skeleWaveLeft
  ];
  currentAnimation = 0;

  danceSlider: any;
  sizeSlider: any;

  player1WorldMatrix = new Matrix4();
  player2WorldMatrix = new Matrix4();

  whiteTexture: WebGLTexture | null = null;
  spriteImage = new MyImage(32, 32, true);
  spriteTexture: WebGLTexture | null = null;
  spriteBuffer: WebGLBuffer | null = null;
  xhrSpriteSheetImage: HTMLImageElement | null = null;
  spriteSheetImage = new MyImage(0, 0, true);
  spriteSheetTexture: WebGLTexture | null = null;
  spriteSheetBuffer: WebGLBuffer | null = null;

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
    this.scenegraph = new Scenegraph(this.renderingContext);

    this.danceSlider = document.getElementById("danceSlider");
    this.sizeSlider = document.getElementById("sizeSlider");
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
      e.preventDefault();
      self.keysPressed.set(e.key, true);
    };

    document.onkeyup = e => {
      e.preventDefault();
      self.keysPressed.set(e.key, false);
      this.currentAnimation = 0;
    };
  }

  private loadShaders(): void {
    let gl = this.renderingContext.gl;

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aTexCoord;
        attribute vec4 aColor;
        attribute vec4 u_scale;

        varying vec2 vTexCoord;
        varying vec4 vColor;
        

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uTextureMatrix;

        void main() {
            // multiply our 2 component vector with a 4x4 matrix and return resulting x, y
            vTexCoord = (uTextureMatrix * aTexCoord).xy;
            vColor = aColor;
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition * u_scale;
        }
        `;
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);

    const fsSource = `
        precision mediump float;
        uniform sampler2D uTextureMap;

        varying vec2 vTexCoord;
        varying vec4 vColor;

        void main() {
            vec4 texel = texture2D(uTextureMap, vTexCoord);
            if (texel.a < 0.1) discard;
            gl_FragColor = vec4(vColor.rgb * texel.rgb, 1.0);
        }
        `;

    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    if(shaderProgram && vertexShader && fragmentShader) {
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
    this.uModelViewMatrixLocation = gl.getUniformLocation(
      shaderProgram,
      "uModelViewMatrix"
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
    this.aScaleLocation = gl.getAttribLocation(shaderProgram, "u_scale");
  }}

  private loadShader(type: number, source: string): null | WebGLShader {
    let gl = this.renderingContext.gl;
    const shader = gl.createShader(type);
    if(!shader) return null;
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

    this.player1WorldMatrix.Translate(130, 100, 0);

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
    this.xhrSpriteSheetImage.src = "../ajcarvajal/library/skeleton_tilemap.png";

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
      self.drawSpriteGraphics();
      self.mainloop(t);
    });
  }

  private updateUI(): void {}

  private update(): void {
    // This is where we would handle user input
    let dx = 0;
    let dy = 0;
    const speed = 8;
    if (this.keysPressed.get("a") || this.keysPressed.get("ArrowLeft")) {
      dx -= 2.0;
      this.currentAnimation = 4;
    }
    if (this.keysPressed.get("d") || this.keysPressed.get("ArrowRight")) {
      dx += 2.0;
      this.currentAnimation = 3;
    }
    if (this.keysPressed.get("w")) {
      this.currentAnimation = 1;
    }
    if (this.keysPressed.get("e")) {
      this.currentAnimation = 5;
    }
    if (this.keysPressed.get("q")) {
      this.currentAnimation = 6;
    }

    this.player1WorldMatrix.Translate(
      dx * speed * this.dt,
      dy * speed * this.dt,
      0.0
    );
  }

  private drawVertexArrayTStrip(vertexBuffer: WebGLBuffer) {
    let gl = this.renderingContext.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 16;
    const positionOffset = 0;
    const texCoordOffset = 8;
    if (this.aVertexLocation >= 0) {
      gl.vertexAttribPointer(
        this.aVertexLocation,
        numComponents,
        type,
        normalize,
        stride,
        positionOffset
      );
      gl.enableVertexAttribArray(this.aVertexLocation);
    }
    if (this.aColorLocation >= 0) {
      gl.vertexAttrib4f(this.aColorLocation, 1.0, 1.0, 1.0, 1.0);
      gl.disableVertexAttribArray(this.aColorLocation);
    }
    if (this.aTexCoordLocation >= 0) {
      gl.vertexAttribPointer(
        this.aTexCoordLocation,
        numComponents,
        type,
        normalize,
        stride,
        texCoordOffset
      );
      gl.enableVertexAttribArray(this.aTexCoordLocation);
    }
    gl.vertexAttrib4f(
      this.aScaleLocation,
      this.sizeSlider.value / 5,
      this.sizeSlider.value / 5,
      1,
      1
    );

    let offset = 0;
    let vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }

  private display(): void {
    let gl = this.renderingContext.gl;
    let sine = Math.sin(this.t1 * 2);
    let red = 0.1;
    let green = 0.0;
    let blue = 0.2;
    gl.clearColor(sine * red, sine * green, sine * blue, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  private drawSpriteGraphics() {
    let gl = this.renderingContext.gl;

    // Don't try to run this function if we do not have a sprite sheet
    if (!this.spriteSheetTexture) return;

    const projectionMatrix = Matrix4.makeOrtho2D(
      0,
      this.renderingContext.width,
      this.renderingContext.height,
      0
    );
    const modelViewMatrix = Matrix4.makeTranslation(50, 50, 0);
    const textureMatrix = Matrix4.makeIdentity();

    //projectionMatrix.Scale(this.sizeSlider.value / 4,this.sizeSlider.value / 4,0);

    if (!this.spriteSheetBuffer)
      this.spriteSheetBuffer = this.createRectVertexBuffer(
        2 * this.spriteSheetImage.width,
        2 * this.spriteSheetImage.height
      );
    gl.bindTexture(gl.TEXTURE_2D, this.spriteSheetTexture);

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
    if (this.uTextureMatrix)
      gl.uniformMatrix4fv(
        this.uTextureMatrix,
        false,
        textureMatrix.toColMajorArray()
      );
    if (this.uTextureMapLocation) gl.uniform1i(this.uTextureMapLocation, 0);
    if (this.spriteSheetBuffer) {
      //this.drawVertexArrayTStrip(this.spriteSheetBuffer);
    }

    this.spriteTexture = this.spriteImage.createTexture(gl);

    if (!this.spriteBuffer)
      this.spriteBuffer = this.createRectVertexBuffer(
        4 * this.spriteImage.width,
        4 * this.spriteImage.height
      );

    this.playAnimation(this.currentAnimation);

    if (this.uModelViewMatrixLocation)
      gl.uniformMatrix4fv(
        this.uModelViewMatrixLocation,
        false,
        this.player1WorldMatrix.toColMajorArray()
      );
    if (this.spriteBuffer) {
      this.drawVertexArrayTStrip(this.spriteBuffer);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(null);
  }

  private playAnimation(animIndex: number) {
    let gl = this.renderingContext.gl;
    let anim = this.skeleAnimations[animIndex];
    if (anim.loaded) {
      let index =
        ((this.t0 * this.danceSlider.value) | 0) % anim.textures.length;
      anim.useTexture(gl, index);
    }
  }
}
