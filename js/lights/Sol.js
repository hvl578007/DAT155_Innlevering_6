"use strict";

import { Sprite, SpriteMaterial, TextureLoader } from "../lib/three.module.js";

export default class Sol {

    constructor(scene){

        let solMaterial = new SpriteMaterial({ 
            map: new TextureLoader().load("./resources/textures/marioSol.png"),
            fog: false
        });

        let solSprite = new Sprite(solMaterial);
        solSprite.scale.set(20,20);
        solSprite.position.set(0,100,0);

        scene.add(solSprite);
    
    }
    
}