"use strict";

import { BoxBufferGeometry, InstancedMesh, Matrix4, MeshPhongMaterial, TextureLoader } from "../../lib/three.module.js";

export default class BlokkHinderloye extends InstancedMesh {

    constructor() {

        const antInstanced = 100;

        let loader = new TextureLoader();
        loader.setPath('./resources/textures/blokk_hinderloype/');

        /*
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
        */

        //kubeTekstur.wrapS = RepeatWrapping;
        //kubeTekstur.wrapT = RepeatWrapping;
        //kubeTekstur.repeat.set(100);
        //kubeTekstur.anisotropy = 16;

        let materialeTabell = [
            //todo meshphong for mindre kraft?
            new MeshPhongMaterial({map: loader.load('chiseled_quartz_block.png')}),
            new MeshPhongMaterial({map: loader.load('chiseled_quartz_block.png')}),
            new MeshPhongMaterial({map: loader.load('chiseled_quartz_block.png')}),
            new MeshPhongMaterial({map: loader.load('chiseled_quartz_block.png')}),
            new MeshPhongMaterial({map: loader.load('chiseled_quartz_block_top.png')}),
            new MeshPhongMaterial({map: loader.load('chiseled_quartz_block_top.png')})
        ];

        let geometri = new BoxBufferGeometry(10, 10, 10, 1, 1, 1);

        /*let materiale = new MeshPhongMaterial({
            //envMap: kubeTekstur
            color: 0x03fc3d,
            envMap: kubeTekstur
            //flatShading: true
        });
        */

        super(geometri, materialeTabell, antInstanced);

        this.receiveShadow = true;
        this.castShadow = true;

        //let i = 0;

        //TODO - sjekk ut eksemplet og "stjel kode derfrå!"
        for (let i = 0; i < antInstanced; i++ ) {

            let x = 300 + Math.floor( Math.random() * 10 - 10 ) * 10;
            let y = Math.floor( Math.random() * 10 ) * 10 + 10;
            let z = 300 + Math.floor( Math.random() * 10 - 10 ) * 10;
            
            let matrise = new Matrix4().setPosition(x, y, z);

            this.setMatrixAt(i, matrise);

        }

        this.instanceMatrix.needsUpdate = true;
        
    }

}