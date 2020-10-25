"use strict";

import { AnimationMixer } from "../lib/three.module.js";
import { GLTFLoader } from "../loaders/GLTFLoader.js";

export default class ModellImport {

    constructor() {

        this.loader = new GLTFLoader();

    }

    plasserTrer(terrengGeometri, scene) {

        // instantiate a GLTFLoader:
        //const loader = new GLTFLoader();

        this.loader.load(
            // resource URL
            'resources/models/kenney_nature_kit/tree_thin.glb',
            // called when resource is loaded
            (object) => {
                //område (x og z koordinatar, og distansen mellom dei = += talet)
                for (let x = -50; x < 50; x += 16) {
                    for (let z = -50; z < 50; z += 16) {

                        //litt tilfeldig plassering rundt dei punkta
                        const px = x + 1 + (6 * Math.random()) - 3;
                        const pz = z + 1 + (6 * Math.random()) - 3;

                        const height = terrengGeometri.getHeightAt(px, pz);

                        if (height < 5) {
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

                            scene.add(tree);
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
}