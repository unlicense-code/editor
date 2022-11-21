/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as path from 'vs/base/common/path';
import * as platform from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { dedupExtensions } from 'vs/workbench/services/extensions/common/extensionsUtil';
import { IExtensionsScannerService, toExtensionDescription } from 'vs/platform/extensionManagement/common/extensionsScannerService';
import { ILogService } from 'vs/platform/log/common/log';
import Severity from 'vs/base/common/severity';
import { localize } from 'vs/nls';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { timeout } from 'vs/base/common/async';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { DEFAULT_PROFILE_EXTENSIONS_MIGRATION_KEY } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
let CachedExtensionScanner = class CachedExtensionScanner {
    _notificationService;
    _hostService;
    _extensionsScannerService;
    _userDataProfileService;
    _userDataProfilesService;
    _storageService;
    _logService;
    scannedExtensions;
    _scannedExtensionsResolve;
    _scannedExtensionsReject;
    constructor(_notificationService, _hostService, _extensionsScannerService, _userDataProfileService, _userDataProfilesService, _storageService, _logService) {
        this._notificationService = _notificationService;
        this._hostService = _hostService;
        this._extensionsScannerService = _extensionsScannerService;
        this._userDataProfileService = _userDataProfileService;
        this._userDataProfilesService = _userDataProfilesService;
        this._storageService = _storageService;
        this._logService = _logService;
        this.scannedExtensions = new Promise((resolve, reject) => {
            this._scannedExtensionsResolve = resolve;
            this._scannedExtensionsReject = reject;
        });
    }
    async scanSingleExtension(extensionPath, isBuiltin) {
        const scannedExtension = await this._extensionsScannerService.scanExistingExtension(URI.file(path.resolve(extensionPath)), isBuiltin ? 0 /* ExtensionType.System */ : 1 /* ExtensionType.User */, { language: platform.language });
        return scannedExtension ? toExtensionDescription(scannedExtension, false) : null;
    }
    async startScanningExtensions() {
        try {
            const extensions = await this._scanInstalledExtensions();
            this._scannedExtensionsResolve(extensions);
        }
        catch (err) {
            this._scannedExtensionsReject(err);
        }
    }
    async _scanInstalledExtensions() {
        try {
            const language = platform.language;
            const profileLocation = this._userDataProfilesService.profiles.length === 1 && this._userDataProfileService.currentProfile.isDefault && !this._storageService.getBoolean(DEFAULT_PROFILE_EXTENSIONS_MIGRATION_KEY, -1 /* StorageScope.APPLICATION */, false) ? undefined : this._userDataProfileService.currentProfile.extensionsResource;
            const [scannedSystemExtensions, scannedUserExtensions] = await Promise.all([
                this._extensionsScannerService.scanSystemExtensions({ language, useCache: true, checkControlFile: true }),
                this._extensionsScannerService.scanUserExtensions({ language, profileLocation, useCache: true })
            ]);
            const scannedDevelopedExtensions = await this._extensionsScannerService.scanExtensionsUnderDevelopment({ language }, [...scannedSystemExtensions, ...scannedUserExtensions]);
            const system = scannedSystemExtensions.map(e => toExtensionDescription(e, false));
            const user = scannedUserExtensions.map(e => toExtensionDescription(e, false));
            const development = scannedDevelopedExtensions.map(e => toExtensionDescription(e, true));
            const r = dedupExtensions(system, user, development, this._logService);
            const disposable = this._extensionsScannerService.onDidChangeCache(() => {
                disposable.dispose();
                this._notificationService.prompt(Severity.Error, localize('extensionCache.invalid', "Extensions have been modified on disk. Please reload the window."), [{
                        label: localize('reloadWindow', "Reload Window"),
                        run: () => this._hostService.reload()
                    }]);
            });
            timeout(5000).then(() => disposable.dispose());
            return r;
        }
        catch (err) {
            this._logService.error(`Error scanning installed extensions:`);
            this._logService.error(err);
            return [];
        }
    }
};
CachedExtensionScanner = __decorate([
    __param(0, INotificationService),
    __param(1, IHostService),
    __param(2, IExtensionsScannerService),
    __param(3, IUserDataProfileService),
    __param(4, IUserDataProfilesService),
    __param(5, IStorageService),
    __param(6, ILogService)
], CachedExtensionScanner);
export { CachedExtensionScanner };
