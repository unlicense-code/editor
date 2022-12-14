import { BrowserWindow, Rectangle } from 'electron';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable } from 'vs/base/common/lifecycle';
import { ISerializableCommandAction } from 'vs/platform/action/common/action';
import { IBackupMainService } from 'vs/platform/backup/electron-main/backup';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDialogMainService } from 'vs/platform/dialogs/electron-main/dialogMainService';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IProtocolMainService } from 'vs/platform/protocol/electron-main/protocol';
import { IApplicationStorageMainService, IStorageMainService } from 'vs/platform/storage/electron-main/storageMainService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeMainService } from 'vs/platform/theme/electron-main/themeMainService';
import { INativeWindowConfiguration } from 'vs/platform/window/common/window';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { IWorkspacesManagementMainService } from 'vs/platform/workspaces/electron-main/workspacesManagementMainService';
import { IWindowState, ICodeWindow, ILoadEvent } from 'vs/platform/window/electron-main/window';
import { IPolicyService } from 'vs/platform/policy/common/policy';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { IUserDataProfilesMainService } from 'vs/platform/userDataProfile/electron-main/userDataProfile';
export interface IWindowCreationOptions {
    state: IWindowState;
    extensionDevelopmentPath?: string[];
    isExtensionTestHost?: boolean;
}
interface ILoadOptions {
    isReload?: boolean;
    disableExtensions?: boolean;
}
export declare class CodeWindow extends Disposable implements ICodeWindow {
    private readonly logService;
    private readonly environmentMainService;
    private readonly policyService;
    private readonly userDataProfilesService;
    private readonly fileService;
    private readonly applicationStorageMainService;
    private readonly storageMainService;
    private readonly configurationService;
    private readonly themeMainService;
    private readonly workspacesManagementMainService;
    private readonly backupMainService;
    private readonly telemetryService;
    private readonly dialogMainService;
    private readonly lifecycleMainService;
    private readonly productService;
    private readonly protocolMainService;
    private readonly windowsMainService;
    private readonly stateMainService;
    private static readonly windowControlHeightStateStorageKey;
    private readonly _onWillLoad;
    readonly onWillLoad: import("vs/base/common/event").Event<ILoadEvent>;
    private readonly _onDidSignalReady;
    readonly onDidSignalReady: import("vs/base/common/event").Event<void>;
    private readonly _onDidTriggerSystemContextMenu;
    readonly onDidTriggerSystemContextMenu: import("vs/base/common/event").Event<{
        x: number;
        y: number;
    }>;
    private readonly _onDidClose;
    readonly onDidClose: import("vs/base/common/event").Event<void>;
    private readonly _onDidDestroy;
    readonly onDidDestroy: import("vs/base/common/event").Event<void>;
    private _id;
    get id(): number;
    private _win;
    get win(): BrowserWindow | null;
    private _lastFocusTime;
    get lastFocusTime(): number;
    get backupPath(): string | undefined;
    get openedWorkspace(): IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | undefined;
    get profile(): IUserDataProfile | undefined;
    get remoteAuthority(): string | undefined;
    private _config;
    get config(): INativeWindowConfiguration | undefined;
    get isExtensionDevelopmentHost(): boolean;
    get isExtensionTestHost(): boolean;
    get isExtensionDevelopmentTestFromCli(): boolean;
    private readonly windowState;
    private currentMenuBarVisibility;
    private transientIsNativeFullScreen;
    private joinNativeFullScreenTransition;
    private representedFilename;
    private documentEdited;
    private readonly hasWindowControlOverlay;
    private readonly whenReadyCallbacks;
    private readonly touchBarGroups;
    private currentHttpProxy;
    private currentNoProxy;
    private readonly configObjectUrl;
    private pendingLoadConfig;
    private wasLoaded;
    constructor(config: IWindowCreationOptions, logService: ILogService, environmentMainService: IEnvironmentMainService, policyService: IPolicyService, userDataProfilesService: IUserDataProfilesMainService, fileService: IFileService, applicationStorageMainService: IApplicationStorageMainService, storageMainService: IStorageMainService, configurationService: IConfigurationService, themeMainService: IThemeMainService, workspacesManagementMainService: IWorkspacesManagementMainService, backupMainService: IBackupMainService, telemetryService: ITelemetryService, dialogMainService: IDialogMainService, lifecycleMainService: ILifecycleMainService, productService: IProductService, protocolMainService: IProtocolMainService, windowsMainService: IWindowsMainService, stateMainService: IStateMainService);
    setRepresentedFilename(filename: string): void;
    getRepresentedFilename(): string | undefined;
    setDocumentEdited(edited: boolean): void;
    isDocumentEdited(): boolean;
    focus(options?: {
        force: boolean;
    }): void;
    private readyState;
    setReady(): void;
    ready(): Promise<ICodeWindow>;
    get isReady(): boolean;
    get whenClosedOrLoaded(): Promise<void>;
    private registerListeners;
    private marketplaceHeadersPromise;
    private getMarketplaceHeaders;
    private onWindowError;
    private destroyWindow;
    private onDidDeleteUntitledWorkspace;
    private onConfigurationUpdated;
    addTabbedWindow(window: ICodeWindow): void;
    load(configuration: INativeWindowConfiguration, options?: ILoadOptions): void;
    private updateConfiguration;
    reload(cli?: NativeParsedArgs): Promise<void>;
    private validateWorkspaceBeforeReload;
    serializeWindowState(): IWindowState;
    updateWindowControls(options: {
        height?: number;
        backgroundColor?: string;
        foregroundColor?: string;
    }): void;
    private restoreWindowState;
    private validateWindowState;
    private getWorkingArea;
    getBounds(): Rectangle;
    toggleFullScreen(): void;
    private setFullScreen;
    get isFullScreen(): boolean;
    private setNativeFullScreen;
    private doSetNativeFullScreen;
    private setSimpleFullScreen;
    private useNativeFullScreen;
    isMinimized(): boolean;
    private getMenuBarVisibility;
    private setMenuBarVisibility;
    private doSetMenuBarVisibility;
    handleTitleDoubleClick(): void;
    close(): void;
    sendWhenReady(channel: string, token: CancellationToken, ...args: any[]): void;
    send(channel: string, ...args: any[]): void;
    updateTouchBar(groups: ISerializableCommandAction[][]): void;
    private createTouchBar;
    private createTouchBarGroup;
    private createTouchBarGroupSegments;
    dispose(): void;
}
export {};
