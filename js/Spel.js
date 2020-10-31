"use strict";

import MouseLookController from './controls/MouseLookController.js';
import Stats from './lib/Stats.js';
import {
    AxesHelper, PCFSoftShadowMap, PerspectiveCamera,
    Scene,
    Vector3, WebGLRenderer,
    BackSide,
    AnimationMixer,
    Clock,
    Raycaster,
    CubeCamera,
    WebGLCubeRenderTarget,
    RGBFormat,
    LinearMipmapLinearFilter,
    sRGBEncoding,
    Fog,
    FogExp2,
    TextureLoader
} from './lib/three.module.js';
import LysLager from './lights/LysLager.js';
import Terreng from './terrain/Terreng.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import ModellImport from './terrain/ModellImport.js';
import Vatn from './terrain/Vatn.js';
import Skydome from './skydome/Skydome.js';
import { PointerLockControls } from './controls/PointerLockControls.js';
import GoldenGun from './models/GoldenGun.js';
import Innsjo from './terrain/Innsjo.js';
import InnsjoCubeMap from './materials/InnsjoCubeMap.js';
import Stein from './terrain/objects/Stein.js';

export default class Spel {

    //er statisk fordi ein eventlistener må ha tak i den
    //TODO fiks (eigen klasse eller noko greier)
    static controls;

    constructor() {

        /**
         * Initialisering av scene, kamera, renderer og slikt
         */
        this._scene = new Scene();

        const axesHelper = new AxesHelper(15);
        axesHelper.position.y = 5;
        this._scene.add(axesHelper);

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xffffff);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;

        // legg til tåke / fog på scenen:
        //TODO fiks farge og skydome?
        //this._scene.background = new TextureLoader().load('./resources/textures/Sky.jpg');
        this._scene.fog = new FogExp2(0x2980B9, 0.005);

        // --------------------------------------------------------------------------------------

        /**
         * Set opp kontrol / styring av kamera (mus + tastatur)
         * 
         * henta frå https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html
         * og brukt PointerLockControls frå threejs ekempler klassane (byggjer på Pointer Lock API-et)
         * https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
         */

        let blocker = document.getElementById('blocker');
        let instructions = document.getElementById('instructions');

        //object som har med kamera-styring og inputs
        Spel.controls = new PointerLockControls(this.camera, document.body);

        instructions.addEventListener('click', function () {

            Spel.controls.lock();

        }, false);

        Spel.controls.addEventListener('lock', function () {

            instructions.style.display = 'none';
            blocker.style.display = 'none';

        });

