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

    lastInnGoldenGun(kamera, mixer) {

        this.loader.load(
            './resources/models/james_bond_golden_gun/ggun.gltf',
            (object) => {
                //henter ut objektet (usikker på kvifor akkuratt dette)
                const gun = object.scene.children[0];

                //usikker, men vil lage skygge og få skygge?
                gun.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                mixer = new AnimationMixer(object.scene);
                
                object.animations.forEach((clip) => {mixer.clipAction(clip).play()});

                //posisjonerer våpnet
                gun.position.z = -1.7;
                gun.position.y = -0.7;
                gun.position.x = 1;
                //roterer våpnet litt 
                gun.rotation.z = 3.25;
                //gjer våpnet mindre for å ikkje klippe inn i ting
                gun.scale.multiplyScalar(1/40);

                //legg til våpnet under kamera slik at den følger med der
                kamera.add(object.scene);
            }
        );
    }
}