import { Event } from 'vs/base/common/event';
export declare const IWebviewManagerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWebviewManagerService>;
export interface WebviewWebContentsId {
    readonly webContentsId: number;
}
export interface WebviewWindowId {
    readonly windowId: number;
}
export interface FindInFrameOptions {
    readonly forward?: boolean;
    readonly findNext?: boolean;
    readonly matchCase?: boolean;
}
export interface FoundInFrameResult {
    readonly requestId: number;
    readonly activeMatchOrdinal: number;
    readonly matches: number;
    readonly selectionArea: any;
    readonly finalUpdate: boolean;
}
export interface IWebviewManagerService {
    _serviceBrand: unknown;
    onFoundInFrame: Event<FoundInFrameResult>;
    setIgnoreMenuShortcuts(id: WebviewWebContentsId | WebviewWindowId, enabled: boolean): Promise<void>;
    findInFrame(windowId: WebviewWindowId, frameName: string, text: string, options: FindInFrameOptions): Promise<void>;
    stopFindInFrame(windowId: WebviewWindowId, frameName: string, options: {
        keepSelection?: boolean;
    }): Promise<void>;
}
