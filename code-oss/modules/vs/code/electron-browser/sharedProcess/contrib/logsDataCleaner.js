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
import { RunOnceScheduler } from 'vs/base/common/async';
import { onUnexpectedError } from 'vs/base/common/errors';
import { Disposable } from 'vs/base/common/lifecycle';
import { basename, dirname, join } from 'vs/base/common/path';
import { Promises } from 'vs/base/node/pfs';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILogService } from 'vs/platform/log/common/log';
let LogsDataCleaner = class LogsDataCleaner extends Disposable {
    environmentService;
    logService;
    constructor(environmentService, logService) {
        super();
        this.environmentService = environmentService;
        this.logService = logService;
        const scheduler = this._register(new RunOnceScheduler(() => {
            this.cleanUpOldLogs();
        }, 10 * 1000 /* after 10s */));
        scheduler.schedule();
    }
    async cleanUpOldLogs() {
        this.logService.trace('[logs cleanup]: Starting to clean up old logs.');
        try {
            const currentLog = basename(this.environmentService.logsPath);
            const logsRoot = dirname(this.environmentService.logsPath);
            const logFiles = await Promises.readdir(logsRoot);
            const allSessions = logFiles.filter(logFile => /^\d{8}T\d{6}$/.test(logFile));
            const oldSessions = allSessions.sort().filter(session => session !== currentLog);
            const sessionsToDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 9));
            if (sessionsToDelete.length > 0) {
                this.logService.trace(`[logs cleanup]: Removing log folders '${sessionsToDelete.join(', ')}'`);
                await Promise.all(sessionsToDelete.map(sessionToDelete => Promises.rm(join(logsRoot, sessionToDelete))));
            }
        }
        catch (error) {
            onUnexpectedError(error);
        }
    }
};
LogsDataCleaner = __decorate([
    __param(0, IEnvironmentService),
    __param(1, ILogService)
], LogsDataCleaner);
export { LogsDataCleaner };
