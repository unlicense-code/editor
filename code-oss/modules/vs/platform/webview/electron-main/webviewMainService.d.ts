import { Disposable } from 'vs/base/common/lifecycle';
import { FoundInFrameResult, IWebviewManagerService, WebviewWebContentsId, WebviewWindowId } from 'vs/platform/webview/common/webviewManagerService';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
export declare class WebviewMainService extends Disposable implements IWebviewManagerService {
    private readonly windowsMainService;
    readonly _serviceBrand: undefined;
    private readonly _onFoundInFrame;
    onFoundInFrame: import("vs/base/common/event").Event<FoundInFrameResult>;
    constructor(windowsMainService: IWindowsMainService);
    setIgnoreMenuShortcuts(id: WebviewWebContentsId | WebviewWindowId, enabled: boolean): Promise<void>;
    findInFrame(windowId: WebviewWindowId, frameName: string, text: string, options: {
        findNext?: boolean;
        forward?: boolean;
    }): Promise<void>;
    stopFindInFrame(windowId: WebviewWindowId, frameName: string, options: {
        keepSelection?: boolean;
    }): Promise<void>;
    private getFrameByName;
}
