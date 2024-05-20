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

    const timeEntires = Object.entries(times);
    const n = timeEntires.length;

    counter = 0;
    for (const schedule of optimalSchedules) {
        ++counter;
        await saveKeyValue(`r_${schedule.id}`, timeEntires.map((time, index) => ({ key: groups[index].length.toString(), value: time[1][counter] })));
    }

    counter = 0;
    let sumXY = 0, sumX = 0, sumY = 0, sumXSquared = 0;
    for (const [, makeSpans] of timeEntires) {
        const x = groups[counter++].length;
        const y = Math.round(makeSpans.reduce((a, b) => a + b) / makeSpans.length);
        sumXY += x * y;
        sumX += x;
        sumY += y;
        sumXSquared += x ** 2;
    }

    const m = (n * sumXY - sumX * sumY) / ((n * sumXSquared) - (sumX ** 2));
    const b = (sumY - m * sumX) / n;

    /**
     * 
     * @param {number} x 
     */
    const regressionCalculator = x => (m * x) + b;

    await saveKeyValue("r_line", timeEntires.map((_, index) => ({ key: groups[index].length.toString(), value: regressionCalculator(groups[index].length) })));

    debugger
}