import { MainThreadClipboardShape } from '../common/extHost.protocol';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
export declare class MainThreadClipboard implements MainThreadClipboardShape {
    private readonly _clipboardService;
    constructor(_context: any, _clipboardService: IClipboardService);
    dispose(): void;
    $readText(): Promise<string>;
    $writeText(value: string): Promise<void>;
}
