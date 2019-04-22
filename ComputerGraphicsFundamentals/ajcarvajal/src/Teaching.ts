/// <reference path="../library/fluxions/Fluxions.ts" />
/// <reference path="../library/gte/GTE.ts" />
/// <reference path="MyShape.ts" />

const SLICES = 64;
const STACKS = 32;

enum MazeDir {
    None = 0,
    North = 1,
    East = 2,
    NorthEast = 3,
    South = 4,
    NorthSouth = 5,
    EastSouth = 6,
    NorthEastSouth = 7,
    West = 8,
    NorthWest = 9,
    EastWest = 10,
    NorthEastWest = 11,
    SouthWest = 12,
    NorthSouthWest = 13,
    EastSouthWest = 14,
    NorthEastSouthWest = 15,
    All = 15
}

function MyBezier(t: number,
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
}

function MyBezierSurface(u: number, v: number, size: number, P: Matrix4): Vector3 {
    let out = Vector3.make(-1.5 * size, 0, -1.5 * size);
    let nCk = [1, 3, 3, 1];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let b_i = nCk[i] * Math.pow((1 - u), i) * Math.pow(u, 3 - i);
            let b_j = nCk[j] * Math.pow((1 - v), j) * Math.pow(v, 3 - j);
            out.x += b_i * b_j * i * size;
            out.y += b_i * b_j * P.at(j, i);
            out.z += b_i * b_j * j * size;
        }
    }

    return out;
}

function sqC(x: number, roundness: number): number {
    let y = Math.cos(x);
    return Math.sign(y) * Math.pow(Math.abs(y), roundness);
}

function sqS(x: number, roundness: number): number {
    let y = Math.sin(x);
    return Math.sign(y) * Math.pow(Math.abs(y), roundness);
}

function sqCT(x: number, roundness: number, alpha: number): number {
    return alpha + sqC(x, roundness);
}

function sqST(x: number, roundness: number, alpha: number): number {
    return alpha + sqS(x, roundness);
}

function sqNormal(u: number, v: number, n: number, e: number): Vector3 {
    return Vector3.make(
        sqC(v, n) * sqC(u, e),
        sqS(v, n),
        sqC(v, n) * sqS(u, e)
    ).normalize();
}


function sqEllipsoid(u: number, v: number, n: number, e: number, sx: number, sy: number, sz: number): Vector3 {
    return Vector3.make(
        sx * sqC(v, n) * sqC(u, e),
        sz * sqS(v, n),
        sy * sqC(v, n) * sqS(u, e)
    );
}

function sqToroid(u: number, v: number, n: number, e: number, alpha: number, sx: number, sy: number, sz: number): Vector3 {
    return Vector3.make(
        sx * sqCT(v, n, alpha) * sqC(u, e),
        sz * sqS(v, n),
        sy * sqCT(v, n, alpha) * sqS(u, e)
    );
}

function drawYAxis(gl: WebGLRenderingContext, shape: MyShape, size: number) {
    shape.newSurface(gl.LINE_STRIP);

    shape.color(0, 1, 0);
    shape.vertex(0, -size, 0);
    shape.color(1, 1, 1);
    shape.vertex(0, 0, 0);
    shape.color(1, 0, 1);
    shape.vertex(0, size, 0);
    shape.color(1, 1, 1);
}

function drawShape(gl: WebGLRenderingContext, surfaceType: number, shape: MyShape, xyz1: Vector3, xyz2: Vector3, xyz3: Vector3, xyz4: Vector3) {
    if (surfaceType == gl.LINE_STRIP || surfaceType == gl.POINTS) {
        shape.vertex3(xyz1);
    } else if (surfaceType == gl.LINES) {
        shape.vertex3(xyz1);
        shape.vertex3(xyz2);
        shape.vertex3(xyz2);
        shape.vertex3(xyz3);
        shape.vertex3(xyz3);
        shape.vertex3(xyz4);
        shape.vertex3(xyz1);
        shape.vertex3(xyz4);
        shape.vertex3(xyz1);
        shape.vertex3(xyz3);
    } else {
        shape.vertex3(xyz1);
        shape.vertex3(xyz2);
        shape.vertex3(xyz3);
        shape.vertex3(xyz1);
        shape.vertex3(xyz3);
        shape.vertex3(xyz4);
    }
}

