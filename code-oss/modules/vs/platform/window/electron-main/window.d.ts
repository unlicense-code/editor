import { BrowserWindow, Rectangle } from 'electron';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ISerializableCommandAction } from 'vs/platform/action/common/action';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { INativeWindowConfiguration } from 'vs/platform/window/common/window';
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export interface ICodeWindow extends IDisposable {
    readonly onWillLoad: Event<ILoadEvent>;
    readonly onDidSignalReady: Event<void>;
    readonly onDidTriggerSystemContextMenu: Event<{
        x: number;
        y: number;
    }>;
    readonly onDidClose: Event<void>;
    readonly onDidDestroy: Event<void>;
    readonly whenClosedOrLoaded: Promise<void>;
    readonly id: number;
    readonly win: BrowserWindow | null;
    readonly config: INativeWindowConfiguration | undefined;
    readonly openedWorkspace?: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier;
    readonly profile?: IUserDataProfile;
    readonly backupPath?: string;
    readonly remoteAuthority?: string;
    readonly isExtensionDevelopmentHost: boolean;
    readonly isExtensionTestHost: boolean;
    readonly lastFocusTime: number;
    readonly isReady: boolean;
    ready(): Promise<ICodeWindow>;
    setReady(): void;
    addTabbedWindow(window: ICodeWindow): void;
    load(config: INativeWindowConfiguration, options?: {
        isReload?: boolean;
    }): void;
    reload(cli?: NativeParsedArgs): void;
    focus(options?: {
        force: boolean;
    }): void;
    close(): void;
    getBounds(): Rectangle;
    send(channel: string, ...args: any[]): void;
    sendWhenReady(channel: string, token: CancellationToken, ...args: any[]): void;
    readonly isFullScreen: boolean;
    toggleFullScreen(): void;
    isMinimized(): boolean;
    setRepresentedFilename(name: string): void;
    getRepresentedFilename(): string | undefined;
    setDocumentEdited(edited: boolean): void;
    isDocumentEdited(): boolean;
    handleTitleDoubleClick(): void;
    updateTouchBar(items: ISerializableCommandAction[][]): void;
    serializeWindowState(): IWindowState;
    updateWindowControls(options: {
        height?: number;
        backgroundColor?: string;
        foregroundColor?: string;
    }): void;
}
export declare const enum LoadReason {
    /**
     * The window is loaded for the first time.
     */
    INITIAL = 1,
    /**
     * The window is loaded into a different workspace context.
     */
    LOAD = 2,
    /**
     * The window is reloaded.
     */
    RELOAD = 3
}
export declare const enum UnloadReason {
    /**
     * The window is closed.
     */
    CLOSE = 1,
    /**
     * All windows unload because the application quits.
     */
    QUIT = 2,
    /**
     * The window is reloaded.
     */
    RELOAD = 3,
    /**
     * The window is loaded into a different workspace context.
     */
    LOAD = 4
}
export interface IWindowState {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    mode?: WindowMode;
    display?: number;
}
export declare const defaultWindowState: (mode?: WindowMode) => IWindowState;
export declare const enum WindowMode {
    Maximized = 0,
    Normal = 1,
    Minimized = 2,
    Fullscreen = 3
}
export interface ILoadEvent {
    workspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | undefined;
    reason: LoadReason;
}
export declare const enum WindowError {
    /**
     * Maps to the `unresponsive` event on a `BrowserWindow`.
     */
    UNRESPONSIVE = 1,
    /**
     * Maps to the `render-process-gone` event on a `WebContents`.
     */
    PROCESS_GONE = 2,
    /**
     * Maps to the `did-fail-load` event on a `WebContents`.
     */
    LOAD = 3
}
