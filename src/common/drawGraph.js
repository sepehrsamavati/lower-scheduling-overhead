// @ts-check

import fs from "node:fs";
import { readKeyValue } from "./stats.js";
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const files = fs.readdirSync("./cache").filter(file => !file.includes('.png') && file.endsWith('.json'));

const regressionData = [];

const colors = [
    '#d90429',
    '#f77f00',
    '#5a189a',
    '#38b000',
    '#ffc300',
    '#03045e',
    '#343a40',
    '#07beb8',
    '#7f4f24',
    '#26a9e0',
    '#f72585',
    '#fb6f92',
    '#e63946',
    '#309f5f',
    '#ffd500',
];

for (const file of files) {
    const data = await readKeyValue(file);
    if (file === 'eoo.json') {
        const chartCanvas = new ChartJSNodeCanvas({
            width: 1000,
            height: 600,
            backgroundColour: '#e5e5e5'
        });

        const average = data.map(item => item.value).reduce((a, b) => a + b) / data.length;

        const buff = chartCanvas.renderToBufferSync({
            data: {
                labels: data.map(item => item.key),
                datasets: [
                    {
                        label: "Linear",
                        data: data.map(item => item.value),
                        borderColor: "#d00000",
                        type: "line",
                        borderDash: [5, 5],
                        borderWidth: 3,
                        tension: 0.4
                    },
                    {
                        label: "Average",
                        data: data.map(() => average),
                        borderColor: "#ffd500",
                        type: "line",
                        pointRadius: 0
                    },
                    {
                        label: "Candidate schedules makespan",
                        data: data.map(item => item.value),
                        backgroundColor: "#14213d",
                        type: "bar"
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
                        label: "Average",
                        data: data.map(() => average),
                        borderColor: "#ffd500",
                        type: "line",
                        pointRadius: 0
                    },
                    {
                        label: "Candidate schedules makespan (sorted)",
                        data: data.map(item => item.value),
                        backgroundColor: "#14213d",
                        type: "bar"
                    },
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
                labels: data.map(item => `s${item.key}`),
                datasets: [
                    {
                        label: "Optimal schedules (intersection) makespan",
                        data: data.map(item => item.value),
                        backgroundColor: colors,
                        barThickness: 15
                    }
                ]
            },
            type: "bar"
        });
        await fs.promises.writeFile(`./cache/${file}.png`, buff);
    }
    else if (file.startsWith('r_') && !file.startsWith('r_line') && file.endsWith('.json')) {
        regressionData.push({
            data,
            scheduleId: file.replace('r_', '').replace('.json', ''),
        });
    }
}

if (regressionData.length) {
    const regressionLineData = await readKeyValue("r_line");
    const chartCanvas = new ChartJSNodeCanvas({
        width: 1000,
        height: 600,
        backgroundColour: '#e5e5e5'
    });

    regressionData.sort((a, b) => parseInt(a.scheduleId) - parseInt(b.scheduleId));

    /** @type {import('chart.js').ChartDataset[]} */
    const datasets = regressionData.map((schedule, index) => ({
        label: `s${schedule.scheduleId}`,
        data: schedule.data.map(item => item.value),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        type: 'line'
    }));

    datasets.unshift({
        label: "RLine",
        data: regressionLineData.map(item => item.value),
        backgroundColor: '#000000',
        borderColor: '#000000',
        borderDash: [5, 5],
        borderWidth: 5,
        fill: false,
        type: 'line'
    });

    const buff = chartCanvas.renderToBufferSync({
        data: {
            datasets,
            labels: regressionData[0].data.map(item => item.key),
        },
        type: "bar"
    });
    await fs.promises.writeFile(`./cache/makespan_vs_load.png`, buff);
}
