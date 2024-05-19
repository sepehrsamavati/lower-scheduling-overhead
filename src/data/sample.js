// @ts-check

const workLoads = Object.freeze([
    5, 1, 7, 3, 5,
    2, 2, 6, 2, 6,
    1, 2, 5, 4, 1,
    8, 8, 1, 2, 9,
    2, 7, 3, 4, 4,
]);

let taskIdCursor = 0;

/** @type {import('../types').Tasks} */
const tasks = new Set();

workLoads.forEach(hardness => {
    tasks.add({
        hardness,
        id: ++taskIdCursor,
    });
});

/** @type {import('../types').AssignedTasks} */
const assignedTasks = new Map();

export default assignedTasks;
