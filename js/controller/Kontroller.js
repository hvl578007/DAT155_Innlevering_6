"use strict";

import Spel from "../Spel.js";

export default class Kontroller {

    constructor() {
        this.spel = new Spel();
        this.spel.loop();
    }

}