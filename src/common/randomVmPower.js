// @ts-check

import config from "./config.js";

export default function randomVmPower() {
    return Math.round(config.virtualMachine.minPower + (Math.random() * (config.virtualMachine.maxPower - config.virtualMachine.minPower)));
}