import pino from "pino";

const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: `yyyy-mm-dd HH:mm:ss`,
            ignore: "pid"
        }
    }
});

export default logger;
