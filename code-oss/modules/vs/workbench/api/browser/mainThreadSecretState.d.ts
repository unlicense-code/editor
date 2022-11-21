import { Disposable } from 'vs/base/common/lifecycle';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
import { IEncryptionService } from 'vs/workbench/services/encryption/common/encryptionService';
import { MainThreadSecretStateShape } from '../common/extHost.protocol';
import { ILogService } from 'vs/platform/log/common/log';
export declare class MainThreadSecretState extends Disposable implements MainThreadSecretStateShape {
    private readonly credentialsService;
    private readonly encryptionService;
    private readonly logService;
    private readonly _proxy;
    private secretStoragePrefix;
    constructor(extHostContext: IExtHostContext, credentialsService: ICredentialsService, encryptionService: IEncryptionService, logService: ILogService);
    private getFullKey;
    $getPassword(extensionId: string, key: string): Promise<string | undefined>;
    $setPassword(extensionId: string, key: string, value: string): Promise<void>;
    $deletePassword(extensionId: string, key: string): Promise<void>;
}
