// @ts-check

let taskIdCursor = 0;
const count = 20;

/** @type {import('../types').Tasks} */
const tasks = new Set();

for (let i = 0; i < count; i++) {
    tasks.add({
        hardness: Math.round(Math.random() * 10),
        id: ++taskIdCursor,
    });
}

export default tasks;
