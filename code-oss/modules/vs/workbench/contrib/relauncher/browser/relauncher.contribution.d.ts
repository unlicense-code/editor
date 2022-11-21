import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IProductService } from 'vs/platform/product/common/productService';
export declare class SettingsChangeRelauncher extends Disposable implements IWorkbenchContribution {
    private readonly hostService;
    private readonly configurationService;
    private readonly productService;
    private readonly dialogService;
    private readonly titleBarStyle;
    private readonly windowControlsOverlayEnabled;
    private readonly windowSandboxEnabled;
    private readonly nativeTabs;
    private readonly nativeFullScreen;
    private readonly clickThroughInactive;
    private readonly updateMode;
    private accessibilitySupport;
    private readonly workspaceTrustEnabled;
    private readonly profilesEnabled;
    private readonly experimentsEnabled;
    private readonly enablePPEExtensionsGallery;
    constructor(hostService: IHostService, configurationService: IConfigurationService, productService: IProductService, dialogService: IDialogService);
    private onConfigurationChange;
    private doConfirm;
}
export declare class WorkspaceChangeExtHostRelauncher extends Disposable implements IWorkbenchContribution {
    private readonly contextService;
    private firstFolderResource?;
    private extensionHostRestarter;
    private onDidChangeWorkspaceFoldersUnbind;
    constructor(contextService: IWorkspaceContextService, extensionService: IExtensionService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService);
    private handleWorkbenchState;
    private onDidChangeWorkspaceFolders;
}
