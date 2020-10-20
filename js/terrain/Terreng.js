"use strict";

import { SimplexNoise } from "../lib/SimplexNoise.js";
import { Mesh, RepeatWrapping, TextureLoader } from "../lib/three.module.js";
import Utilities from "../lib/Utilities.js";
import TextureSplattingMaterial from "../materials/TextureSplattingMaterial.js";
import TerrainBufferGeometry from "./TerrainBufferGeometry.js";

export default class Terreng extends Mesh {

    //TODO fiks namnet
    //Skal den utvide noko?

    //TODO fleire parametre i konstruktøren
    constructor(heightmapImage) {
        const width = 600;

        const simplex = new SimplexNoise();
        const terrainGeometry = new TerrainBufferGeometry({
            width,
            heightmapImage,
            // noiseFn: simplex.noise.bind(simplex),
            numberOfSubdivisions: 256,
            height: 20
        });

        const grassTexture = new TextureLoader().load('./resources/textures/grass_02.png');
        grassTexture.wrapS = RepeatWrapping;
        grassTexture.wrapT = RepeatWrapping;
        grassTexture.repeat.set(5000 / width, 5000 / width);

        const snowyRockTexture = new TextureLoader().load('./resources/textures/snowy_rock_01.png');
        snowyRockTexture.wrapS = RepeatWrapping;
        snowyRockTexture.wrapT = RepeatWrapping;
        snowyRockTexture.repeat.set(1500 / width, 1500 / width);


        const splatMap = new TextureLoader().load('./resources/images/splatmap_01.png');

        const terrainMaterial = new TextureSplattingMaterial({
            color: 0xffffff,
            shininess: 0,
            textures: [snowyRockTexture, grassTexture],
            splatMaps: [splatMap]
        });

        super(terrainGeometry, terrainMaterial);

        this._terrainGeometry = terrainGeometry;
        this.castShadow = true;
        this.receiveShadow = true;
    }

    get terrengGeometri() {
        return this._terrainGeometry;
    }


}