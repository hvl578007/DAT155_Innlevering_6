"use strict";

import { Raycaster, Vector2, Vector3 } from "./lib/three.module.js";
import { GLTFLoader } from "./loaders/GLTFLoader.js";
import GoldenGun from "./models/GoldenGun.js";
import Lommelykt from "./models/Lommelykt.js";
import Spel from "./Spel.js";

export default class Spelar {
    constructor(kamera, hud) {

        this.loader = new GLTFLoader();

        //set aktivtvåpen til 1
        this.aktivtVaapen = 1;
        this._ammo = 12;

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

        //raycaster for skyting:
        this.raycast = new Raycaster();
        //this.raycast.far = 100;

        this.tingAaSkytePaa = [];

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
                this.goldengun.spelActionIgjen();
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
        if (this.goldengun.mixer) this.goldengun.mixer.update(delta);
    }

    skytVaapen(kamera, skalSkyte) {
        if (this.ammo > 0) {
            //spel av lyd, noko raycaste-greier
            this.raycast.setFromCamera(new Vector2(), kamera);
            //let intersections = this.raycast.intersectObject(this.tingAaSkytePaa);
            let intersections = this.raycast.intersectObject(skalSkyte);

            let traff = intersections.length > 0;

            if (traff) {
                console.log("Traff fuglen!!");
            }

            //Spel.controls.getObject();
            this.ammo > 0 ? this.ammo-- : this.ammo = 0;
        }

    }

    reloadVaapen() {
        this.ammo = 12;
    }

    get ammo() {
        return this._ammo;
    }

    set ammo(ammo) {
        this._ammo = ammo;
    }

    leggTilTingAaSkytePaa(objekt) {
        this.tingAaSkytePaa.push(objekt);
    }
}