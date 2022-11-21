import { IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionStorageService } from 'vs/platform/extensionManagement/common/extensionStorage';
import { ILogService } from 'vs/platform/log/common/log';
/**
 * Migrates the installed unsupported nightly extension to a supported pre-release extension. It includes following:
 * 	- Uninstall the Unsupported extension
 * 	- Install (with optional storage migration) the Pre-release extension only if
 * 		- the extension is not installed
 * 		- or it is a release version and the unsupported extension is enabled.
 */
export declare function migrateUnsupportedExtensions(extensionManagementService: IExtensionManagementService, galleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, logService: ILogService): Promise<void>;
