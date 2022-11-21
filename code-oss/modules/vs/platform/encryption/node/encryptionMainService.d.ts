import { ICommonEncryptionService } from 'vs/platform/encryption/common/encryptionService';
import { ILogService } from 'vs/platform/log/common/log';
export interface Encryption {
    encrypt(salt: string, value: string): Promise<string>;
    decrypt(salt: string, value: string): Promise<string>;
}
export declare class EncryptionMainService implements ICommonEncryptionService {
    private machineId;
    private readonly logService;
    readonly _serviceBrand: undefined;
    constructor(machineId: string, logService: ILogService);
    private encryption;
    encrypt(value: string): Promise<string>;
    decrypt(value: string): Promise<string>;
}
