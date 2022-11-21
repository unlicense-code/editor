import { ILogService } from 'vs/platform/log/common/log';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { BaseCredentialsMainService, KeytarModule } from 'vs/platform/credentials/common/credentialsMainService';
export declare class CredentialsNativeMainService extends BaseCredentialsMainService {
    private readonly environmentMainService;
    private readonly productService;
    private readonly windowsMainService;
    constructor(logService: ILogService, environmentMainService: INativeEnvironmentService, productService: IProductService, windowsMainService: IWindowsMainService);
    getSecretStoragePrefix(): Promise<string>;
    protected withKeytar(): Promise<KeytarModule>;
    protected surfaceKeytarLoadError: (err: any) => void;
}
