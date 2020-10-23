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
        //litt høg res på shadow texture... 8k ;)
        retningslys.shadow.mapSize.width = 8192;
        retningslys.shadow.mapSize.height = 8192;
        retningslys.shadow.camera.near = 0.5;
        retningslys.shadow.camera.far = 800;
        //width av terreng/2 gir ca. ok?
        retningslys.shadow.camera.left = -300;
        retningslys.shadow.camera.right = 300;
        retningslys.shadow.camera.top = 300;
        retningslys.shadow.camera.bottom = -300;

        // Set direction
        retningslys.target.position.set(0, 15, 0);

        return retningslys;
    }
    
}