// @ts-check

import { readSync } from '../data/taskIO.js';
import { saveKeyValue } from '../common/stats.js';

/**
 * 
 * @param {import('../common/types').CandidateSchedule[]} optimalSchedules 
 * @param {(schedule: import('../common/types.js').CandidateSchedule['combination']) => Promise<void>} scheduleRunner
 */
export default async function (optimalSchedules, scheduleRunner) {
    const groups = [readSync('c1'), readSync('c2'), readSync('c3'), readSync('c4')];

    /** 
     * @type {{
     *  [key: number]: number[];
     * }}
     */
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

    counter = 0;
    for (const schedule of optimalSchedules) {
        ++counter;
        await saveKeyValue(`r_${schedule.id}`, Object.entries(times).map((time, index) => ({ key: groups[index].length.toString(), value: time[1][counter] })));
    }

    debugger
}