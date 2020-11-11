"use strict";

import { BoxBufferGeometry, BufferGeometry, CatmullRomCurve3, EllipseCurve, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3 } from "../../lib/three.module.js";

export default class Fugl {

    constructor(scene, loader) {
        
        //TODO importer modell
        loader.load('./resources/models/low_poly_bird_animated/scene.gltf', (object) => {
            const modell = object.scene.children[0];

                modell.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

            //object.scene.scale.multiplyScalar(1/100);

            modell.scale.multiplyScalar(1/2);

            //modell.position.y = 5;
            //modell.rotateZ(Math.PI);
            this.modell = modell;
            scene.add(object.scene);
        });

        //lager liten boks
        let boksGeo = new BoxBufferGeometry(2,2,2,1,1,1);
        let boksMat = new MeshBasicMaterial({color: 0xff0000});
        this.boks = new Mesh(boksGeo, boksMat);
        this.boks.position.y = 5;

        //lager kurve den skal følgje
        //this.kurve = new EllipseCurve(0, 0, 10, 20, 0, 2*Math.PI, false, 0);
        this.kurve = new CatmullRomCurve3([
            new Vector3(10, 10, 10),
            new Vector3(-10, 10, 10),
            new Vector3(-10, 8, -10),
            new Vector3(10, 5, -10)
        ]);
        this.kurve.closed = true;

        const punkter = this.kurve.getPoints(200);

        const geometri = new BufferGeometry().setFromPoints(punkter);

        const materiale = new LineBasicMaterial({color: 0xff0000});

        const ellipse = new Line(geometri, materiale);

        scene.add(ellipse);
        //scene.add(this.boks);

        this.modAxis = new Vector3();
        this.modUp = new Vector3(0,1,0);
    }

    beveg(t) {
        let pos = this.kurve.getPoint(t);
        let tan = this.kurve.getTangent(t);

        if (this.modell) {
            //this.modUp = this.modell.up;
            this.modAxis.crossVectors(this.modUp, tan).normalize();
            let radians = Math.acos(this.modUp.dot(tan));

            this.modell.position.copy(pos);
            this.modell.quaternion.setFromAxisAngle(this.modAxis, radians);
            //this.boks.quaternion.setFromAxisAngle(this.modAxis, radians);
            //this.modell.lookAt(tan.add(this.modell.position));
        }

        this.boks.position.copy(pos);
    }
}