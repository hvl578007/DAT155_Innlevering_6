"use strict";

import MouseLookController from './controls/MouseLookController.js';
import Stats from './lib/Stats.js';
import {
    AxesHelper, PCFSoftShadowMap, PerspectiveCamera,
    Scene,
    Vector3, WebGLRenderer,
    BackSide
} from './lib/three.module.js';
import LysLager from './lights/LysLager.js';
import Terreng from './terrain/Terreng.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import ModellImport from './terrain/ModellImport.js';
import Vatn from './terrain/Vatn.js';
import Skydome from './skydome/Skydome.js';


export default class Spel {

    constructor() {

        //TODO putte slikt i eigen klasse?
        //set opp scenen og renderer og diverse greier
        const scene = new Scene();

        const axesHelper = new AxesHelper(15);
        axesHelper.position.y = 5;
        scene.add(axesHelper);

        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xffffff);
        renderer.setSize(window.innerWidth, window.innerHeight);

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFSoftShadowMap;

        /**
         * Handle window resize:
         *  - update aspect ratio.
         *  - update projection matrix
         *  - update renderer size
         */
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);

        /**
         * Add canvas element to DOM.
         */
        document.body.appendChild(renderer.domElement);

        let stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
        // --------------------------------------------------------------------------------------

        /**
         * Add light
         */

        let lys = new LysLager();
        const retningslys = lys.lagRetningslys();

        scene.add(retningslys);
        //retningslys.target = camera;
        scene.add(retningslys.target);

        // --------------------------------------------------------------------------------------

        //set startposisjonen til kameraet?
        camera.position.z = 70;
        camera.position.y = 55;
        camera.rotation.x -= Math.PI * 0.25;

        // --------------------------------------------------------------------------------------

        /**
         * Add terrain:
         *
         */

        let heightMapImage = document.getElementById("heightMap");
        
        let terreng = new Terreng(heightMapImage);

        scene.add(terreng);


        // --------------------------------------------------------------------------------------

        /**
         * Add trees
         *
         */

        let modellImport = new ModellImport();
        //plasserer rundt trer i scenen (burde bruke terrenget heller)
        modellImport.plasserTrer(terreng.terrengGeometri, scene);

        const loader = new GLTFLoader();

        //TODO legg i ein annan klasse (modellimport)
        //laster inn eit gltf-objekt (golden gun)
        loader.load(
            './resources/models/james_bond_golden_gun/ggun.gltf',
            (object) => {
                //henter ut objektet (usikker på kvifor akkuratt dette)
                const gun = object.scene.children[0].clone();

                //usikker, men vil lage skygge og få skygge?
                gun.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                //posisjonerer våpnet
                gun.position.z = -1.5;
                gun.position.y = -0.7;
                gun.position.x = 1;
                //roterer våpnet litt 
                gun.rotation.z = 3.25;
                //gjer våpnet mindre for å ikkje klippe inn i ting
                gun.scale.multiplyScalar(1/40);

                //legg til våpnet under kamera slik at den følger med der
                camera.add(gun);
            }
        );

        //legg til kamera i scenen slik at våpnet vil bli vist
        scene.add(camera);

        //lagar eit nytt vatn som skal plasserast i terrenget
        let vatn = new Vatn();
        //flytter vatnet litt over 0
        vatn.position.y = 0.8;

        //legg til vatnet i terrenget
        terreng.add(vatn);

        //alt kjører bra, men kan ikke se skydomen?? skal være grå farget men alt er hvitt i skyene.
        //lager og legger til skydome
        let skyDome = new Skydome();
        //endrer slik at skydomen rendres innenfra
        skyDome.material.side = BackSide;
        //skyDome.position.y = 5000; //<- denne setninga flytter skydome veldig høgt opp = kan ikkje sjå den lengre

        //legger til skydome i scenen
        scene.add(skyDome);


        // --------------------------------------------------------------------------------------

        /**
         * Set up camera controller:
         */

        //TODO kamera som bedre passar med FPS

        const mouseLookController = new MouseLookController(camera);

        // We attach a click lister to the canvas-element so that we can request a pointer lock.
        // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
        const canvas = renderer.domElement;

        //TODO lage eigen klasse med lyttarar og slikt frå vinduet

        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });

        let yaw = 0;
        let pitch = 0;
        const mouseSensitivity = 0.001;

        function updateCamRotation(event) {
            yaw += event.movementX * mouseSensitivity;
            pitch += event.movementY * mouseSensitivity;
        }

        //TODO lage eigen klasse med lyttarar og slikt frå vinduet

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                canvas.addEventListener('mousemove', updateCamRotation, false);
            } else {
                canvas.removeEventListener('mousemove', updateCamRotation, false);
            }
        });

        let move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            speed: 0.01
        };

        //TODO lage eigen klasse med lyttarar og slikt frå vinduet

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') {
                move.forward = true;
                e.preventDefault();
            } else if (e.code === 'KeyS') {
                move.backward = true;
                e.preventDefault();
            } else if (e.code === 'KeyA') {
                move.left = true;
                e.preventDefault();
            } else if (e.code === 'KeyD') {
                move.right = true;
                e.preventDefault();
            }
        });

        //TODO lage eigen klasse med lyttarar og slikt frå vinduet

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW') {
                move.forward = false;
                e.preventDefault();
            } else if (e.code === 'KeyS') {
                move.backward = false;
                e.preventDefault();
            } else if (e.code === 'KeyA') {
                move.left = false;
                e.preventDefault();
            } else if (e.code === 'KeyD') {
                move.right = false;
                e.preventDefault();
            }
        });

        const velocity = new Vector3(0.0, 0.0, 0.0);

        //TODO putte i eigen klasse som tar for seg "speleloopen"

        let then = performance.now();
        function loop(now) {

            stats.begin();

            const delta = now - then;
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

            // update controller rotation.
            mouseLookController.update(pitch, yaw);
            yaw = 0;
            pitch = 0;

            // apply rotation to velocity vector, and translate moveNode with it.
            velocity.applyQuaternion(camera.quaternion);
            camera.position.add(velocity);

            //set posisjonen til kameraet litt over bakken
            camera.position.setY(terreng.terrengGeometri.getHeightAt(camera.position.x, camera.position.z) + 3);

            // render scene:
            renderer.render(scene, camera);

            stats.end();

            requestAnimationFrame(loop);

        };

        loop(performance.now());


    }

    //eller ha alt i konstruktør?
    start() {

    }
}