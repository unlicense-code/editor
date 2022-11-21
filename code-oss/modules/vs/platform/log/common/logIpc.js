/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { AbstractLoggerService, AbstractMessageLogger, AdapterLogger, log, LogLevel, LogService } from 'vs/platform/log/common/log';
export class LogLevelChannel {
    logService;
    loggerService;
    onDidChangeLogLevel;
    constructor(logService, loggerService) {
        this.logService = logService;
        this.loggerService = loggerService;
        this.onDidChangeLogLevel = Event.buffer(logService.onDidChangeLogLevel, true);
    }
    listen(_, event) {
        switch (event) {
            case 'onDidChangeLogLevel': return this.onDidChangeLogLevel;
        }
        throw new Error(`Event not found: ${event}`);
    }
    async call(_, command, arg) {
        switch (command) {
            case 'setLevel': return arg[1] ? this.loggerService.setLevel(URI.revive(arg[1]), arg[0]) : this.logService.setLevel(arg[0]);
        }
        throw new Error(`Call not found: ${command}`);
    }
}
export class LogLevelChannelClient {
    channel;
    constructor(channel) {
        this.channel = channel;
    }
    get onDidChangeLogLevel() {
        return this.channel.listen('onDidChangeLogLevel');
    }
    setLevel(level, resource) {
        LogLevelChannelClient.setLevel(this.channel, level, resource);
    }
    static setLevel(channel, level, resource) {
        return channel.call('setLevel', [level, resource]);
    }
}
export class LoggerChannel {
    loggerService;
    loggers = new Map();
    constructor(loggerService) {
        this.loggerService = loggerService;
    }
    listen(_, event) {
        throw new Error(`Event not found: ${event}`);
    }
    async call(_, command, arg) {
        switch (command) {
            case 'createLogger':
                this.createLogger(URI.revive(arg[0]), arg[1]);
                return;
            case 'log': return this.log(URI.revive(arg[0]), arg[1]);
            case 'consoleLog': return this.consoleLog(arg[0], arg[1]);
        }
        throw new Error(`Call not found: ${command}`);
    }
    createLogger(file, options) {
        this.loggers.set(file.toString(), this.loggerService.createLogger(file, options));
    }
    consoleLog(level, args) {
        let consoleFn = console.log;
        switch (level) {
            case LogLevel.Error:
                consoleFn = console.error;
                break;
            case LogLevel.Warning:
                consoleFn = console.warn;
                break;
            case LogLevel.Info:
                consoleFn = console.info;
                break;
        }
        consoleFn.call(console, ...args);
    }
    log(file, messages) {
        const logger = this.loggers.get(file.toString());
        if (!logger) {
            throw new Error('Create the logger before logging');
        }
        for (const [level, message] of messages) {
            log(logger, level, message);
        }
    }
}
export class LoggerChannelClient extends AbstractLoggerService {
    channel;
    constructor(logLevel, onDidChangeLogLevel, channel) {
        super(logLevel, onDidChangeLogLevel);
        this.channel = channel;
    }
    createConsoleMainLogger() {
        return new AdapterLogger({
            log: (level, args) => {
                this.channel.call('consoleLog', [level, args]);
            }
        });
    }
    doCreateLogger(file, logLevel, options) {
        return new Logger(this.channel, file, logLevel, options);
    }
}
class Logger extends AbstractMessageLogger {
    channel;
    file;
    isLoggerCreated = false;
    buffer = [];
    constructor(channel, file, logLevel, loggerOptions) {
        super(loggerOptions?.always);
        this.channel = channel;
        this.file = file;
        this.setLevel(logLevel);
        this.channel.call('createLogger', [file, loggerOptions])
            .then(() => {
            this.doLog(this.buffer);
            this.isLoggerCreated = true;
        });
    }
    log(level, message) {
        const messages = [[level, message]];
        if (this.isLoggerCreated) {
            this.doLog(messages);
        }
        else {
            this.buffer.push(...messages);
        }
    }
    doLog(messages) {
        this.channel.call('log', [this.file, messages]);
    }
}
export class FollowerLogService extends LogService {
    parent;
    constructor(parent, logService) {
        super(logService);
        this.parent = parent;
        this._register(parent.onDidChangeLogLevel(level => logService.setLevel(level)));
    }
    setLevel(level) {
        super.setLevel(level);
        this.parent.setLevel(level);
    }
}