function drawShapeUV(gl: WebGLRenderingContext, surfaceType: number, shape: MyShape, xyz1: Vector3, xyz2: Vector3, xyz3: Vector3, xyz4: Vector3,
    uv1: Vector2,
    uv2: Vector2,
    uv3: Vector2,
    uv4: Vector2) {
    shape.texCoord2(uv1);
    if (surfaceType == gl.LINE_STRIP || surfaceType == gl.POINTS) {
        shape.vertex3(xyz1);
    } else if (surfaceType == gl.LINES) {
        shape.vertex3(xyz1);
        shape.vertex3(xyz2);
        shape.vertex3(xyz2);
        shape.vertex3(xyz3);
        shape.vertex3(xyz3);
        shape.vertex3(xyz4);
        shape.vertex3(xyz1);
        shape.vertex3(xyz4);
        shape.vertex3(xyz1);
        shape.vertex3(xyz3);
    } else {
        shape.texCoord2(uv1); shape.vertex3(xyz1);
        shape.texCoord2(uv2); shape.vertex3(xyz2);
        shape.texCoord2(uv3); shape.vertex3(xyz3);
        shape.texCoord2(uv1); shape.vertex3(xyz1);
        shape.texCoord2(uv3); shape.vertex3(xyz3);
        shape.texCoord2(uv4); shape.vertex3(xyz4);
    }
}

function drawShapeUVN(gl: WebGLRenderingContext, surfaceType: number, shape: MyShape, xyz1: Vector3, xyz2: Vector3, xyz3: Vector3, xyz4: Vector3,
    uv1: Vector2,
    uv2: Vector2,
    uv3: Vector2,
    uv4: Vector2,
    nxyz1: Vector3,
    nxyz2: Vector3,
    nxyz3: Vector3,
    nxyz4: Vector3) {
    shape.texCoord2(uv1);
    if (surfaceType == gl.LINE_STRIP || surfaceType == gl.POINTS) {
        shape.vertex3(xyz1);
    } else if (surfaceType == gl.LINES) {
        shape.vertex3(xyz1);
        shape.vertex3(xyz2);
        shape.vertex3(xyz2);
        shape.vertex3(xyz3);
        shape.vertex3(xyz3);
        shape.vertex3(xyz4);
        shape.vertex3(xyz1);
        shape.vertex3(xyz4);
        shape.vertex3(xyz1);
        shape.vertex3(xyz3);
    } else {
        shape.normal3(nxyz1); shape.texCoord2(uv1); shape.vertex3(xyz1);
        shape.normal3(nxyz2); shape.texCoord2(uv2); shape.vertex3(xyz2);
        shape.normal3(nxyz3); shape.texCoord2(uv3); shape.vertex3(xyz3);
        shape.normal3(nxyz1); shape.texCoord2(uv1); shape.vertex3(xyz1);
        shape.normal3(nxyz3); shape.texCoord2(uv3); shape.vertex3(xyz3);
        shape.normal3(nxyz4); shape.texCoord2(uv4); shape.vertex3(xyz4);
    }
}

function sphere(u: number, v: number, sx: number, sy: number, sz: number): Vector3 {
    return Vector3.make(
        0.5 * sx * Math.cos(v) * Math.cos(u),
        0.5 * sz * Math.sin(v),
        0.5 * sy * Math.cos(v) * Math.sin(u)
    );
}

function fillShapeSphere(gl: WebGLRenderingContext, shape: MyShape, stepCount = -1) {
    let surfaceType = gl.TRIANGLES;
    const size = 2.0;
    const slices = SLICES;
    const stacks = STACKS;
    let count = 0;

    //drawYAxis(gl, shape, 1.2 * size);

    shape.newSurface(surfaceType);

    let du = 1.0 / stacks * Math.PI;
    let dv = 1.0 / slices * 2 * Math.PI;
    let ds = 1.0 / slices;
    let dt = 1.0 / stacks;

    let v = -Math.PI / 2;
    let t = 0;
    for (let j = 0; j <= stacks; j++) {
        let u = -Math.PI;
        let s = 0;
        for (let i = 0; i <= slices; i++) {
            let xyz1 = sphere(u, v, size, size, size);
            let xyz2 = sphere(u + du, v, size, size, size);
            let xyz3 = sphere(u + du, v + dv, size, size, size);
            let xyz4 = sphere(u, v + dv, size, size, size);
            drawShapeUV(gl, surfaceType, shape, xyz1, xyz2, xyz3, xyz4,
                Vector2.make(s, t),
                Vector2.make(s + ds, t),
                Vector2.make(s + ds, t + dt),
                Vector2.make(s, t + dt));
            u += du;
            s += ds;
            if (stepCount >= 0 && count++ > stepCount)
                return;
        }
        v += dv;
        t += dt;
    }
}

