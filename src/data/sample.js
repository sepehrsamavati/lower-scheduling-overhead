// @ts-check

const workLoads = Object.freeze([
    5, 1, 7, 3, 5,
    2, 2, 6, 2, 6,
    1, 2, 5, 4, 1,
    8, 8, 1, 2, 9,
    2, 7, 3, 4, 4,
]);

let taskIdCursor = 0;

/**
 * @typedef {Set<{ id: number; hardness: number; }>} Task
 */

/** @type {Task} */
const tasks = new Set();

workLoads.forEach(hardness => {
    tasks.add({
        hardness,
        id: ++taskIdCursor,
    });
});

/** @type {Map<number, { task: Task; status: '' | 'assigning' | 'processing' | 'done'; }>} */
const assignedTasks = new Map();

export default assignedTasks;
