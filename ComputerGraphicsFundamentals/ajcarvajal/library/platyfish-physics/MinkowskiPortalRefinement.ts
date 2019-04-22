/// <reference path="./Platyfish.ts" />

namespace PF {
    export enum SupportMapping {
        Point = 0,
        Box = 1,
        Sphere = 2
    };

    export function sm_point(n: Vector3): Vector3 {
        return n.clone();
    }

    export function sm_box(n: Vector3, r: number = 1): Vector3 {
        return Vector3.make(
            r * Math.sign(n.x),
            r * Math.sign(n.y),
            r * Math.sign(n.z)
        );
    }

    export function sm_sphere(n: Vector3, r: number = 1): Vector3 {
        return Vector3.make(r * n.x, r * n.y, r * n.z);
    }

    export function sm_S(sm: SupportMapping, n: Vector3, position: Vector3): Vector3 {
        switch (sm) {
            case SupportMapping.Point: return sm_point(n).add(position);
            case SupportMapping.Sphere: return sm_sphere(n).add(position);
            case SupportMapping.Box: return sm_box(n).add(position);
        }
        return n.add(position);
    }

    export function isCollision(
        sm1: SupportMapping, position1: Vector3,
        sm2: SupportMapping, position2: Vector3): boolean {
        let normal1: Vector3;
        let normal2: Vector3;
        let zero = Vector3.make();

        let V0 = position1.sub(position2).norm();
        let S_BminusA;
        let V1 = sm_S(sm1, V0.neg(), zero);
        let V1crossV0 = Vector3.cross(V1, V0).norm();
        let V2 = sm_S(sm1, V1crossV0, zero);
        let V2minusV0 = V2.sub(V0);
        let V1minusV0 = V1.sub(V0);
        let side = Vector3.cross(V2minusV0, V1minusV0).norm();
        let V3 = sm_S(sm1, side, zero);
        return false;
    }
}
