import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { ILogService } from 'vs/platform/log/common/log';
export declare class BrowserClipboardService extends Disposable implements IClipboardService {
    private readonly layoutService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly mapTextToType;
    constructor(layoutService: ILayoutService, logService: ILogService);
    private webKitPendingClipboardWritePromise;
    private installWebKitWriteTextWorkaround;
    writeText(text: string, type?: string): Promise<void>;
    readText(type?: string): Promise<string>;
    private findText;
    readFindText(): Promise<string>;
    writeFindText(text: string): Promise<void>;
    private resources;
    writeResources(resources: URI[]): Promise<void>;
    readResources(): Promise<URI[]>;
    hasResources(): Promise<boolean>;
}
