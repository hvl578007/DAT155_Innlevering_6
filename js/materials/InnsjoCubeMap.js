"use strict";

import { CubeCamera, WebGLCubeRenderTarget } from "../lib/three.module.js";

export default class InnsjoCubeMap {

    //henta frå https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_cubemap_dynamic.html

    constructor() {

        //lagar rendertarget 1 (brukar 2 for ping-pong effekt / double-buffer)
        this._cubeRenderTarget1 = new WebGLCubeRenderTarget(1024, {
            anisotropy: 16
        });

        //lager det første kameraet
        this._cubeCamera1 = new CubeCamera(0.1, 800, this._cubeRenderTarget1);
        this._cubeCamera1.position.x = -30;
        this._cubeCamera1.position.z = 170;
        //TODO ka y-pos?
        this._cubeCamera1.position.y = 1.5;

        this._cubeRenderTarget2 = new WebGLCubeRenderTarget(1024, {
            anisotropy: 16
        });

        this._cubeCamera2 = new CubeCamera(0.1, 800, this._cubeRenderTarget2);
        this._cubeCamera2.position.x = -30;
        this._cubeCamera2.position.z = 170;
        //TODO ka y-pos?
        this._cubeCamera2.position.y = 1.5;
    }

    get cubeCamera1() {
        return this._cubeCamera1;
    }

    get cubeCamera2() {
        return this._cubeCamera2
    }

    get cubeRenderTarget1() {
        return this._cubeRenderTarget1;
    }

    get cubeRenderTarget2() {
        return this._cubeRenderTarget2;
    }
}