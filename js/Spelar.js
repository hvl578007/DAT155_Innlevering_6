"use strict";

import { AudioLoader, LoopOnce, PositionalAudio, Raycaster, Vector2, AudioListener } from "./lib/three.module.js";
import { GLTFLoader } from "./loaders/GLTFLoader.js";
import GoldenGun from "./models/GoldenGun.js";
import Lommelykt from "./models/Lommelykt.js";

export default class Spelar {
    constructor(kamera) {

        this.loader = new GLTFLoader();

        //set aktivtvåpen til 1
        this.aktivtVaapen = 1;
        this._ammo = 12;

        

        /**
         * Legg til lommelykt på kameraet / spelaren
         * TODO flytt ut i eigen spelar-klasse!
         */
        this.lommelykt = new Lommelykt(kamera, this.loader);
        // --------------------------------------------------------------------------------------

        this.raycast = new Raycaster();

        /**
         * Prøver meg på lyd...
         */
        /*
        // Lyd på spelaren
        this.lytter = new AudioListener();
        kamera.add(this.lytter);

        //lagar lyd1 (skudd)
        this.lyd1 = new PositionalAudio(this.lytter);

        //laster inn lyd
        let audioLoader = new AudioLoader();

        audioLoader.load('./resources/lyd/357_shot2.wav', (buffer) => {
            this.lyd1.setBuffer(buffer);
            this.lyd1.setRefDistance(2);
            this.lyd1.loop = false;
            this.lyd1.setVolume(0.5);
        });

        //lagar lyd 2 (reload)

        this.lyd2 = new PositionalAudio(this.lytter);

        audioLoader.load('./resources/lyd/reload1.wav', (buffer) => {
            this.lyd2.setBuffer(buffer);
            this.lyd2.setRefDistance(2);
            this.lyd2.loop = false;
            this.lyd2.setVolume(0.5);
        });
        */

        /**
         * Legg til golden gun på kameraet / spelaren
         * TODO eigen spelar-klasse
         */
        this.goldengun = new GoldenGun(kamera, this.loader); //, [this.lyd1, this.lyd2]);
        //this._goldengun = new Object3D();

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
        let traff = false;

        if (this.ammo > 0) {
            this.spelAvLyd(1);
            //spel av lyd, noko raycaste-greier
            this.raycast.setFromCamera(new Vector2(), kamera);
            //sjekker kva ein har evt treft (sjekke berre mot parameteren for å gjere det enkelt å søkje igjennom)
            let intersections = this.raycast.intersectObject(skalSkyte, true);
            //let intersections = this.raycast.intersectObject(skalSkyte);

            //sjekker om ein traff
            traff = intersections.length > 0;

            //minker ammo
            this.ammo > 0 ? this.ammo-- : this.ammo = 0;
        }

        return traff;

    }

    spelAvLyd(id) {
        switch (id) {
            case 1: //skudd
                //this.lyd1.play();
                break;

            case 2: //reload
                //this.lyd2.play();
                break;
        }
    }

    reloadVaapen() {
        this.spelAvLyd(2);
        this.ammo = 12;
    }

    get ammo() {
        return this._ammo;
    }

    set ammo(ammo) {
        this._ammo = ammo;
    }

}