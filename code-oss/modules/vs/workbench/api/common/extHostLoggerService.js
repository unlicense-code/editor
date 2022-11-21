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
import { AbstractMessageLogger, AbstractLoggerService } from 'vs/platform/log/common/log';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { URI } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
import { isUndefined } from 'vs/base/common/types';
let ExtHostLoggerService = class ExtHostLoggerService extends AbstractLoggerService {
    _proxy;
    constructor(rpc, initData) {
        super(initData.logLevel, Event.None);
        this._proxy = rpc.getProxy(MainContext.MainThreadLogger);
    }
    $setLevel(level, resource) {
        if (resource) {
            this.setLevel(URI.revive(resource), level);
        }
        else if (!isUndefined(level)) {
            this.setLevel(level);
        }
    }
    doCreateLogger(resource, logLevel, options) {
        return new Logger(this._proxy, resource, logLevel, options);
    }
};
ExtHostLoggerService = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IExtHostInitDataService)
], ExtHostLoggerService);
export { ExtHostLoggerService };
class Logger extends AbstractMessageLogger {
    proxy;
    file;
    isLoggerCreated = false;
    buffer = [];
    constructor(proxy, file, logLevel, loggerOptions) {
        super(loggerOptions?.always);
        this.proxy = proxy;
        this.file = file;
        this.setLevel(logLevel);
        this.proxy.$createLogger(file, loggerOptions)
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
        this.proxy.$log(this.file, messages);
    }
}
