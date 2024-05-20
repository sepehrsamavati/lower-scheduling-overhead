// @ts-check
import net from "node:net";
import "./common/noProcessExit.js";
import eoo from "./algorithms/eoo.js";
import config from "./common/config.js";
import regression from "./algorithms/regression.js";
import messageResolver, { createMessage } from "./common/messageResolver.js";

/** @type {import('./common/types.js').VirtualMachinesReference} */
const virtualMachines = new Set();
/** @type {Map<import('./common/types.js').VirtualMachineReference['id'], net.Socket>} */
const vmSocket = new Map();

let openRequests = 0;
let requestsCount = 0;
/** @type {NodeJS.Timeout | number} */
let progressTimer = 0;
const showProgress = () => {
    progressTimer = setInterval(() => {
        console.info(`${Math.round(((requestsCount - openRequests) / requestsCount) * 100)}%`);
    }, 100);
}, stopProgress = () => {
    clearInterval(progressTimer);
};
let scheduleEnd = () => { };

const server = net.createServer();

/** @type {(schedule: import('./common/types').CandidateSchedule['combination']) => Promise<void>} */
const scheduleRunner = async schedule => new Promise(resolve => {
    scheduleEnd = resolve;
    openRequests = requestsCount = schedule.length;
    showProgress();
    schedule.forEach(comb => {
        const targetSocket = vmSocket.get(comb.vmId);
        if (!targetSocket) return;

        // console.info(`Sending task #${comb.task.id} to VM #${comb.vmId}`);
        targetSocket.write(createMessage.runTask(comb.task.id, comb.task.hardness, comb.vmPower));
    });
});

server.on('connection', socket => {
    console.info(`Connection from ${socket.localAddress}:${socket.localPort}`);
    /** @type {import('./common/types.js').VirtualMachineReference | null} */
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
        const messages = messageResolver(chunk);

        messages.forEach(res => {
            if (res?.register) {
                vm = {
                    id: res.register.id,
                    lastMessage: now,
                    lastPing: -1,
                };
                vmSocket.set(vm.id, socket);
                virtualMachines.add(vm);
                console.info(`VM registered #${res.register.id}`);

                if (virtualMachines.size === config.virtualMachinesCount) {
                    debugger
                    eoo(virtualMachines, scheduleRunner)
                        .then(optimal => {
                            regression(optimal, scheduleRunner)
                                .then(res => {
                                    vmSocket.forEach(socket => socket.write(createMessage.readyToRun()));
                                });
                        });
                }

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
                }, config.pingTimeout);
            } else if (res?.close) {
                console.info(`VM requested close #${vm.id}`);
                dispose();
                socket.end();
                return;
            } else if (res?.taskResponse) {
                // console.info(`Task #${res.taskResponse.taskId} response received`);
                openRequests--;
                if (openRequests === 0) {
                    scheduleEnd();
                    stopProgress();
                }
            }
        });

        if (vm)
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

server.once('listening', () => console.info(`Leader listening on port ${config.leaderPort}`));

server.listen(config.leaderPort);

