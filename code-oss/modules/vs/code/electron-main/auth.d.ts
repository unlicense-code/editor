import { Disposable } from 'vs/base/common/lifecycle';
import { ICredentialsMainService } from 'vs/platform/credentials/common/credentials';
import { IEncryptionMainService } from 'vs/platform/encryption/common/encryptionService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
export declare class ProxyAuthHandler extends Disposable {
    private readonly logService;
    private readonly windowsMainService;
    private readonly credentialsService;
    private readonly encryptionMainService;
    private readonly productService;
    private readonly PROXY_CREDENTIALS_SERVICE_KEY;
    private pendingProxyResolve;
    private state;
    private sessionCredentials;
    constructor(logService: ILogService, windowsMainService: IWindowsMainService, credentialsService: ICredentialsMainService, encryptionMainService: IEncryptionMainService, productService: IProductService);
    private registerListeners;
    private onLogin;
    private resolveProxyCredentials;
    private doResolveProxyCredentials;
}
