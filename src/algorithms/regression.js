// @ts-check

import { readSync } from '../data/taskIO.js';

/**
 * 
 * @param {import('../common/types').CandidateSchedule[]} optimalSchedules 
 * @param {(schedule: import('../common/types.js').CandidateSchedule['combination']) => Promise<void>} scheduleRunner
 */
export default async function (optimalSchedules, scheduleRunner) {
    const groups = [readSync('c1'), readSync('c2'), readSync('c3'), readSync('c4')];

    const times = {};

    let counter = 0;
    for (const group of groups) {
        times[++counter] = [];
        for (const schedule of optimalSchedules) {
            schedule.createCombination(group);
            const start = performance.now();
            await scheduleRunner(schedule.combination);
            const time = performance.now() - start;
            schedule.time = time;
            times[counter].push(time);
        }
    }

    debugger
}