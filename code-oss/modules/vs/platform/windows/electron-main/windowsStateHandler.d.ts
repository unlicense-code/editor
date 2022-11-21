import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { INativeWindowConfiguration } from 'vs/platform/window/common/window';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { IWindowState as IWindowUIState } from 'vs/platform/window/electron-main/window';
import { IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export interface IWindowState {
    windowId?: number;
    workspace?: IWorkspaceIdentifier;
    folderUri?: URI;
    backupPath?: string;
    remoteAuthority?: string;
    uiState: IWindowUIState;
}
export interface IWindowsState {
    lastActiveWindow?: IWindowState;
    lastPluginDevelopmentHostWindow?: IWindowState;
    openedWindows: IWindowState[];
}
interface INewWindowState extends IWindowUIState {
    hasDefaultState?: boolean;
}
interface ISerializedWindowsState {
    readonly lastActiveWindow?: ISerializedWindowState;
    readonly lastPluginDevelopmentHostWindow?: ISerializedWindowState;
    readonly openedWindows: ISerializedWindowState[];
}
interface ISerializedWindowState {
    readonly workspaceIdentifier?: {
        id: string;
        configURIPath: string;
    };
    readonly folder?: string;
    readonly backupPath?: string;
    readonly remoteAuthority?: string;
    readonly uiState: IWindowUIState;
}
export declare class WindowsStateHandler extends Disposable {
    private readonly windowsMainService;
    private readonly stateMainService;
    private readonly lifecycleMainService;
    private readonly logService;
    private readonly configurationService;
    private static readonly windowsStateStorageKey;
    get state(): IWindowsState;
    private readonly _state;
    private lastClosedState;
    private shuttingDown;
    constructor(windowsMainService: IWindowsMainService, stateMainService: IStateMainService, lifecycleMainService: ILifecycleMainService, logService: ILogService, configurationService: IConfigurationService);
    private registerListeners;
    private onBeforeShutdown;
    private saveWindowsState;
    private onBeforeCloseWindow;
    private toWindowState;
    getNewWindowState(configuration: INativeWindowConfiguration): INewWindowState;
    private doGetNewWindowState;
    private ensureNoOverlap;
}
export declare function restoreWindowsState(data: ISerializedWindowsState | undefined): IWindowsState;
export declare function getWindowsStateStoreData(windowsState: IWindowsState): IWindowsState;
export {};
