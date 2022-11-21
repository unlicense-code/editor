/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Queue } from 'vs/base/common/async';
import { VSBuffer } from 'vs/base/common/buffer';
import { basename, dirname, joinPath } from 'vs/base/common/resources';
import { ByteSize, IFileService, whenProviderRegistered } from 'vs/platform/files/common/files';
import { BufferLogService } from 'vs/platform/log/common/bufferLog';
import { AbstractLogger, AbstractLoggerService, format, ILogService, LogLevel } from 'vs/platform/log/common/log';
const MAX_FILE_SIZE = 5 * ByteSize.MB;
let FileLogger = class FileLogger extends AbstractLogger {
    resource;
    donotUseFormatters;
    fileService;
    initializePromise;
    queue;
    backupIndex = 1;
    constructor(name, resource, level, donotUseFormatters, fileService) {
        super();
        this.resource = resource;
        this.donotUseFormatters = donotUseFormatters;
        this.fileService = fileService;
        this.setLevel(level);
        this.queue = this._register(new Queue());
        this.initializePromise = this.initialize();
    }
    trace() {
        if (this.getLevel() <= LogLevel.Trace) {
            this._log(LogLevel.Trace, format(arguments));
        }
    }
    debug() {
        if (this.getLevel() <= LogLevel.Debug) {
            this._log(LogLevel.Debug, format(arguments));
        }
    }
    info() {
        if (this.getLevel() <= LogLevel.Info) {
            this._log(LogLevel.Info, format(arguments));
        }
    }
    warn() {
        if (this.getLevel() <= LogLevel.Warning) {
            this._log(LogLevel.Warning, format(arguments));
        }
    }
    error() {
        if (this.getLevel() <= LogLevel.Error) {
            const arg = arguments[0];
            if (arg instanceof Error) {
                const array = Array.prototype.slice.call(arguments);
                array[0] = arg.stack;
                this._log(LogLevel.Error, format(array));
            }
            else {
                this._log(LogLevel.Error, format(arguments));
            }
        }
    }
    flush() {
    }
    async initialize() {
        try {
            await this.fileService.createFile(this.resource);
        }
        catch (error) {
            if (error.fileOperationResult !== 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                throw error;
            }
        }
    }
    _log(level, message) {
        this.queue.queue(async () => {
            await this.initializePromise;
            let content = await this.loadContent();
            if (content.length > MAX_FILE_SIZE) {
                await this.fileService.writeFile(this.getBackupResource(), VSBuffer.fromString(content));
                content = '';
            }
            if (this.donotUseFormatters) {
                content += message;
            }
            else {
                content += `${this.getCurrentTimestamp()} [${this.stringifyLogLevel(level)}] ${message}\n`;
            }
            await this.fileService.writeFile(this.resource, VSBuffer.fromString(content));
        });
    }
    getCurrentTimestamp() {
        const toTwoDigits = (v) => v < 10 ? `0${v}` : v;
        const toThreeDigits = (v) => v < 10 ? `00${v}` : v < 100 ? `0${v}` : v;
        const currentTime = new Date();
        return `${currentTime.getFullYear()}-${toTwoDigits(currentTime.getMonth() + 1)}-${toTwoDigits(currentTime.getDate())} ${toTwoDigits(currentTime.getHours())}:${toTwoDigits(currentTime.getMinutes())}:${toTwoDigits(currentTime.getSeconds())}.${toThreeDigits(currentTime.getMilliseconds())}`;
    }
    getBackupResource() {
        this.backupIndex = this.backupIndex > 5 ? 1 : this.backupIndex;
        return joinPath(dirname(this.resource), `${basename(this.resource)}_${this.backupIndex++}`);
    }
    async loadContent() {
        try {
            const content = await this.fileService.readFile(this.resource);
            return content.value.toString();
        }
        catch (e) {
            return '';
        }
    }
    stringifyLogLevel(level) {
        switch (level) {
            case LogLevel.Debug: return 'debug';
            case LogLevel.Error: return 'error';
            case LogLevel.Info: return 'info';
            case LogLevel.Trace: return 'trace';
            case LogLevel.Warning: return 'warning';
        }
        return '';
    }
};
FileLogger = __decorate([
    __param(4, IFileService)
], FileLogger);
export { FileLogger };
let FileLoggerService = class FileLoggerService extends AbstractLoggerService {
    fileService;
    constructor(logService, fileService) {
        super(logService.getLevel(), logService.onDidChangeLogLevel);
        this.fileService = fileService;
    }
    doCreateLogger(resource, logLevel, options) {
        const logger = new BufferLogService(logLevel);
        whenProviderRegistered(resource, this.fileService).then(() => logger.logger = new FileLogger(options?.name || basename(resource), resource, logger.getLevel(), !!options?.donotUseFormatters, this.fileService));
        return logger;
    }
};
FileLoggerService = __decorate([
    __param(0, ILogService),
    __param(1, IFileService)
], FileLoggerService);
export { FileLoggerService };
