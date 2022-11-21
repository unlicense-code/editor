import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IWorkbenchFileService } from 'vs/workbench/services/files/common/files';
export declare class WorkspaceWatcher extends Disposable {
    private readonly fileService;
    private readonly configurationService;
    private readonly contextService;
    private readonly notificationService;
    private readonly openerService;
    private readonly uriIdentityService;
    private readonly hostService;
    private readonly watchedWorkspaces;
    constructor(fileService: IWorkbenchFileService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, notificationService: INotificationService, openerService: IOpenerService, uriIdentityService: IUriIdentityService, hostService: IHostService);
    private registerListeners;
    private onDidChangeWorkspaceFolders;
    private onDidChangeWorkbenchState;
    private onDidChangeConfiguration;
    private onDidWatchError;
    private watchWorkspace;
    private unwatchWorkspace;
    private refresh;
    private unwatchWorkspaces;
    dispose(): void;
}
