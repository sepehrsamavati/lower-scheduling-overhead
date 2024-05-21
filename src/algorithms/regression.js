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

    /** @type {import('../common/types').ScheduleRegression[]} */
    const schedulesRegression = optimalSchedules.map(schedule => ({
        origin: schedule,
        regressionCalculator: x => 0
    }));

    counter = -1;
    for (const schedule of schedulesRegression) {
        ++counter;

        const points = timeEntires.map((time, index) => ({ x: groups[index].length, y: time[1][counter] }));

        await saveKeyValue(`r_${schedule.origin.id}`, points.map(p => ({ key: p.x.toString(), value: p.y })));

        const xAverage = Math.round(points.map(p => p.x).reduce((a, b) => a + b) / points.length);
        const yAverage = Math.round(points.map(p => p.y).reduce((a, b) => a + b) / points.length);

        const xVariance = points.map(item => (item.x - xAverage) ** 2).reduce((a, b) => a + b);
        const yVariance = points.map(item => (item.y - yAverage) ** 2).reduce((a, b) => a + b);

        const xStandardDeviation = Math.sqrt(xVariance / points.length);
        const yStandardDeviation = Math.sqrt(yVariance / points.length);

        const correlation = (points.map(item => (item.x - xAverage) * (item.y - yAverage)).reduce((a, b) => a + b)) / Math.sqrt(xVariance * yVariance);

        const b = (correlation * yStandardDeviation) / xStandardDeviation;
        const A = yAverage - (b * xAverage);

        if (Number.isNaN(b) || Number.isNaN(A))
            debugger

        schedule.regressionCalculator = x => (b * x) + A;
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

    return schedulesRegression;
}