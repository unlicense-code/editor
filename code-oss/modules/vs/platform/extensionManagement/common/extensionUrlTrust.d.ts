export declare const IExtensionUrlTrustService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionUrlTrustService>;
export interface IExtensionUrlTrustService {
    readonly _serviceBrand: undefined;
    isExtensionUrlTrusted(extensionId: string, url: string): Promise<boolean>;
}
