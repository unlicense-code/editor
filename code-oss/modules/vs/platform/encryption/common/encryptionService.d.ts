export declare const IEncryptionMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IEncryptionMainService>;
export interface IEncryptionMainService extends ICommonEncryptionService {
}
export interface ICommonEncryptionService {
    readonly _serviceBrand: undefined;
    encrypt(value: string): Promise<string>;
    decrypt(value: string): Promise<string>;
}
