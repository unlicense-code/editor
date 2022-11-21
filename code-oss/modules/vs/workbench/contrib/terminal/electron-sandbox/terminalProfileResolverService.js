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
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITerminalInstanceService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { BaseTerminalProfileResolverService } from 'vs/workbench/contrib/terminal/browser/terminalProfileResolverService';
import { ITerminalProfileService } from 'vs/workbench/contrib/terminal/common/terminal';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
let ElectronTerminalProfileResolverService = class ElectronTerminalProfileResolverService extends BaseTerminalProfileResolverService {
    constructor(configurationResolverService, configurationService, historyService, lifecycleService, logService, workspaceContextService, terminalProfileService, remoteAgentService, storageService, notificationService, terminalInstanceService) {
        super({
            getDefaultSystemShell: async (remoteAuthority, platform) => {
                const backend = await terminalInstanceService.getBackend(remoteAuthority);
                if (!backend) {
                    throw new Error(`Cannot get default system shell when there is no backend for remote authority '${remoteAuthority}'`);
                }
                return backend.getDefaultSystemShell(platform);
            },
            getEnvironment: async (remoteAuthority) => {
                const backend = await terminalInstanceService.getBackend(remoteAuthority);
                if (!backend) {
                    throw new Error(`Cannot get environment when there is no backend for remote authority '${remoteAuthority}'`);
                }
                return backend.getEnvironment();
            }
        }, configurationService, configurationResolverService, historyService, logService, terminalProfileService, workspaceContextService, remoteAgentService, storageService, notificationService);
    }
};
ElectronTerminalProfileResolverService = __decorate([
    __param(0, IConfigurationResolverService),
    __param(1, IConfigurationService),
    __param(2, IHistoryService),
    __param(3, ILifecycleService),
    __param(4, ILogService),
    __param(5, IWorkspaceContextService),
    __param(6, ITerminalProfileService),
    __param(7, IRemoteAgentService),
    __param(8, IStorageService),
    __param(9, INotificationService),
    __param(10, ITerminalInstanceService)
], ElectronTerminalProfileResolverService);
export { ElectronTerminalProfileResolverService };
