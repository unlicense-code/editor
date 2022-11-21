import { ILogService } from 'vs/platform/log/common/log';
import { IEncryptionService } from 'vs/workbench/services/encryption/common/encryptionService';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare class EncryptionService implements IEncryptionService {
    readonly _serviceBrand: undefined;
    constructor(remoteAgentService: IRemoteAgentService, environmentService: IBrowserWorkbenchEnvironmentService, logService: ILogService);
    encrypt(value: string): Promise<string>;
    decrypt(value: string): Promise<string>;
}
