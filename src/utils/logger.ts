import { createLogger, format, transports } from 'winston';
import 'winston-mongodb';
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports';
import util from 'util';
import config from '../config/config';
import { EApplicationEnviroment } from '../constant/application';
import path from 'path';
import * as sourceMapSupport from 'source-map-support';
import { red, blue, yellow, green, magenta } from 'colorette';
import { MongoDBTransportInstance } from 'winston-mongodb';
//Linking Trace Support
sourceMapSupport.install();

const colorizeLevel = (level: string) => {
    switch (level) {
        case 'ERROR':
            return red(level);
        case 'INFO':
            return blue(level);
        case 'WARN':
            return yellow(level);
        default:
            return level;
    }
};

const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info;

    const customLevel = colorizeLevel(level.toUpperCase());
    const customTimestamp = green(timestamp);
    const customMessage = message;
    const customMeta = util.inspect(meta, {
        showHidden: false,
        depth: null,
        colors: true
    });

    const customLog = `${customLevel} [${customTimestamp}] ${customMessage}\n ${magenta('META')} ${customMeta}\n`;
    return customLog;
});

const consoleTransport = (): Array<ConsoleTransportInstance> => {
    if (config.ENV === EApplicationEnviroment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), consoleLogFormat)
            })
        ];
    }
    return [];
};

const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info;

    const logMeta: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(meta)) {
        if (value instanceof Error) {
            logMeta[key] = {
                name: value.name,
                message: value.message,
                trace: value.stack || ''
            };
        } else {
            logMeta[key] = value;
        }
    }

    const logData = {
        level: level.toUpperCase(),
        message,
        timestamp,
        meta: logMeta
    };

    return JSON.stringify(logData, null, 4);
});

const fileTransport = (): Array<FileTransportInstance> => {
    return [
        new transports.File({
            filename: path.join(__dirname, '../', '../', 'logs', `${config.ENV}.log`),
            level: 'info',
            format: format.combine(format.timestamp(), fileLogFormat)
        })
    ];
};

const mongoDBTransport = (): Array<MongoDBTransportInstance> => {
    return [
        new transports.MongoDB({
            level: 'info',
            db: config.DB_URL as string,
            metaKey: 'meta',
            expireAfterSeconds: 3600 * 24 * 30,
            collection: 'app-logs'
        })
    ];
};

export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: [...fileTransport(), ...mongoDBTransport(), ...consoleTransport()]
});
