"use strict";

import { AnimationMixer, BoxBufferGeometry, BufferGeometry, CatmullRomCurve3, Curve, EllipseCurve, Line, LineBasicMaterial, LoopOnce, Mesh, MeshBasicMaterial, Vector3 } from "../../lib/three.module.js";

export default class Fugl {

    constructor(scene, loader) {

        //TODO importer modell
        loader.load('./resources/models/low_poly_bird_animated/scene.gltf', (object) => {
            this._modell = object.scene.children[0];

            this._modell.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            //object.scene.scale.multiplyScalar(1/100);
            this._mixer = new AnimationMixer(object.scene);
            this.action = this._mixer.clipAction(object.animations[0]);
            this.action.play();

            this._modell.scale.multiplyScalar(1 / 2);

            //modell.position.y = 5;
            //modell.rotateZ(Math.PI);
            scene.add(object.scene);
        });

        /*
        //lager liten boks
        let boksGeo = new BoxBufferGeometry(2,2,2,1,1,1);
        let boksMat = new MeshBasicMaterial({color: 0xff0000});
        this.boks = new Mesh(boksGeo, boksMat);
        this.boks.position.y = 5;
        */

        //lager kurve den skal følgje
        //this.kurve = new EllipseCurve(0, 0, 10, 20, 0, 2*Math.PI, false, 0);
        this.kurve = new CatmullRomCurve3([
            new Vector3(10, 25, 200),
            new Vector3(-100, 24, 200),
            new Vector3(-100, 26, 100),
            new Vector3(10, 23, 100)
        ], true, 'catmullrom', 1.0);

        const punkter = this.kurve.getPoints(100);

        const geometri = new BufferGeometry().setFromPoints(punkter);

        const materiale = new LineBasicMaterial({ color: 0xff0000 });

        const ellipse = new Line(geometri, materiale);

        scene.add(ellipse);
        //scene.add(this.boks);

        this.axis = new Vector3();
        this.up = new Vector3(0, 1, 0);
        this._harBlittSkutt = false;
        this.fartFall = 0;
    }

    beveg(t, delta, posOverBakken) {
        if (!this._harBlittSkutt) {
            let pos = this.kurve.getPoint(t);
            let tan = this.kurve.getTangent(t).normalize().multiplyScalar(-1);

            if (this._modell) {
                //this.modUp = this.modell.up;
                this.axis.crossVectors(this.up, tan).normalize();
                let radians = Math.acos(this.up.dot(tan));

                this._modell.position.copy(pos);
                this._modell.quaternion.setFromAxisAngle(this.axis, radians);
                //this.boks.quaternion.setFromAxisAngle(this.modAxis, radians);
                //this.modell.lookAt(tan.add(this.modell.position));
            }
        } else {
            this.action.stop();
            if (posOverBakken < this._modell.position.y) {
                this.fartFall -= 9.8 * 5.0 * delta; // 5 = massen
                this._modell.position.y += this.fartFall * delta;
            } else {
                this.fartFall = 0;
                this._modell.position.y = posOverBakken;
            }
        }
        //this.boks.position.copy(pos);
    }

    get mixer() {
        return this._mixer;
    }

    set mixer(mixer) {
        this._mixer = mixer;
    }

    get modell() {
        return this._modell;
    }

    set modell(modell) {
        this._modell = modell;
    }

    get harBlittSkutt() {
        return this._harBlittSkutt;
    }

    set harBlittSkutt(verdi) {
        this._harBlittSkutt = verdi;
    }
}