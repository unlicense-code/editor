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
import { ILoggerService } from 'vs/platform/log/common/log';
import { Emitter } from 'vs/base/common/event';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { IOutputService } from 'vs/workbench/services/output/common/output';
export const ILogLevelService = createDecorator('ILogLevelService');
let LogLevelService = class LogLevelService extends Disposable {
    outputService;
    loggerService;
    _serviceBrand;
    _onDidChangeLogLevel = this._register(new Emitter());
    onDidChangeLogLevel = this._onDidChangeLogLevel.event;
    logLevels = new Map();
    constructor(outputService, loggerService) {
        super();
        this.outputService = outputService;
        this.loggerService = loggerService;
    }
    getLogLevel(id) {
        return this.logLevels.get(id);
    }
    setLogLevel(id, logLevel) {
        if (this.getLogLevel(id) === logLevel) {
            return false;
        }
        this.logLevels.set(id, logLevel);
        const channel = this.outputService.getChannelDescriptor(id);
        const resource = channel?.log ? channel.file : undefined;
        if (resource) {
            this.loggerService.setLevel(resource, logLevel);
        }
        this._onDidChangeLogLevel.fire({ id, logLevel });
        return true;
    }
};
LogLevelService = __decorate([
    __param(0, IOutputService),
    __param(1, ILoggerService)
], LogLevelService);
export { LogLevelService };
