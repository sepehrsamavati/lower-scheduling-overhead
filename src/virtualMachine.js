// @ts-check

import net from "node:net";
import crypto from "node:crypto";
import "./common/noProcessExit.js";
// import threadSleep from "thread-sleep";
import config from "./common/config.js";
import messageResolver, { createMessage } from "./common/messageResolver.js";

const id = crypto.randomUUID();
const power = Math.round(config.virtualMachine.minPower + (Math.random() * (config.virtualMachine.maxPower - config.virtualMachine.minPower)));
console.info(`VM Power: ${power}`);

const socket = new net.Socket();

socket.once('connect', () => {
    console.info("Connected to leader!");
    socket.write(createMessage.register(id, power));

    const pingTimer = setInterval(() => {
        socket.write(createMessage.ping());
    }, config.pingInterval).unref();

    socket.on('data', chunk => {
        const messages = messageResolver(chunk);
        messages.forEach(async res => {
            if (res?.runTask) {
                console.info(`Solving ${res.runTask.taskId}...`);
                // threadSleep(power * res.runTask.hardness); // faking task makespan
                await new Promise(r => setTimeout(r, power * res.runTask.hardness));
                console.info(`Task ${res.runTask.taskId} done.`);
                socket.write(createMessage.taskResponse(res.runTask.taskId));
            }
        });
    });
});

socket.connect({
    host: config.leaderHost,
    port: config.leaderPort
});

process.once('SIGINT', () => {
    socket.write(createMessage.close());
});
