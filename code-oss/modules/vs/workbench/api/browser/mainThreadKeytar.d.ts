import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { MainThreadKeytarShape } from 'vs/workbench/api/common/extHost.protocol';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
export declare class MainThreadKeytar implements MainThreadKeytarShape {
    private readonly _credentialsService;
    constructor(_extHostContext: IExtHostContext, _credentialsService: ICredentialsService);
    $getPassword(service: string, account: string): Promise<string | null>;
    $setPassword(service: string, account: string, password: string): Promise<void>;
    $deletePassword(service: string, account: string): Promise<boolean>;
    $findPassword(service: string): Promise<string | null>;
    $findCredentials(service: string): Promise<Array<{
        account: string;
        password: string;
    }>>;
    dispose(): void;
}
