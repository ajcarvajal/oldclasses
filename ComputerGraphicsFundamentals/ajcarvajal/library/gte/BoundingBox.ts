/// <reference path="Vector3.ts"/>

namespace GTE {
    export class BoundingBox {
        minBounds = Vector3.make(1e6, 1e6, 1e6);
        maxBounds = Vector3.make(-1e6, -1e6, -1e6);

        constructor() { }

        copy(b: BoundingBox): BoundingBox {
            this.minBounds.copy(b.minBounds);
            this.maxBounds.copy(b.maxBounds);
            return this;
        }

        clone(): BoundingBox {
            let b = new BoundingBox();
            return b.copy(this);
        }

        get width(): number { return this.maxBounds.x - this.minBounds.x; }
        get height(): number { return this.maxBounds.y - this.minBounds.y; }
        get depth(): number { return this.maxBounds.z - this.minBounds.z; }
        get maxSize(): number { return GTE.max3(this.width, this.height, this.depth); }
        get minSize(): number { return GTE.min3(this.width, this.height, this.depth); }
        get x(): number { return 0.5 * (this.minBounds.x + this.maxBounds.x); }
        get y(): number { return 0.5 * (this.minBounds.y + this.maxBounds.y); }
        get z(): number { return 0.5 * (this.minBounds.z + this.maxBounds.z); }
        get left(): number { return this.minBounds.x; }
        get right(): number { return this.maxBounds.x; }
        get top(): number { return this.maxBounds.y; }
        get bottom(): number { return this.minBounds.y; }
        get front(): number { return this.minBounds.z; }
        get back(): number { return this.maxBounds.z; }

        get outsideSphere(): Sphere {
            let d = (0.5 * this.maxSize); // distance from center to largest diagonal
            let r = Math.sqrt(d * d + d * d);
            return new Sphere(r, this.center);
        }

        get insideSphere(): Sphere {
            let r = 0.5 * this.maxSize;
            return new Sphere(r, this.center);
        }

        get size(): Vector3 {
            return Vector3.make(
                this.maxBounds.x - this.minBounds.x,
                this.maxBounds.y - this.minBounds.y,
                this.maxBounds.z - this.minBounds.z
            );
        }

        get center(): Vector3 {
            return Vector3.make(
                0.5 * (this.minBounds.x + this.maxBounds.x),
                0.5 * (this.minBounds.y + this.maxBounds.y),
                0.5 * (this.minBounds.z + this.maxBounds.z)
            );
        }

        add(p: Vector3) {
            this.minBounds = Vector3.min(this.minBounds, p);
            this.maxBounds = Vector3.max(this.maxBounds, p);
        }

        reset() {
            this.minBounds = Vector3.make(1e6, 1e6, 1e6);
            this.maxBounds = Vector3.make(-1e6, -1e6, -1e6);
        }

        intersectsAABB(aabb: BoundingBox): boolean {
            let Xoverlap = true;
            let Yoverlap = true;
            let Zoverlap = true;

            let a = this;
            let b = aabb;

            if (a.left > b.right || a.right < b.left) Xoverlap = false;
            if (a.bottom > b.top || a.top < b.bottom) Yoverlap = false;
            if (a.front > b.back || b.back < b.front) Zoverlap = false;

            return Xoverlap || Yoverlap || Zoverlap;
        }

        // signed distance function
        sdf(p: Vector3): number {
            let c = this.center;
            return max3(
                Math.abs(p.x - c.x) - this.width * 0.5,
                Math.abs(p.y - c.y) - this.height * 0.5,
                Math.abs(p.z - c.z) - this.depth * 0.5
            );
        }

        support(n: Vector3): Vector3 {
            let c = this.center;
            return new Vector3(
                c.x + 0.5 * this.width * GTE.sign(n.x),
                c.y + 0.5 * this.height * GTE.sign(n.y),
                c.z + 0.5 * this.depth * GTE.sign(n.z)
            );
        }
    }
}
