import { URI } from 'vs/base/common/uri';
export declare const IClipboardService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IClipboardService>;
export interface IClipboardService {
    readonly _serviceBrand: undefined;
    /**
     * Writes text to the system clipboard.
     */
    writeText(text: string, type?: string): Promise<void>;
    /**
     * Reads the content of the clipboard in plain text
     */
    readText(type?: string): Promise<string>;
    /**
     * Reads text from the system find pasteboard.
     */
    readFindText(): Promise<string>;
    /**
     * Writes text to the system find pasteboard.
     */
    writeFindText(text: string): Promise<void>;
    /**
     * Writes resources to the system clipboard.
     */
    writeResources(resources: URI[]): Promise<void>;
    /**
     * Reads resources from the system clipboard.
     */
    readResources(): Promise<URI[]>;
    /**
     * Find out if resources are copied to the clipboard.
     */
    hasResources(): Promise<boolean>;
}
