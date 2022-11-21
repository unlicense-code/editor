import { Disposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
export declare class CodeCacheCleaner extends Disposable {
    private readonly productService;
    private readonly logService;
    private readonly _DataMaxAge;
    constructor(currentCodeCachePath: string | undefined, productService: IProductService, logService: ILogService);
    private cleanUpCodeCaches;
}
