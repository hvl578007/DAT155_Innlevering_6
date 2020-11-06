"use strict";

import { BoxBufferGeometry, CubeTextureLoader, InstancedMesh, Matrix4, MeshPhongMaterial, MeshStandardMaterial, RepeatWrapping } from "../../lib/three.module.js";

export default class BlokkHinderloye extends InstancedMesh {

    constructor() {

        const antInstanced = 500;

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

        //kubeTekstur.wrapS = RepeatWrapping;
        //kubeTekstur.wrapT = RepeatWrapping;
        //kubeTekstur.repeat.set(100);
        //kubeTekstur.anisotropy = 16;

        let geometri = new BoxBufferGeometry(8, 8, 8, 1, 1, 1);

        let materiale = new MeshPhongMaterial({
            //envMap: kubeTekstur
            color: 0x03fc3d,
            //flatShading: true
        });

        super(geometri, materiale, antInstanced);

        this.castShadow = true;
        this.recieveShadow = true;

        //let i = 0;

        //TODO - sjekk ut eksemplet og "stjel kode derfrå!"
        for (let i = 0; i < antInstanced; i++ ) {

            let x = 300 + Math.floor( Math.random() * 10 - 10 ) * 20;
            let y = Math.floor( Math.random() * 10 ) * 10 + 10;
            let z = 300 + Math.floor( Math.random() * 10 - 10 ) * 20;
            
            let matrise = new Matrix4().setPosition(x, y, z);

            this.setMatrixAt(i, matrise);

        }

        this.instanceMatrix.needsUpdate = true;
        
    }

}