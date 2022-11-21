import { ICredentialsService, ICredentialsChangeEvent } from 'vs/platform/credentials/common/credentials';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { Disposable } from 'vs/base/common/lifecycle';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare class BrowserCredentialsService extends Disposable implements ICredentialsService {
    private readonly productService;
    readonly _serviceBrand: undefined;
    private _onDidChangePassword;
    readonly onDidChangePassword: import("vs/base/common/event").Event<ICredentialsChangeEvent>;
    private credentialsProvider;
    private _secretStoragePrefix;
    getSecretStoragePrefix(): Promise<string>;
    constructor(environmentService: IBrowserWorkbenchEnvironmentService, remoteAgentService: IRemoteAgentService, productService: IProductService);
    getPassword(service: string, account: string): Promise<string | null>;
    setPassword(service: string, account: string, password: string): Promise<void>;
    deletePassword(service: string, account: string): Promise<boolean>;
    findPassword(service: string): Promise<string | null>;
    findCredentials(service: string): Promise<Array<{
        account: string;
        password: string;
    }>>;
    clear(): Promise<void>;
}
