class Homework2App {
    renderingContext: FxRenderingContext;
    scenegraph: Scenegraph;
    t0 = 0;
    t1 = 0;
    dt = 0;
    uiUpdateTime = 0;
    shaderProgram: null | WebGLProgram = null;
    aVertexPosition = -1;
    uProjectionMatrixLocation: WebGLUniformLocation | null = null;
    uModelViewMatrixLocation: WebGLUniformLocation | null = null;
    uTextureMapLoc: WebGLUniformLocation | null = null;
    positionBuffer: WebGLBuffer | null = null;

    objects: any = [];
    rotateAngle = 0;
    paused = false;

    player1Texture: WebGLTexture | null = null;
    player2Texture: WebGLTexture | null = null;
    missile1Texture: WebGLTexture | null = null;
    missile2Texture: WebGLTexture | null = null;
    ballTexture: WebGLTexture | null = null;

    player1WorldMatrix = new Matrix4();
    player2WorldMatrix = new Matrix4();
    missile1WorldMatrix = new Matrix4();
    missile2WorldMatrix = new Matrix4();
    ballWorldMatrix = new Matrix4();

    keysPressed: Map<string, boolean> = new Map<string, boolean>();

    constructor(public width: number = 512, public height: number = 384) {
        hflog.logElement = "log";
        width = Math.floor(document.body.clientWidth) | 0;
        height = Math.floor(width * 3.0 / 4.0) | 0;
        this.renderingContext = new FxRenderingContext(width, height, "app");
        if (!this.renderingContext) {
            throw "Unable to create rendering context.";
        }
        this.scenegraph = new Scenegraph(this.renderingContext);
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
            e.preventDefault();
            self.keysPressed.set(e.key, true);
        };

