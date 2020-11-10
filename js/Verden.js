"use strict";

import { Object3D } from "./lib/three.module.js";
import LysLager from "./lights/LysLager.js";
import { GLTFLoader } from "./loaders/GLTFLoader.js";
import InnsjoCubeMap from "./materials/InnsjoCubeMap.js";
import GoldenGun from "./models/GoldenGun.js";
import Lommelykt from "./models/Lommelykt.js";
import Skydome from "./skydome/Skydome.js";
import Innsjo from "./terrain/Innsjo.js";
import ModellImport from "./terrain/ModellImport.js";
import BlokkHinderloye from "./terrain/objects/BlokkHinderloype.js";
import Hus from "./terrain/objects/Hus.js";
import JapanskBygning from "./terrain/objects/JapanskBygning.js"
import Stein from "./terrain/objects/Stein.js";
import Terreng from "./terrain/Terreng.js";
import Vatn from "./terrain/Vatn.js";
import Sol from "./lights/Sol.js"

/**
 * Set opp verdenen i scenegrafen
 */
export default class Verden {
    
    //skal den extende mesh? kanskje unødvendig
    /**
     * 
     * @param {*} scene 
     * @param {*} kamera 
     * @param {*} objekterHoppePaa tabell med objekter ein kan hoppe oppå
     */
    constructor(scene, kamera, objekterHoppePaa) {

        /**
         * Legg til lys og sol i scenen
         */

        let lys = new LysLager();

        this.Sol = new Sol(scene, lys);

        //lagar retningsbasert lys
        //const retningslys = lys.lagRetningslys();
        //scene.add(retningslys);
        //scene.add(retningslys.target);

        // ambient lys
        const ambientLys = lys.lagAmbientLys();
        scene.add(ambientLys);

        // --------------------------------------------------------------------------------------

        /**
         * Lagar og legg til terreng i scenen
         *
         */

        let heightMapImage = document.getElementById("heightMap");

        this._terreng = new Terreng(heightMapImage);

        scene.add(this.terreng);

        // --------------------------------------------------------------------------------------

        //lagar ein loader
        this.loader = new GLTFLoader();

        /**
         * Add trees
         * TODO bruk støy (gaussisk / normalfordeling) til å meir "naturleg plassere trer" + må ikkje plassere dei i vatnet ;)
         *
         */

        let modellImport = new ModellImport();
        //plasserer rundt trer i this._scenen (burde bruke terrenget heller)
        modellImport.plasserTrer(this.terreng.terrengGeometri, scene);

        // --------------------------------------------------------------------------------------

        /**
         * Legg til vatn i terrenget
         */

        //lagar eit nytt vatn som skal plasserast i terrenget
        this._vatn = new Vatn();

        //legg til vatnet i terrenget
        this._terreng.add(this._vatn);

        /**
         * lager cubecamera for å få til dynamisk cube mapping på vatnet:
         */
        this._innsjoCubeMap = new InnsjoCubeMap();

        /**
         * Legg til innsjø i terrenget
         * 
         */
        this._innsjo = new Innsjo(this._innsjoCubeMap.cubeRenderTarget2.texture);
        this._terreng.add(this._innsjo);

        // --------------------------------------------------------------------------------------

        /**
         * Legg til skydome i this._scenen
         */

        //alt kjører bra, men kan ikke se skydomen?? skal være grå farget men alt er hvitt i skyene.
        //lager og legger til skydome
        let skyDome = new Skydome();
        //endrer slik at skydomen rendres innenfra
        //skyDome.material.side = BackSide; //<-- flytta denne inn i klassen heller
        skyDome.position.y = 40; 

        //legger til skydome i this._scenen
        scene.add(skyDome);

        // --------------------------------------------------------------------------------------

        /**
         * Lagar stein i terrenget (berre 1, utvide med fleire?)
         */

        this.stein = new Stein();

        this.stein.position.x = -10;
        this.stein.position.z = 50;
        this.stein.position.y = -3;
        this.stein.rotation.x = (Math.PI/2);

        objekterHoppePaa.push(this.stein);

        scene.add(this.stein);

        // --------------------------------------------------------------------------------------

        /**
         * Legg til blokker i ei hinderløype:
         */
        this.blokkHinderloype = new BlokkHinderloye();
        objekterHoppePaa.push(this.blokkHinderloype);

        scene.add(this.blokkHinderloype);

        /**
         * legger til urbane ting 
         */
        this.hus = new Hus(scene, this.loader);

        //this.japanskBygning = new JapanskBygning(scene, this.loader);
        //--------------------------------------------------------------------------------------

        //for ping-pong av cube map
        this.count = 0;
    }

    get goldengun() {
        return this._goldengun;
    }

    get terreng() {
        return this._terreng;
    }

    get vatn() {
        return this._vatn;
    }

    get innsjo() {
        return this._innsjo;
    }

    get innsjoCubeMap() {
        return this._innsjoCubeMap;
    }

    bevegPaaVatn(time) {
        if (this._vatn.matShader) this._vatn.matShader.uniforms.time.value = time;
        if (this._innsjo.matShader) this._innsjo.matShader.uniforms.time.value = time;
    }

    oppdaterCubeMapVatn(renderer, scene) {
        //oppdatering av cube map / env map
        // pingpong
        renderer.autoClear = true;
        this._innsjo.hidden = true;
        if (this.count % 2 === 0) {
            this._innsjoCubeMap.cubeCamera1.update(renderer, scene);
            this._innsjo.vassMateriale.envMap = this._innsjoCubeMap.cubeRenderTarget1.texture;
        } else {
            this._innsjoCubeMap.cubeCamera2.update(renderer, scene);
            this._innsjo.vassMateriale.envMap = this._innsjoCubeMap.cubeRenderTarget2.texture;
        }
        this._innsjo.hidden = false;
        renderer.autoClear = false;

        this.count++;
    }

    bevegSol(tSol){
        this.Sol.beveg(tSol);
    }
}