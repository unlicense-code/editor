import { ICredentialsChangeEvent, ICredentialsMainService } from 'vs/platform/credentials/common/credentials';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
export declare type KeytarModule = typeof import('keytar');
export declare abstract class BaseCredentialsMainService extends Disposable implements ICredentialsMainService {
    protected readonly logService: ILogService;
    private static readonly MAX_PASSWORD_LENGTH;
    private static readonly PASSWORD_CHUNK_SIZE;
    readonly _serviceBrand: undefined;
    private _onDidChangePassword;
    readonly onDidChangePassword: import("vs/base/common/event").Event<ICredentialsChangeEvent>;
    protected _keytarCache: KeytarModule | undefined;
    constructor(logService: ILogService);
    abstract getSecretStoragePrefix(): Promise<string>;
    protected abstract withKeytar(): Promise<KeytarModule>;
    /**
     * An optional method that subclasses can implement to assist in surfacing
     * Keytar load errors to the user in a friendly way.
     */
    protected abstract surfaceKeytarLoadError?: (err: any) => void;
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
