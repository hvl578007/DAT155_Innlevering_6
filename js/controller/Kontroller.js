"use strict";

import Spel from "../Spel.js";
import EventHandler from "./EventHandler.js";

export default class Kontroller {

    constructor() {
        this.eventHandler = new EventHandler();
        this.spel = new Spel();
        let now = performance.now()
        this.spel.loop(now);
    }

}