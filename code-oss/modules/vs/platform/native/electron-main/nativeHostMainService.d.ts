import { MessageBoxOptions, MessageBoxReturnValue, OpenDevToolsOptions, OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { AddFirstParameterToFunctions } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { MouseInputEvent } from 'vs/base/parts/sandbox/common/electronTypes';
import { ISerializableCommandAction } from 'vs/platform/action/common/action';
import { INativeOpenDialogOptions } from 'vs/platform/dialogs/common/dialogs';
import { IDialogMainService } from 'vs/platform/dialogs/electron-main/dialogMainService';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { ICommonNativeHostService, IOSProperties, IOSStatistics } from 'vs/platform/native/common/native';
import { IProductService } from 'vs/platform/product/common/productService';
import { ISharedProcess } from 'vs/platform/sharedProcess/node/sharedProcess';
import { IPartsSplash } from 'vs/platform/theme/common/themeService';
import { IThemeMainService } from 'vs/platform/theme/electron-main/themeMainService';
import { IColorScheme, IOpenedWindow, IOpenEmptyWindowOptions, IOpenWindowOptions, IWindowOpenable } from 'vs/platform/window/common/window';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { IWorkspacesManagementMainService } from 'vs/platform/workspaces/electron-main/workspacesManagementMainService';
import { VSBuffer } from 'vs/base/common/buffer';
import { IV8Profile } from 'vs/platform/profiling/common/profiling';
export interface INativeHostMainService extends AddFirstParameterToFunctions<ICommonNativeHostService, Promise<unknown>, number | undefined> {
}
export declare const INativeHostMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<INativeHostMainService>;
export declare class NativeHostMainService extends Disposable implements INativeHostMainService {
    private sharedProcess;
    private readonly windowsMainService;
    private readonly dialogMainService;
    private readonly lifecycleMainService;
    private readonly environmentMainService;
    private readonly logService;
    private readonly productService;
    private readonly themeMainService;
    private readonly workspacesManagementMainService;
    readonly _serviceBrand: undefined;
    constructor(sharedProcess: ISharedProcess, windowsMainService: IWindowsMainService, dialogMainService: IDialogMainService, lifecycleMainService: ILifecycleMainService, environmentMainService: IEnvironmentMainService, logService: ILogService, productService: IProductService, themeMainService: IThemeMainService, workspacesManagementMainService: IWorkspacesManagementMainService);
    get windowId(): never;
    readonly onDidOpenWindow: Event<number>;
    readonly onDidTriggerSystemContextMenu: Event<{
        windowId: number;
        x: number;
        y: number;
    }>;
    readonly onDidMaximizeWindow: Event<number>;
    readonly onDidUnmaximizeWindow: Event<number>;
    readonly onDidBlurWindow: Event<number>;
    readonly onDidFocusWindow: Event<number>;
    readonly onDidResumeOS: Event<unknown>;
    readonly onDidChangeColorScheme: Event<IColorScheme>;
    private readonly _onDidChangePassword;
    readonly onDidChangePassword: Event<{
        account: string;
        service: string;
    }>;
    readonly onDidChangeDisplay: Event<void>;
    getWindows(): Promise<IOpenedWindow[]>;
    getWindowCount(windowId: number | undefined): Promise<number>;
    getActiveWindowId(windowId: number | undefined): Promise<number | undefined>;
    openWindow(windowId: number | undefined, options?: IOpenEmptyWindowOptions): Promise<void>;
    openWindow(windowId: number | undefined, toOpen: IWindowOpenable[], options?: IOpenWindowOptions): Promise<void>;
    private doOpenWindow;
    private doOpenEmptyWindow;
    toggleFullScreen(windowId: number | undefined): Promise<void>;
    handleTitleDoubleClick(windowId: number | undefined): Promise<void>;
    isMaximized(windowId: number | undefined): Promise<boolean>;
    maximizeWindow(windowId: number | undefined): Promise<void>;
    unmaximizeWindow(windowId: number | undefined): Promise<void>;
    minimizeWindow(windowId: number | undefined): Promise<void>;
    updateWindowControls(windowId: number | undefined, options: {
        height?: number;
        backgroundColor?: string;
        foregroundColor?: string;
    }): Promise<void>;
    focusWindow(windowId: number | undefined, options?: {
        windowId?: number;
        force?: boolean;
    }): Promise<void>;
    setMinimumSize(windowId: number | undefined, width: number | undefined, height: number | undefined): Promise<void>;
    saveWindowSplash(windowId: number | undefined, splash: IPartsSplash): Promise<void>;
    installShellCommand(windowId: number | undefined): Promise<void>;
    uninstallShellCommand(windowId: number | undefined): Promise<void>;
    private getShellCommandLink;
    showMessageBox(windowId: number | undefined, options: MessageBoxOptions): Promise<MessageBoxReturnValue>;
    showSaveDialog(windowId: number | undefined, options: SaveDialogOptions): Promise<SaveDialogReturnValue>;
    showOpenDialog(windowId: number | undefined, options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
    private toBrowserWindow;
    pickFileFolderAndOpen(windowId: number | undefined, options: INativeOpenDialogOptions): Promise<void>;
    pickFolderAndOpen(windowId: number | undefined, options: INativeOpenDialogOptions): Promise<void>;
    pickFileAndOpen(windowId: number | undefined, options: INativeOpenDialogOptions): Promise<void>;
    pickWorkspaceAndOpen(windowId: number | undefined, options: INativeOpenDialogOptions): Promise<void>;
    private doOpenPicked;
    showItemInFolder(windowId: number | undefined, path: string): Promise<void>;
    setRepresentedFilename(windowId: number | undefined, path: string): Promise<void>;
    setDocumentEdited(windowId: number | undefined, edited: boolean): Promise<void>;
    openExternal(windowId: number | undefined, url: string): Promise<boolean>;
    private safeSnapOpenExternal;
    moveItemToTrash(windowId: number | undefined, fullPath: string): Promise<void>;
    isAdmin(): Promise<boolean>;
    writeElevated(windowId: number | undefined, source: URI, target: URI, options?: {
        unlock?: boolean;
    }): Promise<void>;
    private get cliPath();
    getOSStatistics(): Promise<IOSStatistics>;
    getOSProperties(): Promise<IOSProperties>;
    getOSVirtualMachineHint(): Promise<number>;
    getOSColorScheme(): Promise<IColorScheme>;
    hasWSLFeatureInstalled(): Promise<boolean>;
    killProcess(windowId: number | undefined, pid: number, code: string): Promise<void>;
    readClipboardText(windowId: number | undefined, type?: 'selection' | 'clipboard'): Promise<string>;
    writeClipboardText(windowId: number | undefined, text: string, type?: 'selection' | 'clipboard'): Promise<void>;
    readClipboardFindText(windowId: number | undefined): Promise<string>;
    writeClipboardFindText(windowId: number | undefined, text: string): Promise<void>;
    writeClipboardBuffer(windowId: number | undefined, format: string, buffer: VSBuffer, type?: 'selection' | 'clipboard'): Promise<void>;
    readClipboardBuffer(windowId: number | undefined, format: string): Promise<VSBuffer>;
    hasClipboard(windowId: number | undefined, format: string, type?: 'selection' | 'clipboard'): Promise<boolean>;
    newWindowTab(): Promise<void>;
    showPreviousWindowTab(): Promise<void>;
    showNextWindowTab(): Promise<void>;
    moveWindowTabToNewWindow(): Promise<void>;
    mergeAllWindowTabs(): Promise<void>;
    toggleWindowTabsBar(): Promise<void>;
    updateTouchBar(windowId: number | undefined, items: ISerializableCommandAction[][]): Promise<void>;
    notifyReady(windowId: number | undefined): Promise<void>;
    relaunch(windowId: number | undefined, options?: {
        addArgs?: string[];
        removeArgs?: string[];
    }): Promise<void>;
    reload(windowId: number | undefined, options?: {
        disableExtensions?: boolean;
    }): Promise<void>;
    closeWindow(windowId: number | undefined): Promise<void>;
    closeWindowById(currentWindowId: number | undefined, targetWindowId?: number | undefined): Promise<void>;
    quit(windowId: number | undefined): Promise<void>;
    exit(windowId: number | undefined, code: number): Promise<void>;
    resolveProxy(windowId: number | undefined, url: string): Promise<string | undefined>;
    findFreePort(windowId: number | undefined, startPort: number, giveUpAfter: number, timeout: number, stride?: number): Promise<number>;
    openDevTools(windowId: number | undefined, options?: OpenDevToolsOptions): Promise<void>;
    toggleDevTools(windowId: number | undefined): Promise<void>;
    sendInputEvent(windowId: number | undefined, event: MouseInputEvent): Promise<void>;
    toggleSharedProcessWindow(): Promise<void>;
    profileRenderer(windowId: number | undefined, session: string, duration: number): Promise<IV8Profile>;
    windowsGetStringRegKey(windowId: number | undefined, hive: 'HKEY_CURRENT_USER' | 'HKEY_LOCAL_MACHINE' | 'HKEY_CLASSES_ROOT' | 'HKEY_USERS' | 'HKEY_CURRENT_CONFIG', path: string, name: string): Promise<string | undefined>;
    private windowById;
}
