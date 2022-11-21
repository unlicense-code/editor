import { ILogService } from 'vs/platform/log/common/log';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IProductService } from 'vs/platform/product/common/productService';
import { BaseCredentialsMainService, KeytarModule } from 'vs/platform/credentials/common/credentialsMainService';
export declare class CredentialsWebMainService extends BaseCredentialsMainService {
    private readonly environmentMainService;
    private readonly productService;
    protected surfaceKeytarLoadError?: (err: any) => void;
    constructor(logService: ILogService, environmentMainService: INativeEnvironmentService, productService: IProductService);
    getSecretStoragePrefix(): Promise<string>;
    protected withKeytar(): Promise<KeytarModule>;
}
