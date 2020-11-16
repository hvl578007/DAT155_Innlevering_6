"use strict";

import { Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, MultiplyOperation, PlaneBufferGeometry, RepeatWrapping, TextureLoader } from "../lib/three.module.js";

export default class Innsjo extends Mesh {

    constructor(envMapParam) {

        //lagar geometri 100x100
        //TODO lek litt med inndelingar for å få det "betre"..
        let vassGeometri = new PlaneBufferGeometry(75, 75, 100, 100);
        //vassGeometri.rotateX(-Math.PI / 2);

        //lagar materiale som responderer til lyset
        
        
        let vassMateriale = new MeshPhongMaterial({
            transparent: true,
            opacity: 0.95,
            shininess: 100,
            //map: vassTekstur,
            envMap: envMapParam
        });
        

        /*
        let vassMateriale = new MeshBasicMaterial({
            envMap: envMapParam,
            combine: MultiplyOperation,
            reflectivity: 1
        });
        */

        
        //endrer materialshaderen før den skal kompilere
        //henta kode og slikt frå https://medium.com/@joshmarinacci/water-ripples-with-vertex-shaders-6a9ecbdf091f
        vassMateriale.onBeforeCompile = (shader) => {
            //legg til uniform i shaderen
            shader.uniforms.time = { value: 0 };
            shader.vertexShader = `
                uniform float time;
            ` + shader.vertexShader;

            const token = '#include <begin_vertex>';
            //equation for normals from:
            // https://stackoverflow.com/questions/9577868/glsl-calculate-surface-normal

            //kode for å lage nye normalar og transformere punkta
            const customTransform = `
                vec3 transformed = vec3(position);
                float freq = 1.0;
                float amp = 0.04;
                float angle = (time + position.y)*freq;
                transformed.z += sin(angle)*amp;
                objectNormal = normalize(vec3(0.0,-amp * freq * cos(angle),1.0));
                vNormal = normalMatrix * objectNormal;
            `;

            //bytter ut kode i shaderen
            shader.vertexShader = shader.vertexShader.replace(token, customTransform);
            //lagrar shaderen for å kunne oppdatere/sende ny uniform til shaderen når ein rendrer
            this._matShader = shader;
        };
        

        super(vassGeometri, vassMateriale);

        this._vassMateriale = vassMateriale;

        this.receiveShadow = true;
        //this.castShadow = true;

        this.rotation.x = -Math.PI / 2;
        this.position.x = -30;
        this.position.z = 170;
        //flytter vatnet litt over 0
        this.position.y = 1.9;
    }

    get matShader() {
        return this._matShader;
    }

    set matShader(shader) {
        this._matShader = shader;
    }

    get vassMateriale() {
        return this._vassMateriale;
    }

    set vassMateriale(materiale) {
        this._vassMateriale = materiale;
    }

}