        document.onkeyup = (e) => {
            e.preventDefault();
            self.keysPressed.set(e.key, false);
        };
    }

    private loadShaders(): void {
        let gl = this.renderingContext.gl;

        const vsSource = `
        attribute vec4 aVertexPosition;

        varying vec2 uv;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 u_rotateMatrix;

        void main() {
            uv = aVertexPosition.xy;
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition * u_rotateMatrix;

        }
        `;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fsSource = `
        precision mediump float;
        uniform sampler2D tmap;

        varying vec2 uv;

        void main() {
            //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            gl_FragColor = vec4(texture2D(tmap, uv).rgb, 1.0);
        }
        `;

        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        if(shaderProgram && vertexShader && fragmentShader) {
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            hflog.error("Unable to initialize shader program: " + gl.getProgramInfoLog(shaderProgram));
            this.shaderProgram = null;
        }

        this.shaderProgram = shaderProgram;

        this.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
        this.uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
        this.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
        this.uTextureMapLoc = gl.getUniformLocation(shaderProgram, "tmap");
    }}

    private loadShader(type: number, source: string): null | WebGLShader {
        let gl = this.renderingContext.gl;
        const shader = gl.createShader(type);
        if(!shader) return null;
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
        this.positionBuffer = gl.createBuffer();

        const positions = [
            -1.0, 1.0,
            1.0, 1.0,
            -1.0, -1.0,
            1.0, -0.0,
            1, 1,
            -1, 1
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);


        //////////////////make non player objects/////////////////////////////
        for (var k = 0; k < 20; ++k) {
            this.objects.push({
                positions: [
                    0,2,
                    -1,-1,
                    1,-1,
                    1, 1,
                    0, -1
                ],
                positionBuffer: gl.createBuffer(),
                objectMatrix: Matrix4.makeTranslation(0,0, -10.0)
                
            });
            gl.bindBuffer(gl.ARRAY_BUFFER, this.objects[k].positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.objects[k].positions), gl.STATIC_DRAW);
        }
        ///////////////////////////////////////////////////////////////////////
    }

    private loadTextures(): void {
        let gl = this.renderingContext.gl;
        let tmap = new ImageData(new Uint8ClampedArray([
            150, 50, 200,25, 100, 125,50, 50,
        ]), 1, 2);
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if (texture) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tmap);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        }
    }

    /////////////////////////////////////////////////////////////
    //main loop functions
    ////////////////////////////////////////////////////////////
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
            self.mainloop(t);
        });
    }

    private updateUI(): void {

    }

    private update(): void {
        // This is where we would handle user input
        let dx = 0;
        let dy = 0;
        const speed = 1;
        if (this.keysPressed.get("a") || this.keysPressed.get("ArrowLeft")) {
            dx -= 1.0;
        }
        if (this.keysPressed.get("d") || this.keysPressed.get("ArrowRight")) {
            dx += 1.0;
        }
        if (this.keysPressed.get("w") || this.keysPressed.get("ArrowUp")) {
            dy += 1.0;
        }
        if (this.keysPressed.get("s") || this.keysPressed.get("ArrowDown")) {
            dy -= 1.0;
        }
        if (this.keysPressed.get("r") || this.keysPressed.get("R")) {
            this.player1WorldMatrix.LoadIdentity();
        }
        if (this.keysPressed.get("p") || this.keysPressed.get("Space")) {
            this.paused = !this.paused;
        }
        this.player1WorldMatrix.Translate(dx * speed * this.dt, dy * speed * this.dt, 0.0);
    }

    private display(): void {
        this.uiUpdateTime *= 0.005;
        let gl = this.renderingContext.gl;
        gl.clearColor(0.0, 0.0, 0.0, 0.90);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfView = 45;// * Math.PI / 180;
        const aspect = this.renderingContext.aspectRatio;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = Matrix4.makePerspectiveY(fieldOfView, aspect, zNear, zFar);
        const playerMVM = Matrix4.makeTranslation(0.0, -1.0, -9.0).MultMatrix(this.player1WorldMatrix);

        // set up vertex array
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.vertexAttribPointer(this.aVertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                this.aVertexPosition
            );
        }
        gl.useProgram(this.shaderProgram);
        gl.uniformMatrix4fv(this.uProjectionMatrixLocation, false, projectionMatrix.toColMajorArray());
        gl.uniformMatrix4fv(this.uModelViewMatrixLocation, false, playerMVM.toColMajorArray());
        gl.uniform1i(this.uTextureMapLoc, 0);

        {
            let offset = 0;
            let vertexCount = 6;
            gl.drawArrays(gl.TRIANGLE_FAN, offset, vertexCount);

        }

        ///////////////////draw other objects//////////////////////////////////////
        for (var j in this.objects) {
            {
                const numComponents = 2;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, this.objects[j].positionBuffer);
                gl.vertexAttribPointer(this.aVertexPosition,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    this.aVertexPosition
                );
            }
            gl.useProgram(this.shaderProgram);
            gl.uniformMatrix4fv(this.uProjectionMatrixLocation, false, projectionMatrix.toColMajorArray());
            gl.uniformMatrix4fv(this.uModelViewMatrixLocation, false, this.objects[j].objectMatrix.toColMajorArray());
            
            if(!this.paused) {
            var angle = Math.PI * this.rotateAngle / 180;
            var rotateMatrix = new Float32Array([
                       Math.cos(angle), Math.sin(angle), 0.0, 0.0,
                       -Math.sin(angle), Math.cos(angle), 0.0, 0.0,
                       0.0, 0.0, 1.0, 0.0,
                       0.0, 0.0, 0.0, 1.0
                    ]);
            this.rotateAngle += 11;
            if(this.shaderProgram) {
            var u_rotateMatrix = gl.getUniformLocation(this.shaderProgram, 'u_rotateMatrix');
            gl.uniformMatrix4fv(u_rotateMatrix, false, rotateMatrix);
                }
            {
                let offset = 0;
                let vertexCount = 4;
                gl.drawArrays(gl.TRIANGLE_FAN, offset, vertexCount);

            }
            ///////////////////////////////////////////////////////////////////////
        }}
    }

}