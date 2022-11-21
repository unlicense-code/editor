import { ILocalExtension, IExtensionGalleryService, InstallVSIXOptions } from 'vs/platform/extensionManagement/common/extensionManagement';
import { URI } from 'vs/base/common/uri';
import { ExtensionManagementService as BaseExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagementService';
import { IExtensionManagementServer, IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDownloadService } from 'vs/platform/download/common/download';
import { IProductService } from 'vs/platform/product/common/productService';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
export declare class ExtensionManagementService extends BaseExtensionManagementService {
    private readonly environmentService;
    constructor(environmentService: INativeWorkbenchEnvironmentService, extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, configurationService: IConfigurationService, productService: IProductService, downloadService: IDownloadService, userDataSyncEnablementService: IUserDataSyncEnablementService, dialogService: IDialogService, workspaceTrustRequestService: IWorkspaceTrustRequestService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, fileService: IFileService, logService: ILogService, instantiationService: IInstantiationService);
    protected installVSIXInServer(vsix: URI, server: IExtensionManagementServer, options: InstallVSIXOptions | undefined): Promise<ILocalExtension>;
}
