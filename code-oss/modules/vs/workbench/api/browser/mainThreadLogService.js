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
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ILoggerService, ILogService, log, LogLevelToString, parseLogLevel } from 'vs/platform/log/common/log';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ExtHostContext, MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { URI } from 'vs/base/common/uri';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILogLevelService } from 'vs/workbench/contrib/logs/common/logLevelService';
import { IOutputService } from 'vs/workbench/services/output/common/output';
import { localExtHostLog, remoteExtHostLog, webWorkerExtHostLog } from 'vs/workbench/services/extensions/common/extensions';
let MainThreadLoggerService = class MainThreadLoggerService {
    loggerService;
    disposables = new DisposableStore();
    constructor(extHostContext, logService, loggerService, extensionLoggerService, outputService) {
        this.loggerService = loggerService;
        const proxy = extHostContext.getProxy(ExtHostContext.ExtHostLogLevelServiceShape);
        this.disposables.add(logService.onDidChangeLogLevel(level => proxy.$setLevel(level)));
        this.disposables.add(extensionLoggerService.onDidChangeLogLevel(({ id, logLevel }) => {
            const channel = outputService.getChannelDescriptor(id);
            const resource = channel?.log ? channel.file : undefined;
            if (resource && (channel?.extensionId || id === localExtHostLog || id === remoteExtHostLog || id === webWorkerExtHostLog)) {
                proxy.$setLevel(logLevel, resource);
            }
        }));
    }
    $log(file, messages) {
        const logger = this.loggerService.getLogger(URI.revive(file));
        if (!logger) {
            throw new Error('Create the logger before logging');
        }
        for (const [level, message] of messages) {
            log(logger, level, message);
        }
    }
    async $createLogger(file, options) {
        this.loggerService.createLogger(URI.revive(file), options);
    }
    dispose() {
        this.disposables.dispose();
    }
};
MainThreadLoggerService = __decorate([
    extHostNamedCustomer(MainContext.MainThreadLogger),
    __param(1, ILogService),
    __param(2, ILoggerService),
    __param(3, ILogLevelService),
    __param(4, IOutputService)
], MainThreadLoggerService);
export { MainThreadLoggerService };
// --- Internal commands to improve extension test runs
CommandsRegistry.registerCommand('_extensionTests.setLogLevel', function (accessor, level) {
    const logService = accessor.get(ILogService);
    const environmentService = accessor.get(IEnvironmentService);
    if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
        const logLevel = parseLogLevel(level);
        if (logLevel !== undefined) {
            logService.setLevel(logLevel);
        }
    }
});
CommandsRegistry.registerCommand('_extensionTests.getLogLevel', function (accessor) {
    const logService = accessor.get(ILogService);
    return LogLevelToString(logService.getLevel());
});
