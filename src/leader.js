// @ts-check
import net from "node:net";
import "./common/noProcessExit.js";
import config from "./common/config.js";
import messageResolver, { createMessage } from "./common/messageResolver.js";

/** @type {import('./types').VirtualMachinesReference} */
const virtualMachines = new Set();

const server = net.createServer();

server.on('connection', socket => {
    console.info(`Connection from ${socket.localAddress}:${socket.localPort}`);
    /** @type {import('./types').VirtualMachineReference | null} */
    let vm = null;
    /** @type {NodeJS.Timeout | number} */
    let pingTimeout = 0;

    const dispose = () => {
        clearTimeout(pingTimeout);
        if (vm)
            virtualMachines.delete(vm);
    };

    socket.on('data', chunk => {
        const now = Date.now();
        const res = messageResolver(chunk);

        if (res?.register) {
            vm = {
                id: res.register.id,
                lastMessage: now,
                lastPing: -1
            };
            virtualMachines.add(vm);
            console.info(`VM registered #${res.register.id}`);

            // console.info(`Sending task #${++taskIdCursor} to VM #${vm.id}`);
            // socket.write(createMessage.runTask(taskIdCursor, 5));

            return;
        }
        else if (!vm)
            return;

        if (typeof res?.ping === "number") {
            vm.lastPing = res.ping;
            clearTimeout(pingTimeout);
            const id = vm.id;
            pingTimeout = setTimeout(() => {
                console.info(`No ping from VM #${id}`);
            }, 5e3);
        } else if (res?.close) {
            console.info(`VM requested close #${vm.id}`);
            dispose();
            socket.end();
            return;
        } else if (res?.taskResponse) {
            console.info(`Task #${res.taskResponse.taskId} response received`);
        }

        vm.lastMessage = now;
    });

    socket.on('close', () => {
        console.error(`VM #${vm?.id} connection closed`);
        if (vm)
            dispose();
    });

    socket.on('error', err => {
        console.error(`Error from VM #${vm?.id}: ${err.message}`);
    });
});

server.once('listening', () => console.info(`Leader listening on 127.0.0.1:${config.leaderPort}`));

server.listen(config.leaderPort);

