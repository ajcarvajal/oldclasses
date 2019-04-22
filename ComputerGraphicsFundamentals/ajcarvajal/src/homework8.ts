// Homework #8 PBR/NPR
/// <reference path="../library/fluxions/Fluxions.ts" />
/// <reference path="Teaching.ts"/>

class Homework8App {
    renderingContext: FxRenderingContext;
    scenegraph: MyScenegraph;
    t0 = 0;
    t1 = 0;
    dt = 0;
    gridCounter = new GridCounter(4, 1, 1);  // we have three lectures modes with 32 * 16 steps to work through
    maze = new MyTileMap();
    skyboxPath = "../assets/skybox.scn";
    skyboxName = "skybox.scn";
    sceneGraphPath = "../assets/test_shading_scene.scn"
    sceneGraphName = "test_shading_scene.scn";
    io: Teaching.Interactive;

    randomTexture = new Teaching.RandomTexture();

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
    spriteImage = new MyImage(8, 8, true);
    spriteTexture: WebGLTexture | null = null;
    spriteBuffer: WebGLBuffer | null = null;
    xhrSpriteSheetImage: HTMLImageElement | null = null;
    spriteSheetImage = new MyImage(0, 0, true);
    spriteSheetTexture: WebGLTexture | null = null;
    spriteSheetBuffer: WebGLBuffer | null = null;

    renderConfig: RenderConfig | null = null;

    keysPressed: Map<string, boolean> = new Map<string, boolean>();

    private uiUpdateTime: number = 0;
    private uiCameraAngle = 0;
    private uiCameraPitch = 0;
    private uiCameraDistance = 0;
    private uiShadowMapAlgorithm: number = 0;
    private uiShadowMapParam1: number = 0;
    private uiShadowMapParam2: number = 0;
    private uiShadowMapDistance: number = 20.0;
    private uiPBKsm: number = 0.0;
    private uiPBKdm: number = -0.99;
    private uiPBGGXgamma: number = 2;
    private uiPBirradiance: number = 0.0;
    private uiPBreflections: number = 0.0;
    private uiExposure: number = 0;
    private uiGamma: number = 1;
    private uiSunSpeed: number = 1;
    private uiMetalName: string = "";
    private uiMetalType: string = "";
    private uiMetalChanged: boolean = false;
    private uiColorSpaceType: string = "";
    private uiColorSpaceChanged: boolean = false;
    private uiColorSpaceName: string = "";
    private uiMonochromatic: boolean = false;

    constructor(public width: number = 512, public height: number = 384) {
        hflog.logElement = "log";
        width = Math.floor(document.body.clientWidth) | 0;
        height = Math.floor(width * 3.0 / 4.0) | 0;
        this.renderingContext = new FxRenderingContext(width, height, "app");
        this.width = this.renderingContext.canvas.width;
        this.height = this.renderingContext.canvas.height;
        if (!this.renderingContext) {
            throw "Unable to create rendering context.";
        }
        this.scenegraph = new MyScenegraph(this.renderingContext);

        // This loads a scenegraph
        this.scenegraph.Load(this.sceneGraphPath);
        this.scenegraph.Load(this.skyboxPath);

        this.io = new Teaching.Interactive(this.renderingContext, this.scenegraph);
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
        // this is now in the Teaching.Interactive class
    }

    public loadShaders(): void {
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
                hflog.error("Unable to initialize shader program: " + gl.getProgramInfoLog(shaderProgram));
                this.shaderProgram = null;
            }

            this.shaderProgram = shaderProgram;

            this.aVertexLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
            this.aTexCoordLocation = gl.getAttribLocation(shaderProgram, 'aTexCoord');
            this.aColorLocation = gl.getAttribLocation(shaderProgram, 'aColor');
            this.aNormalLocation = gl.getAttribLocation(shaderProgram, 'aNormalLocation');
            this.uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
            this.uCameraMatrixLocation = gl.getUniformLocation(shaderProgram, 'uCameraMatrix');
            this.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
            this.uTextureMatrix = gl.getUniformLocation(shaderProgram, 'uTextureMatrix');
            this.uTextureMapLocation = gl.getUniformLocation(shaderProgram, "uTextureMap");
            this.uRenderMode = gl.getUniformLocation(shaderProgram, "uRenderMode");

