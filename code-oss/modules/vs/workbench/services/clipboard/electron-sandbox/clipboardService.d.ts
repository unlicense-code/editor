import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { URI } from 'vs/base/common/uri';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
export declare class NativeClipboardService implements IClipboardService {
    private readonly nativeHostService;
    private static readonly FILE_FORMAT;
    readonly _serviceBrand: undefined;
    constructor(nativeHostService: INativeHostService);
    writeText(text: string, type?: 'selection' | 'clipboard'): Promise<void>;
    readText(type?: 'selection' | 'clipboard'): Promise<string>;
    readFindText(): Promise<string>;
    writeFindText(text: string): Promise<void>;
    writeResources(resources: URI[]): Promise<void>;
    readResources(): Promise<URI[]>;
    hasResources(): Promise<boolean>;
    private resourcesToBuffer;
    private bufferToResources;
}
