import { Event } from 'vs/base/common/event';
export declare const ICredentialsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ICredentialsService>;
export interface ICredentialsProvider {
    getPassword(service: string, account: string): Promise<string | null>;
    setPassword(service: string, account: string, password: string): Promise<void>;
    deletePassword(service: string, account: string): Promise<boolean>;
    findPassword(service: string): Promise<string | null>;
    findCredentials(service: string): Promise<Array<{
        account: string;
        password: string;
    }>>;
    clear?(): Promise<void>;
}
export interface ICredentialsChangeEvent {
    service: string;
    account: string;
}
export interface ICredentialsService extends ICredentialsProvider {
    readonly _serviceBrand: undefined;
    readonly onDidChangePassword: Event<ICredentialsChangeEvent>;
    getSecretStoragePrefix(): Promise<string>;
}
export declare const ICredentialsMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ICredentialsMainService>;
export interface ICredentialsMainService extends ICredentialsService {
}
export declare class InMemoryCredentialsProvider implements ICredentialsProvider {
    private secretVault;
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
