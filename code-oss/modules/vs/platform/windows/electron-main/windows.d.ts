import { WebContents } from 'electron';
import { Event } from 'vs/base/common/event';
import { IProcessEnvironment } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { ICodeWindow } from 'vs/platform/window/electron-main/window';
import { IOpenEmptyWindowOptions, IWindowOpenable } from 'vs/platform/window/common/window';
export declare const IWindowsMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWindowsMainService>;
export interface IWindowsMainService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeWindowsCount: Event<IWindowsCountChangedEvent>;
    readonly onDidOpenWindow: Event<ICodeWindow>;
    readonly onDidSignalReadyWindow: Event<ICodeWindow>;
    readonly onDidTriggerSystemContextMenu: Event<{
        window: ICodeWindow;
        x: number;
        y: number;
    }>;
    readonly onDidDestroyWindow: Event<ICodeWindow>;
    open(openConfig: IOpenConfiguration): Promise<ICodeWindow[]>;
    openEmptyWindow(openConfig: IOpenEmptyConfiguration, options?: IOpenEmptyWindowOptions): Promise<ICodeWindow[]>;
    openExtensionDevelopmentHostWindow(extensionDevelopmentPath: string[], openConfig: IOpenConfiguration): Promise<ICodeWindow[]>;
    openExistingWindow(window: ICodeWindow, openConfig: IOpenConfiguration): void;
    sendToFocused(channel: string, ...args: any[]): void;
    sendToAll(channel: string, payload?: any, windowIdsToIgnore?: number[]): void;
    getWindows(): ICodeWindow[];
    getWindowCount(): number;
    getFocusedWindow(): ICodeWindow | undefined;
    getLastActiveWindow(): ICodeWindow | undefined;
    getWindowById(windowId: number): ICodeWindow | undefined;
    getWindowByWebContents(webContents: WebContents): ICodeWindow | undefined;
}
export interface IWindowsCountChangedEvent {
    readonly oldCount: number;
    readonly newCount: number;
}
export declare const enum OpenContext {
    CLI = 0,
    DOCK = 1,
    MENU = 2,
    DIALOG = 3,
    DESKTOP = 4,
    API = 5
}
export interface IBaseOpenConfiguration {
    readonly context: OpenContext;
    readonly contextWindowId?: number;
}
export interface IOpenConfiguration extends IBaseOpenConfiguration {
    readonly cli: NativeParsedArgs;
    readonly userEnv?: IProcessEnvironment;
    readonly urisToOpen?: IWindowOpenable[];
    readonly waitMarkerFileURI?: URI;
    readonly preferNewWindow?: boolean;
    readonly forceNewWindow?: boolean;
    readonly forceNewTabbedWindow?: boolean;
    readonly forceReuseWindow?: boolean;
    readonly forceEmpty?: boolean;
    readonly diffMode?: boolean;
    readonly mergeMode?: boolean;
    addMode?: boolean;
    readonly gotoLineMode?: boolean;
    readonly initialStartup?: boolean;
    readonly noRecentEntry?: boolean;
    /**
     * The remote authority to use when windows are opened with either
     * - no workspace (empty window)
     * - a workspace that is neither `file://` nor `vscode-remote://`
     */
    readonly remoteAuthority?: string;
    readonly forceProfile?: string;
    readonly forceTempProfile?: boolean;
}
export interface IOpenEmptyConfiguration extends IBaseOpenConfiguration {
}
