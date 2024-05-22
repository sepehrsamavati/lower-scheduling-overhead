// @ts-check

import fs from "node:fs";
import { readKeyValue } from "./stats.js";
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const files = fs.readdirSync("./cache").filter(file => !file.includes('.png') && file.endsWith('.json'));

const regressionData = [];

const baseOptions = {
    options: {
        plugins: {
            legend: {
                labels: {
                    color: '#fff'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: "#fff"
                },
                grid: {
                    color: '#2a2a2a',
                    borderColor: '#fff'
                }
            },
            y: {
                beginAtZero: false,
                ticks: {
                    color: "#fff"
                },
                grid: {
                    color: '#2a2a2a',
                    borderColor: '#fff'
                }
            }
        }
    },
};

const baseConfig = {
    width: 1356,
    height: 760,
    // backgroundColour: '#e5e5e5'
};

const colors = [
    '#a70000',
    '#ff002b',
    '#c44f00',
    '#f77300',
    '#ffcc00',
    '#ffff00',
    '#2528d6',
    '#0077ff',
    '#31b3ff',
    '#00c8a6',
    '#437690',
    '#5a1b9a',
    '#9d00ff',
    '#00a700',
    '#17e600',
    '#535353',
    '#b3b3b3',
    '#a76932',
    '#9f006f',
    '#ff00a6',
    '#ff69b4',
];

for (const file of files) {
    const data = await readKeyValue(file);
    if (file === 'eoo.json') {
        const chartCanvas = new ChartJSNodeCanvas(baseConfig);

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
                        backgroundColor: "#9d00ff",
                        type: "bar"
                    }
                ]
            },
            ...baseOptions,
            type: "bar"
        });
        await fs.promises.writeFile(`./cache/${file}.png`, buff);

        data.sort((a, b) => a.value - b.value);

        const sortedChartCanvas = new ChartJSNodeCanvas(baseConfig);
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
                        backgroundColor: "#9d00ff", // #14213d
                        type: "bar"
                    },
                ]
            },
            ...baseOptions,
            type: "bar"
        });
        await fs.promises.writeFile(`./cache/${file}_sorted.png`, sortedBuff);
    }
    else if (file === 'eoo_intersection.json') {
        const chartCanvas = new ChartJSNodeCanvas(baseConfig);
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
            options: {
                ...baseOptions.options,
                scales: {
                    ...baseOptions.options.scales,
                    y: {
                        ...baseOptions.options.scales.y,
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
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
    const chartCanvas = new ChartJSNodeCanvas(baseConfig);

    regressionData.sort((a, b) => parseInt(a.scheduleId) - parseInt(b.scheduleId));

    /** @type {import('chart.js').ChartDataset[]} */
    const datasets = regressionData.map((schedule, index) => ({
        label: `s${schedule.scheduleId}`,
        data: schedule.data.map(item => item.value),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        type: 'line',
    }));

    datasets.unshift({
        label: "RLine",
        data: regressionLineData.map(item => item.value),
        backgroundColor: '#fff',
        borderColor: '#fff',
        borderDash: [3, 3],
        borderWidth: 4,
        fill: false,
        type: 'line'
    });

    const buff = chartCanvas.renderToBufferSync({
        data: {
            datasets,
            labels: regressionData[0].data.map(item => item.key),
        },
        ...baseOptions,
        type: "bar"
    });
    await fs.promises.writeFile(`./cache/makespan_vs_load.png`, buff);
}
