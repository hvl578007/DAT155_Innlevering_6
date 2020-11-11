"use strict";

import { GLTFLoader } from "./loaders/GLTFLoader.js";
import GoldenGun from "./models/GoldenGun.js";
import Lommelykt from "./models/Lommelykt.js";

export default class Spelar {
    constructor(kamera, hud) {

        this.loader = new GLTFLoader();

        //set aktivtvåpen til 1
        this.aktivtVaapen = 1;
        this.ammo = 12;

        /**
         * Legg til golden gun på kameraet / spelaren
         * TODO eigen spelar-klasse
         */
        this.goldengun = new GoldenGun(kamera, this.loader);
        //this._goldengun = new Object3D();

        /**
         * Legg til lommelykt på kameraet / spelaren
         * TODO flytt ut i eigen spelar-klasse!
         */
        this.lommelykt = new Lommelykt(kamera, this.loader);
        // --------------------------------------------------------------------------------------


    }

    byttTilVaapen(vaapenNummer) {

        switch (vaapenNummer) {
            case 1: //goldengun
                //skjul lommelykt
                //skjul lommelykt hud?
                //vis gun
                //vis ammo hud?
                this.lommelykt.vis(false);
                this.goldengun.vis(true);
                break;
        
            case 2: //lommelykt
                //skjul gun
                //skjul ammo hud?
                //vis lommelykt
                //vis lommelykt hud?
                this.goldengun.vis(false);
                this.lommelykt.vis(true);
                break;

            default:
                break;
        }
    }

    oppdaterGunAnimation(delta) {
        if(this.goldengun.mixer) this.goldengun.mixer.update(delta);
    }

    skytVaapen() {
        
    }
}