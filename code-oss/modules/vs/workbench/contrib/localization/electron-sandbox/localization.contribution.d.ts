import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IExtensionManagementService, IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export declare class LocalizationWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    private readonly notificationService;
    private readonly jsonEditingService;
    private readonly environmentService;
    private readonly hostService;
    private readonly storageService;
    private readonly extensionManagementService;
    private readonly galleryService;
    private readonly paneCompositeService;
    private readonly telemetryService;
    constructor(notificationService: INotificationService, jsonEditingService: IJSONEditingService, environmentService: IEnvironmentService, hostService: IHostService, storageService: IStorageService, extensionManagementService: IExtensionManagementService, galleryService: IExtensionGalleryService, paneCompositeService: IPaneCompositePartService, telemetryService: ITelemetryService);
    private onDidInstallExtensions;
    private checkAndInstall;
    private isLocaleInstalled;
    private installExtension;
}
