// @ts-check

import arrayShuffle from '../common/arrayShuffle.js';

/**
 * 
 * @param {import('../types').Tasks} tasks 
 * @param {import('../types').VirtualMachinesReference} virtualMachines 
 */
export default function (tasks, virtualMachines) {
    const _tasks = [...tasks];
    const _virtualMachines = [...virtualMachines];

    /** @type {import('../types').CandidateSchedule[]} */
    let candidateSchedules = [];

    /** @type {import('../types').Combination[]} */
    const combinations = [];

    for (let i = 0; i < _tasks.length; i++) {
        const taskId = _tasks[i].id;
        for (let j = 0; j < _virtualMachines.length; j++) {
            /** @type {import('../types').CandidateSchedule} */
            combinations.push({
                taskId, vmId: _virtualMachines[j].id
            });
        }
    }

    const allSchedules = () => {
        /** @type {Set<string>} */
        const serializedSchedules = new Set();
        const uniqueTasks = new Set(_tasks.map(task => task.id));

        /**
         * 
         * @param {import('../types').CandidateSchedule} currentCombination 
         * @returns 
         */
        const generateCombinations = (currentCombination = []) => {
            if (currentCombination.length === uniqueTasks.size) {
                serializedSchedules.add(JSON.stringify(currentCombination.slice().sort((a, b) => a.taskId - b.taskId)));
                return;
            }

            for (let i = 0; i < combinations.length; i++) {
                const combination = combinations[i];
                if (!currentCombination.some(task => task.taskId === combination.taskId)) {
                    generateCombinations([...currentCombination, combination]);
                }
            }
        };

        generateCombinations();
        const res = Array.from(serializedSchedules).map(combo => JSON.parse(combo));
        candidateSchedules = res;
    };

    const randomSchedules = (targetCount = 30) => {
        const uniqueTasks = new Set(combinations.map(c => c.taskId));
        const output = new Set();
        let remaining = Math.pow(_virtualMachines.length, _tasks.length);

        while (output.size < targetCount && remaining > 0) {
            const currentCombination = [];
            const usedTaskIds = new Set();

            while (usedTaskIds.size < uniqueTasks.size) {
                const randomIndex = Math.floor(Math.random() * combinations.length);
                const randomTask = combinations[randomIndex];

                if (!usedTaskIds.has(randomTask.taskId)) {
                    currentCombination.push(randomTask);
                    usedTaskIds.add(randomTask.taskId);
                }
            }

            remaining--;
            output.add(JSON.stringify(currentCombination.slice().sort((a, b) => a.taskId - b.taskId)));
        }

        const res = Array.from(output).map(combo => JSON.parse(combo));
        candidateSchedules = res;
    };

    const randomAssign = (targetCount = 30) => {
        for (let i = 0; i < targetCount; i++) {
            const tasksToAssign = [..._tasks];
            arrayShuffle(tasksToAssign);

            /** @type {Map<string, number[]>} */
            const vmTaskMap = new Map();

            while (tasksToAssign.length > 0) {
                for (let j = 0; j < _virtualMachines.length; j++) {
                    const task = tasksToAssign.pop();
                    if (!task)
                        break;

                    const vmId = _virtualMachines[j].id;

                    const vmTasks = vmTaskMap.get(vmId);

                    if (vmTasks)
                        vmTasks.push(task.id);
                    else
                        vmTaskMap.set(vmId, [task.id]);
                }
            }

            /** @type {import('../types').CandidateSchedule} */
            const schedule = [];

            [...vmTaskMap.entries()]
                .map(([vmId, tasks]) => {
                    tasks.forEach(id => schedule.push({ vmId, taskId: id }));
                });

            candidateSchedules.push(schedule);
        }
    };

    randomAssign(30);
}
