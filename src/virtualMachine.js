// @ts-check

import net from "node:net";
import crypto from "node:crypto";
import "./common/noProcessExit.js";
import threadSleep from "thread-sleep";
import config from "./common/config.js";
import messageResolver, { createMessage } from "./common/messageResolver.js";

const id = crypto.randomUUID();
const power = Math.round(250 + (Math.random() * 750));

const socket = new net.Socket();

socket.once('connect', () => {
    console.info("Connected to leader!");
    socket.write(createMessage.register(id, power));

    const pingTimer = setInterval(() => {
        socket.write(createMessage.ping());
    }, 1e3).unref();

    socket.on('data', chunk => {
        const res = messageResolver(chunk);

        if (res?.runTask) {
            threadSleep(power * res.runTask.hardness); // faking task makespan
            socket.write(createMessage.taskResponse(res.runTask.taskId));
        }
    });
});

socket.connect({
    host: "127.0.0.1",
    port: config.leaderPort
});

process.once('SIGINT', () => {
    socket.write(createMessage.close());
});
