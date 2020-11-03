"use strict";

//import {  } from "../lib/three.module.js";

export default class Hus {

    constructor(scene, gltfloader){
        gltfloader.load(
            './resources/models/hus1/scene.gltf',
            (object) => {
                let hus = object.scene.children[0];

                hus.traverse((child) => {
                    if(child.isMesh){
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                hus.position.z = 1.0;
                hus.position.y = 1.0;
                hus.position.x = 1.0;

                hus.scale.multiplyScalar(1/30);

                scene.add(object.scene);
            }

        );   
    }

}