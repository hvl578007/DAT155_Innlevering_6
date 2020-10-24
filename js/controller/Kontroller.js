"use strict";

import Spel from "../Spel.js";
import EventHandler from "./EventHandler.js";

export default class Kontroller {

    constructor() {
        this.spel = new Spel();
        //this.eventHandler = new EventHandler(this.spel);
        //let now = performance.now()
        this.spel.loop();
    }

}