"use strict";

import { DirectionalLight, AmbientLight } from "../lib/three.module.js";

export default class LysLager {

    //TODO fiks namnet
    //Skal den utvide noko?

    constructor() {

    }

    lagRetningslys() {
        let retningslys = new DirectionalLight(0xffffff);
        //retningslys.position.set(300, 600, 300);

        retningslys.castShadow = true;

        //Set up shadow properties for the light
        //litt høg res på shadow texture... 8k ;)
        //14 = 16k, 13 = 8k, 12 = 4k, 11 = 2k, 10 = 1k
        let shadowRes = Math.pow(2, 10);
        retningslys.shadow.mapSize.width = shadowRes;
        retningslys.shadow.mapSize.height = shadowRes;
        retningslys.shadow.camera.near = 20;
        retningslys.shadow.camera.far = 750;
        //width av terreng/2 gir ca. ok?
        retningslys.shadow.camera.left = -400;
        retningslys.shadow.camera.right = 400;
        retningslys.shadow.camera.top = 400;
        retningslys.shadow.camera.bottom = -400;

        // Set direction
        retningslys.target.position.set(0, 0, 0);

        return retningslys;
    }

    lagAmbientLys() {
        let ambLys = new AmbientLight(0x404040, 1.0); // soft white light
        return ambLys;
    }
    
}