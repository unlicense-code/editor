import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionGalleryService, IGalleryExtension, InstallOperation } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionSignatureVerificationService } from 'vs/platform/extensionManagement/node/extensionSignatureVerificationService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
export declare class ExtensionsDownloader extends Disposable {
    private readonly fileService;
    private readonly extensionGalleryService;
    private readonly configurationService;
    private readonly extensionSignatureVerificationService;
    private readonly logService;
    private static readonly SignatureArchiveExtension;
    readonly extensionsDownloadDir: URI;
    private readonly cache;
    private readonly cleanUpPromise;
    constructor(environmentService: INativeEnvironmentService, fileService: IFileService, extensionGalleryService: IExtensionGalleryService, configurationService: IConfigurationService, extensionSignatureVerificationService: IExtensionSignatureVerificationService, logService: ILogService);
    download(extension: IGalleryExtension, operation: InstallOperation): Promise<{
        readonly location: URI;
        verified: boolean;
    }>;
    private downloadSignatureArchive;
    private downloadFile;
    delete(location: URI): Promise<void>;
    private rename;
    private cleanUp;
    private getName;
}
