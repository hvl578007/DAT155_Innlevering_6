"use strict";

import { Group, PointLight, SpotLight } from "../lib/three.module.js";
import Spel from "../Spel.js";


export default class Lommelykt {

    constructor(kamera, gltfloader) {

        gltfloader.load(
            './resources/models/worn_silver_flashlight/scene.gltf',
            (object) => {

                const lommelykt = object.scene.children[0];

                lommelykt.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                //posisjonerer lommelykta
                lommelykt.position.z = -1.5;
                lommelykt.position.y = -0.7;
                lommelykt.position.x = 1;
                //roterer lommelykta litt 
                lommelykt.rotation.z = 3.25;
                //gjer lommelykta mindre for å ikkje klippe inn i ting
                lommelykt.scale.multiplyScalar(1/2);

                //legg til lommelykta under kamera slik at den følger med der

                //lagar ei gruppe for at ein enkelt kan skjule og vise lommelykta + lyset
                this._lommelyktGruppe = new Group();
                kamera.add(this._lommelyktGruppe);

                this._lommelyktGruppe.add(object.scene);

                //kamera.add(object.scene);

                //lager spotlys som "simulerer lommelykt"
                let spotLys = new SpotLight(0xf8c377, 3, 100, 0.5, 0.9, 2);
                //skygge på lommelykt såg litt dårleg ut..
                /*
                spotLys.castShadow = true;
                spotLys.shadow.mapSize.width = 512;
                spotLys.shadow.mapSize.height = 512;
                spotLys.shadow.camera.near = 3.1;
                spotLys.shadow.camera.far = 100;
                spotLys.shadow.camera.fov = 30;
                */

                //legg til spotlys i gruppa
                this._lommelyktGruppe.add(spotLys);
                //set posisjonen til lyset rett bak kamera:
                spotLys.position.set(0,0,1);
                //peiker lyset mot kameraet (så den føl musepeikaren)
                spotLys.target = kamera;

                //skjuler gruppa
                this._lommelyktGruppe.visible = false;

            }
        );

    }

    get lommelyktGruppe() {
        return this._lommelyktGruppe;
    }

    vis(verdi) {
        if(this._lommelyktGruppe) this._lommelyktGruppe.visible = verdi;
    }

}