function fillShapeSuperquadric(gl: WebGLRenderingContext, shape: MyShape, n: number, e: number, stepCount = 0) {
    const surfaceType = gl.TRIANGLES;
    const size = 2.0;
    const slices = SLICES;
    const stacks = STACKS;
    let count = 0;

    //drawYAxis(gl, shape, 1.2 * size);

    shape.newSurface(surfaceType);

    let du = 1.0 / stacks * Math.PI;
    let dv = 1.0 / slices * 2 * Math.PI;
    let ds = 1.0 / slices;
    let dt = 1.0 / stacks;

    let v = -Math.PI / 2;
    let t = 0;
    for (let j = 0; j <= stacks; j++) {
        let u = -Math.PI;
        let s = 0;
        for (let i = 0; i <= slices; i++) {
            let xyz1 = sqEllipsoid(u, v, n, e, size, size, size);
            let xyz2 = sqEllipsoid(u + du, v, n, e, size, size, size);
            let xyz3 = sqEllipsoid(u + du, v + dv, n, e, size, size, size);
            let xyz4 = sqEllipsoid(u, v + dv, n, e, size, size, size);
            // drawShape(gl, surfaceType, shape, xyz1, xyz2, xyz3, xyz4);
            drawShapeUV(gl, surfaceType, shape, xyz1, xyz2, xyz3, xyz4,
                Vector2.make(s, t),
                Vector2.make(s + ds, t),
                Vector2.make(s + ds, t + dt),
                Vector2.make(s, t + dt));
            u += du;
            s += ds;
            if (stepCount >= 0 && count++ > stepCount)
                return;
        }
        v += dv;
        t += dt;
    }
}

function fillShapeSuperquadricToroid(gl: WebGLRenderingContext, shape: MyShape, n: number, e: number, stepCount = 0) {
    const surfaceType = gl.TRIANGLES;
    const size = 0.5;
    const slices = SLICES;
    const stacks = STACKS;
    const alpha = 4 * size;
    let count = 0;

    //drawYAxis(gl, shape, 1.2 * size);

    shape.newSurface(surfaceType);
    let du = 1.0 / slices * 2 * Math.PI;
    let dv = 1.0 / stacks * 2 * Math.PI;
    let ds = 1.0 / slices;
    let dt = 1.0 / stacks;

    let v = 0;
    let t = 0;
    for (let j = 0; j <= stacks; j++) {
        let u = 0;
        let s = 0;
        for (let i = 0; i <= slices; i++) {
            // (i, j)
            let xyz1 = sqToroid(u, v, n, e, alpha, size, size, size);
            // (i + 1, j)
            let xyz2 = sqToroid(u + du, v, n, e, alpha, size, size, size);
            // (i + 1, j + 1)
            let xyz3 = sqToroid(u + du, v + dv, n, e, alpha, size, size, size);
            // (i, j + 1)
            let xyz4 = sqToroid(u, v + dv, n, e, alpha, size, size, size);
            // drawShape(gl, surfaceType, shape, xyz1, xyz2, xyz3, xyz4);
            let nxyz1 = sqNormal(u, v, n, e);
            let nxyz2 = sqNormal(u + du, v, n, e);
            let nxyz3 = sqNormal(u + du, v + dv, n, e);
            let nxyz4 = sqNormal(u, v + dv, n, e);
            drawShapeUVN(gl, surfaceType, shape, xyz1, xyz2, xyz3, xyz4,
                Vector2.make(s, t),
                Vector2.make(s + ds, t),
                Vector2.make(s + ds, t + dt),
                Vector2.make(s, t + dt),
                nxyz1, nxyz2, nxyz3, nxyz4);
            u += du;
            s += ds;
            if (stepCount >= 0 && count++ > stepCount)
                return;
        }
        v += dv;
        t += dt;
    }
}


