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
import { ILoggerService, ILogService, log } from 'vs/platform/log/common/log';
import { registerLogChannel } from 'vs/workbench/services/output/common/output';
import { IFileService } from 'vs/platform/files/common/files';
let DelayedLogChannel = class DelayedLogChannel {
    id;
    name;
    file;
    fileService;
    logService;
    logger;
    constructor(id, name, file, loggerService, fileService, logService) {
        this.id = id;
        this.name = name;
        this.file = file;
        this.fileService = fileService;
        this.logService = logService;
        this.logger = loggerService.createLogger(file, { name });
    }
    registerLogChannelPromise;
    log(level, message) {
        if (!this.registerLogChannelPromise) {
            // Register log channel only when logging is actually attempted
            this.registerLogChannelPromise = registerLogChannel(this.id, this.name, this.file, this.fileService, this.logService);
        }
        log(this.logger, level, message);
    }
};
DelayedLogChannel = __decorate([
    __param(3, ILoggerService),
    __param(4, IFileService),
    __param(5, ILogService)
], DelayedLogChannel);
export { DelayedLogChannel };
