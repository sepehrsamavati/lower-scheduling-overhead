const messageTypes = Object.freeze({
    ping: "PING",
    register: "REG",
    close: "CLS",
    runTask: "RUN",
    taskResponse: "RES",
    setPower: "SPW",
    readyToRun: "RTR"
});

export default messageTypes;
