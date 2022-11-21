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
import { IOutputService } from 'vs/workbench/services/output/common/output';
import { IMainProcessService, ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { LogLevelService as CommonLogLevelService } from 'vs/workbench/contrib/logs/common/logLevelService';
import { remotePtyHostLog, remoteServerLog, sharedLogChannelId, userDataSyncLogChannelId } from 'vs/workbench/contrib/logs/common/logConstants';
import { LogLevelChannelClient } from 'vs/platform/log/common/logIpc';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
let LogLevelService = class LogLevelService extends CommonLogLevelService {
    sharedProcessService;
    mainProcessService;
    remoteAgentService;
    constructor(outputService, loggerService, sharedProcessService, mainProcessService, remoteAgentService) {
        super(outputService, loggerService);
        this.sharedProcessService = sharedProcessService;
        this.mainProcessService = mainProcessService;
        this.remoteAgentService = remoteAgentService;
    }
    setLogLevel(id, logLevel) {
        if (!super.setLogLevel(id, logLevel)) {
            return false;
        }
        const channel = this.outputService.getChannelDescriptor(id);
        const resource = channel?.log ? channel.file : undefined;
        LogLevelChannelClient.setLevel(this.mainProcessService.getChannel('logLevel'), logLevel, resource);
        if (id === sharedLogChannelId || id === userDataSyncLogChannelId) {
            LogLevelChannelClient.setLevel(this.sharedProcessService.getChannel('logLevel'), logLevel, resource);
            return true;
        }
        const connection = this.remoteAgentService.getConnection();
        if ((id === remoteServerLog || id === remotePtyHostLog) && connection) {
            connection.withChannel('logger', (channel) => LogLevelChannelClient.setLevel(channel, logLevel, resource));
            return true;
        }
        return true;
    }
};
LogLevelService = __decorate([
    __param(0, IOutputService),
    __param(1, ILoggerService),
    __param(2, ISharedProcessService),
    __param(3, IMainProcessService),
    __param(4, IRemoteAgentService)
], LogLevelService);
export { LogLevelService };
