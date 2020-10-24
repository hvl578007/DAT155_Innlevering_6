"use strict";

export default class EventHandler {
    
    constructor(spel) {
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === spel.canvas) {
                spel.canvas.addEventListener('mousemove', spel.updateCamRotation.bind(spel), false);
            } else {
                spel.canvas.removeEventListener('mousemove', spel.updateCamRotation, false);
            }
        });
    }
}