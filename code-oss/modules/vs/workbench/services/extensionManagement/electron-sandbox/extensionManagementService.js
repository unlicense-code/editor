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
import { generateUuid } from 'vs/base/common/uuid';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionManagementService as BaseExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagementService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IExtensionManagementServerService, IWorkbenchExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { Schemas } from 'vs/base/common/network';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDownloadService } from 'vs/platform/download/common/download';
import { IProductService } from 'vs/platform/product/common/productService';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { joinPath } from 'vs/base/common/resources';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
let ExtensionManagementService = class ExtensionManagementService extends BaseExtensionManagementService {
    environmentService;
    constructor(environmentService, extensionManagementServerService, extensionGalleryService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService) {
        super(extensionManagementServerService, extensionGalleryService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService);
        this.environmentService = environmentService;
    }
    async installVSIXInServer(vsix, server, options) {
        if (vsix.scheme === Schemas.vscodeRemote && server === this.extensionManagementServerService.localExtensionManagementServer) {
            const downloadedLocation = joinPath(this.environmentService.tmpDir, generateUuid());
            await this.downloadService.download(vsix, downloadedLocation);
            vsix = downloadedLocation;
        }
        return super.installVSIXInServer(vsix, server, options);
    }
};
ExtensionManagementService = __decorate([
    __param(0, INativeWorkbenchEnvironmentService),
    __param(1, IExtensionManagementServerService),
    __param(2, IExtensionGalleryService),
    __param(3, IConfigurationService),
    __param(4, IProductService),
    __param(5, IDownloadService),
    __param(6, IUserDataSyncEnablementService),
    __param(7, IDialogService),
    __param(8, IWorkspaceTrustRequestService),
    __param(9, IExtensionManifestPropertiesService),
    __param(10, IFileService),
    __param(11, ILogService),
    __param(12, IInstantiationService)
], ExtensionManagementService);
export { ExtensionManagementService };
registerSingleton(IWorkbenchExtensionManagementService, ExtensionManagementService, 1 /* InstantiationType.Delayed */);
