"use strict";

import { PointerLockControls } from './lib/PointerLockControls.js';
import { BloomPass } from './lib/postprocessing/BloomPass.js';
import { BokehPass } from './lib/postprocessing/BokehPass.js';
import { EffectComposer } from './lib/postprocessing/EffectComposer.js';
import { FilmPass } from './lib/postprocessing/FilmPass.js';
import { RenderPass } from './lib/postprocessing/RenderPass.js';
import Stats from './lib/Stats.js';
import {
    Clock,
    FogExp2, PCFSoftShadowMap, PerspectiveCamera,
    Raycaster, Scene,
    Vector3, WebGLRenderer
} from './lib/three.module.js';
import Spelar from './Spelar.js';
import HUD from './ui/HUD.js';
import Verden from './Verden.js';

export default class Spel {

    //er statisk fordi ein eventlistener må ha tak i den
    //TODO fiks (eigen klasse eller noko greier)
    static controls;

    constructor() {

        /**
         * Initialisering av scene, kamera, renderer og slikt
         */
        this._scene = new Scene();

        //const axesHelper = new AxesHelper(15);
        //axesHelper.position.y = 5;
        //this._scene.add(axesHelper);

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xffffff);
        this.renderer.autoClear = false;
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;

        // legg til tåke / fog på scenen:
        //TODO fiks farge og skydome?
        //this._scene.background = new TextureLoader().load('./resources/textures/Sky.jpg');
        this._scene.fog = new FogExp2(0xb8cbd9, 0.005);

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
        //this.leanVelocity = new Vector2();

        //legg til kameraet i scenen, treng det for raycasting for hopp, og for å få fram ting som ligg under kameraet
        this._scene.add(Spel.controls.getObject());

        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        document.addEventListener('mousedown', this.onMouseDown.bind(this), false);