function fillShapeBezier(gl: WebGLRenderingContext, shape: MyShape, P: Matrix4, stepCount = -1) {
    const surfaceType = gl.TRIANGLES;
    const size = 1.0;
    const slices = SLICES;
    const stacks = STACKS;
    let count = 0;

    //drawYAxis(gl, shape, 1.2 * size);

    shape.newSurface(surfaceType);
    let du = 1.0 / SLICES;
    let dv = 1.0 / STACKS;
    let v = 0;
    for (let j = 0; j < STACKS; j++) {
        let u = 0;
        for (let i = 0; i < SLICES; i++) {
            let xyz1 = MyBezierSurface(u, v, size, P);
            let xyz2 = MyBezierSurface(u + du, v, size, P);
            let xyz3 = MyBezierSurface(u + du, v + dv, size, P);
            let xyz4 = MyBezierSurface(u, v + dv, size, P);
            drawShapeUV(gl, surfaceType, shape,
                xyz1, xyz2, xyz3, xyz4,
                Vector2.make(u, v),
                Vector2.make(u + du, v),
                Vector2.make(u + du, v + dv),
                Vector2.make(u, v + dv));
            u += du;
            if (stepCount >= 0 && count++ > stepCount)
                return;
        }
        v += dv;
    }
}


function fillShapeBox(gl: WebGLRenderingContext, shape: MyShape, size: number,
    left: boolean = true,
    right: boolean = true,
    top: boolean = true,
    bottom: boolean = true,
    front: boolean = true,
    back: boolean = true) {
    let s = size / 2;
    let v = [
        Vector3.make(-s, s, s),
        Vector3.make(-s, -s, s),
        Vector3.make(s, -s, s),
        Vector3.make(s, s, s),
        Vector3.make(-s, s, -s),
        Vector3.make(-s, -s, -s),
        Vector3.make(s, -s, -s),
        Vector3.make(s, s, -s)
    ];
    if (front) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[0]);
        shape.texCoord(1, 0); shape.vertex3(v[1]);
        shape.texCoord(1, 1); shape.vertex3(v[2]);
        shape.texCoord(0, 1); shape.vertex3(v[3]);
    }
    if (back) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[7]);
        shape.texCoord(1, 0); shape.vertex3(v[6]);
        shape.texCoord(1, 1); shape.vertex3(v[5]);
        shape.texCoord(0, 1); shape.vertex3(v[4]);
    }
    if (right) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[3]);
        shape.texCoord(1, 0); shape.vertex3(v[2]);
        shape.texCoord(1, 1); shape.vertex3(v[6]);
        shape.texCoord(0, 1); shape.vertex3(v[7]);
    }
    if (top) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[4]);
        shape.texCoord(1, 0); shape.vertex3(v[0]);
        shape.texCoord(1, 1); shape.vertex3(v[3]);
        shape.texCoord(0, 1); shape.vertex3(v[7]);
    }
    if (left) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[4]);
        shape.texCoord(1, 0); shape.vertex3(v[5]);
        shape.texCoord(1, 1); shape.vertex3(v[1]);
        shape.texCoord(0, 1); shape.vertex3(v[0]);
    }
    if (bottom) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[1]);
        shape.texCoord(1, 0); shape.vertex3(v[5]);
        shape.texCoord(1, 1); shape.vertex3(v[6]);
        shape.texCoord(0, 1); shape.vertex3(v[2]);
    }
}

