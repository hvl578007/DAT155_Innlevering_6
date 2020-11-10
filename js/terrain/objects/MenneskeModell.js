"use strict";

import { BoxBufferGeometry, BufferGeometry, EllipseCurve, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Vector3 } from "../../lib/three.module.js";

export default class MenneskeModell {

    constructor(terreng, loader) {
        
        //TODO importer modell
        loader.load('./resources/models/low_poly_male_base_rigged_bonus_armor/scene.gltf', (object) => {
            const modell = object.scene.children[0];

                modell.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

            //object.scene.scale.multiplyScalar(1/100);

            modell.scale.multiplyScalar(1/200);

            modell.position.y = 5;
            this.modell = modell;
            terreng.add(object.scene);
        });

        //lager liten boks
        let boksGeo = new BoxBufferGeometry(2,2,2,1,1,1);
        let boksMat = new MeshBasicMaterial({color: 0xff0000});
        this.boks = new Mesh(boksGeo, boksMat);
        this.boks.position.y = 5;

        //lager kurve den skal følgje
        this.kurve = new EllipseCurve(0, 0, 10, 20, 0, 2*Math.PI, false, 0);

        const punkter = this.kurve.getPoints(100);

        const geometri = new BufferGeometry().setFromPoints(punkter);
        geometri.rotateX(-Math.PI/2); 

        const materiale = new LineBasicMaterial({color: 0xff0000});

        const ellipse = new Line(geometri, materiale);
        ellipse.position.y = 5;

        terreng.add(ellipse);
        terreng.add(this.boks);

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

            //this.boks.quaternion.setFromAxisAngle(this.modAxis, radians);

            this.modell.position.x = pos.x;
            this.modell.position.z = pos.y;
            //this.modell.rotateZ(0.1);
        }

        this.boks.position.x = pos.x;
        this.boks.position.z = pos.y;
    }
}