// @ts-check

import { readSync } from './taskIO.js';

/** @type {import('../common/types.js').Tasks} */
const tasks = new Set();

for (const task of readSync('config')) {
    tasks.add(task);
}

export default tasks;