        Spel.controls.addEventListener('unlock', function () {

            blocker.style.display = 'block';
            instructions.style.display = '';

        });

        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            canJump: false
        };

        this.velocity = new Vector3();
        this.direction = new Vector3();

        //legg til kameraet i scenen, treng det for raycasting for hopp, og for å få fram ting som ligg under kameraet
        this._scene.add(Spel.controls.getObject());

        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);

        //lagar raycaster for å sjå om ein er oppå eit objekt
        this.raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 3);
        //lagar ein tabell som skal innehelde objekter som ein kan hoppe på
        this.objekterHoppePaa = [];

        // --------------------------------------------------------------------------------------

        /**
         * Handle window resize:
         *  - update aspect ratio.
         *  - update projection matrix
         *  - update renderer size
         */
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);

            //Spel.controls.handleResize();
        }, false);

        /**
        * Add canvas element to DOM.
        */
        document.body.appendChild(this.renderer.domElement);

        /**
         * Legg til stats-counter (fps osv)
         */

        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);


        /**
         * Lagar ei threejs klokke for å finne delta (tida mellom gammal og nåtid)
         */

        this.clock = new Clock();

        // --------------------------------------------------------------------------------------

        /**
         * Legg til lys i scenen
         */

        let lys = new LysLager();

        //lagar retningsbasert lys
        const retningslys = lys.lagRetningslys();

        this._scene.add(retningslys);
        this._scene.add(retningslys.target);

        // --------------------------------------------------------------------------------------

        //set startposisjonen til kameraet
        this.camera.position.z = 70;
        this.camera.position.y = 55;
        this.camera.rotation.x -= Math.PI * 0.25;

        // --------------------------------------------------------------------------------------

        /**
         * Lagar og legg til terreng i scenen
         *
         */

        let heightMapImage = document.getElementById("heightMap");

        this.terreng = new Terreng(heightMapImage);

        this._scene.add(this.terreng);

        // --------------------------------------------------------------------------------------

        /**
         * Add trees
         * TODO bruk støy (gaussisk / normalfordeling) til å meir "naturleg plassere trer" + må ikkje plassere dei i vatnet ;)
         *
         */

        let modellImport = new ModellImport();
        //plasserer rundt trer i this._scenen (burde bruke terrenget heller)
        modellImport.plasserTrer(this.terreng.terrengGeometri, this._scene);

        // --------------------------------------------------------------------------------------

        /**
         * Legg til golden gun på kameraet / spelaren
         */

        //laster inn eit gltf-objekt (golden gun)
        this.loader = new GLTFLoader();
        this.goldengun = new GoldenGun(this.camera, this.loader);

        // --------------------------------------------------------------------------------------

        /**
         * Legg til vatn i terrenget
         */

        //lagar eit nytt vatn som skal plasserast i terrenget
        this.vatn = new Vatn();

        //legg til vatnet i terrenget
        this.terreng.add(this.vatn);

        /**
         * lager cubecamera for å få til dynamisk cube mapping på vatnet:
         */
        this.innsjoCubeMap = new InnsjoCubeMap();

        /**
         * Legg til innsjø i terrenget
         * 
         */
        this.innsjo = new Innsjo(this.innsjoCubeMap.cubeRenderTarget2.texture);
        this.terreng.add(this.innsjo);

        // --------------------------------------------------------------------------------------

        /**
         * Legg til skydome i this._scenen
         */

        //alt kjører bra, men kan ikke se skydomen?? skal være grå farget men alt er hvitt i skyene.
        //lager og legger til skydome
        let skyDome = new Skydome();
        //endrer slik at skydomen rendres innenfra
        //skyDome.material.side = BackSide; //<-- flytta denne inn i klassen heller
        //skyDome.position.y = 5000; //<- denne setninga flytter skydome veldig høgt opp = kan ikkje sjå den lengre

        //legger til skydome i this._scenen
        this._scene.add(skyDome);

        // --------------------------------------------------------------------------------------

        /**
         * Lagar stein i terrenget (berre 1, utvide med fleire?)
         */

        this.stein = new Stein();

        this.stein.position.x = -10;
        this.stein.position.z = 50;
        this.stein.position.y = -3;
        this.stein.rotation.x = (Math.PI/2);

        this.objekterHoppePaa.push(this.stein);

        this._scene.add(this.stein);

        //berre lagrar canvas som ein objekt-variabel
        this._canvas = this.renderer.domElement;

        //TODO endre denne (Date.now() ???)
        this.time = 0;
        //for ping-pong av cube map
        this.count = 0;

    }

    /**
     * Metoden som blir brukt for å rendre scenen
     * TODO eigen klasse?
     */
    loop() {

        requestAnimationFrame(this.loop.bind(this));

        const delta = this.clock.getDelta();

        //TODO fiks dette her på eit eller anna vis...
        this.time += delta;
        if (this.time > 12.5) this.time = 0;

        //oppdaterer tid-variabel i vass-shaderen for å få til bevegelse
        if (this.vatn.matShader) this.vatn.matShader.uniforms.time.value = this.time;
        if (this.innsjo.matShader) this.innsjo.matShader.uniforms.time.value = this.time;

        //animerer våpnet
        //TODO fiks slik at det bare skjer ein gong
        if (this.goldengun.mixer) this.goldengun.mixer.update(delta);

        //hogda ein er i terrenget
        let terrengPosHogde = this.terreng.terrengGeometri.getHeightAt(this.camera.position.x, this.camera.position.z);

        //styrer med kontroll av kameraet
        //henta frå https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html

        if (Spel.controls.isLocked === true) {
        
            //TODO legg til objekter (i objects) ein kan hoppe på
            this.raycaster.ray.origin.copy(Spel.controls.getObject().position);
            this.raycaster.ray.origin.y -= 10;

            let intersections = this.raycaster.intersectObjects(this.objekterHoppePaa);

            let onObject = intersections.length > 0;

            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            this.velocity.y -= 9.8 * 125.0 * delta; // 100.0 = mass

            this.direction.z = Number(this.move.forward) - Number(this.move.backward);
            this.direction.x = Number(this.move.right) - Number(this.move.left);
            this.direction.normalize(); // this ensures consistent movements in all directions

            if (this.move.forward || this.move.backward) this.velocity.z -= this.direction.z * 400.0 * delta;
            if (this.move.left || this.move.right) this.velocity.x -= this.direction.x * 400.0 * delta;

            
            if (onObject === true) {

                this.velocity.y = Math.max(0, this.velocity.y);
                this.move.canJump = true;

            }
            

            Spel.controls.moveRight(- this.velocity.x * delta);
            Spel.controls.moveForward(- this.velocity.z * delta);

            Spel.controls.getObject().position.y += (this.velocity.y * delta / 5); // new behavior

            //om ein er ved bakken igjen -> ingen fart i y-retning + 
            if (Spel.controls.getObject().position.y <= terrengPosHogde + 3) {

                this.velocity.y = 0;
                //Spel.controls.getObject().position.y = 3;
                this.move.canJump = true;

            }

            let erOverBakken = Spel.controls.getObject().position.y > terrengPosHogde + 3;

            let faller = this.velocity.y !== 0;

            if (!faller && !erOverBakken && !onObject && this.move.canJump) {
                //set posisjonen til kameraet litt over bakken
                Spel.controls.getObject().position.setY(terrengPosHogde + 3);
            
            }

        }

        // pingpong
        this.innsjo.hidden = true;
        if (this.count % 2 === 0) {
            this.innsjoCubeMap.cubeCamera1.update(this.renderer, this._scene);
            this.innsjo.vassMateriale.envMap = this.innsjoCubeMap.cubeRenderTarget1.texture;
        } else {
            this.innsjoCubeMap.cubeCamera2.update(this.renderer, this._scene);
            this.innsjo.vassMateriale.envMap = this.innsjoCubeMap.cubeRenderTarget2.texture;
        }
        this.innsjo.hidden = false;

        this.count++;

        this.stats.update();

        // render this._scene:
        this.renderer.render(this._scene, this.camera);

    }

    //TODO i eigen klasse eller noko?
    /**
     * Metode for å aktivere bevegelse
     * @param {*} event 
     */
    onKeyDown(event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                this.move.forward = true;
                break;

            case 37: // left
            case 65: // a
                this.move.left = true;
                break;

            case 40: // down
            case 83: // s
                this.move.backward = true;
                break;

            case 39: // right
            case 68: // d
                this.move.right = true;
                break;

            case 32: // space
                if (this.move.canJump === true) this.velocity.y += 350;
                this.move.canJump = false;
                break;

        }

    }

    //TODO i eigen klasse eller noko?
    /**
     * Metode for å deaktivere bevegelse
     * @param {*} event 
     */
    onKeyUp(event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                this.move.forward = false;
                break;

            case 37: // left
            case 65: // a
                this.move.left = false;
                break;

            case 40: // down
            case 83: // s
                this.move.backward = false;
                break;

            case 39: // right
            case 68: // d
                this.move.right = false;
                break;

        }

    }

    get scene() {
        return this._scene;
    }

    set scene(scene) {
        this._scene = scene;
    }

    get canvas() {
        return this.renderer.domElement;
    }

    set canvas(canvas) {
        this._canvas = canvas;
    }
}