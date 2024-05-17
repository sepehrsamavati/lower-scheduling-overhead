import process from "node:process";

const nilFunc = (e) => {
    if(e instanceof Error)
        console.error(e);
};

const events = Object.freeze([
    'exit',
    'beforeExit',
    'disconnect',
    'rejectionHandled',
    'uncaughtException',
    'unhandledRejection',
    'SIGKILL',
]);

// process.on('SIGINT');

events
    .forEach(eventName => {
        process.on(eventName, nilFunc);
    });
