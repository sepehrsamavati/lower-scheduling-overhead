// @ts-check
import * as dotenv from "dotenv";
dotenv.config();

/**
 * 
 * @param {string} message 
 */
const configError = (message) => {
    console.warn(`⚠ Config error: ${message}`);
};

const config = Object.freeze({
    leaderHost: process.env?.LSO_LEADER_HOST ?? '127.0.0.1',
    leaderPort: Number.parseInt(process.env?.LSO_LEADER_PORT ?? '5000'),
    configTaskCount: Number.parseInt(process.env.LSO_CONFIGURE_TASK_COUNT ?? '20'),
    configScheduleCount: Number.parseInt(process.env.LSO_CONFIGURE_SCHEDULE_COUNT ?? '30'),
    speedRate: Number.parseInt(process.env.LSO_SPEED_RATE ?? '1'),
    virtualMachinesCount: Number.parseInt(process.env.LSO_VM_COUNT ?? '5'),
    virtualMachine: Object.freeze({
        minPower: Number.parseInt(process.env?.LSO_VM_MIN_POWER ?? '250'),
        maxPower: Number.parseInt(process.env?.LSO_VM_MAX_POWER ?? '1000'),
    }),
    pingInterval: Number.parseInt(process.env.LSO_PING_INTERVAL ?? '1000'),
    pingTimeout: Number.parseInt(process.env.LSO_PING_TIMEOUT ?? '5000')
});

if(config.virtualMachine.minPower > config.virtualMachine.maxPower) configError("Minimum VM power is greater than maximum power");

export default config;
