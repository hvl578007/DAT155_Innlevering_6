"use strict";

//import {  } from "../lib/three.module.js";

export default class Hus {

    constructor(scene, gltfloader){
        gltfloader.load(
            './resources/models/japanskBygning/scene.gltf',
            (object) => {
                let hus = object.scene.children[0];

                hus.traverse((child) => {
                    if(child.isMesh){
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                hus.position.z = -110.0;
                hus.position.y = 6.0;
                hus.position.x = 30.0;

                hus.scale.multiplyScalar(2);

                scene.add(object.scene);
            }

        );   
    }

}