"use strict";

import { Mesh, MeshBasicMaterial, SphereGeometry, TextureLoader, ShaderMaterial } from "../lib/three.module.js";

export default class Skydome extends Mesh {

    constructor(){

        let skydomeGeometry = new SphereGeometry(350,64,64);
        let skydomeMaterial = new MeshBasicMaterial({
            map: new TextureLoader().load('./resources/textures/sky.jpg')
        });

        super(skydomeGeometry, skydomeMaterial);
        
    }

}