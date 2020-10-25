"use strict";

import { Mesh, MeshPhongMaterial, PlaneBufferGeometry, RepeatWrapping, ShaderMaterial, TextureLoader } from "../lib/three.module.js";
import VassMateriale from "../materials/VassMateriale.js";

export default class Vatn extends Mesh {

    constructor() {

        let vassTekstur = new TextureLoader().load('./resources/textures/watermap_minecraft.jpg');
        vassTekstur.wrapS = RepeatWrapping;
        vassTekstur.wrapT = RepeatWrapping;
        vassTekstur.repeat.set(200, 200);

        let vassGeometri = new PlaneBufferGeometry(600, 600, 100, 100);
        //vassGeometri.rotateX(-Math.PI / 2);
        
        let vassMateriale = new MeshPhongMaterial({
            transparent: true,
            opacity: 1.0,
            map: vassTekstur
        });

        vassMateriale.onBeforeCompile = (shader) => {
            shader.uniforms.time = { value: 0};
            shader.vertexShader = `
                uniform float time;
            ` + shader.vertexShader;

            const token = '#include <begin_vertex>';
            //equation for normals from:
            // https://stackoverflow.com/questions/9577868/glsl-calculate-surface-normal
            const customTransform = `
                vec3 transformed = vec3(position);
                float freq = 2.0;
                float amp = 0.5;
                float angle = (time + position.y)*freq;
                transformed.z += sin(angle)*amp;
                objectNormal = normalize(vec3(-amp * freq * cos(angle),0.0,1.0));
                vNormal = normalMatrix * objectNormal;
            `;
            shader.vertexShader = shader.vertexShader.replace(token,customTransform);
            this._matShader = shader;
        };

        super(vassGeometri, vassMateriale);

        this.receiveShadow = true;
        //this.castShadow = true;

        this.rotation.x = -Math.PI / 2

    }

    get matShader() {
        return this._matShader;
    }

    set matShader(shader) {
        this._matShader = shader;
    }


}