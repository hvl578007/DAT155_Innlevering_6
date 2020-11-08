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
                //roterer våpnet litt 
                lommelykt.rotation.z = 3.25;
                //gjer våpnet mindre for å ikkje klippe inn i ting
                lommelykt.scale.multiplyScalar(1/2);

                //legg til lommelykta under kamera slik at den følger med der

                let lommelyktGruppe = new Group();
                kamera.add(lommelyktGruppe);

                lommelyktGruppe.add(object.scene);

                //kamera.add(object.scene);

                let spotLys = new SpotLight(0xf8c377, 3, 75, 0.5, 0.9, 2);
                //let pointLys = new PointLight(0xf8c377, 1, 40);
                //this._spotLys = this.lagSpotLysInternt();

                lommelyktGruppe.add(spotLys);
                spotLys.position.set(0,0,1);

                spotLys.target = kamera;

                //Spel.controls.getObject().add(spotLys.target);
                //pointLys.target.position.set(0,0,-1);
                lommelyktGruppe.visible = true;

            }
        );

    }

    /**
     * NB! Berre for intern bruk!
     */
    lagSpotLysInternt() {
        //TODO lek litt med parametre her!
        let spotLys = new SpotLight(0xf8c377, 1, 40);

        /*
        spotLys.castShadow = true;

        spotLys.shadow.mapSize.width = 1024;
        spotLys.shadow.mapSize.height = 1024;

        spotLys.shadow.camera.near = 0.1;
        spotLys.shadow.camera.far = 200;
        spotLys.shadow.camera.fov = 30;
        */

        //spotLys.target.position.set(0,0,1);

        return spotLys;
    }
}