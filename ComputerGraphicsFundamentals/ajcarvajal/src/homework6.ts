/* 
Homework #6 Scenegraphs, Animation, & State Machines  

The following deliverables:

(2 pt) Screenshot and working program

(2 pt) Pick two of the following (three if you are a grad student) and implement. Write a short description of how your program uses the following technologies.
            Keyframe animation
            Camera on a path
            Scenegraph
            Skeletal animation (your choice of morph target, hierarchical, matrix palette skinning, etc)
            Finite State Machine or Pushdown Automata inspired state machine

(1 pt) Choose a theme. Write an introduction to your program explaining how you applied the theme.
            Ancient Technology
            Exploration
            Historical
            Discovery
*/

/// <reference path="../library/fluxions/Fluxions.ts" />
/// <reference path="Teaching.ts"/>

class Homework6App {
    renderingContext: FxRenderingContext;
    scenegraph: MyScenegraph;
    t0 = 0;
    t1 = 0;
    dt = 0;
    uiUpdateTime = 0;
    animateTime = -5;
    janimateTime = -5;
    imlazy = 0;
    gridCounter = new GridCounter(2 * (STACKS + 1) * (SLICES + 1), 7, 1);  // we have three lectures modes with 32 * 16 steps to work through
    sceneGraphPath = "../ajcarvajal/library/hw6/hw6.scn"
    sceneGraphName = "hw6.scn";

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

    whiteTexture: WebGLTexture | null = null;
    renderConfig: RenderConfig | null = null;
    keysPressed: Map<string, boolean> = new Map<string, boolean>();

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
        this.scenegraph.AddRenderConfig("default",
            "shaders/gbuffer.vert",
            "shaders/gooch.frag");

        this.scenegraph.Load(this.sceneGraphPath);
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
        document.onkeydown = (e) => {
            if (e.key == "F12") return;
            if (e.ctrlKey) return;
            e.preventDefault();
            self.keysPressed.set(e.key, true);
        };

        document.onkeyup = (e) => {
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
        }
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
        this.gridCounter.update(SLICES * STACKS / 5 * this.dt);

        let wasdX = 0.0;
        let wasdY = 0.0;
        if (this.checkKeys(["a", "A"])) wasdX -= 1.0;
        if (this.checkKeys(["d", "D"])) wasdX += 1.0;
        if (this.checkKeys(["w", "W"])) wasdY -= 1.0;
        if (this.checkKeys(["s", "S"])) wasdY += 1.0;


        let skullNode = this.scenegraph.GetNode("", "skull");
        let eyeNode = this.scenegraph.GetNode("", "eye");
        let jawNode = this.scenegraph.GetNode("", "jaw");

        if (skullNode && jawNode && eyeNode) {     
            eyeNode.parent = "skull";
            jawNode.parent = "skull";

            skullNode.posttransform.Rotate(wasdY*1.5,1,0,0);
            skullNode.posttransform.Rotate(wasdX*1.5,0,1,0);

            eyeNode.transform.LoadIdentity();
            eyeNode.transform.Translate(0,0.5,1);
            eyeNode.transform.Rotate(2,0,0,1);

            jawNode.posttransform.LoadIdentity();
            jawNode.posttransform.Translate(0,0,14)

            //chomp animation
        {
            var duration = 2;
            if(this.checkKeys(["q","Q"])) {
                this.janimateTime = this.t0;
                this.imlazy = 0;
            }
            if(this.t1 - this.janimateTime  < duration) {
                this.imlazy+=0.01
                jawNode.posttransform.Rotate(Math.sin(this.imlazy*45) * 20,1,0,0);
                jawNode.posttransform.Translate(0,-0.35,0);
            } else jawNode.pretransform.LoadIdentity();

        }
            //eyeroll anymation
        {
            var duration = 2;
            if(this.checkKeys(["e","E"])) {
                
                this.animateTime = this.t0;
            }
            if(this.t1 - this.animateTime  < duration) {
                eyeNode.transform.Rotate(Math.sin(this.t0*3)*25,1,0,0);
            } else eyeNode.pretransform.LoadIdentity();
        }

            this.scenegraph.UpdateChildTransforms("");
        }
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
        const s = 9//Math.sin(this.t1 / 10);
        const c = 9//Math.cos(this.t1 / 10);
        const d = 0.2;
        const cameraMatrix = Matrix4.makeLookAt(Vector3.make(d * c, d * .67, d * s), Vector3.make(0, 0, 0), Vector3.make(0, 1, 0));
        cameraMatrix.Rotate(45,0,1,0);
        // RENDER TO TEXTURE EXAMPLE //
        {
            let rc = this.scenegraph.UseRenderConfig("default")
            if (rc) {
                rc.usesFBO = true;
                this.scenegraph.gbufferFBO.use();
                this.scenegraph.SetGlobalParameters(rc);
                rc.SetMatrix4f("CameraMatrix", cameraMatrix);
                rc.SetMatrix4f("ProjectionMatrix", projectionMatrix);
                rc.SetMatrix4f("WorldMatrix", Matrix4.makeIdentity());

                this.scenegraph.RenderScene("default", "");
                this.scenegraph.gbufferFBO.restore();
                rc.usesFBO = false;
                this.scenegraph.SetGlobalParameters(rc);
            }
        }

        let rc = this.scenegraph.UseRenderConfig("default")
        if (rc) {
            this.scenegraph.SetGlobalParameters(rc);
            rc.SetMatrix4f("CameraMatrix", cameraMatrix);
            rc.SetMatrix4f("ProjectionMatrix", projectionMatrix);
            rc.SetMatrix4f("WorldMatrix", Matrix4.makeIdentity());

            this.scenegraph.RenderScene("default", "");
        }
        else {
            gl.useProgram(this.shaderProgram);
            this.scenegraph.UseTexture("test_texture.png", 0);

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
                gl.uniform1i(this.uTextureMapLocation, 13);
            if (this.uRenderMode)
                gl.uniform1i(this.uRenderMode, 1);

            // Do our original render code here
            // This is the 3D Transformations one
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