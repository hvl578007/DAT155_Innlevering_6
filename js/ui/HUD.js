"use strict";

import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneBufferGeometry, PlaneGeometry, Scene, Texture } from "../lib/three.module.js";

export default class HUD {

    constructor(hoegde, breidde) {

        //henta kode frå https://www.evermade.fi/story/pure-three-js-hud/
        // og https://codepen.io/jaamo/pen/MaOGZV 

        //let hudCanvas = new OffscreenCanvas(breidde, hoegde);
        let hudCanvas = document.createElement('canvas');
        hudCanvas.height = hoegde;
        hudCanvas.width = breidde;
        this._hudBitmap = hudCanvas.getContext('2d');

        this._hudBitmap.font = "Normal 40px Arial";
        this._hudBitmap.textAlign = 'center';
        this._hudBitmap.fillStyle = "rgba(245,10,10,0.75";
        this._hudBitmap.fillText('Initializing...', breidde/2, hoegde/2);

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