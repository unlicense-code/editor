import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { Disposable } from 'vs/base/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
/**
 * A workbench contribution that will look for `.code-workspace` files in the root of the
 * workspace folder and open a notification to suggest to open one of the workspaces.
 */
export declare class WorkspacesFinderContribution extends Disposable implements IWorkbenchContribution {
    private readonly contextService;
    private readonly notificationService;
    private readonly fileService;
    private readonly quickInputService;
    private readonly hostService;
    private readonly storageService;
    constructor(contextService: IWorkspaceContextService, notificationService: INotificationService, fileService: IFileService, quickInputService: IQuickInputService, hostService: IHostService, storageService: IStorageService);
    private findWorkspaces;
    private doHandleWorkspaceFiles;
}
