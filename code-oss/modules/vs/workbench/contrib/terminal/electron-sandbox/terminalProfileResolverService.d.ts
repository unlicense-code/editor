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
export declare class ElectronTerminalProfileResolverService extends BaseTerminalProfileResolverService {
    constructor(configurationResolverService: IConfigurationResolverService, configurationService: IConfigurationService, historyService: IHistoryService, lifecycleService: ILifecycleService, logService: ILogService, workspaceContextService: IWorkspaceContextService, terminalProfileService: ITerminalProfileService, remoteAgentService: IRemoteAgentService, storageService: IStorageService, notificationService: INotificationService, terminalInstanceService: ITerminalInstanceService);
}
