"use strict";

import { Mesh, MeshBasicMaterial, SphereGeometry, TextureLoader, BackSide } from "../lib/three.module.js";

export default class Skydome extends Mesh {

    constructor(){

        let skydomeGeometry = new SphereGeometry(550,64,64);
        let skydomeMaterial = new MeshBasicMaterial({
            map: new TextureLoader().load('./resources/textures/skydomeTexture.jpg'),
            fog: false,
            side: BackSide
        });

        super(skydomeGeometry, skydomeMaterial);
        
    }

}