function fillShapeMazeBox(gl: WebGLRenderingContext, shape: MyShape, size: number,
    left: boolean = true,
    right: boolean = true,
    top: boolean = true,
    bottom: boolean = true,
    front: boolean = true,
    back: boolean = true,
    offset: Vector3) {
    let s = size / 2;
    let v = [
        Vector3.make(-s, s, s).add(offset),
        Vector3.make(-s, -s, s).add(offset),
        Vector3.make(s, -s, s).add(offset),
        Vector3.make(s, s, s).add(offset),
        Vector3.make(-s, s, -s).add(offset),
        Vector3.make(-s, -s, -s).add(offset),
        Vector3.make(s, -s, -s).add(offset),
        Vector3.make(s, s, -s).add(offset)
    ];
    if (front) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[0]);
        shape.texCoord(1, 0); shape.vertex3(v[1]);
        shape.texCoord(1, 1); shape.vertex3(v[2]);
        shape.texCoord(0, 1); shape.vertex3(v[3]);
    }
    if (back) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[7]);
        shape.texCoord(1, 0); shape.vertex3(v[6]);
        shape.texCoord(1, 1); shape.vertex3(v[5]);
        shape.texCoord(0, 1); shape.vertex3(v[4]);
    }
    if (right) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[3]);
        shape.texCoord(1, 0); shape.vertex3(v[2]);
        shape.texCoord(1, 1); shape.vertex3(v[6]);
        shape.texCoord(0, 1); shape.vertex3(v[7]);
    }
    if (top) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[4]);
        shape.texCoord(1, 0); shape.vertex3(v[0]);
        shape.texCoord(1, 1); shape.vertex3(v[3]);
        shape.texCoord(0, 1); shape.vertex3(v[7]);
    }
    if (left) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[4]);
        shape.texCoord(1, 0); shape.vertex3(v[5]);
        shape.texCoord(1, 1); shape.vertex3(v[1]);
        shape.texCoord(0, 1); shape.vertex3(v[0]);
    }
    if (bottom) {
        shape.newSurface(gl.TRIANGLE_FAN);
        shape.texCoord(0, 0); shape.vertex3(v[1]);
        shape.texCoord(1, 0); shape.vertex3(v[5]);
        shape.texCoord(1, 1); shape.vertex3(v[6]);
        shape.texCoord(0, 1); shape.vertex3(v[2]);
    }
}


function fillShapeMaze(gl: WebGLRenderingContext, shape: MyShape, maze: MyTileMap, stepCount = -1) {
    const size = 0.75;
    let count = 0;
    //drawYAxis(gl, shape, 1.2 * size);
    let totalOffset = Vector3.make(
        -size * (maze.width - 1) / 2,
        -size * (maze.height - 1) / 2,
        0);

    const surfaceType = gl.TRIANGLES;
    shape.newSurface(surfaceType);
    for (let j = 0; j < maze.height; j++) {
        for (let i = 0; i < maze.width; i++) {
            let north = maze.getTile(i, j) & MazeDir.North;
            let south = maze.getTile(i, j) & MazeDir.South;
            let west = maze.getTile(i, j) & MazeDir.West;
            let east = maze.getTile(i, j) & MazeDir.East;
            let offset = Vector3.make(i * size, j * size, 0).add(totalOffset);
            fillShapeMazeBox(gl, shape, size, false, false, false, false, false, true, offset);
            if (west) fillShapeMazeBox(gl, shape, size, true, false, false, false, false, false, offset);
            if (east) fillShapeMazeBox(gl, shape, size, false, true, false, false, false, false, offset);
            if (north) fillShapeMazeBox(gl, shape, size, false, false, true, false, false, false, offset);
            if (south) fillShapeMazeBox(gl, shape, size, false, false, false, true, false, false, offset);

            if (stepCount >= 0 && count++ > stepCount)
                return;
        }
    }
}

function disableBit(x: number, which: number): number {
    let y = x | 0;
    let z = 1 << which;
    return ~z & y;
}

function MazeOpenPath(maze: MyTileMap, i: number, j: number, dir: MazeDir) {
    let otherCellI = i;
    let otherCellJ = j;
    let otherCellMask = 0;
    switch (dir) {
        case MazeDir.North: otherCellJ += 1; otherCellMask = MazeDir.South; break;
        case MazeDir.South: otherCellJ -= 1; otherCellMask = MazeDir.North; break;
        case MazeDir.East: otherCellI += 1; otherCellMask = MazeDir.West; break;
        case MazeDir.West: otherCellI -= 1; otherCellMask = MazeDir.East; break;
        default: return;
    }

    let otherCell = maze.getTile(otherCellI, otherCellJ);
    let thisCell = maze.getTile(i, j);

    if (otherCell < 0 || thisCell < 0) return;

    otherCell &= ~otherCellMask;
    thisCell &= ~dir;

    maze.setTile(otherCellI, otherCellJ, otherCell);
    maze.setTile(i, j, thisCell);
}

