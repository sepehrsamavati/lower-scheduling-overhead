// @ts-check

import fs from "node:fs";
import { readKeyValue } from "./stats.js";
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const files = fs.readdirSync("./cache").filter(file => !file.includes('.png'));

const regressionData = [];

for (const file of files) {
    const data = await readKeyValue(file);
    if (file === 'eoo.json') {
        const chartCanvas = new ChartJSNodeCanvas({
            width: 1000,
            height: 600,
            backgroundColour: '#e5e5e5'
        });
        const buff = chartCanvas.renderToBufferSync({
            data: {
                labels: data.map(item => item.key),
                datasets: [
                    {
                        label: "Candidate schedules makespan",
                        data: data.map(item => item.value),
                        backgroundColor: "#14213d",
                        type: "bar"
                    },
                    {
                        label: "Linear",
                        data: data.map(item => item.value),
                        backgroundColor: "#b5e2fa",
                        type: "line"
                    }
                ]
            },
            type: "bar"
        });
        await fs.promises.writeFile(`./cache/${file}.png`, buff);

        data.sort((a, b) => a.value - b.value);

        const sortedChartCanvas = new ChartJSNodeCanvas({
            width: 1000,
            height: 600,
            backgroundColour: '#e5e5e5'
        });
        const sortedBuff = sortedChartCanvas.renderToBufferSync({
            data: {
                labels: data.map(item => item.key),
                datasets: [
                    {
                        label: "Candidate schedules makespan (sorted)",
                        data: data.map(item => item.value),
                        backgroundColor: "#14213d",
                        type: "bar"
                    },
                    {
                        label: "Linear",
                        data: data.map(item => item.value),
                        backgroundColor: "#b5e2fa",
                        type: "line"
                    }
                ]
            },
            type: "bar"
        });
        await fs.promises.writeFile(`./cache/${file}_sorted.png`, sortedBuff);
    }
    else if (file === 'eoo_intersection.json') {
        const chartCanvas = new ChartJSNodeCanvas({
            width: 1000,
            height: 600,
            backgroundColour: '#e5e5e5'
        });
        const buff = chartCanvas.renderToBufferSync({
            data: {
                labels: data.map(item => item.key),
                datasets: [
                    {
                        label: "Optimal schedules (intersection) makespan",
                        data: data.map(item => item.value),
                        backgroundColor: "#fb8500"
                    }
                ]
            },
            type: "bar"
        });
        await fs.promises.writeFile(`./cache/${file}.png`, buff);
    }
    else if (file.startsWith('r_') && file.endsWith('.json')) {
        regressionData.push({
            data,
            scheduleId: file.replace('r_', '').replace('.json', ''),
        });
    }
}

if (regressionData.length) {
    const colors = [
        '#d90429',
        '#f77f00',
        '#5a189a',
        '#38b000',
        '#89fc00',
        '#03045e',
        '#343a40',
        '#d00000',
        '#7f4f24',
        '#26a9e0',
        '#f72585',
        '#fb6f92',
    ];
    const chartCanvas = new ChartJSNodeCanvas({
        width: 1000,
        height: 600,
        backgroundColour: '#e5e5e5'
    });
    const buff = chartCanvas.renderToBufferSync({
        data: {
            labels: regressionData[0].data.map(item => item.key),
            datasets: regressionData.map((schedule, index) => ({
                label: `s${schedule.scheduleId}`,
                data: schedule.data.map(item => item.value),
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length],
                borderWidth: 2,
                type: 'line'
            }))
        },
        type: "bar"
    });
    await fs.promises.writeFile(`./cache/makespan_vs_load.png`, buff);
}
