"use strict";

import { GLTFLoader } from "../loaders/GLTFLoader.js";

export default class ModellImport {

    constructor() {

        this.loader = new GLTFLoader();

    }

    plasserTrer(terrengGeometri, terreng) {

        // instantiate a GLTFLoader:
        //const loader = new GLTFLoader();

        this.loader.load(
            // resource URL
            'resources/models/kenney_nature_kit/tree_thin.glb',
            // called when resource is loaded
            (object) => {
                //område (x og z koordinatar, og distansen mellom dei = += talet)
                for (let x = -400; x < 400; x += 30) {
                    for (let z = -400; z < 400; z += 30) {

                        //litt tilfeldig plassering rundt dei punkta
                        const px = x + this.randomGauss(x);
                        const pz = z + this.randomGauss(z);

                        const height = terrengGeometri.getHeightAt(px, pz);

                        if (height > 2 && height < 9) {
                            const tree = object.scene.children[0].clone();

                            tree.traverse((child) => {
                                if (child.isMesh) {
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });

                            tree.position.x = px;
                            tree.position.y = height - 0.01;
                            tree.position.z = pz;

                            tree.rotation.y = Math.random() * (2 * Math.PI);

                            tree.scale.multiplyScalar(5 + Math.random() * 1);

                            terreng.add(tree);
                        }

                    }
                }
            },
            (xhr) => {
                console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model.', error);
            }
        );

    }

    lastInnGLTFModell(ressursURL) {

        //fungerer ikkje...
        let objekt = null;

        this.loader.load(
            ressursURL,
            (obj) => {
                objekt = obj.scene.children[0].clone();

                objekt.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            }
        );

        return objekt;
    }

    randomGauss() {
        // See http://c-faq.com/lib/gaussian.html
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

        var v1, v2, S;

        do {
            v1 = 2 * Math.random() - 1;
            v2 = 2 * Math.random() - 1;
            S = v1 * v1 + v2 * v2;
        } while(S >= 1 || S == 0);

        // Ideally alternate between v1 and v2
        return v1 * Math.sqrt(-2 * Math.log(S) / S);
    }
}
