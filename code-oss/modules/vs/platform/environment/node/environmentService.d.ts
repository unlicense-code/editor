import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { AbstractNativeEnvironmentService } from 'vs/platform/environment/common/environmentService';
import { IProductService } from 'vs/platform/product/common/productService';
export declare class NativeEnvironmentService extends AbstractNativeEnvironmentService {
    constructor(args: NativeParsedArgs, productService: IProductService);
}