        //lagar raycaster for å sjå om ein er oppå eit objekt
        this.raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 3);
        //lagar ein tabell som skal innehelde objekter som ein kan hoppe på
        this.objekterHoppePaa = [];

        // --------------------------------------------------------------------------------------

        //set startposisjonen til kameraet
        this.camera.position.z = 70;
        this.camera.position.y = 55;
        this.camera.rotation.x -= Math.PI * 0.25;

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

            //Oppdater HUD kamera
            this.hud.oppdaterKameraNyeDimensjonar(window.innerWidth, window.innerHeight);

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

        //TODO lage spelar-klasse? (kontroll av kamera og slikt)

        //set opp verdenen
        this.verden = new Verden(this._scene, this.camera, this.objekterHoppePaa);

        // --------------------------------------------------------------------------------------

        /**
         * Lagar HUD:
         */

        this.hud = new HUD(window.innerHeight, window.innerWidth);

        // --------------------------------------------------------------------------------------

        /**
         * Lagar spelar
         * TODO fiks...
         */
        this.spelar = new Spelar(this.camera, this.hud);

        // --------------------------------------------------------------------------------------

        //berre lagrar canvas som ein objekt-variabel
        this._canvas = this.renderer.domElement;

        //TODO endre denne (Date.now() ???)
        this.time = 0;

        //variablar for å flytte på ting i kurver
        this.tSol = 0.1;
        this.verden.bevegSol(this.tSol);
        this.t = 0;

        //variabel for andre ting som skal bevege på seg og slikt:
        this.interaksjon = {
            solFram: false,
            solTilbake: false,
            harByttaVaapen: false,
            aktivtVaapen: 1,
            harSkutt: false
        };

        /**
         * Post-processing
         */
        this.composer = new EffectComposer(this.renderer);

        this.composer.addPass(new RenderPass(this._scene, this.camera));

        const bloomPass = new BloomPass(
            1,
            25,
            4,
            256
        );
        //this.composer.addPass(bloomPass);

        const bokehPass = new BokehPass(this._scene, this.camera, {

        });
        this.composer.addPass(bokehPass);

        const filmPass = new FilmPass(
            0.15,
            0.025,
            648,
            false
        );
        filmPass.renderToScreen = true;
        this.composer.addPass(filmPass);

    }

    /**
     * Metoden som blir brukt for å rendre scenen
     * TODO eigen klasse?
     */
    loop() {

        const delta = this.clock.getDelta();

        //TODO fiks dette her på eit eller anna vis...
        this.time += delta;
        //if (this.time > 12.5) this.time = 0;

        //oppdaterer tid-variabel i vass-shaderen for å få til bevegelse
        this.verden.bevegPaaVatn(this.time);

        //animerer fuglen:
        this.verden.animerFugl(delta);

        //animerer våpnet
        //TODO fiks slik at det bare skjer ein gong
        this.spelar.oppdaterGunAnimation(delta);

        //TODO legg dette i spelar?!
        //hogda ein er i terrenget
        let terrengPosHogde = this.verden.terreng.terrengGeometri.getHeightAt(this.camera.position.x, this.camera.position.z);

        //styrer med kontroll av kameraet
        //henta frå https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html
        if (Spel.controls.isLocked) {

            //gjer klar raycasteren slik at den kan sjekke om ein er over eit objekt ein kan stå på
            this.raycaster.ray.origin.copy(Spel.controls.getObject().position);
            this.raycaster.ray.origin.y -= 3;

            let intersections = this.raycaster.intersectObjects(this.objekterHoppePaa);

            let onObject = intersections.length > 0;

            //oppdatere hastigheitar i x/y/z-retning
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            this.velocity.y -= 9.8 * 125.0 * delta; // 125.0 = mass

            //positiv om ein går framover, negativt elles
            this.direction.z = Number(this.move.forward) - Number(this.move.backward);
            //positiv om ein går mot høgre, negativt elles
            this.direction.x = Number(this.move.right) - Number(this.move.left);
            this.direction.normalize(); // this ensures consistent movements in all directions

            //head bobbing: droppa

            if (this.move.forward || this.move.backward) {
                this.velocity.z -= this.direction.z * 400.0 * delta;
            }
            if (this.move.left || this.move.right) {
                this.velocity.x -= this.direction.x * 400.0 * delta;
            }

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

        //bytte av våpen:
        if (this.interaksjon.harByttaVaapen) {
            this.spelar.byttTilVaapen(this.interaksjon.aktivtVaapen);
            this.interaksjon.harByttaVaapen = false;
        }

        //får solen til å gå i en ellipse rundt banen
        if (this.interaksjon.solFram || this.interaksjon.solTilbake) {
            let retning = Number(this.interaksjon.solFram) - Number(this.interaksjon.solTilbake);
            this.verden.bevegSol(this.tSol);
            this.tSol = this.tSol + 0.001 * retning;
            if (this.tSol < 0) this.tSol = 0;
            if (this.tSol > 0.5) this.tSol = 0.5;
        }

        //sjekker kor ein ser: drepte fps hehe, må legge alt i tabell eller noko enn å bruke rekursiv
        //this.raycasterPicking.setFromCamera(new Vector2(), Spel.controls.getObject());
        //let intersectionsPicking = this.raycasterPicking.intersectObject(this._scene, true);
        //let objektSerPaa = "";
        //if (intersectionsPicking.length > 0) objektSerPaa = intersectionsPicking[intersectionsPicking.length-1].namn;

        //skyter på fuglen i scenen (eller sjekker om ein gjer det)
        if (this.interaksjon.harSkutt) {
            let traff = this.spelar.skytVaapen(Spel.controls.getObject(), this.verden.fugl.modell);
            if (traff) {
                this.verden.fugl.harBlittSkutt = true;
            }
            this.interaksjon.harSkutt = false;
        }

        //beveg på menneske:
        this.verden.bevegFugl(this.t, delta);
        this.t = (this.t >= 1) ? 0 : this.t += 0.0015;
        //this.t = (this.t + 0.001) % 1.000;

        this.verden.oppdaterCubeMapVatn(this.renderer, this.scene);

        //oppdaterer fps-stats
        this.stats.update();

        //oppdater hud:
        this.hud.teikn(window.innerWidth, window.innerHeight, Spel.controls, this.spelar);

        // render this._scene:
        //this.renderer.render(this._scene, this.camera);
        this.composer.render(delta);
        this.renderer.autoClear = false;
        // render hud
        this.renderer.render(this.hud.scene, this.hud.kamera);
        this.renderer.autoClear = true;

        requestAnimationFrame(this.loop.bind(this));


    }

    //TODO i eigen klasse eller noko?
    /**
     * Metode for å aktivere bevegelse og andre tastetrykk
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

            case 88: // x
                this.interaksjon.solFram = true;
                break;

            case 90: // z
                this.interaksjon.solTilbake = true;
                break;

            case 49: // 1
                this.interaksjon.aktivtVaapen = 1;
                this.interaksjon.harByttaVaapen = true;
                break;

            case 50: // 2
                this.interaksjon.aktivtVaapen = 2;
                this.interaksjon.harByttaVaapen = true;
                break;

            case 82: // r
                //reload
                this.spelar.reloadVaapen();
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

            case 88: // x
                this.interaksjon.solFram = false;
                break;

            case 90: // z
                this.interaksjon.solTilbake = false;
                break;

        }

    }

    /**
     * Metode for å hente trykk
     * @param {*} event 
     */
    onMouseDown(event) {
        if (Spel.controls.isLocked && this.interaksjon.aktivtVaapen === 1) {
            this.interaksjon.harSkutt = true;
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