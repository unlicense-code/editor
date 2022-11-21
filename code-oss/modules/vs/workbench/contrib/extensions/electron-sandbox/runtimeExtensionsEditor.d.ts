import { Action } from 'vs/base/common/actions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IExtensionService, IExtensionHostProfile } from 'vs/workbench/services/extensions/common/extensions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { Event } from 'vs/base/common/event';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILabelService } from 'vs/platform/label/common/label';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { AbstractRuntimeExtensionsEditor, IRuntimeExtension } from 'vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor';
import { IFileService } from 'vs/platform/files/common/files';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
export declare const IExtensionHostProfileService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionHostProfileService>;
export declare const CONTEXT_PROFILE_SESSION_STATE: RawContextKey<string>;
export declare const CONTEXT_EXTENSION_HOST_PROFILE_RECORDED: RawContextKey<boolean>;
export declare enum ProfileSessionState {
    None = 0,
    Starting = 1,
    Running = 2,
    Stopping = 3
}
export interface IExtensionHostProfileService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeState: Event<void>;
    readonly onDidChangeLastProfile: Event<void>;
    readonly state: ProfileSessionState;
    readonly lastProfile: IExtensionHostProfile | null;
    startProfiling(): void;
    stopProfiling(): void;
    getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    setUnresponsiveProfile(extensionId: ExtensionIdentifier, profile: IExtensionHostProfile): void;
}
export declare class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
    private readonly _extensionHostProfileService;
    private _profileInfo;
    private _extensionsHostRecorded;
    private _profileSessionState;
    constructor(telemetryService: ITelemetryService, themeService: IThemeService, contextKeyService: IContextKeyService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionService: IExtensionService, notificationService: INotificationService, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, storageService: IStorageService, labelService: ILabelService, environmentService: IWorkbenchEnvironmentService, clipboardService: IClipboardService, _extensionHostProfileService: IExtensionHostProfileService);
    protected _getProfileInfo(): IExtensionHostProfile | null;
    protected _getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    protected _createSlowExtensionAction(element: IRuntimeExtension): Action | null;
    protected _createReportExtensionIssueAction(element: IRuntimeExtension): Action | null;
    protected _createSaveExtensionHostProfileAction(): Action | null;
    protected _createProfileAction(): Action | null;
}
export declare class StartExtensionHostProfileAction extends Action {
    private readonly _extensionHostProfileService;
    static readonly ID = "workbench.extensions.action.extensionHostProfile";
    static readonly LABEL: string;
    constructor(id: string | undefined, label: string | undefined, _extensionHostProfileService: IExtensionHostProfileService);
    run(): Promise<any>;
}
export declare class StopExtensionHostProfileAction extends Action {
    private readonly _extensionHostProfileService;
    static readonly ID = "workbench.extensions.action.stopExtensionHostProfile";
    static readonly LABEL: string;
    constructor(id: string | undefined, label: string | undefined, _extensionHostProfileService: IExtensionHostProfileService);
    run(): Promise<any>;
}
export declare class SaveExtensionHostProfileAction extends Action {
    private readonly _nativeHostService;
    private readonly _environmentService;
    private readonly _extensionHostProfileService;
    private readonly _fileService;
    static readonly LABEL: string;
    static readonly ID = "workbench.extensions.action.saveExtensionHostProfile";
    constructor(id: string | undefined, label: string | undefined, _nativeHostService: INativeHostService, _environmentService: IWorkbenchEnvironmentService, _extensionHostProfileService: IExtensionHostProfileService, _fileService: IFileService);
    run(): Promise<any>;
    private _asyncRun;
}
