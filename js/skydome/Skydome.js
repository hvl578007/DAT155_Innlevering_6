"use strict";

import { Mesh, MeshPhongMaterial, SphereGeometry, TextureLoader, ShaderMaterial } from "../lib/three.module.js";

export default class Skydome extends Mesh {

    constructor(){

        let skydomeGeometry = new SphereGeometry(3000,60,40);
        let skydomeMaterial = new MeshPhongMaterial({
            color: 0x808080
            //map: new TextureLoader().load('./resources/textures/grass_02.png')
        });

        super(skydomeGeometry, skydomeMaterial);
        
    }

}