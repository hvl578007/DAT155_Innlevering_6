"use strict";

import { Mesh, MeshPhongMaterial, PlaneBufferGeometry, ShaderMaterial } from "../lib/three.module.js";

export default class Vatn extends Mesh {

    constructor() {

        let vassGeometri = new PlaneBufferGeometry(600, 600, 100, 100);
        vassGeometri.rotateX(-Math.PI / 2);
        let vassMateriale = new MeshPhongMaterial({
            transparent: true,
            opacity: 0.5,
            color: 0x0000ff
        });

        super(vassGeometri, vassMateriale);

    }


}