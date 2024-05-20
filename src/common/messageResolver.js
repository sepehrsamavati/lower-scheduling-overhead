// @ts-check

import messageTypes from "./messageTypes.js";

export const createMessage = Object.freeze({
    ping: () => `${messageTypes.ping},${Date.now()};`,
    close: () => `${messageTypes.close};`,

    /**
     * @param {string} id
     * @param {number} power
     */
    register: (id, power) => `${messageTypes.register},${id},${power};`,

    /**
     * @param {number} taskId
     * @param {number} hardness
     * @param {number} power
     */
    runTask: (taskId, hardness, power) => `${messageTypes.runTask},${taskId},${hardness},${power};`,

    /** @param {number} taskId */
    taskResponse: (taskId) => `${messageTypes.taskResponse},${taskId};`,
    /** @param {number} power */
    setPower: (power) => `${messageTypes.setPower},${power};`,
    readyToRun: () => `${messageTypes.readyToRun};`,
});

/**
 * 
 * @param {Buffer | string} rawBuf 
 */
export default function (rawBuf) {
    const messages = rawBuf.toString().split(';').filter(msg => msg.length);

    return messages.map(message => {
        const parts = message.split(',');
        const type = parts.at(0);

        switch (type) {
            case messageTypes.ping:
                const [, time] = parts;
                return { ping: Math.round(Date.now() - Number.parseInt(time)) };
            case messageTypes.register:
                const [, id, power] = parts;
                return { register: { id, power: Number.parseInt(power) } };
            case messageTypes.close:
                return { close: true };
            case messageTypes.readyToRun:
                return { readyToRun: true };
            case messageTypes.runTask: {
                const [, taskId, hardness, power] = parts;
                return {
                    runTask: {
                        taskId: Number.parseInt(taskId),
                        power: Number.parseInt(power),
                        hardness: Math.max(0, Math.min(Number.parseInt(hardness), 10))
                    }
                };
            }
            case messageTypes.taskResponse: {
                const [, taskId] = parts;
                return { taskResponse: { taskId } };
            }
            case messageTypes.setPower: {
                const [, power] = parts;
                return { setPower: { amount: Number.parseInt(power) } };
            }
            default:
                return null;
        }
    });
}