import { ICommandService } from 'vs/platform/commands/common/commands';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IProductService } from 'vs/platform/product/common/productService';
export declare const restoreWalkthroughsConfigurationKey = "workbench.welcomePage.restorableWalkthroughs";
export declare type RestoreWalkthroughsConfigurationValue = {
    folder: string;
    category?: string;
    step?: string;
};
export declare class StartupPageContribution implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly configurationService;
    private readonly editorService;
    private readonly workingCopyBackupService;
    private readonly fileService;
    private readonly contextService;
    private readonly lifecycleService;
    private readonly layoutService;
    private readonly productService;
    private readonly commandService;
    private readonly environmentService;
    private readonly storageService;
    constructor(instantiationService: IInstantiationService, configurationService: IConfigurationService, editorService: IEditorService, workingCopyBackupService: IWorkingCopyBackupService, fileService: IFileService, contextService: IWorkspaceContextService, lifecycleService: ILifecycleService, layoutService: IWorkbenchLayoutService, productService: IProductService, commandService: ICommandService, environmentService: IWorkbenchEnvironmentService, storageService: IStorageService);
    private run;
    private tryOpenWalkthroughForFolder;
    private openReadme;
    private openGettingStarted;
}
