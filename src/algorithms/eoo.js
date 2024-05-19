// @ts-check

import tasks from '../data/eoo.js';
import arrayShuffle from '../common/arrayShuffle.js';
import randomVmPower from '../common/randomVmPower.js';

/**
 * 
 * @param {import('../common/types.js').VirtualMachinesReference} virtualMachines 
 * @param {(schedule: import('../common/types.js').CandidateSchedule['combination']) => Promise<void>} scheduleRunner
 */
export default async function (virtualMachines, scheduleRunner) {
    const _tasks = [...tasks];
    const _virtualMachines = [...virtualMachines];

    /** @type {import('../common/types.js').CandidateSchedule[]} */
    let candidateSchedules = [];

    /** @type {import('../common/types.js').Combination[]} */
    const combinations = [];

    for (let i = 0; i < _tasks.length; i++) {
        const task = _tasks[i];
        for (let j = 0; j < _virtualMachines.length; j++) {
            /** @type {import('../common/types.js').CandidateSchedule} */
            combinations.push({
                task, vmId: _virtualMachines[j].id, vmPower: -1
            });
        }
    }

    const allSchedules = () => {
        /** @type {Set<string>} */
        const serializedSchedules = new Set();
        const uniqueTasks = new Set(_tasks.map(task => task.id));

        /**
         * 
         * @param {import('../common/types.js').CandidateSchedule} currentCombination 
         * @returns 
         */
        const generateCombinations = (currentCombination = { combination: [], createCombination: () => { }, estimatedTime: -1 }) => {
            if (currentCombination.combination.length === uniqueTasks.size) {
                serializedSchedules.add(JSON.stringify(currentCombination.combination.slice().sort((a, b) => a.task.id - b.task.id)));
                return;
            }

            for (let i = 0; i < combinations.length; i++) {
                const combination = combinations[i];
                if (!currentCombination.combination.some(comb => comb.task.id === combination.task.id)) {
                    generateCombinations({
                        combination: [...currentCombination.combination, combination],
                        createCombination: () => { },
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
        const uniqueTasks = new Set(combinations.map(c => c.task.id));
        const output = new Set();
        let remaining = Math.pow(_virtualMachines.length, _tasks.length);

        while (output.size < targetCount && remaining > 0) {
            const currentCombination = [];
            const usedTaskIds = new Set();

            while (usedTaskIds.size < uniqueTasks.size) {
                const randomIndex = Math.floor(Math.random() * combinations.length);
                const randomTask = combinations[randomIndex];

                if (!usedTaskIds.has(randomTask.task.id)) {
                    currentCombination.push(randomTask);
                    usedTaskIds.add(randomTask.task.id);
                }
            }

            remaining--;
            output.add(JSON.stringify(currentCombination.slice().sort((a, b) => a.task.id - b.task.id)));
        }

        const res = Array.from(output).map(combo => JSON.parse(combo));
        candidateSchedules = res;
    };

    const randomAssign = (targetCount = 30) => {
        for (let i = 0; i < targetCount; i++) {

            console.log("Shuffling VM power...");
            _virtualMachines.forEach(vm => vm.setPower(randomVmPower()));

            /** @type {import('../common/types.js').CandidateSchedule} */
            const schedule = {
                combination: [],
                createCombination: tasks => {
                    schedule.combination = [];
                    const tasksToAssign = [...tasks];
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

                    [...vmTaskMap.entries()]
                        .map(([vmId, vmTasks]) => {
                            vmTasks.forEach(id => {
                                const task = tasks.find(t => t.id === id);
                                const vm = _virtualMachines.find(vm => vm.id === vmId);
                                if (task && vm)
                                    schedule.combination.push({ vmId, task, vmPower: vm.power })
                            });
                        });
                },
                estimatedTime: -1
            };

            schedule.createCombination(_tasks);

            candidateSchedules.push(schedule);
        }
    };

    randomAssign(5);

    // candidateSchedules.forEach(schedule => {
    //     let maxVmTime = 0;

    //     // @ts-ignore
    //     const result = Object.groupBy(schedule.combination, ({ vmId }) => vmId);

    //     Object.entries(result).forEach(([vmId, combinations]) => {
    //         const tasksHardness = combinations.map(c => _tasks.find(t => t.id === c.taskId)?.hardness);
    //         const workload = tasksHardness.length ? tasksHardness.reduce((a, b) => a + b) : 0;
    //         if (workload > maxVmTime)
    //             maxVmTime = workload;
    //     });

    //     schedule.estimatedTime = maxVmTime;
    // });

    for (const schedule of candidateSchedules) {
        const start = performance.now();
        await scheduleRunner(schedule.combination);
        schedule.estimatedTime = performance.now() - start;
    }
    debugger

    const averageTime = candidateSchedules.map(s => s.estimatedTime).reduce((a, b) => a + b) / candidateSchedules.length;

    /** @type {import('../common/types.js').CandidateSchedule[]} */
    const goodEnough = [];

    candidateSchedules.filter(s => s.estimatedTime < averageTime).forEach(s => goodEnough.push(s));

    /** @type {import('../common/types.js').CandidateSchedule[]} */
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

    return intersection;
}