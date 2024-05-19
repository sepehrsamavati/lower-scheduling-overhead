// @ts-check

import config from '../common/config.js';

let taskIdCursor = 0;

/** @type {import('../common/types.js').Tasks} */
const tasks = new Set();

for (let i = 0; i < config.configTaskCount; i++) {
    tasks.add({
        hardness: Math.round(Math.random() * 10),
        id: ++taskIdCursor,
    });
}

export default tasks;
