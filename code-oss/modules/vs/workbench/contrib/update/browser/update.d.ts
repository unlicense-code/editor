import { Disposable } from 'vs/base/common/lifecycle';
import { IActivityService } from 'vs/workbench/services/activity/common/activity';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUpdateService } from 'vs/platform/update/common/update';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { RawContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IProductService } from 'vs/platform/product/common/productService';
export declare const CONTEXT_UPDATE_STATE: RawContextKey<string>;
export declare const RELEASE_NOTES_URL: RawContextKey<string>;
export declare function showReleaseNotesInEditor(instantiationService: IInstantiationService, version: string): Promise<boolean>;
export declare class ProductContribution implements IWorkbenchContribution {
    private static readonly KEY;
    constructor(storageService: IStorageService, instantiationService: IInstantiationService, notificationService: INotificationService, environmentService: IBrowserWorkbenchEnvironmentService, openerService: IOpenerService, configurationService: IConfigurationService, hostService: IHostService, productService: IProductService, contextKeyService: IContextKeyService);
}
export declare class UpdateContribution extends Disposable implements IWorkbenchContribution {
    private readonly storageService;
    private readonly instantiationService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly updateService;
    private readonly activityService;
    private readonly contextKeyService;
    private readonly productService;
    private readonly hostService;
    private state;
    private readonly badgeDisposable;
    private updateStateContextKey;
    constructor(storageService: IStorageService, instantiationService: IInstantiationService, notificationService: INotificationService, dialogService: IDialogService, updateService: IUpdateService, activityService: IActivityService, contextKeyService: IContextKeyService, productService: IProductService, hostService: IHostService);
    private onUpdateStateChange;
    private onError;
    private onUpdateNotAvailable;
    private onUpdateAvailable;
    private onUpdateDownloaded;
    private onUpdateReady;
    private shouldShowNotification;
    private registerGlobalActivityActions;
}
export declare class SwitchProductQualityContribution extends Disposable implements IWorkbenchContribution {
    private readonly productService;
    private readonly environmentService;
    constructor(productService: IProductService, environmentService: IBrowserWorkbenchEnvironmentService);
    private registerGlobalActivityActions;
}
