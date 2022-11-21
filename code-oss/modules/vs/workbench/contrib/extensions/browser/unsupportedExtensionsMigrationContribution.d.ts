import { IExtensionGalleryService, IGlobalExtensionEnablementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionStorageService } from 'vs/platform/extensionManagement/common/extensionStorage';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
export declare class UnsupportedExtensionsMigrationContrib implements IWorkbenchContribution {
    constructor(extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, logService: ILogService);
}
