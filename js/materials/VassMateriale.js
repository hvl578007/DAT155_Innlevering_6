"use strict";

import { ShaderMaterial } from "../lib/three.module.js";

export default class VassMateriale extends ShaderMaterial {

    constructor({
        map = null,
        opacity = 1.0
    }) {

        const vertexShader = `
            out vec2 vTexCoords;
                
            void main() {
                vTexCoords = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            
            in vec2 vTexCoords;

            uniform sampler2D aTexture;
            uniform float aOpacity;

            void main() {
                vec4 textureColor = texture(aTexture, vTexCoords);

                //ser denne ligg innebygd i shader frå threejs??
                pc_fragColor = textureColor;
            }
        `;

        super({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                aTexture: {
                    value: map
                },
                aOpacity: {
                    value: opacity
                }
            }
        });
    }

}