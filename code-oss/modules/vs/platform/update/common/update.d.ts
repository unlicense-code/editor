import { Event } from 'vs/base/common/event';
export interface IUpdate {
    version: string;
    productVersion: string;
    supportsFastUpdate?: boolean;
    url?: string;
    hash?: string;
}
/**
 * Updates are run as a state machine:
 *
 *      Uninitialized
 *           ↓
 *          Idle
 *          ↓  ↑
 *   Checking for Updates  →  Available for Download
 *         ↓
 *     Downloading  →   Ready
 *         ↓               ↑
 *     Downloaded   →  Updating
 *
 * Available: There is an update available for download (linux).
 * Ready: Code will be updated as soon as it restarts (win32, darwin).
 * Downloaded: There is an update ready to be installed in the background (win32).
 */
export declare const enum StateType {
    Uninitialized = "uninitialized",
    Idle = "idle",
    CheckingForUpdates = "checking for updates",
    AvailableForDownload = "available for download",
    Downloading = "downloading",
    Downloaded = "downloaded",
    Updating = "updating",
    Ready = "ready"
}
export declare const enum UpdateType {
    Setup = 0,
    Archive = 1,
    Snap = 2
}
export declare type Uninitialized = {
    type: StateType.Uninitialized;
};
export declare type Idle = {
    type: StateType.Idle;
    updateType: UpdateType;
    error?: string;
};
export declare type CheckingForUpdates = {
    type: StateType.CheckingForUpdates;
    explicit: boolean;
};
export declare type AvailableForDownload = {
    type: StateType.AvailableForDownload;
    update: IUpdate;
};
export declare type Downloading = {
    type: StateType.Downloading;
    update: IUpdate;
};
export declare type Downloaded = {
    type: StateType.Downloaded;
    update: IUpdate;
};
export declare type Updating = {
    type: StateType.Updating;
    update: IUpdate;
};
export declare type Ready = {
    type: StateType.Ready;
    update: IUpdate;
};
export declare type State = Uninitialized | Idle | CheckingForUpdates | AvailableForDownload | Downloading | Downloaded | Updating | Ready;
export declare const State: {
    Uninitialized: Uninitialized;
    Idle: (updateType: UpdateType, error?: string) => Idle;
    CheckingForUpdates: (explicit: boolean) => CheckingForUpdates;
    AvailableForDownload: (update: IUpdate) => AvailableForDownload;
    Downloading: (update: IUpdate) => Downloading;
    Downloaded: (update: IUpdate) => Downloaded;
    Updating: (update: IUpdate) => Updating;
    Ready: (update: IUpdate) => Ready;
};
export interface IAutoUpdater extends Event.NodeEventEmitter {
    setFeedURL(url: string): void;
    checkForUpdates(): void;
    applyUpdate?(): Promise<void>;
    quitAndInstall(): void;
}
export declare const IUpdateService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUpdateService>;
export interface IUpdateService {
    readonly _serviceBrand: undefined;
    readonly onStateChange: Event<State>;
    readonly state: State;
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(): Promise<void>;
    applyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    isLatestVersion(): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
}
