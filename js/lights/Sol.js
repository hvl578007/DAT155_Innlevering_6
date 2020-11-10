"use strict";

import { Sprite, SpriteMaterial, TextureLoader, EllipseCurve, BufferGeometry, LineBasicMaterial, Line } from "../lib/three.module.js";

export default class Sol {

    constructor(scene, lys){

        let solMaterial = new SpriteMaterial({ 
            map: new TextureLoader().load("./resources/textures/marioSol.png"),
            fog: false
        });

        this.solSprite = new Sprite(solMaterial);
        this.solSprite.scale.set(20,20);
        this.solSprite.position.set(0,0,0);

        //legger sol spriten til i scenen
        scene.add(this.solSprite);

        //lager et retningslys
        const retningslys = lys.lagRetningslys();

        //legger lyset til på sol spriten
        this.solSprite.add(retningslys);

        //legger til at lyset skal lyse mot midten av scenen
        scene.add(retningslys.target);

        // ellipse som solen skal følge
        this.kurve = new EllipseCurve(
            0, 0,
            320, 320,
            0, 2 * Math.PI,
            false,
            0
        );
        
        //uncomment for å visualisere kurven//
        //const punkter = this.kurve.getPoints(50);
        //const geometri = new BufferGeometry().setFromPoints(punkter);
        //const materiale = new LineBasicMaterial({ color : 0xff0000 });
        //const ellipse = new Line(geometri, materiale);
        //scene.add(ellipse);
    
    }

    beveg(tSol){
        let pos = this.kurve.getPoint(tSol);
        let tan = this.kurve.getTangent(tSol);
        this.solSprite.position.x = pos.x;
        this.solSprite.position.y = pos.y;
    }
    
}