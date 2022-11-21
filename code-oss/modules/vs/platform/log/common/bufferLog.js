/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AbstractLogger, DEFAULT_LOG_LEVEL, LogLevel } from 'vs/platform/log/common/log';
function getLogFunction(logger, level) {
    switch (level) {
        case LogLevel.Trace: return logger.trace;
        case LogLevel.Debug: return logger.debug;
        case LogLevel.Info: return logger.info;
        case LogLevel.Warning: return logger.warn;
        case LogLevel.Error: return logger.error;
        default: throw new Error('Invalid log level');
    }
}
export class BufferLogService extends AbstractLogger {
    buffer = [];
    _logger = undefined;
    constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super();
        this.setLevel(logLevel);
        this._register(this.onDidChangeLogLevel(level => {
            this._logger?.setLevel(level);
        }));
    }
    set logger(logger) {
        this._logger = logger;
        for (const { level, args } of this.buffer) {
            const fn = getLogFunction(logger, level);
            fn.apply(logger, args);
        }
        this.buffer = [];
    }
    _log(level, ...args) {
        if (this._logger) {
            const fn = getLogFunction(this._logger, level);
            fn.apply(this._logger, args);
        }
        else if (this.getLevel() <= level) {
            this.buffer.push({ level, args });
        }
    }
    trace(message, ...args) {
        this._log(LogLevel.Trace, message, ...args);
    }
    debug(message, ...args) {
        this._log(LogLevel.Debug, message, ...args);
    }
    info(message, ...args) {
        this._log(LogLevel.Info, message, ...args);
    }
    warn(message, ...args) {
        this._log(LogLevel.Warning, message, ...args);
    }
    error(message, ...args) {
        this._log(LogLevel.Error, message, ...args);
    }
    dispose() {
        this._logger?.dispose();
    }
    flush() {
        this._logger?.flush();
    }
}
