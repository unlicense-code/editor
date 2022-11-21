import { IURLHandler, IOpenURLOptions } from 'vs/platform/url/common/url';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { IOpenerService, IOpener } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { NativeURLService } from 'vs/platform/url/common/urlService';
export interface IRelayOpenURLOptions extends IOpenURLOptions {
    openToSide?: boolean;
    openExternal?: boolean;
}
export declare class RelayURLService extends NativeURLService implements IURLHandler, IOpener {
    private readonly nativeHostService;
    private urlService;
    constructor(mainProcessService: IMainProcessService, openerService: IOpenerService, nativeHostService: INativeHostService, productService: IProductService);
    create(options?: Partial<UriComponents>): URI;
    open(resource: URI | string, options?: IRelayOpenURLOptions): Promise<boolean>;
    handleURL(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
}
