

class Homework1App {
    renderingContext: FxRenderingContext;
    scenegraph: MyScenegraph;
    t0 = 0;
    t1 = 0;
    dt = 0;;
    uiUpdateTime = 0;
    rotation = 0;
    shaderProgram:null |  WebGLProgram = null;
    positionBuffer: WebGLBuffer | null = null;
    colorBuffer: WebGLBuffer | null = null;


    constructor(public width: number = 512, public height: number = 384) {
        hflog.logElement = "log";
        this.renderingContext = new FxRenderingContext(width, height, "app");
        if (!this.renderingContext) {
            throw "Unable to create rendering context.";
        }
        this.scenegraph = new MyScenegraph(this.renderingContext);
        this.scenegraph.AddRenderConfig("default",
        "shaders/gbuffer.vert",
        "shaders/gbuffer.frag");
    }

    run(): void {
        this.init();
        this.mainloop(0);
    }

    private init(): void {
        this.loadShaders();
        this.loadScenegraph();
    }

    private loadShaders(): void {
        let gl = this.renderingContext.gl;

        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying lowp vec4 vColor;
        
            void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
            }
      `;

        const fsSource = `
            varying lowp vec4 vColor;

            void main() {
                gl_FragColor = vColor;
            }
        `;


        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
        this.shaderProgram = gl.createProgram();

        if(this.shaderProgram && vertexShader && fragmentShader) {
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.shaderProgram));
        }}

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

        const positions = [
            1.0, 1,
            -1.0, 1.0,
            1, -1.0,
            1.0, -1.0,

        ];

        this.positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        var colors = [
            1.0, 1.0, 1.0, 1.0,    // white
            1.0, 0.0, 1.0, 1.0,    // red
            0.0, 1.0, 0.0, 1.0,    // green
            1.0, 0.0, 1.0, 0.0,    // blue
        ];

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        if(this.shaderProgram) {
        let vertexPositionLoc = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');

        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(vertexPositionLoc, numComponents,
            type, normalize, stride, offset);

        gl.enableVertexAttribArray(vertexPositionLoc);

        let vertexColor = gl.getAttribLocation(this.shaderProgram, 'aVertexColor');
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.vertexAttribPointer(
                vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                vertexColor);
        }
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
            self.mainloop(t);
        });
    }

    private updateUI(): void {

    }

    private update(): void {


    }

    private display(): void {
        let gl = this.renderingContext.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if(this.shaderProgram) {
        let modelViewMatrixLoc = gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix');
        let projectionMatrixLoc = gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix');

        const field = 45;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0

        const projectionMatrix = new Matrix4().PerspectiveX(field, aspect, zNear, zFar);
        const modelViewMatrix = new Matrix4().Translate(-0.0, 0.0, -6.0);

        this.rotation += this.dt * 5000;
        modelViewMatrix.Rotate(this.rotation, 0, 0, 1);

        gl.useProgram(this.shaderProgram);

        gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix.toColMajorArray());
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, modelViewMatrix.toColMajorArray());

        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_FAN, offset, vertexCount);

    }}
}