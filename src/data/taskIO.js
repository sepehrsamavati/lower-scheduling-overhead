// @ts-check
import fs from "node:fs";
import config from "../common/config.js";

const filePath = "./src/data/dataset.json";
/** @type {Buffer | null} */
let buffCache = null;

export const generateSync = () => {
    const count = config.configTaskCount + 250 + 300 + 350 + 400;

    let taskId = 0;

    /** @type {import('../common/types.js').Task[]} */
    const tasks = [];

    for (let i = 0; i < count; i++) {
        tasks.push({
            id: ++taskId,
            hardness: Math.round(Math.random() * 10)
        });
    }

    fs.writeFileSync(filePath, JSON.stringify(tasks));
};

/**
 * 
 * @param {'c1' | 'c2' | 'c3' | 'c4' | 'config'} group 
 */
export const readSync = (group) => {
    const buff = buffCache ?? fs.readFileSync(filePath);
    const serialized = buff.toString();
    /** @type {import('../common/types.js').Task[]} */
    const tasks = JSON.parse(serialized);

    const [start, end] = ({
        'c1': [0, 250],
        'c2': [250, 550],
        'c3': [550, 900],
        'c4': [900, 1300],
        'config': [1300, 1300 + config.configTaskCount],
    })[group];

    return tasks.slice(start, end);
};
