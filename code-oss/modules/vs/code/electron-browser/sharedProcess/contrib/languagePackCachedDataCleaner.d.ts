import { Disposable } from 'vs/base/common/lifecycle';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
export declare class LanguagePackCachedDataCleaner extends Disposable {
    private readonly environmentService;
    private readonly logService;
    private readonly productService;
    private readonly _DataMaxAge;
    constructor(environmentService: INativeEnvironmentService, logService: ILogService, productService: IProductService);
    private cleanUpLanguagePackCache;
}
