import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { AbstractExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
export declare class ExtensionResourceLoaderService extends AbstractExtensionResourceLoaderService {
    private readonly _requestService;
    constructor(fileService: IFileService, storageService: IStorageService, productService: IProductService, environmentService: IEnvironmentService, configurationService: IConfigurationService, _requestService: IRequestService);
    readExtensionResource(uri: URI): Promise<string>;
}
