// @ts-check

import net from "node:net";
import crypto from "node:crypto";
import "./common/noProcessExit.js";
import config from "./common/config.js";
import randomVmPower from "./common/randomVmPower.js";
import messageResolver, { createMessage } from "./common/messageResolver.js";

const id = crypto.randomUUID();
let power = randomVmPower();
let configuring = true;
console.info(`VM startup power: ${power}`);

/** @type {Array<() => Promise<void>>} */
const taskQueue = [];
let runningTasks = 0;
const concurrentLimit = 1;

/**
 * 
 * @param {() => Promise<void>} cb 
 */
const addToQueue = (cb) => {
    taskQueue.push(cb);
    checkToRun();
};

const checkToRun = () => {
    if (runningTasks + 1 <= concurrentLimit) {
        const task = taskQueue.shift();
        if (!task) return false;
        runningTasks++;
        task()
            .then(() => {
                runningTasks--;
                checkToRun();
            });
        return true;
    }
    return false;
};

const socket = new net.Socket();

socket.once('connect', () => {
    console.info("Connected to leader!");
    socket.write(createMessage.register(id, power));

    const pingTimer = setInterval(() => {
        socket.write(createMessage.ping());
    }, config.pingInterval).unref();

    socket.on('data', chunk => {
        const messages = messageResolver(chunk);
        messages.forEach(res => {
            if (res?.runTask) {
                addToQueue(async () => {
                    // console.info(`Solving ${res.runTask.taskId}...`);
                    // threadSleep(power * res.runTask.hardness); // faking task makespan
                    await new Promise(r => setTimeout(r, (res.runTask.power * res.runTask.hardness) / (configuring ? config.configSpeed : 1)));
                    // console.info(`Task ${res.runTask.taskId} done.`);
                    socket.write(createMessage.taskResponse(res.runTask.taskId));
                });
            } else if (res?.setPower) {
                power = res.setPower.amount;
                console.info(`VM power set to ${power}`);
            } else if (res?.readyToRun) {
                configuring = false;
                console.info("VM is ready to run, configuration finished.");
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
