"use strict";

import { DirectionalLight } from "../lib/three.module.js";

export default class LysLager {

    //TODO fiks namnet
    //Skal den utvide noko?

    constructor() {

    }

    lagRetningslys() {
        let retningslys = new DirectionalLight(0xffffff);
        retningslys.position.set(300, 600, 300);

        retningslys.castShadow = true;

        //Set up shadow properties for the light
        retningslys.shadow.mapSize.width = 2048;
        retningslys.shadow.mapSize.height = 2048;
        retningslys.shadow.camera.near = 0.5;
        retningslys.shadow.camera.far = 3000;

        // Set direction
        retningslys.target.position.set(0, 15, 0);

        return retningslys;
    }
    
}