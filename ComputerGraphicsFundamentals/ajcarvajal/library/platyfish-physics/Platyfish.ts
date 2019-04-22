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
/// <reference path="PhysicsObject.ts" />
/// <reference path="CollisionDetection.ts" />
/// <reference path="MinkowskiPortalRefinement.ts" />

namespace PF {
    export class Platyfish {
        objects: PhysicsObject[] = [];

        constructor() { }

        addSphere(name: string): PhysicsObject {
            let obj = new PhysicsObject(this, ObjectType.Sphere, name);
            obj.sphere.radius = 0.5;
            this.objects.push(obj);
            return obj;
        }

        addCube(name: string): PhysicsObject {
            let obj = new PhysicsObject(this, ObjectType.AABB, name);
            obj.aabb.add(Vector3.make(-0.5, -0.5, -0.5));
            obj.aabb.add(Vector3.make(0.5, 0.5, 0.5));
            this.objects.push(obj);
            return obj;
        }

        update(dt: number) {
            // move objects O(N)
            for (let i = 0; i < this.objects.length; i++) {
                this.objects[i].update(dt);
            }

            // handle collisions O(N^2)
            for (let i = 0; i < this.objects.length; i++) {
                let o1 = this.objects[i];
                for (let j = i + 1; j < this.objects.length; j++) {
                    let o2 = this.objects[j];
                    if (o1.collidesWith(o2)) {
                        // Find out how much force to apply to objects
                        // 1. TODO Assume these are spheres and adjust them accordingly
                        //    Later, we will support additional objects

                        // New method
                        // 0. Find object centers
                        let o1c = o1.position;
                        let o2c = o2.position;

                        // 1. Find object 1 direction to object 2
                        let o1too2 = o1.dirTo(o2);

                        // 2. Find the surface points on each object
                        let o1p = o1.support(o1too2);
                        let o2p = o2.support(o1too2.neg());

                        // 3. Find out how far we are penetrating using the
                        // signed distance function
                        let o1sdf = o1.sdf(o2p);
                        let o2sdf = o2.sdf(o1p);

                        // 4. Find the normal at the points from step 2
                        let o1N = o1.sdfN(o1p);
                        let o2N = o2.sdfN(o2p);

                        // 5. Move o1 and o2 away from each other by half of their sdf's
                        //    and in the direction of their respective normals                        
                        // are we inside either o1 or o2?
                        if (o1sdf < 0.0) {
                            // move o1 and o2 by a quarter the amount of o1sdf
                            // we are guessing that half of movement is due to o1
                            o1.move(o1N, o1sdf * 0.25);
                            o2.move(o2N, o1sdf * 0.25);
                        }
                        if (o2sdf < 0.0) {
                            // move o1 and o2 by a quarter the amount of o2sdf
                            // we are guessing that half of movement is due to o2
                            o1.move(o1N, o2sdf * 0.25);
                            o2.move(o2N, o2sdf * 0.25);
                        }

                        // // Old method with spheres
                        // let d = o1.distanceTo(o2);
                        // let dir = o1.dirTo(o2);
                        // let difference = d - o1.sphere.radius - o2.sphere.radius;
                        // if (difference < 0.0) {
                        //     o1.move(dir, 0.5 * difference);
                        //     o2.move(dir, -0.5 * difference);
                        // }
                    }
                }
            }
        }
    }
}