function MazeCreate(maze: MyTileMap, w: number, h: number, stepCount: number = -1) {
    // make a maze
    maze.resize(w, h);
    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            maze.setTile(i, j, MazeDir.All);
        }
    }

    // binary tree method
    let maxw = w - 1;
    let maxh = h - 1;
    for (let j = 0; j < w; j++) {
        for (let i = 0; i < h; i++) {
            if (j == maxh && i == maxw) continue;
            if (j != maxh && i == maxw) {
                MazeOpenPath(maze, i, j, MazeDir.North);
            }
            if (j == maxh && i != maxw) {
                MazeOpenPath(maze, i, j, MazeDir.East);
            }
            if (i != maxw && j != maxh) {
                let dir = MazeDir.North;
                if (Math.random() >= 0.5)
                    dir = MazeDir.East;
                MazeOpenPath(maze, i, j, dir);
            }
        }
    }
}


class GridCounter {
    private t = 0;
    private x_ = 0;
    private y_ = 0;
    private z_ = 0;

    get x(): number { return this.x_; }
    get y(): number { return this.y_; }
    get z(): number { return this.z_; }

    constructor(private X = 100, private Y = 3, private Z = 1) {
    }

    update(dt: number) {
        this.t += dt;
        while (this.t >= 1.0) {
            if (this.nextX()) {
                if (this.nextY()) {
                    this.nextZ();
                }
            }
            this.t -= 1.0;
            //console.log(this.x_, this.y_, this.z_);
        }
    }

    reset() {
        this.t = 0;
        this.x_ = 0;
        this.y_ = 0;
        this.z_ = 0;
    }

    nextX() {
        this.x_++;
        if (this.x_ >= this.X) {
            this.x_ = 0;
            return true;
        }
        return false;
    }

    nextY() {
        this.y_++;
        if (this.y_ >= this.Y) {
            this.y_ = 0;
            return true;
        }
        return false;
    }

    nextZ() {
        this.z_++;
        if (this.z_ >= this.Z) {
            this.z_ = 0;
            return true;
        }
        return false;
    }
}

namespace Teaching {

    export class RandomTexture {
        randomImage = new MyImage(64, 64, true);
        randomTexture: WebGLTexture | null = null;
        randomTextureMatrix = new Matrix4();

        constructor() { }

        update(dt: number): void {
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * (this.randomImage.width - 1);
                const y = Math.random() * (this.randomImage.height - 1);
                const color = new MyColor((Math.random() * 255) | 0, (Math.random() * 255) | 0, (Math.random() * 255) | 0, 255);
                this.randomImage.setPixel(x | 0, y | 0, color);
            }
            this.randomTextureMatrix.Rotate(dt * 20.0, 0.0, 0.0, 1.0);
        }

