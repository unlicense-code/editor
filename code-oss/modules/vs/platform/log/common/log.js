/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { isWindows } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const ILogService = createDecorator('logService');
export const ILoggerService = createDecorator('loggerService');
function now() {
    return new Date().toISOString();
}
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Off"] = 0] = "Off";
    LogLevel[LogLevel["Trace"] = 1] = "Trace";
    LogLevel[LogLevel["Debug"] = 2] = "Debug";
    LogLevel[LogLevel["Info"] = 3] = "Info";
    LogLevel[LogLevel["Warning"] = 4] = "Warning";
    LogLevel[LogLevel["Error"] = 5] = "Error";
})(LogLevel || (LogLevel = {}));
export const DEFAULT_LOG_LEVEL = LogLevel.Info;
export function log(logger, level, message) {
    switch (level) {
        case LogLevel.Trace:
            logger.trace(message);
            break;
        case LogLevel.Debug:
            logger.debug(message);
            break;
        case LogLevel.Info:
            logger.info(message);
            break;
        case LogLevel.Warning:
            logger.warn(message);
            break;
        case LogLevel.Error:
            logger.error(message);
            break;
        default: throw new Error('Invalid log level');
    }
}
export function format(args) {
    let result = '';
    for (let i = 0; i < args.length; i++) {
        let a = args[i];
        if (typeof a === 'object') {
            try {
                a = JSON.stringify(a);
            }
            catch (e) { }
        }
        result += (i > 0 ? ' ' : '') + a;
    }
    return result;
}
export class AbstractLogger extends Disposable {
    level = DEFAULT_LOG_LEVEL;
    _onDidChangeLogLevel = this._register(new Emitter());
    onDidChangeLogLevel = this._onDidChangeLogLevel.event;
    setLevel(level) {
        if (this.level !== level) {
            this.level = level;
            this._onDidChangeLogLevel.fire(this.level);
        }
    }
    getLevel() {
        return this.level;
    }
}
export class AbstractMessageLogger extends AbstractLogger {
    logAlways;
    constructor(logAlways) {
        super();
        this.logAlways = logAlways;
    }
    checkLogLevel(level) {
        return this.logAlways || this.getLevel() <= level;
    }
    trace(message, ...args) {
        if (this.checkLogLevel(LogLevel.Trace)) {
            this.log(LogLevel.Trace, format([message, ...args]));
        }
    }
    debug(message, ...args) {
        if (this.checkLogLevel(LogLevel.Debug)) {
            this.log(LogLevel.Debug, format([message, ...args]));
        }
    }
    info(message, ...args) {
        if (this.checkLogLevel(LogLevel.Info)) {
            this.log(LogLevel.Info, format([message, ...args]));
        }
    }
    warn(message, ...args) {
        if (this.checkLogLevel(LogLevel.Warning)) {
            this.log(LogLevel.Warning, format([message, ...args]));
        }
    }
    error(message, ...args) {
        if (this.checkLogLevel(LogLevel.Error)) {
            if (message instanceof Error) {
                const array = Array.prototype.slice.call(arguments);
                array[0] = message.stack;
                this.log(LogLevel.Error, format(array));
            }
            else {
                this.log(LogLevel.Error, format([message, ...args]));
            }
        }
    }
    flush() { }
}
export class ConsoleMainLogger extends AbstractLogger {
    useColors;
    constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super();
        this.setLevel(logLevel);
        this.useColors = !isWindows;
    }
    trace(message, ...args) {
        if (this.getLevel() <= LogLevel.Trace) {
            if (this.useColors) {
                console.log(`\x1b[90m[main ${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.log(`[main ${now()}]`, message, ...args);
            }
        }
    }
    debug(message, ...args) {
        if (this.getLevel() <= LogLevel.Debug) {
            if (this.useColors) {
                console.log(`\x1b[90m[main ${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.log(`[main ${now()}]`, message, ...args);
            }
        }
    }
    info(message, ...args) {
        if (this.getLevel() <= LogLevel.Info) {
            if (this.useColors) {
                console.log(`\x1b[90m[main ${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.log(`[main ${now()}]`, message, ...args);
            }
        }
    }
    warn(message, ...args) {
        if (this.getLevel() <= LogLevel.Warning) {
            if (this.useColors) {
                console.warn(`\x1b[93m[main ${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.warn(`[main ${now()}]`, message, ...args);
            }
        }
    }
    error(message, ...args) {
        if (this.getLevel() <= LogLevel.Error) {
            if (this.useColors) {
                console.error(`\x1b[91m[main ${now()}]\x1b[0m`, message, ...args);
            }
            else {
                console.error(`[main ${now()}]`, message, ...args);
            }
        }
    }
    dispose() {
        // noop
    }
    flush() {
        // noop
    }
}
export class ConsoleLogger extends AbstractLogger {
    constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super();
        this.setLevel(logLevel);
    }
    trace(message, ...args) {
        if (this.getLevel() <= LogLevel.Trace) {
            console.log('%cTRACE', 'color: #888', message, ...args);
        }
    }
    debug(message, ...args) {
        if (this.getLevel() <= LogLevel.Debug) {
            console.log('%cDEBUG', 'background: #eee; color: #888', message, ...args);
        }
    }
    info(message, ...args) {
        if (this.getLevel() <= LogLevel.Info) {
            console.log('%c INFO', 'color: #33f', message, ...args);
        }
    }
    warn(message, ...args) {
        if (this.getLevel() <= LogLevel.Warning) {
            console.log('%c WARN', 'color: #993', message, ...args);
        }
    }
    error(message, ...args) {
        if (this.getLevel() <= LogLevel.Error) {
            console.log('%c  ERR', 'color: #f33', message, ...args);
        }
    }
    dispose() {
        // noop
    }
    flush() {
        // noop
    }
}
export class AdapterLogger extends AbstractLogger {
    adapter;
    constructor(adapter, logLevel = DEFAULT_LOG_LEVEL) {
        super();
        this.adapter = adapter;
        this.setLevel(logLevel);
    }
    trace(message, ...args) {
        if (this.getLevel() <= LogLevel.Trace) {
            this.adapter.log(LogLevel.Trace, [this.extractMessage(message), ...args]);
        }
    }
    debug(message, ...args) {
        if (this.getLevel() <= LogLevel.Debug) {
            this.adapter.log(LogLevel.Debug, [this.extractMessage(message), ...args]);
        }
    }
    info(message, ...args) {
        if (this.getLevel() <= LogLevel.Info) {
            this.adapter.log(LogLevel.Info, [this.extractMessage(message), ...args]);
        }
    }
    warn(message, ...args) {
        if (this.getLevel() <= LogLevel.Warning) {
            this.adapter.log(LogLevel.Warning, [this.extractMessage(message), ...args]);
        }
    }
    error(message, ...args) {
        if (this.getLevel() <= LogLevel.Error) {
            this.adapter.log(LogLevel.Error, [this.extractMessage(message), ...args]);
        }
    }
    extractMessage(msg) {
        if (typeof msg === 'string') {
            return msg;
        }
        return toErrorMessage(msg, this.getLevel() <= LogLevel.Trace);
    }
    dispose() {
        // noop
    }
    flush() {
        // noop
    }
}
export class MultiplexLogService extends AbstractLogger {
    logServices;
    constructor(logServices) {
        super();
        this.logServices = logServices;
        if (logServices.length) {
            this.setLevel(logServices[0].getLevel());
        }
    }
    setLevel(level) {
        for (const logService of this.logServices) {
            logService.setLevel(level);
        }
        super.setLevel(level);
    }
    trace(message, ...args) {
        for (const logService of this.logServices) {
            logService.trace(message, ...args);
        }
    }
    debug(message, ...args) {
        for (const logService of this.logServices) {
            logService.debug(message, ...args);
        }
    }
    info(message, ...args) {
        for (const logService of this.logServices) {
            logService.info(message, ...args);
        }
    }
    warn(message, ...args) {
        for (const logService of this.logServices) {
            logService.warn(message, ...args);
        }
    }
    error(message, ...args) {
        for (const logService of this.logServices) {
            logService.error(message, ...args);
        }
    }
    flush() {
        for (const logService of this.logServices) {
            logService.flush();
        }
    }
    dispose() {
        for (const logService of this.logServices) {
            logService.dispose();
        }
    }
}
export class LogService extends Disposable {
    logger;
    constructor(logger) {
        super();
        this.logger = logger;
        this._register(logger);
    }
    get onDidChangeLogLevel() {
        return this.logger.onDidChangeLogLevel;
    }
    setLevel(level) {
        this.logger.setLevel(level);
    }
    getLevel() {
        return this.logger.getLevel();
    }
    trace(message, ...args) {
        this.logger.trace(message, ...args);
    }
    debug(message, ...args) {
        this.logger.debug(message, ...args);
    }
    info(message, ...args) {
        this.logger.info(message, ...args);
    }
    warn(message, ...args) {
        this.logger.warn(message, ...args);
    }
    error(message, ...args) {
        this.logger.error(message, ...args);
    }
    flush() {
        this.logger.flush();
    }
}
export class AbstractLoggerService extends Disposable {
    logLevel;
    loggerItems = new ResourceMap();
    constructor(logLevel, onDidChangeLogLevel) {
        super();
        this.logLevel = logLevel;
        this._register(onDidChangeLogLevel(logLevel => this.setLevel(logLevel)));
    }
    getLoggers() {
        return [...this.loggerItems.values()].map(({ logger }) => logger);
    }
    getLogger(resource) {
        return this.loggerItems.get(resource)?.logger;
    }
    createLogger(resource, options, logLevel) {
        let logger = this.loggerItems.get(resource)?.logger;
        if (!logger) {
            logLevel = options?.always ? LogLevel.Trace : logLevel;
            logger = this.doCreateLogger(resource, logLevel ?? this.logLevel, options);
            this.loggerItems.set(resource, { logger, logLevel });
        }
        return logger;
    }
    setLevel(arg1, arg2) {
        const resource = URI.isUri(arg1) ? arg1 : undefined;
        const logLevel = resource ? arg2 : arg1;
        if (resource) {
            const logger = this.loggerItems.get(resource);
            if (logger && logger.logLevel !== logLevel) {
                logger.logLevel = logLevel;
                logger.logger.setLevel(logLevel);
            }
        }
        else {
            this.logLevel = logLevel;
            this.loggerItems.forEach(({ logLevel, logger }) => {
                if (logLevel === undefined) {
                    logger.setLevel(this.logLevel);
                }
            });
        }
    }
    getLogLevel(resource) {
        const logger = this.loggerItems.get(resource);
        return logger?.logLevel;
    }
    dispose() {
        this.loggerItems.forEach(({ logger }) => logger.dispose());
        this.loggerItems.clear();
        super.dispose();
    }
}
export class NullLogger {
    onDidChangeLogLevel = new Emitter().event;
    setLevel(level) { }
    getLevel() { return LogLevel.Info; }
    trace(message, ...args) { }
    debug(message, ...args) { }
    info(message, ...args) { }
    warn(message, ...args) { }
    error(message, ...args) { }
    critical(message, ...args) { }
    dispose() { }
    flush() { }
}
export class NullLogService extends NullLogger {
}
export class NullLoggerService extends AbstractLoggerService {
    constructor() { super(LogLevel.Info, Event.None); }
    doCreateLogger(resource, logLevel, options) {
        return new NullLogger();
    }
}
export function getLogLevel(environmentService) {
    if (environmentService.verbose) {
        return LogLevel.Trace;
    }
    if (typeof environmentService.logLevel === 'string') {
        const logLevel = parseLogLevel(environmentService.logLevel.toLowerCase());
        if (logLevel !== undefined) {
            return logLevel;
        }
    }
    return DEFAULT_LOG_LEVEL;
}
export function LogLevelToString(logLevel) {
    switch (logLevel) {
        case LogLevel.Trace: return 'trace';
        case LogLevel.Debug: return 'debug';
        case LogLevel.Info: return 'info';
        case LogLevel.Warning: return 'warn';
        case LogLevel.Error: return 'error';
        case LogLevel.Off: return 'off';
    }
}
export function parseLogLevel(logLevel) {
    switch (logLevel) {
        case 'trace':
            return LogLevel.Trace;
        case 'debug':
            return LogLevel.Debug;
        case 'info':
            return LogLevel.Info;
        case 'warn':
            return LogLevel.Warning;
        case 'error':
            return LogLevel.Error;
        case 'critical':
            return LogLevel.Error;
        case 'off':
            return LogLevel.Off;
    }
    return undefined;
}
