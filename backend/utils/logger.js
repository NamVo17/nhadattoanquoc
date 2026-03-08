'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const { env } = require('../config/env.config');

const LOG_DIR = path.join(__dirname, '..', 'logs');

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };
winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) =>
        stack ? `[${timestamp}] ${level}: ${message}\n${stack}` : `[${timestamp}] ${level}: ${message}`
    )
);

const transports = [
    new winston.transports.Console({
        format: consoleFormat,
        silent: env.IS_PRODUCTION,
    }),
    new DailyRotateFile({
        dirname: LOG_DIR,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '10m',
        maxFiles: '30d',
        format,
    }),
    new DailyRotateFile({
        dirname: LOG_DIR,
        filename: 'combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format,
    }),
];

const logger = winston.createLogger({
    level: env.IS_PRODUCTION ? 'warn' : 'debug',
    levels,
    transports,
    exitOnError: false,
});

// Stream for Morgan HTTP logger
logger.stream = {
    write: (message) => logger.http(message.trim()),
};

module.exports = logger;
