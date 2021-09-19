import path from 'path';
import winston from 'winston';
import { Format, TransformableInfo } from 'logform';

const MAX_LOGGER_INSTANCES = 300;
const { format } = winston;

export default createLogger;

function createLogger(moduleName: string): winston.Logger {
    const label: string = getLabel(moduleName);
    const baseLogFormat: Format = format.combine(
        format.label({ label }),
        // @TODO: разобраться с логированием дополнительных объектов!
        // format.prettyPrint(),
        // format.splat(),
        // format.metadata({ fillExcept: ['message', 'timestamp', 'level', 'label'] }),
    );
    const logConfig = {
        console: {
            format: format.combine(
                format.colorize(),
                baseLogFormat,
                format.timestamp({ format: 'HH:mm:ss.SSS' }),
                format.printf(getMessageForConsole),
            ),
            handleExceptions: true,
        },
    };

    const logger: winston.Logger = winston.createLogger({
        // level: global.LOG_LEVEL || 'info',
        level: 'debug',
        transports: [new winston.transports.Console(logConfig.console)],
        exitOnError: true,
    });

    // Увеличение количества листенеров нужно из-за большого числа экземпляров логгера (по количеству файлов-модулей).
    // Ограничение сверху - чтобы не ломать защиту от утечек памяти.
    if (process.getMaxListeners() <= MAX_LOGGER_INSTANCES) {
        process.setMaxListeners(process.getMaxListeners() + 1);
    } else {
        logger.warn(
            `Внимание! Достигнуто максимальное количество обработчиков для процесса (${MAX_LOGGER_INSTANCES}). Если это не утечка памяти, требуется увеличить MAX_LOGGER_INSTANCES.`,
        );
    }

    return logger;
}

function getLabel(moduleName = 'default'): string {
    return `[${moduleName.split(path.sep).slice(-2).join(path.sep)}]`;
}

function getMessageForConsole(info: TransformableInfo): string {
    const { message, timestamp, level, label }: { [key: string]: string } = info;
    return message ? `${timestamp} ${level} ${label}: ${message}` : '';
}
