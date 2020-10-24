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
import {FirstPersonControls} from './controls/FirstPersonControls.js';
import {PointerLockControls} from './controls/PointerLockControls.js';

let goldenGunMixer;


export default class Spel {

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

        //this.controls = new PointerLockControls(this.camera, document.body);
        this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
        this.controls.activeLook = false;
        this.controls.movementSpeed = 10;
        this.controls.lookSpeed = 0.05;

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

            this.controls.handleResize();
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
        // --------------------------------------------------------------------------------------

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
        modellImport.lastInnGoldenGun(this.camera, goldenGunMixer);

        this.loader = new GLTFLoader();

        //console.log(goldenGunMixer);

        //legg til kamera i this._scenen slik at våpnet vil bli vist
        this._scene.add(this.camera);

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

        /**
         * Set up camera controller:
         */

        //TODO kamera som bedre passar med FPS

        //this.mouseLookController = new MouseLookController(this.camera);

        // We attach a click lister to the canvas-element so that we can request a pointer lock.
        // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
        this._canvas = this.renderer.domElement;

        //TODO lage eigen klasse med lyttarar og slikt frå vinduet

        /*
        this._canvas.addEventListener('click', () => {
            this._canvas.requestPointerLock();
        });
        */

        //this.yaw = 0;
        //this.pitch = 0;
        //this.mouseSensitivity = 0.001;

        //TODO lage eigen klasse med lyttarar og slikt frå vinduet
        /*
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === this._canvas) {
                this._canvas.addEventListener('mousemove', this.updateCamRotation, false);
            } else {
                this._canvas.removeEventListener('mousemove', this.updateCamRotation, false);
            }
        });
        */
        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            speed: 20.0
        };

        //TODO lage eigen klasse med lyttarar og slikt frå vinduet

        /*
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') {
                this.move.forward = true;
                e.preventDefault();
            } else if (e.code === 'KeyS') {
                this.move.backward = true;
                e.preventDefault();
            } else if (e.code === 'KeyA') {
                this.move.left = true;
                e.preventDefault();
            } else if (e.code === 'KeyD') {
                this.move.right = true;
                e.preventDefault();
            }
        });
        */

        //TODO lage eigen klasse med lyttarar og slikt frå vinduet

        /*
        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW') {
                this.move.forward = false;
                e.preventDefault();
            } else if (e.code === 'KeyS') {
                this.move.backward = false;
                e.preventDefault();
            } else if (e.code === 'KeyA') {
                this.move.left = false;
                e.preventDefault();
            } else if (e.code === 'KeyD') {
                this.move.right = false;
                e.preventDefault();
            }
        });
        */

        this.velocity = new Vector3(0.0, 0.0, 0.0);

        //TODO putte i eigen klasse som tar for seg "speleloopen"

        /*
        let then = performance.now();
        function loop(now) {

            const delta = now - then;
            //const delta = clock.getDelta();

            then = now;

            const moveSpeed = move.speed * delta;

            velocity.set(0.0, 0.0, 0.0);

            if (move.left) {
                velocity.x -= moveSpeed;
            }

            if (move.right) {
                velocity.x += moveSpeed;
            }

            if (move.forward) {
                velocity.z -= moveSpeed;
            }

            if (move.backward) {
                velocity.z += moveSpeed;
            }

            if (goldenGunMixer) goldenGunMixer.update(delta);

            // update controller rotation.
            mouseLookController.update(pitch, yaw);
            yaw = 0;
            pitch = 0;

            // apply rotation to velocity vector, and translate moveNode with it.
            velocity.applyQuaternion(camera.quaternion);
            camera.position.add(velocity);

            //set posisjonen til kameraet litt over bakken
            camera.position.setY(terreng.terrengGeometri.getHeightAt(camera.position.x, camera.position.z) + 3);

            // render this._scene:
            renderer.render(this._scene, camera);

            stats.update();

            requestAnimationFrame(loop);

        };

        //loop(performance.now());
        */

        this.time = 0;

    }

    static updateCamRotation(event) {
        this.yaw += event.movementX * this.mouseSensitivity;
        this.pitch += event.movementY * this.mouseSensitivity;
    }

    loop() {

        //const delta = now - then;
        const delta = this.clock.getDelta();

        this.time += delta;
        if (this.time > 10) this.time = 0;

        //then = now;

        const moveSpeed = this.move.speed * delta;

        this.velocity.set(0.0, 0.0, 0.0);

        this.controls.update(delta);

        if (this.vatn.matShader) this.vatn.matShader.uniforms.time.value = this.time;
        //console.log(this._matShader);
        /*
        if (this.move.left) {
            this.velocity.x -= moveSpeed;
        }

        if (this.move.right) {
            this.velocity.x += moveSpeed;
        }

        if (this.move.forward) {
            this.velocity.z -= moveSpeed;
        }

        if (this.move.backward) {
            this.velocity.z += moveSpeed;
        }
        */

        if (this.goldenGunMixer) this.goldenGunMixer.update(delta);

        /*

        // update controller rotation.
        this.mouseLookController.update(this.pitch, this.yaw);
        this.yaw = 0;
        this.pitch = 0;

        // apply rotation to velocity vector, and translate moveNode with it.
        this.velocity.applyQuaternion(this.camera.quaternion);
        this.camera.position.add(this.velocity);
        */

        //set posisjonen til kameraet litt over bakken
        this.camera.position.setY(this.terreng.terrengGeometri.getHeightAt(this.camera.position.x, this.camera.position.z) + 3);

        // render this._scene:
        this.renderer.render(this._scene, this.camera);

        this.stats.update();

        requestAnimationFrame(this.loop.bind(this));

    }

    //eller ha alt i konstruktør?
    start() {

    }

    get scene() {
        return this._scene;
    }

    get canvas() {
        return this.renderer.domElement;
    }

    set canvas(canvas) {
        this._canvas = canvas;
    }
}