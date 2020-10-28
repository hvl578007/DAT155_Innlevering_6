"use strict";

import { Mesh, MeshBasicMaterial, SphereGeometry, TextureLoader, ShaderMaterial, BackSide } from "../lib/three.module.js";

export default class Skydome extends Mesh {

    constructor(scene){

        let skydomeGeometry = new SphereGeometry(550,64,64);
        let skydomeMaterial = new MeshBasicMaterial({
            map: new TextureLoader().load('./resources/textures/sky.jpg'),
            fog: false,
            side: BackSide
        });

        super(skydomeGeometry, skydomeMaterial);
        
    }

}