            this.io.setShader(gl, this.shaderProgram);
        }

        this.scenegraph.AddRenderConfig("skybox",
            "shaders/skybox.vert", "shaders/skybox.frag");
        this.scenegraph.AddRenderConfig("default",
            "shaders/rtr-spectral-fresnel.vert",
            "shaders/rtr-spectral-fresnel.frag");
    }

    private loadShader(type: number, source: string): null | WebGLShader {
        let gl = this.renderingContext.gl;
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            hflog.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    private loadScenegraph(): void {
        let gl = this.renderingContext.gl;

        let v0 = Vector2.make(-1.0, -1.0); // lower left
        let v1 = Vector2.make(1.0, 1.0);   // upper right
        let st0 = Vector2.make(0.0, 0.0);  // lower left
        let st1 = Vector2.make(1.0, 1.0);  // upper right
        const positionsTexCoords = [
            v0.x, v1.y, st0.x, st1.y,
            v0.x, v0.y, st0.x, st0.y,
            v1.x, v1.y, st1.x, st1.y,
            v1.x, v0.y, st1.x, st0.y
        ];

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positionsTexCoords),
            gl.STATIC_DRAW);
    }

    private createRectVertexBuffer(width: number, height: number): WebGLBuffer | null {
        let gl = this.renderingContext.gl;
        let buffer = gl.createBuffer();

        let v0 = Vector2.make(0, 0); // lower left
        let v1 = Vector2.make(width, height);   // upper right
        let st0 = Vector2.make(0.0, 0.0);  // lower left
        let st1 = Vector2.make(1.0, 1.0);  // upper right
        const positionsTexCoords = [
            v0.x, v1.y, st0.x, st1.y,
            v0.x, v0.y, st0.x, st0.y,
            v1.x, v1.y, st1.x, st1.y,
            v1.x, v0.y, st1.x, st0.y
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positionsTexCoords),
            gl.DYNAMIC_DRAW);

        return buffer;
    }

    private loadTextures(): void {
        let gl = this.renderingContext.gl;

        this.scenegraph.Load("../assets/textures/test_texture.png");
        this.scenegraph.Load("../assets/textures/bluemarble.png");

        let tmap = new ImageData(new Uint8ClampedArray([
            255, 255, 0, 255, 0, 0, 255, 255,
            0, 0, 255, 255, 255, 255, 0, 255
        ]), 2, 2);

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
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
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
        this.xhrSpriteSheetImage.addEventListener("load", (e) => {
            if (!self.xhrSpriteSheetImage) return;
            hflog.info('loaded ' + self.xhrSpriteSheetImage.src);
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
            setTimeout(() => { }, 17);
        }
        window.requestAnimationFrame((t: number) => {
            self.update();
            self.display();
            //self.displayUI();
            self.draw3DGraphics();

            self.mainloop(t);
        });
    }

    private updateUI(): void {

    }

    private checkKeys(keys: string[]): boolean {
        for (let k of keys) {
            if (this.keysPressed.get(k)) return true;
        }
        return false;
    }

    private update(): void {
        this.gridCounter.update(this.dt);
        this.randomTexture.update(this.dt);
        this.io.update(this.dt);
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
        const projectionMatrix = Matrix4.makePerspectiveY(fieldOfView, aspect, zNear, zFar);
        const rotX = Matrix4.makeRotation(this.t0 * 30.0, 1.0, 0.0, 0.0);
        const rotY = Matrix4.makeRotation(this.t0 * 30.0, 0.0, 1.0, 0.0);
        const rotZ = Matrix4.makeRotation(this.t0 * 30.0, 0.0, 0.0, 1.0);
        const translationMatrix = Matrix4.makeTranslation(0, 0, 0);
        const rotationMatrix = Matrix4.multiply3(rotX, rotY, rotZ);
        const modelViewMatrix = Matrix4.multiply(translationMatrix, rotationMatrix);
        const s = Math.sin(this.t1 / 10);
        const c = Math.cos(this.t1 / 10);
        const y = Math.cos(this.t1 / 13) * 1.5 + 0.5;
        const d = Math.cos(this.t1 / 5) + 2.5;
        const cameraPosition = Vector3.make(d * c, y, d * s);
        const cameraMatrix = Matrix4.makeLookAt(cameraPosition, Vector3.make(0, 0, 0), Vector3.make(0, 1, 0));

        // Draw Skybox
        let rc = this.scenegraph.UseRenderConfig("skybox");
        if (rc) {
            rc.depthMask = false;
            rc.useDepthTest = false;
            this.scenegraph.SetGlobalParameters(rc);
            rc.Use();
            rc.SetMatrix4f("ProjectionMatrix", Matrix4.makePerspectiveY(90.0, this.renderingContext.aspectRatio, 0.1, 100.0));
            let M = cameraMatrix.clone();
            M.m14 = 0.0; M.m24 = 0.0; M.m34 = 0.0;
            rc.SetMatrix4f("CameraMatrix", M);
            rc.SetMatrix4f("WorldMatrix", Matrix4.makeIdentity());
            this.scenegraph.RenderScene("skybox", "skybox.scn");
            rc.Restore();
        }

        rc = this.scenegraph.UseRenderConfig("default")
        if (rc) {
            this.scenegraph.SetGlobalParameters(rc);
            rc.SetMatrix4f("CameraMatrix", cameraMatrix);
            rc.SetUniform3f("CameraPosition", cameraPosition);
            rc.SetMatrix4f("ProjectionMatrix", projectionMatrix);
            rc.SetMatrix4f("WorldMatrix", Matrix4.makeIdentity());

            rc.SetUniform1f("uPBKdm", this.uiPBKdm);
            rc.SetUniform1f("uPBKsm", this.uiPBKsm);
            rc.SetUniform1f("uPBGGXgamma", this.uiPBGGXgamma);
            rc.SetUniform1f("uPBirradiance", this.uiPBirradiance);
            rc.SetUniform1f("uPBreflections", this.uiPBreflections);
            rc.SetUniform1f("uToneMapExposure", this.uiExposure);
            rc.SetUniform1f("uToneMapGamma", this.uiGamma);
            rc.SetUniform1i("ShadowMapAlgorithm", this.uiShadowMapAlgorithm);
            rc.SetUniform1i("ShadowMapParam1", this.uiShadowMapParam1);
            rc.SetUniform1i("ShadowMapParam2", this.uiShadowMapParam2);
            // rc.SetUniform3f("MoonDirTo", this.moonPhysics.dirTo);
            // rc.SetUniform3f("MoonE0", this.moonPhysics.moonE0);

            this.scenegraph.RenderScene("default", this.sceneGraphName);
        }
        else {
            switch (this.gridCounter.x) {
                case 0: this.randomTexture.use(gl);
                    break;
                case 1: gl.bindTexture(gl.TEXTURE_2D, null);
                    break;
                case 2: gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
                    break;
                default:
                    this.scenegraph.UseTexture("test_texture.png", 0);
            }

            // configure shader program
            gl.useProgram(this.shaderProgram);
            if (this.uProjectionMatrixLocation)
                gl.uniformMatrix4fv(this.uProjectionMatrixLocation, false, projectionMatrix.toColMajorArray());
            if (this.uModelViewMatrixLocation)
                gl.uniformMatrix4fv(this.uModelViewMatrixLocation, false, modelViewMatrix.toColMajorArray());
            if (this.uCameraMatrixLocation)
                gl.uniformMatrix4fv(this.uCameraMatrixLocation, false, cameraMatrix.toColMajorArray());
            // Uncomment if we want weird textures
            if (this.uTextureMatrix)
                // gl.uniformMatrix4fv(this.uTextureMatrix, false, this.randomTextureMatrix.toColMajorArray());
                gl.uniformMatrix4fv(this.uTextureMatrix, false, Matrix4.makeIdentity().toColMajorArray());
            if (this.uTextureMapLocation)
                gl.uniform1i(this.uTextureMapLocation, 0);
            if (this.uRenderMode)
                gl.uniform1i(this.uRenderMode, 1);

            // Do our original render code here
            let shape = new MyShape();
            shape.newSurface(gl.TRIANGLES);
            shape.color3(Colors.ArneCloudBlue);
            shape.texCoord(0.0, 0.0);
            shape.vertex(-1.0, -1.0, 0.0);
            shape.color3(Colors.ArneGold);
            shape.texCoord(0.5, 1.0);
            shape.vertex(0.0, 1.0, 0.0);
            shape.color3(Colors.ArneSlimeGreen);
            shape.texCoord(1.0, 0.0);
            shape.vertex(1.0, -1.0, 0.0);
            shape.draw(gl, this.aVertexLocation, this.aColorLocation, this.aTexCoordLocation, this.aNormalLocation);

            if (this.uRenderMode)
                gl.uniform1i(this.uRenderMode, 0);
        }
    }
}