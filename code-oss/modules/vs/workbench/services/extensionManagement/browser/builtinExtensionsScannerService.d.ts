import { IBuiltinExtensionsScannerService, IExtension } from 'vs/platform/extensions/common/extensions';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { IProductService } from 'vs/platform/product/common/productService';
import { ILogService } from 'vs/platform/log/common/log';
export declare class BuiltinExtensionsScannerService implements IBuiltinExtensionsScannerService {
    private readonly extensionResourceLoaderService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly builtinExtensionsPromises;
    private nlsUrl;
    constructor(environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, extensionResourceLoaderService: IExtensionResourceLoaderService, productService: IProductService, logService: ILogService);
    scanBuiltinExtensions(): Promise<IExtension[]>;
    private localizeManifest;
}
