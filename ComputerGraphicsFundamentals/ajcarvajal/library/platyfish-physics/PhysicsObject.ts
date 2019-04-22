/// <reference path="Platyfish.ts" />

namespace PF {
    export enum ObjectType {
        Sphere,
        AABB,
        ConvexHull
    }

    export class PhysicsObject {
        protected x = new Vector3();
        protected v = new Vector3();
        protected m = 1.0;

        aabb = new GTE.BoundingBox();
        sphere = new GTE.Sphere(0.0, Vector3.makeZero());

        private transform_ = Matrix4.makeIdentity();
        private invtransform_ = Matrix4.makeIdentity();

        get worldMatrix(): Matrix4 { return this.transform_; }
        set worldMatrix(m: Matrix4) {
            this.transform_.copy(m);
            this.invtransform_ = this.transform_.asInverse();
            this.x.copy(this.wmT);
        }

        // get rotation matrix 3x3 or translation vectors
        get wmR(): Matrix3 { return this.transform_.asTopLeft3x3(); }
        get wmT(): Vector3 { return this.transform_.col3(3); }
        get wmInvR(): Matrix3 { return this.invtransform_.asTopLeft3x3(); }
        get wmInvT(): Vector3 { return this.invtransform_.col3(3); }

        get position(): Vector3 { return this.wmT; }
        get velocity(): Vector3 { return this.v; }
        get dir(): Vector3 { return this.v.norm(); }
        get mass(): number { return this.m; }

        constructor(public pf: Platyfish, readonly type: ObjectType, readonly name: string = "unknown") { }

        sdf(p: Vector3): number {
            let newP = this.invtransform_.transform3(p);
            switch (this.type) {
                case ObjectType.Sphere: return this.sphere.sdf(newP);
                case ObjectType.AABB: return this.aabb.sdf(newP);
            }
            return 1e6; // very far outside object
        }

        sdfN(p: Vector3): Vector3 {
            const neg = -0.001;
            const pos = 0.001;
            let x1 = this.sdf(p.add(Vector3.make(neg, 0.0, 0.0)));
            let x2 = this.sdf(p.add(Vector3.make(pos, 0.0, 0.0)));
            let y1 = this.sdf(p.add(Vector3.make(0.0, neg, 0.0)));
            let y2 = this.sdf(p.add(Vector3.make(0.0, pos, 0.0)));
            let z1 = this.sdf(p.add(Vector3.make(0.0, 0.0, neg)));
            let z2 = this.sdf(p.add(Vector3.make(0.0, 0.0, pos)));
            return Vector3.makeUnit(x2 - x1, y2 - y1, z2 - z1);
        }

        support(n: Vector3): Vector3 {
            let newN = this.wmInvR.transform(n);
            let v: Vector3;
            switch (this.type) {
                case ObjectType.Sphere:
                    v = this.sphere.support(newN);
                    break;
                case ObjectType.AABB:
                    v = this.aabb.support(newN);
                    break;
                default:
                    return Vector3.makeZero();
            }
            return GTE.transformRT(v, this.wmR, this.wmT);
        }

        distanceTo(obj: PhysicsObject): number {
            return this.x.distance(obj.x);
        }

        dirTo(obj: PhysicsObject): Vector3 {
            return obj.x.sub(this.x).norm();
        }

        move(dir: Vector3, d: number): Vector3 {
            this.transform_.Translate(d * dir.x, d * dir.y, d * dir.z);
            this.worldMatrix = this.transform_;
            return this.wmT;
        }

        // move in the direction of velocity
        moveBy(d: number): Vector3 {
            return this.move(this.v, d);
        }

        moveTo(p: Vector3): void {
            this.transform_.m14 = p.x;
            this.transform_.m24 = p.y;
            this.transform_.m34 = p.z;
            this.worldMatrix = this.transform_;
        }

        rotate(angleInDegrees: number, x: number, y: number, z: number) {
            this.transform_.Rotate(angleInDegrees, x, y, z);
            this.worldMatrix = this.transform_;
        }

        update(dt: number): void {
            this.moveBy(dt);
        }

        collidesWith(obj: PhysicsObject, epsilon: number = 1e-6): boolean {
            // New type using support functions and signed distance functions
            let o1 = this;
            let o2 = obj;

            let o1c = o1.position;
            let o2c = o2.position;

            // 1. Find object 1 direction to object 2
            let o1too2 = o1.dirTo(o2);

            // 2. Find distance center of o1 to edge of o1
            let o1p = o1.support(o1too2);
            let o2p = o2.support(o1too2.neg());

            // 3. Find signed distance functions for each support mapping for each shape        
            let o1sdf = o1.sdf(o2p);
            let o2sdf = o2.sdf(o1p);

            // 4. If signed distance functions are negative, then we have detected a collision
            if (o1sdf <= -epsilon || o2sdf <= -epsilon)
                return true;

            return false;

            // Old type (compare objects with each other with specific collision detection)
            let result = false;
            if (this.type == ObjectType.Sphere) {
                switch (obj.type) {
                    case ObjectType.Sphere:
                        result = cdSphereSphere(this.sphere, obj.sphere);
                        break;
                    case ObjectType.AABB:
                        result = cdSphereAABB(this.sphere, obj.aabb);
                        break;
                }
            }
            if (this.type == ObjectType.AABB) {
                switch (obj.type) {
                    case ObjectType.Sphere:
                        result = cdAABBSphere(this.aabb, obj.sphere);
                        break;
                    case ObjectType.AABB:
                        result = cdAABBAABB(this.aabb, obj.aabb);
                        break;
                }
            }
            return result;
        }
    }
}