import { Disposable } from 'vs/base/common/lifecycle';
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionStorageService } from 'vs/platform/extensionManagement/common/extensionStorage';
import { INativeServerExtensionManagementService } from 'vs/platform/extensionManagement/node/extensionManagementService';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class ExtensionsContributions extends Disposable {
    constructor(extensionManagementService: INativeServerExtensionManagementService, extensionGalleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, storageService: IStorageService, logService: ILogService);
}
