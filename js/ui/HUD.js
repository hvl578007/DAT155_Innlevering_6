"use strict";

import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneBufferGeometry, PlaneGeometry, Scene, Texture } from "../lib/three.module.js";

export default class HUD {

    constructor(hoegde, breidde) {

        //henta kode frå https://www.evermade.fi/story/pure-three-js-hud/
        // og https://codepen.io/jaamo/pen/MaOGZV 

        let hudCanvas = new OffscreenCanvas(breidde, hoegde);
        //let hudCanvas = document.createElement('canvas');
        //hudCanvas.height = hoegde;
        //hudCanvas.width = breidde;
        this._hudBitmap = hudCanvas.getContext('2d');

        this._hudBitmap.font = "Normal 36px Arial";
        this._hudBitmap.textAlign = 'start';
        this._hudBitmap.fillStyle = 'white';
        this._hudBitmap.strokeStyle = 'black';
        //this._hudBitmap.fillText('Initializing...', breidde/2, hoegde/2);

        this._kameraHUD = new OrthographicCamera(-breidde/2, breidde/2, hoegde/2, -hoegde/2, 0, 30);

        this._sceneHUD = new Scene();

        this._hudTekstur = new Texture(hudCanvas);
        this._hudTekstur.needsUpdate = true;
        let materiale = new MeshBasicMaterial({
            map: this._hudTekstur
        });
        materiale.transparent = true;

        let planGeometri = new PlaneGeometry(breidde, hoegde);
        let plan = new Mesh(planGeometri, materiale);
        this._sceneHUD.add(plan);

        //henter inn bilder
        this.goldengunHUDImg = document.getElementById('goldengunHUD');
        this.lommelyktHUDImg = document.getElementById("lommelyktHUD");
        this.ammoHUDImg = document.getElementById('ammoHUD');

        //teikner statiske ting
        this._hudBitmap.drawImage(this.goldengunHUDImg, 55, 150, 100, 61);
        this._hudBitmap.fillText("1", 20, 195);
        this._hudBitmap.strokeText("1", 20, 195);
        this._hudBitmap.drawImage(this.lommelyktHUDImg, 70, 350, 80, 80);
        this._hudBitmap.fillText("2", 20, 405);
        this._hudBitmap.strokeText("2", 20, 405);
        
    }

    oppdaterKameraNyeDimensjonar(breidde, hoegde) {
        this._kameraHUD.left = -breidde/2;
        this._kameraHUD.right = breidde/2;
        this._kameraHUD.top = hoegde/2;
        this._kameraHUD.bottom = -hoegde/2;
        this._kameraHUD.updateProjectionMatrix();
    }

    teikn(breidde, hoegde, controls) {
        //this._hudBitmap.clearRect(0, 0, breidde, hoegde);
        this._hudBitmap.clearRect(breidde/2, 0, breidde, hoegde/2);
        this._hudBitmap.fillText("x: " + Math.round(controls.getObject().position.x) + " y: " + Math.round(controls.getObject().position.y-3) + " z: " + Math.round(controls.getObject().position.z), breidde-350, 75);
        this._hudBitmap.strokeText("x: " + Math.round(controls.getObject().position.x) + " y: " + Math.round(controls.getObject().position.y-3) + " z: " + Math.round(controls.getObject().position.z), breidde-350, 75);
        this._hudBitmap.clearRect(0, hoegde/2, breidde/2, hoegde);
        this._hudBitmap.drawImage(this.ammoHUDImg, 50, hoegde-150, 100, 100);
        this._hudBitmap.fillText("Ammo: 12", 170, hoegde-80);
        this._hudBitmap.strokeText("Ammo: 12", 170, hoegde-80);
        this._hudTekstur.needsUpdate = true;
    }

    get scene() {
        return this._sceneHUD;
    }

    get kamera() {
        return this._kameraHUD;
    }

    get tekstur() {
        return this._hudTekstur;
    }

    get bitmap() {
        return this._hudBitmap;
    }
}