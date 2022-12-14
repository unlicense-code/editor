import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IEditSessionsStorageService, IEditSessionsLogService } from 'vs/workbench/contrib/editSessions/common/editSessions';
import { ISCMService } from 'vs/workbench/contrib/scm/common/scm';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IProductService } from 'vs/platform/product/common/productService';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditSessionIdentityService } from 'vs/platform/workspace/common/editSessions';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IActivityService } from 'vs/workbench/services/activity/common/activity';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare class EditSessionsContribution extends Disposable implements IWorkbenchContribution {
    private readonly editSessionsStorageService;
    private readonly fileService;
    private readonly progressService;
    private readonly openerService;
    private readonly telemetryService;
    private readonly scmService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly logService;
    private readonly environmentService;
    private readonly instantiationService;
    private readonly productService;
    private configurationService;
    private readonly contextService;
    private readonly editSessionIdentityService;
    private readonly quickInputService;
    private commandService;
    private readonly contextKeyService;
    private readonly fileDialogService;
    private readonly lifecycleService;
    private readonly storageService;
    private readonly activityService;
    private readonly editorService;
    private continueEditSessionOptions;
    private readonly shouldShowViewsContext;
    private static APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY;
    private accountsMenuBadgeDisposable;
    constructor(editSessionsStorageService: IEditSessionsStorageService, fileService: IFileService, progressService: IProgressService, openerService: IOpenerService, telemetryService: ITelemetryService, scmService: ISCMService, notificationService: INotificationService, dialogService: IDialogService, logService: IEditSessionsLogService, environmentService: IEnvironmentService, instantiationService: IInstantiationService, productService: IProductService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, editSessionIdentityService: IEditSessionIdentityService, quickInputService: IQuickInputService, commandService: ICommandService, contextKeyService: IContextKeyService, fileDialogService: IFileDialogService, lifecycleService: ILifecycleService, storageService: IStorageService, activityService: IActivityService, editorService: IEditorService);
    private autoResumeEditSession;
    private updateAccountsMenuBadge;
    private autoStoreEditSession;
    private registerViews;
    private registerActions;
    private registerShowEditSessionOutputChannelAction;
    private registerShowEditSessionViewAction;
    private registerContinueEditSessionAction;
    private registerResumeLatestEditSessionAction;
    private registerStoreLatestEditSessionAction;
    resumeEditSession(ref?: string, silent?: boolean, force?: boolean): Promise<void>;
    private generateChanges;
    private willChangeLocalContents;
    storeEditSession(fromStoreCommand: boolean): Promise<string | undefined>;
    private getChangedResources;
    private hasEditSession;
    private shouldContinueOnWithEditSession;
    private registerContributedEditSessionOptions;
    private registerContinueInLocalFolderAction;
    private pickContinueEditSessionDestination;
    private resolveDestination;
    private createPickItems;
}
