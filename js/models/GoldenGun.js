"use strict";

import { AnimationMixer } from "../lib/three.module.js";

export default class GoldenGun {

    constructor(kamera, gltfloader) {
        gltfloader.load(
            './resources/models/james_bond_golden_gun/scene.gltf',
            (object) => {
                //henter ut objektet
                let gun = object.scene.children[0];

                //vil lage skygge og få skygge
                gun.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                //lagrar animasjonar som er i modellen i ein mixer som ein bruke til å spele av i loop-metoden
                this._mixer = new AnimationMixer(object.scene);
                
                object.animations.forEach((clip) => {this._mixer.clipAction(clip).play()});

                //posisjonerer våpnet
                gun.position.z = -1.7;
                gun.position.y = -0.7;
                gun.position.x = 1;
                //roterer våpnet litt 
                gun.rotation.z = 3.25;
                //gjer våpnet mindre for å ikkje klippe inn i ting
                gun.scale.multiplyScalar(1/40);

                //legg til våpnet under kamera slik at den følger med der
                kamera.add(object.scene);

                this._gun = gun;
            }
        );
    }

    get mixer() {
        return this._mixer;
    }

    set mixer(mixer) {
        this._mixer = mixer;
    }

    get gun() {
        return this._gun;
    }
}