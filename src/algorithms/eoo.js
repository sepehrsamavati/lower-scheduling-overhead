// @ts-check

import arrayShuffle from '../common/arrayShuffle.js';

/**
 * 
 * @param {import('../types').Tasks} tasks 
 * @param {import('../types').VirtualMachinesReference} virtualMachines 
 */
export default function z(tasks, virtualMachines) {
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
        const generateCombinations = (currentCombination = { combination: [], estimatedTime: -1 }) => {
            if (currentCombination.combination.length === uniqueTasks.size) {
                serializedSchedules.add(JSON.stringify(currentCombination.combination.slice().sort((a, b) => a.taskId - b.taskId)));
                return;
            }

            for (let i = 0; i < combinations.length; i++) {
                const combination = combinations[i];
                if (!currentCombination.combination.some(task => task.taskId === combination.taskId)) {
                    generateCombinations({
                        combination: [...currentCombination.combination, combination],
                        estimatedTime: -1
                    });
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
            const schedule = {
                combination: [],
                estimatedTime: -1
            };

            [...vmTaskMap.entries()]
                .map(([vmId, tasks]) => {
                    tasks.forEach(id => schedule.combination.push({ vmId, taskId: id }));
                });

            candidateSchedules.push(schedule);
        }
    };

    randomAssign(30);

    candidateSchedules.forEach(schedule => {
        let maxVmTime = 0;

        // @ts-ignore
        const result = Object.groupBy(schedule.combination, ({ vmId }) => vmId);

        Object.entries(result).forEach(([vmId, combinations]) => {
            const tasksHardness = combinations.map(c => _tasks.find(t => t.id === c.taskId)?.hardness);
            const workload = tasksHardness.length ? tasksHardness.reduce((a, b) => a + b) : 0;
            if (workload > maxVmTime)
                maxVmTime = workload;
        });

        schedule.estimatedTime = maxVmTime;
    });

    const averageTime = candidateSchedules.map(s => s.estimatedTime).reduce((a, b) => a + b) / candidateSchedules.length;

    /** @type {import('../types').CandidateSchedule[]} */
    const goodEnough = [];

    candidateSchedules.filter(s => s.estimatedTime < averageTime).forEach(s => goodEnough.push(s));


    /** @type {import('../types').CandidateSchedule[]} */
    const selectedSubset = [];

    for (let i = 0; i < candidateSchedules.length; i++) {
        const current = candidateSchedules[i];
        const next = candidateSchedules[i + 1];
        if (current && next) {
            if (current.estimatedTime < next.estimatedTime)
                selectedSubset.push(current);
            else
                selectedSubset.push(next);
            i++;
        }
    }

    const intersection = goodEnough.filter(value => selectedSubset.includes(value));

    debugger
}

z(
    new Set([
        { id: 1, hardness: 6 },
        { id: 2, hardness: 1 },
        { id: 3, hardness: 2 },
        { id: 4, hardness: 6 },
        { id: 5, hardness: 8 },
        { id: 6, hardness: 5 },
        { id: 7, hardness: 5 },
        { id: 8, hardness: 9 },
        { id: 9, hardness: 7 },
        { id: 10, hardness: 6 },
        { id: 11, hardness: 3 },
        { id: 12, hardness: 2 },
        { id: 13, hardness: 8 },
        { id: 14, hardness: 1 },
        { id: 15, hardness: 4 },
        { id: 16, hardness: 4 },
        { id: 17, hardness: 8 },
        { id: 18, hardness: 2 },
        { id: 19, hardness: 1 },
        { id: 20, hardness: 9 },
    ]),
    new Set([
        { id: 'vm1', lastMessage: 0, lastPing: 0 },
        { id: 'vm2', lastMessage: 0, lastPing: 0 },
        { id: 'vm3', lastMessage: 0, lastPing: 0 },
        { id: 'vm4', lastMessage: 0, lastPing: 0 },
        { id: 'vm5', lastMessage: 0, lastPing: 0 },
    ])
);
