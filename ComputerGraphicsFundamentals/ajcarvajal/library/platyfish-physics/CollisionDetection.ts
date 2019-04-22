// Platyfish Typescript Physics Library
// Copyright (c) 2018 Jonathan Metzgar
// All Rights Reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
/// <reference path="../gte/GTE.ts" />

namespace PF {
    export function cdSphereSphere(s1: GTE.Sphere, s2: GTE.Sphere): boolean {
        if (s1.intersectsSphere(s2)) return true;
        return false;
    }

    export function cdAABBAABB(b1: GTE.BoundingBox, b2: GTE.BoundingBox): boolean {
        if (b1.intersectsAABB(b2)) return true;
        return false;
    }

    export function cdSphereAABB(s: GTE.Sphere, b: GTE.BoundingBox): boolean {
        let boxRadius = 0.5 * GTE.max3(b.width, b.height, b.depth);
        let dirToAABB = b.center.sub(b.center);
        let length = dirToAABB.length();
        if (length - boxRadius - s.radius < 0.0)
            return true;
        return false;
    }

    export function cdAABBSphere(b: GTE.BoundingBox, s: GTE.Sphere): boolean {
        return cdSphereAABB(s, b);
    }
}