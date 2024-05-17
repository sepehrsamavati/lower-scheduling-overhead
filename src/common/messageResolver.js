import messageTypes from "./messageTypes.js";

export const createMessage = Object.freeze({
    ping: () => `${messageTypes.ping},${Date.now()}`,
    close: () => messageTypes.close,

    /** @param {string, number} id */
    register: (id, power) => `${messageTypes.register},${id},${power}`,

    /**
     * @param {number} taskId
     * @param {number} hardness
     */
    runTask: (taskId, hardness) => `${messageTypes.runTask},${taskId},${hardness}`,

    /** @param {number} taskId */
    taskResponse: (taskId) => `${messageTypes.taskResponse},${taskId}`
});

/**
 * 
 * @param {Buffer | string} rawBuf 
 */
export default function (rawBuf) {
    const parts = rawBuf.toString().split(',');
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
        case messageTypes.runTask: {
            const [, taskId, hardness] = parts;
            return { runTask: { taskId: Number.parseInt(taskId), hardness: Math.max(0, Math.min(Number.parseInt(hardness), 10)) } };
        }
        case messageTypes.taskResponse: {
            const [, taskId] = parts;
            return { taskResponse: { taskId } };
        }
        default:
            return null;
    }
}