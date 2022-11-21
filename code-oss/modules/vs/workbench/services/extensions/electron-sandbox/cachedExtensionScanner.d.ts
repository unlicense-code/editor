import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IExtensionsScannerService } from 'vs/platform/extensionManagement/common/extensionsScannerService';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class CachedExtensionScanner {
    private readonly _notificationService;
    private readonly _hostService;
    private readonly _extensionsScannerService;
    private readonly _userDataProfileService;
    private readonly _userDataProfilesService;
    private readonly _storageService;
    private readonly _logService;
    readonly scannedExtensions: Promise<IExtensionDescription[]>;
    private _scannedExtensionsResolve;
    private _scannedExtensionsReject;
    constructor(_notificationService: INotificationService, _hostService: IHostService, _extensionsScannerService: IExtensionsScannerService, _userDataProfileService: IUserDataProfileService, _userDataProfilesService: IUserDataProfilesService, _storageService: IStorageService, _logService: ILogService);
    scanSingleExtension(extensionPath: string, isBuiltin: boolean): Promise<IExtensionDescription | null>;
    startScanningExtensions(): Promise<void>;
    private _scanInstalledExtensions;
}
