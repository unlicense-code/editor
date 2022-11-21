import 'vs/css!./media/workspaceTrustEditor';
import { Disposable } from 'vs/base/common/lifecycle';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IBannerService } from 'vs/workbench/services/banner/browser/bannerService';
import { ILabelService } from 'vs/platform/label/common/label';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare class WorkspaceTrustContextKeys extends Disposable implements IWorkbenchContribution {
    private readonly _ctxWorkspaceTrustEnabled;
    private readonly _ctxWorkspaceTrustState;
    constructor(contextKeyService: IContextKeyService, workspaceTrustEnablementService: IWorkspaceTrustEnablementService, workspaceTrustManagementService: IWorkspaceTrustManagementService);
}
export declare class WorkspaceTrustRequestHandler extends Disposable implements IWorkbenchContribution {
    private readonly dialogService;
    private readonly commandService;
    private readonly workspaceContextService;
    private readonly workspaceTrustManagementService;
    private readonly workspaceTrustRequestService;
    constructor(dialogService: IDialogService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, workspaceTrustManagementService: IWorkspaceTrustManagementService, workspaceTrustRequestService: IWorkspaceTrustRequestService);
    private get useWorkspaceLanguage();
    private registerListeners;
}
export declare class WorkspaceTrustUXHandler extends Disposable implements IWorkbenchContribution {
    private readonly dialogService;
    private readonly workspaceContextService;
    private readonly workspaceTrustEnablementService;
    private readonly workspaceTrustManagementService;
    private readonly configurationService;
    private readonly statusbarService;
    private readonly storageService;
    private readonly workspaceTrustRequestService;
    private readonly bannerService;
    private readonly labelService;
    private readonly hostService;
    private readonly productService;
    private readonly remoteAgentService;
    private readonly entryId;
    private readonly statusbarEntryAccessor;
    constructor(dialogService: IDialogService, workspaceContextService: IWorkspaceContextService, workspaceTrustEnablementService: IWorkspaceTrustEnablementService, workspaceTrustManagementService: IWorkspaceTrustManagementService, configurationService: IConfigurationService, statusbarService: IStatusbarService, storageService: IStorageService, workspaceTrustRequestService: IWorkspaceTrustRequestService, bannerService: IBannerService, labelService: ILabelService, hostService: IHostService, productService: IProductService, remoteAgentService: IRemoteAgentService);
    private registerListeners;
    private updateWorkbenchIndicators;
    private doShowModal;
    private showModalOnStart;
    private get startupPromptSetting();
    private get useWorkspaceLanguage();
    private getBannerItem;
    private getBannerItemAriaLabels;
    private getBannerItemMessages;
    private get bannerSetting();
    private createStatusbarEntry;
    private getStatusbarEntry;
    private updateStatusbarEntry;
}
