import { IExtensionUrlTrustService } from 'vs/platform/extensionManagement/common/extensionUrlTrust';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
export declare class ExtensionUrlTrustService implements IExtensionUrlTrustService {
    private readonly productService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private trustedExtensionUrlPublicKeys;
    constructor(productService: IProductService, logService: ILogService);
    isExtensionUrlTrusted(extensionId: string, url: string): Promise<boolean>;
}
