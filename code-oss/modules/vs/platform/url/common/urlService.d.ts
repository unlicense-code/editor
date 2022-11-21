import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IProductService } from 'vs/platform/product/common/productService';
import { IOpenURLOptions, IURLHandler, IURLService } from 'vs/platform/url/common/url';
export declare abstract class AbstractURLService extends Disposable implements IURLService {
    readonly _serviceBrand: undefined;
    private handlers;
    abstract create(options?: Partial<UriComponents>): URI;
    open(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
    registerHandler(handler: IURLHandler): IDisposable;
}
export declare class NativeURLService extends AbstractURLService {
    protected readonly productService: IProductService;
    constructor(productService: IProductService);
    create(options?: Partial<UriComponents>): URI;
}
