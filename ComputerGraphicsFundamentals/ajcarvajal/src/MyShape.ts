/// <reference path="MyColor.ts" />

class MyShapeOutline {
    constructor(
        public type: number = 0,
        public first: number = 0,
        public count: number = 0
    ) { }
}

class MyShape {
    private currentVertex = Vector3.make(0, 0, 0);
    private currentColor = Vector3.make(1, 1, 1);
    private currentTexCoord = Vector2.make(0, 0);
    private currentNormal = Vector3.make(0, 0, 1);
    private count: number = 0;
    private vertices: number[] = [];
    private surfaces: MyShapeOutline[] = [];
    private dirty = true;
    private buffer: WebGLBuffer | null = null;
    private vOffset: number = 0;
    private cOffset: number = 4 * 3;
    private tOffset: number = 4 * 6;
    private nOffset: number = 4 * 8;
    private stride: number = 4 * 11;

    constructor() { }

    vertex(x: number, y: number, z: number) {
        this.currentVertex.x = x;
        this.currentVertex.y = y;
        this.currentVertex.z = z;
        this.emitVertex();
    }

    vertex3(xyz: Vector3) {
        this.currentVertex.x = xyz.x;
        this.currentVertex.y = xyz.y;
        this.currentVertex.z = xyz.z;
        this.emitVertex();
    }

    color(r: number, g: number, b: number) {
        this.currentColor.x = r;
        this.currentColor.y = g;
        this.currentColor.z = b;
    }

    color3(rgb: Vector3) {
        this.currentColor.copy(rgb);
    }

    texCoord(s: number, t: number) {
        this.currentTexCoord.x = s;
        this.currentTexCoord.y = t;
    }

    texCoord2(st: Vector2) {
        this.currentTexCoord.x = st.x;
        this.currentTexCoord.y = st.y;
    }

    normal(x: number, y: number, z: number) {
        this.currentNormal.reset(x, y, z);
    }

    normal3(xyz: Vector3) {
        this.currentNormal.reset(xyz.x, xyz.y, xyz.z);
    }

    // set current material library
    mtllib(name: string) {

    }

    // set current material
    usemtl(name: string) {

    }

    // create smoothing normals
    smooth() {

    }

    // create a box
    box(P0: Vector3, P1: Vector3) {

    }

    // create a sphere
    sphere(size: number, slices: number = 16, stacks: number = 8) {

    }

    // add a new index to the surface
    // negative numbers backward index into the shape vertices
    addIndex(which: number) {

    }

    clear() {
        this.vertices = [];
        this.surfaces = [];
        this.dirty = true;
    }

    newSurface(type: number) {
        let surface = new MyShapeOutline(
            type,
            this.count,
            0
        );
        this.surfaces.push(surface);
    }

    private emitVertex() {
        if (this.surfaces.length == 0) {
            return;
        }
        let last = this.surfaces.length - 1;
        let v: number[] = [
            this.currentVertex.x,
            this.currentVertex.y,
            this.currentVertex.z,
            this.currentColor.x,
            this.currentColor.y,
            this.currentColor.z,
            this.currentTexCoord.x,
            this.currentTexCoord.y,
            this.currentNormal.x,
            this.currentNormal.y,
            this.currentNormal.z
        ];
        this.vertices.push(...v);
        this.count++;
        this.surfaces[last].count++;
        this.dirty = true;
    }

    buildBuffers(gl: WebGLRenderingContext) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
        this.dirty = false;
    }

    draw(gl: WebGLRenderingContext,
        vertexIndex: number = -1,
        colorIndex: number = -1,
        texCoordIndex: number = -1,
        normalIndex: number = -1
    ) {
        if (this.dirty) this.buildBuffers(gl);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        if (vertexIndex >= 0) {
            gl.enableVertexAttribArray(vertexIndex);
            gl.vertexAttribPointer(
                vertexIndex,
                3,
                gl.FLOAT,
                false,
                this.stride,
                this.vOffset
            );
        }

        if (colorIndex >= 0) {
            gl.enableVertexAttribArray(colorIndex);
            gl.vertexAttribPointer(
                colorIndex,
                3,
                gl.FLOAT,
                false,
                this.stride,
                this.cOffset
            );
        }

        if (texCoordIndex >= 0) {
            gl.enableVertexAttribArray(texCoordIndex);
            gl.vertexAttribPointer(
                texCoordIndex,
                2,
                gl.FLOAT,
                false,
                this.stride,
                this.tOffset
            );
        }

        if (normalIndex >= 0) {
            gl.enableVertexAttribArray(normalIndex);
            gl.vertexAttribPointer(
                colorIndex,
                3,
                gl.FLOAT,
                false,
                this.stride,
                this.nOffset
            );
        }

        for (let surface of this.surfaces) {
            gl.drawArrays(surface.type, surface.first, surface.count);
        }
    }
}