        use(gl: WebGLRenderingContext): void {
            this.randomTexture = this.randomImage.createTexture(gl, MyImageRepeatMode.MIRRORED_REPEAT, MyImageFilterMode.NEAREST);
            if (this.randomTexture) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.randomTexture);
            }
        }
    }

    class Drawable {
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

        constructor(
            public renderingContext: FxRenderingContext,
            public scenegraph: MyScenegraph
        ) { }

        setShader(gl: WebGLRenderingContext, shaderProgram: WebGLProgram | null) {
            if (shaderProgram) {
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

        reset(): void {
        }

        update(dt: number): void {

        }

        draw(): void {

        }
    }

    export class Interactive extends Drawable {
        keysPressed: Map<string, boolean> = new Map<string, boolean>();
        wasdX: number = 0.0;
        wasdY: number = 0.0;
        dx: number = 0.0;
        dy: number = 0.0;
        ijklX: number = 0.0;
        ijklY: number = 0.0;

        constructor(
            public renderingContext: FxRenderingContext,
            public scenegraph: MyScenegraph) {
            super(renderingContext, scenegraph);
            let self = this;
            //
            // This function is an example on how to add a keyboard handler to the main html window
            //
            // Notice the lambda functions to handle the event
            //
            // Notice how we capture the `this` pointer by assigning it to a local variable self which
            // can be used by the lambda functions

            document.onkeydown = (e) => { self.onkeydown(e); };
            document.onkeyup = (e) => { self.onkeyup(e); };
        }

        public checkKeys(keys: string[]): boolean {
            for (let k of keys) {
                if (this.keysPressed.get(k)) return true;
            }
            return false;
        }

        onkeydown(e: KeyboardEvent): void {
            if (e.key == "F12") return;
            if (e.ctrlKey) return;
            e.preventDefault();
            this.keysPressed.set(e.key, true);
        }

        onkeyup(e: KeyboardEvent): void {
            if (e.key == "F12") return;
            if (e.ctrlKey) return;
            e.preventDefault();
            this.keysPressed.set(e.key, false);
        }

        update(dt: number): void {
            super.update(dt);
            // This is where we would handle user input
            const speed = 1;
            this.dx = 0.0;
            this.dy = 0.0;
            this.wasdX = 0.0;
            this.wasdY = 0.0;
            this.ijklX = 0.0;
            this.ijklY = 0.0;
            if (this.checkKeys(["Left", "ArrowLeft"])) this.dx -= speed;
            if (this.checkKeys(["Right", "ArrowRight"])) this.dx += speed;
            if (this.checkKeys(["Up", "ArrowUp"])) this.dy -= speed;
            if (this.checkKeys(["Down", "ArrowDownUp"])) this.dy += speed;
            if (this.checkKeys(["r", "R"])) this.reset();
            if (this.checkKeys(["a", "A"])) this.wasdX -= speed;
            if (this.checkKeys(["d", "D"])) this.wasdX += speed;
            if (this.checkKeys(["w", "W"])) this.wasdY += speed;
            if (this.checkKeys(["s", "S"])) this.wasdY -= speed;
        }
    }

    // BEGIN MINKOWSKI PORTAL REFINEMENT ///////////////////////////////////////////

    class MPRTest extends Drawable {
        shapes: MyShape[] = [];
        types: number[] = [];
        positions: Vector3[] = [];
        phases: number[] = [];
        colors: Vector3[] = [];
        t1 = 0.0;

        constructor(readonly MaxShapes = 3,
            public renderingContext: FxRenderingContext,
            public scenegraph: MyScenegraph) {
            super(renderingContext, scenegraph);

            for (let i = 0; i < MaxShapes; i++) {
                this.shapes.push(new MyShape());
                let type = (Math.random() > 0.5) ? PF.SupportMapping.Box : PF.SupportMapping.Sphere;
                this.types.push(type);
                this.phases.push(Math.random() * Math.PI);
                // start out assuming collision occurred
                this.colors.push(Vector3.make(1, 0, 0));
                this.positions.push(Vector3.make());
            }
        }

        update(dt: number) {
            this.t1 += dt;
            for (let i = 0; i < this.MaxShapes; i++) {
                let halfCount = this.MaxShapes * 0.5;
                this.positions[i] = Vector3.make(halfCount * Math.sin(this.t1 + this.phases[i]) - this.MaxShapes + 2 * i, 0, 0);
                this.colors[i].reset(0, 1, 0);
            }

            for (let i = 0; i < this.MaxShapes; i++) {
                for (let j = i + 1; j < this.MaxShapes; j++) {
                    if (PF.isCollision(this.types[i], this.positions[i], this.types[j], this.positions[j])) {
                        this.colors[i] = Vector3.make(1, 0, 0);
                        this.colors[j] = Vector3.make(1, 0, 0);
                    }
                }
            }
        }

        draw() {
            let gl = this.renderingContext.gl;
            gl.useProgram(this.shaderProgram);
            if (!this.uModelViewMatrixLocation) {
                return;
            }
            for (let i = 0; i < this.MaxShapes; i++) {
                this.shapes[i].color3(this.colors[i]);
                switch (this.types[i]) {
                    case PF.SupportMapping.Box: fillShapeBox(gl, this.shapes[i], 2); break;
                    case PF.SupportMapping.Sphere: fillShapeSphere(gl, this.shapes[i]); break;
                }

                let T = Matrix4.makeTranslation(this.positions[i].x, this.positions[i].y, this.positions[i].z);
                gl.uniformMatrix4fv(this.uModelViewMatrixLocation, false, T.toColMajorArray());

                this.shapes[i].draw(gl,
                    this.aVertexLocation,
                    this.aColorLocation,
                    this.aTexCoordLocation,
                    this.aNormalLocation);
            }
        }
    }

    // BEGIN COLLISION DETECTION TEST //////////////////////////////////////////////

    export class CollisionDetectionTest extends Interactive {
        collisionObjectsCreated = false;
        platyfish = new PF.Platyfish();
        lastCDTime = 0.0;
        sceneGraphPath = "../assets/test_collision_scene.scn"
        sceneGraphName = "test_collision_scene.scn";

        constructor(
            public renderingContext: FxRenderingContext,
            public scenegraph: MyScenegraph) {
            super(renderingContext, scenegraph);
            this.scenegraph.Load(this.sceneGraphPath);
        }

        reset(): void {
            this.collisionObjectsCreated = false;
        }

        initCollisionDetection() {
            const MaxNodes = 10;
            this.platyfish = new PF.Platyfish();
            let pf = this.platyfish;

            // Create objects in the physics context
            if (0) {
                let o1IsSphere = false;
                let o2IsSphere = false;
                let o1 = o1IsSphere ? pf.addSphere("sphere1") : pf.addCube("cube1");
                let o2 = o2IsSphere ? pf.addSphere("sphere2") : pf.addCube("cube2");
                o1.moveTo(Vector3.make(0.00, 0.00, 0.00));
                o2.moveTo(Vector3.make(0.00, 0.00, 0.75));
            } else {
                let scount = 0;
                let bcount = 0;
                for (let i = 0; i < MaxNodes; i++) {
                    let isSphere = Math.random() > 0.5;
                    let obj = isSphere ? pf.addSphere("sphere" + ++scount) : pf.addCube("cube" + ++bcount);
                    let p = Vector3.make(Math.random() * 3 - 1.5, 0.0, Math.random() * 3 - 1.5);
                    obj.moveTo(p);
                }
            }

            // remove nodes from scene graph if they exist
            for (let i = 0; i <= MaxNodes; i++) {
                this.scenegraph.RemoveNode(this.sceneGraphName, "sphere" + i);
                this.scenegraph.RemoveNode(this.sceneGraphName, "box" + i);
                this.scenegraph.RemoveNode(this.sceneGraphName, "cube" + i);
            }

            // Add objects to the scene graph
            let smesh = this.scenegraph.GetMesh("geosphere.obj");
            let bmesh = this.scenegraph.GetMesh("box.obj");
            if (!smesh || !bmesh) return;
            for (let i = 0; i < pf.objects.length; i++) {
                let obj = pf.objects[i];
                let isSphere = obj.type == PF.ObjectType.Sphere;
                let node = this.scenegraph.AddNode(this.sceneGraphName, obj.name);
                if (!node) continue;
                if (isSphere) {
                    node.geometryGroup = "geosphere.obj";
                    obj.aabb.copy(smesh.aabb);
                    obj.sphere.copy(smesh.aabb.insideSphere);
                }
                else {
                    node.geometryGroup = "box.obj";
                    obj.aabb.copy(bmesh.aabb);
                    obj.sphere.copy(bmesh.aabb.outsideSphere);
                }
            }
            this.collisionObjectsCreated = true;
        }

        update(dt: number): void {
            super.update(dt);
            if (this.scenegraph.isSceneGraph(this.sceneGraphName) &&
                this.scenegraph.areMeshes(["geosphere.obj", "box.obj"]) &&
                !this.collisionObjectsCreated) {
                this.initCollisionDetection();
            } else {
                // move object 0
                let o = this.platyfish.objects[0]
                if (o) {
                    o.velocity.x = this.wasdX;
                    o.velocity.z = this.wasdY;
                    o.moveBy(dt);
                    o.rotate(-this.dx * 30.0 * dt, 0, 1, 0);
                    o.rotate(this.dy * 30.0 * dt, 1, 0, 0);
                }

                // update scenegraph with new transformations
                for (let o of this.platyfish.objects) {
                    if (o.name == "cube1") {
                        //o.rotate(this.dt * 30, 0, 1, 0);
                        break;
                    }
                }

                // update in 0.01 second steps
                for (let t = 0.0; t < dt; t += 0.01) {
                    this.platyfish.update(0.01);
                }

                // Copy physics matrices to scenegraph node matrices
                for (let obj of this.platyfish.objects) {
                    let node = this.scenegraph.GetNode(this.sceneGraphName, obj.name);
                    if (node) {
                        node.worldMatrix = obj.worldMatrix;
                    }
                }
            }
        }

        draw() {
            let gl = this.renderingContext.gl;
        }
    }

}