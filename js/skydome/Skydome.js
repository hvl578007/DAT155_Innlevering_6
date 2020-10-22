"use strict";

import { Mesh, MeshPhongMaterial, TextureLoader, ShaderMaterial } from "../lib/three.module.js";

export default class Skydome extends Mesh {

    constructor(){

        let skydomeGeometry = new THREE.SphereGeometry(3000,60,40);
        let teksturloader = THREE.TextureLoader();
        let SkydomeMaterial = new MeshPhongMaterial({
            map: teksturloader.load('./resources/textures/grass_02.png')
        });

        super(skydomeGeometry, SkydomeMaterial);
        
    }

}