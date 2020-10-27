"use strict";

import { DoubleSide, Mesh, MeshPhongMaterial, PlaneBufferGeometry, RepeatWrapping, ShaderMaterial, TextureLoader } from "../lib/three.module.js";
import VassMateriale from "../materials/VassMateriale.js";

/**
 * @author Stian
 */
export default class Vatn extends Mesh {

    constructor() {

        //laster inn vasstekstur
        let vassTekstur = new TextureLoader().load('./resources/textures/watermap_minecraft.jpg');
        //set at teksturen skal repetere (det er ein veldig liten tekstur)
        vassTekstur.wrapS = RepeatWrapping;
        vassTekstur.wrapT = RepeatWrapping;
        vassTekstur.repeat.set(200, 200);

        //lagar geometri 600x600
        //TODO lek litt med inndelingar for å få det "betre"..
        let vassGeometri = new PlaneBufferGeometry(600, 600, 300, 300);
        //vassGeometri.rotateX(-Math.PI / 2);

        //lagar materiale som responderer til lyset
        let vassMateriale = new MeshPhongMaterial({
            transparent: true,
            opacity: 1.0,
            shininess: 20,
            map: vassTekstur
        });

        //endrer materialshaderen før den skal kompilere
        //henta kode og slikt frå https://medium.com/@joshmarinacci/water-ripples-with-vertex-shaders-6a9ecbdf091f
        vassMateriale.onBeforeCompile = (shader) => {
            //legg til uniform og lagar nokon variablar i shaderen
            shader.uniforms.time = { value: 0 };
            shader.vertexShader = `
                uniform float time;
                float wave(float time, float freq, float amp) {
                float angle = (time+position.y)*freq;
                    return sin(angle)*amp;
                }
                float waveNorm(float time, float freq, float amp) {
                float angle = (time+position.y)*freq;
                    return -amp * freq * cos(angle);
                }
            ` + shader.vertexShader;

            const token = '#include <begin_vertex>';
            //equation for normals from:
            // https://stackoverflow.com/questions/9577868/glsl-calculate-surface-normal

            //kode for å lage nye normalar og transformere punkta
            const customTransform = `
                vec3 transformed = vec3(position);
                float freq = 2.0;
                float amp = 0.15;
                /*
                float angle = (time + position.y)*freq;
                transformed.z += sin(angle)*amp;
                objectNormal = normalize(vec3(0.0,-amp * freq * cos(angle),1.0));
                vNormal = normalMatrix * objectNormal;
                */
                
                
                transformed.z += wave(time,freq,amp)
                    + wave(time,freq*2.0,amp/2.0)
                    + wave(time,freq*3.5,amp*0.2);
                float normWave = waveNorm(time,freq,amp)
                    + waveNorm(time,freq*2.0,amp/2.0)
                    + waveNorm(time,freq*3.5,amp*0.2);
                objectNormal = normalize(vec3(0.0, normWave,1.0));
                vNormal = normalMatrix * objectNormal;
                
            `;
            //bytter ut kode i shaderen
            shader.vertexShader = shader.vertexShader.replace(token, customTransform);
            //lagrar shaderen for å kunne oppdatere/sende ny uniform til shaderen når ein rendrer
            this._matShader = shader;
        };

        //lagar mesh-en
        super(vassGeometri, vassMateriale);

        //skal få skygge
        this.receiveShadow = true;
        //this.castShadow = true;

        //rotterer og posisjonerer den "rett"
        this.rotation.x = -Math.PI / 2;
        //this.position.z = -0;
        //flytter vatnet litt over 0
        this.position.y = 1.3;
    }

    get matShader() {
        return this._matShader;
    }

    set matShader(shader) {
        this._matShader = shader;
    }


}