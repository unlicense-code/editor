export declare const IExtensionSignatureVerificationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionSignatureVerificationService>;
/**
 * A service for verifying signed extensions.
 */
export interface IExtensionSignatureVerificationService {
    readonly _serviceBrand: undefined;
    /**
     * Verifies an extension file (.vsix) against a signature archive file.
     * @param { string } vsixFilePath The extension file path.
     * @param { string } signatureArchiveFilePath The signature archive file path.
     * @returns { Promise<boolean> } A promise with `true` if the extension is validly signed and trusted;
     * otherwise, `false` because verification is not enabled (e.g.:  in the OSS version of VS Code).
     * @throws { ExtensionVerificationError } An error with a code indicating the validity, integrity, or trust issue
     * found during verification or a more fundamental issue (e.g.:  a required dependency was not found).
     */
    verify(vsixFilePath: string, signatureArchiveFilePath: string): Promise<boolean>;
}
/**
 * An error raised during extension signature verification.
 */
export interface ExtensionSignatureVerificationError extends Error {
    readonly code: string;
}
export declare class ExtensionSignatureVerificationService implements IExtensionSignatureVerificationService {
    readonly _serviceBrand: undefined;
    private moduleLoadingPromise;
    private vsceSign;
    verify(vsixFilePath: string, signatureArchiveFilePath: string): Promise<boolean>;
}
