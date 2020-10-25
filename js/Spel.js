"use strict";

import MouseLookController from './controls/MouseLookController.js';
import Stats from './lib/Stats.js';
import {
    AxesHelper, PCFSoftShadowMap, PerspectiveCamera,
    Scene,
    Vector3, WebGLRenderer,
    BackSide,
    AnimationMixer,
    Clock
} from './lib/three.module.js';
import LysLager from './lights/LysLager.js';
import Terreng from './terrain/Terreng.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import ModellImport from './terrain/ModellImport.js';
import Vatn from './terrain/Vatn.js';
import Skydome from './skydome/Skydome.js';
import { FirstPersonControls } from './controls/FirstPersonControls.js';
import { PointerLockControls } from './controls/PointerLockControls.js';
import GoldenGun from './models/GoldenGun.js';

let goldenGunMixer;

export default class Spel {

    //er statisk fordi ein eventlistener må ha tak i den
    //TODO fiks (eigen klasse eller noko greier)
    static controls;

    constructor() {

        //TODO putte slikt i eigen klasse?
        //set opp scenen og renderer og diverse greier
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

        //styring av kamera - henta frå https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html

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

        this._scene.add(Spel.controls.getObject());


        document.addEventListener('keydown', this.onKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onKeyUp.bind(this), false);

        /*
        Spel.controls = new FirstPersonSpel.controls(this.camera, this.renderer.domElement);
        Spel.controls.activeLook = false;
        Spel.controls.movementSpeed = 10;
        Spel.controls.lookSpeed = 0.05;
        */

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


        this.clock = new Clock();

        /**
         * Add light
         */

        let lys = new LysLager();
        const retningslys = lys.lagRetningslys();

        this._scene.add(retningslys);
        //retningslys.target = camera;
        this._scene.add(retningslys.target);

        // --------------------------------------------------------------------------------------

        //set startposisjonen til kameraet?
        this.camera.position.z = 70;
        this.camera.position.y = 55;
        this.camera.rotation.x -= Math.PI * 0.25;

        // --------------------------------------------------------------------------------------

        /**
         * Add terrain:
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
        //modellImport.lastInnGoldenGun(this.camera, goldenGunMixer);

        this.loader = new GLTFLoader();
        this.goldengun = new GoldenGun(this.camera, this.loader);

        //console.log(goldenGunMixer);

        //legg til kamera i this._scenen slik at våpnet vil bli vist
        //this._scene.add(this.camera);

        // --------------------------------------------------------------------------------------

        /**
         * Legg til vatn i terrenget
         */

        //lagar eit nytt vatn som skal plasserast i terrenget
        this.vatn = new Vatn();
        //flytter vatnet litt over 0
        this.vatn.position.y = 1.2;

        //legg til vatnet i terrenget
        this.terreng.add(this.vatn);

        // --------------------------------------------------------------------------------------

        /**
         * Legg til skydome i this._scenen
         */

        //alt kjører bra, men kan ikke se skydomen?? skal være grå farget men alt er hvitt i skyene.
        //lager og legger til skydome
        let skyDome = new Skydome();
        //endrer slik at skydomen rendres innenfra
        skyDome.material.side = BackSide;
        //skyDome.position.y = 5000; //<- denne setninga flytter skydome veldig høgt opp = kan ikkje sjå den lengre

        //legger til skydome i this._scenen
        this._scene.add(skyDome);

        // --------------------------------------------------------------------------------------

        //berre lagrar canvas som ein objekt-variabel
        this._canvas = this.renderer.domElement;

        this.time = 0;

    }

    init() {

    }

    static updateCamRotation(event) {
        this.yaw += event.movementX * this.mouseSensitivity;
        this.pitch += event.movementY * this.mouseSensitivity;
    }

    loop() {

        requestAnimationFrame(this.loop.bind(this));

        const delta = this.clock.getDelta();


        this.time += delta;
        if (this.time > 10) this.time = 0;

        const moveSpeed = this.move.speed * delta;

        this.velocity.set(0.0, 0.0, 0.0);

        if (this.vatn.matShader) this.vatn.matShader.uniforms.time.value = this.time;
        //console.log(this._matShader);

        if (this.goldengun.mixer) this.goldengun.mixer.update(delta);

        if (Spel.controls.isLocked === true) {

            //raycaster.ray.origin.copy(Spel.controls.getObject().position);
            //raycaster.ray.origin.y -= 10;

            //var intersections = raycaster.intersectObjects(objects);

            //var onObject = intersections.length > 0;

            //var delta = ( time - prevTime ) / 1000;

            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;

            this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

            this.direction.z = Number(this.move.forward) - Number(this.move.backward);
            this.direction.x = Number(this.move.right) - Number(this.move.left);
            this.direction.normalize(); // this ensures consistent movements in all directions

            if (this.move.forward || this.move.backward) this.velocity.z -= this.direction.z * 400.0 * delta;
            if (this.move.left || this.move.right) this.velocity.x -= this.direction.x * 400.0 * delta;

            /*
            if (onObject === true) {

                this.velocity.y = Math.max(0, this.velocity.y);
                this.move.canJump = true;

            }
            */

            Spel.controls.moveRight(- this.velocity.x * delta);
            Spel.controls.moveForward(- this.velocity.z * delta);

            Spel.controls.getObject().position.y += (this.velocity.y * delta); // new behavior

            if (Spel.controls.getObject().position.y < 10) {

                this.velocity.y = 0;
                Spel.controls.getObject().position.y = 10;

                this.move.canJump = true;

            }

        }

        //set posisjonen til kameraet litt over bakken
        Spel.controls.getObject().position.setY(this.terreng.terrengGeometri.getHeightAt(this.camera.position.x, this.camera.position.z) + 3);

        this.stats.update();

        // render this._scene:
        this.renderer.render(this._scene, this.camera);

    }

    //TODO i eigen klasse eller noko?
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