"use strict";

import { BoxBufferGeometry, CubeTextureLoader, InstancedMesh, Matrix4, MeshStandardMaterial, RepeatWrapping } from "../../lib/three.module.js";

export default class BlokkHinderloye extends InstancedMesh {

    constructor() {

        const antInstanced = 100;

        let kubeTekstur = new CubeTextureLoader()
            .setPath('./resources/textures/blokk_hinderloype/')
            .load([
                'chiseled_quartz_block.png',
                'chiseled_quartz_block.png',
                'chiseled_quartz_block.png',
                'chiseled_quartz_block.png',
                'chiseled_quartz_block_top.png',
                'chiseled_quartz_block_top.png'
            ]);

        kubeTekstur.wrapS = RepeatWrapping;
        kubeTekstur.wrapT = RepeatWrapping;
        kubeTekstur.repeat.set(100);
        kubeTekstur.anisotropy = 16;

        let geometri = new BoxBufferGeometry(8, 8, 8, 1, 1, 1);

        let materiale = new MeshStandardMaterial({
            envMap: kubeTekstur
        });

        super(geometri, materiale, antInstanced);

        this.castShadow = true;
        this.recieveShadow = true;

        let i = 0;

        //TODO - sjekk ut eksemplet og "stjel kode derfrå!"

        for (let x = 200; x < 450; x += 30) {
            for (let z = 200; z < 450; z += 40) {
                for (let y = 0; y < 50; y += 10) {

                    //litt tilfeldig plassering rundt dei punkta
                    const px = x + 1 + (12 * Math.random()) - 3;
                    const pz = z + 1 + (12 * Math.random()) - 3;
                    const py = y + 1 + (12 * Math.random()) - 3;

                    //if (height > 2 && height < 9) {

                    let matrise = new Matrix4().setPosition(px, py, pz);

                    if (i < antInstanced) {
                        this.setMatrixAt(i, matrise);
                        i++
                    }



                    //tree.position.x = px;
                    //tree.position.y = height - 0.01;
                    //tree.position.z = pz;

                    //tree.rotation.y = Math.random() * (2 * Math.PI);

                    //tree.scale.multiplyScalar(5 + Math.random() * 1);

                    //scene.add(tree);
                    //}

                }
            }


        }
        this.instanceMatrix.needsUpdate = true;

    }

}