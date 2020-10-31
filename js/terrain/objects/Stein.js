"use strict";

import { BoxBufferGeometry, CubeGeometry, Mesh, MeshStandardMaterial, SphereBufferGeometry, TextureLoader } from "../../lib/three.module.js";

export default class Stein extends Mesh {

    constructor() {

        let steinDisplacement = new TextureLoader().load('./resources/textures/rock/Rock_039_height.png');
        let steinNormalMap = new TextureLoader().load('./resources/textures/rock/Rock_039_normal.jpg');
        let steinRough = new TextureLoader().load('./resources/textures/rock/Rock_039_roughness.jpg');
        let steinTexture = new TextureLoader().load('./resources/textures/rock/Rock_039_baseColor.jpg');
        let steinAmbientOcclusion = new TextureLoader().load('./resources/textures/rock/Rock_039_ambientOcclusion.jpg');

        let steinGeometri = new SphereBufferGeometry(7, 64, 64);

        let steinMateriale = new MeshStandardMaterial({
            aoMap: steinAmbientOcclusion,
            displacementMap: steinDisplacement,
            normalMap: steinNormalMap,
            roughnessMap: steinRough,
            map: steinTexture
        });

        super(steinGeometri, steinMateriale);

        this.receiveShadow = true;
        this.castShadow = true;
    }
}