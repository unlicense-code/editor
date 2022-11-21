import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionsProfileScannerService } from 'vs/platform/extensionManagement/common/extensionsProfileScannerService';
import { AbstractExtensionsScannerService, IExtensionsScannerService, Translations } from 'vs/platform/extensionManagement/common/extensionsScannerService';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class ExtensionsScannerService extends AbstractExtensionsScannerService implements IExtensionsScannerService {
    private readonly nativeEnvironmentService;
    constructor(userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, fileService: IFileService, logService: ILogService, nativeEnvironmentService: INativeEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    protected getTranslations(language: string): Promise<Translations>;
}
