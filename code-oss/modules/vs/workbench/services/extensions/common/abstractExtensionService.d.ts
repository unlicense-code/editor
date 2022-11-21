import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ExtensionPointContribution, IExtensionService, IExtensionsStatus, IWillActivateEvent, IResponsiveStateChangeEvent, IExtensionHost, ActivationKind, ExtensionHostKind, ExtensionRunningLocation, ExtensionActivationReason } from 'vs/workbench/services/extensions/common/extensions';
import { IExtensionPoint } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { ExtensionDescriptionRegistry } from 'vs/workbench/services/extensions/common/extensionDescriptionRegistry';
import { IExtensionHostManager } from 'vs/workbench/services/extensions/common/extensionHostManager';
import { ExtensionIdentifier, IExtensionDescription, IExtension, IExtensionContributions } from 'vs/platform/extensions/common/extensions';
import { ExtensionKind } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { ILogService } from 'vs/platform/log/common/log';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare const enum ExtensionRunningPreference {
    None = 0,
    Local = 1,
    Remote = 2
}
export declare function extensionRunningPreferenceToString(preference: ExtensionRunningPreference): "None" | "Remote" | "Local";
export declare abstract class AbstractExtensionService extends Disposable implements IExtensionService {
    protected readonly _instantiationService: IInstantiationService;
    protected readonly _notificationService: INotificationService;
    protected readonly _environmentService: IWorkbenchEnvironmentService;
    protected readonly _telemetryService: ITelemetryService;
    protected readonly _extensionEnablementService: IWorkbenchExtensionEnablementService;
    protected readonly _fileService: IFileService;
    protected readonly _productService: IProductService;
    protected readonly _extensionManagementService: IWorkbenchExtensionManagementService;
    private readonly _contextService;
    protected readonly _configurationService: IConfigurationService;
    protected readonly _extensionManifestPropertiesService: IExtensionManifestPropertiesService;
    protected readonly _logService: ILogService;
    protected readonly _remoteAgentService: IRemoteAgentService;
    private readonly _lifecycleService;
    protected readonly _userDataProfileService: IUserDataProfileService;
    _serviceBrand: undefined;
    private readonly _onDidRegisterExtensions;
    readonly onDidRegisterExtensions: Event<void>;
    private readonly _onDidChangeExtensionsStatus;
    readonly onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]>;
    private readonly _onDidChangeExtensions;
    readonly onDidChangeExtensions: Event<{
        readonly added: ReadonlyArray<IExtensionDescription>;
        readonly removed: ReadonlyArray<IExtensionDescription>;
    }>;
    private readonly _onWillActivateByEvent;
    readonly onWillActivateByEvent: Event<IWillActivateEvent>;
    private readonly _onDidChangeResponsiveChange;
    readonly onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent>;
    protected readonly _registry: ExtensionDescriptionRegistry;
    private readonly _registryLock;
    private readonly _installedExtensionsReady;
    private readonly _isDev;
    private readonly _extensionsMessages;
    private readonly _allRequestedActivateEvents;
    private readonly _proposedApiController;
    private readonly _isExtensionDevHost;
    protected readonly _isExtensionDevTestFromCli: boolean;
    private _deltaExtensionsQueue;
    private _inHandleDeltaExtensions;
    private _runningLocation;
    private _lastExtensionHostId;
    private _maxLocalProcessAffinity;
    private _maxLocalWebWorkerAffinity;
    private readonly _remoteCrashTracker;
    private _extensionHostManagers;
    protected _extensionHostActiveExtensions: Map<string, ExtensionIdentifier>;
    private _extensionHostActivationTimes;
    private _extensionHostExtensionRuntimeErrors;
    constructor(_instantiationService: IInstantiationService, _notificationService: INotificationService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, _extensionEnablementService: IWorkbenchExtensionEnablementService, _fileService: IFileService, _productService: IProductService, _extensionManagementService: IWorkbenchExtensionManagementService, _contextService: IWorkspaceContextService, _configurationService: IConfigurationService, _extensionManifestPropertiesService: IExtensionManifestPropertiesService, _logService: ILogService, _remoteAgentService: IRemoteAgentService, _lifecycleService: ILifecycleService, _userDataProfileService: IUserDataProfileService);
    private _getExtensionKind;
    protected abstract _pickExtensionHostKind(extensionId: ExtensionIdentifier, extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
    protected _getExtensionHostManagers(kind: ExtensionHostKind): IExtensionHostManager[];
    protected _getExtensionHostManagerByRunningLocation(runningLocation: ExtensionRunningLocation): IExtensionHostManager | null;
    private _computeAffinity;
    private _computeRunningLocation;
    protected _determineRunningLocation(localExtensions: IExtensionDescription[]): Map<string, ExtensionRunningLocation | null>;
    protected _initializeRunningLocation(localExtensions: IExtensionDescription[], remoteExtensions: IExtensionDescription[]): void;
    /**
     * Update `this._runningLocation` with running locations for newly enabled/installed extensions.
     */
    private _updateRunningLocationForAddedExtensions;
    protected _filterByRunningLocation(extensions: IExtensionDescription[], desiredRunningLocation: ExtensionRunningLocation): IExtensionDescription[];
    protected _filterByExtensionHostKind(extensions: IExtensionDescription[], desiredExtensionHostKind: ExtensionHostKind): IExtensionDescription[];
    protected _filterByExtensionHostManager(extensions: IExtensionDescription[], extensionHostManager: IExtensionHostManager): IExtensionDescription[];
    private _handleDeltaExtensions;
    private _deltaExtensions;
    private _updateExtensionsOnExtHosts;
    private _updateExtensionsOnExtHost;
    canAddExtension(extension: IExtensionDescription): boolean;
    private _canAddExtension;
    canRemoveExtension(extension: IExtensionDescription): boolean;
    private _activateAddedExtensionIfNeeded;
    protected _initialize(): Promise<void>;
    private _handleExtensionTests;
    private findTestExtensionHost;
    private _releaseBarrier;
    stopExtensionHosts(): void;
    private _startExtensionHostsIfNecessary;
    private _createExtensionHostManager;
    protected _doCreateExtensionHostManager(extensionHostId: string, extensionHost: IExtensionHost, isInitialStart: boolean, initialActivationEvents: string[]): IExtensionHostManager;
    private _onExtensionHostCrashOrExit;
    protected _onExtensionHostCrashed(extensionHost: IExtensionHostManager, code: number, signal: string | null): void;
    private _getExtensionHostExitInfoWithTimeout;
    private _onRemoteExtensionHostCrashed;
    protected _logExtensionHostCrash(extensionHost: IExtensionHostManager): void;
    startExtensionHosts(): Promise<void>;
    restartExtensionHost(): Promise<void>;
    activateByEvent(activationEvent: string, activationKind?: ActivationKind): Promise<void>;
    private _activateByEvent;
    activationEventIsDone(activationEvent: string): boolean;
    whenInstalledExtensionsRegistered(): Promise<boolean>;
    get extensions(): IExtensionDescription[];
    protected getExtensions(): Promise<IExtensionDescription[]>;
    getExtension(id: string): Promise<IExtensionDescription | undefined>;
    readExtensionPointContributions<T extends IExtensionContributions[keyof IExtensionContributions]>(extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]>;
    getExtensionsStatus(): {
        [id: string]: IExtensionsStatus;
    };
    getInspectPort(extensionHostId: string, tryEnableInspector: boolean): Promise<number>;
    getInspectPorts(extensionHostKind: ExtensionHostKind, tryEnableInspector: boolean): Promise<number[]>;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
    protected _checkEnableProposedApi(extensions: IExtensionDescription[]): void;
    /**
     * @argument extensions The extensions to be checked.
     * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
     */
    protected _checkEnabledAndProposedAPI(extensions: IExtensionDescription[], ignoreWorkspaceTrust: boolean): IExtensionDescription[];
    /**
     * @argument extension The extension to be checked.
     * @argument ignoreWorkspaceTrust Do not take workspace trust into account.
     */
    protected _isEnabled(extension: IExtensionDescription, ignoreWorkspaceTrust: boolean): boolean;
    protected _safeInvokeIsEnabled(extension: IExtension): boolean;
    private _filterEnabledExtensions;
    protected _doHandleExtensionPoints(affectedExtensions: IExtensionDescription[]): void;
    private _handleExtensionPointMessage;
    private static _handleExtensionPoint;
    private _acquireInternalAPI;
    _activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    private _onWillActivateExtension;
    private _onDidActivateExtension;
    private _onDidActivateExtensionError;
    private _onExtensionRuntimeError;
    protected abstract _createExtensionHost(runningLocation: ExtensionRunningLocation, isInitialStart: boolean): IExtensionHost | null;
    protected abstract _scanAndHandleExtensions(): Promise<void>;
    protected abstract _scanSingleExtension(extension: IExtension): Promise<IExtensionDescription | null>;
    abstract _onExtensionHostExit(code: number): void;
}
export declare class ExtensionHostCrashTracker {
    private static _TIME_LIMIT;
    private static _CRASH_LIMIT;
    private readonly _recentCrashes;
    private _removeOldCrashes;
    registerCrash(): void;
    shouldAutomaticallyRestart(): boolean;
}
export declare function filterByRunningLocation(extensions: IExtensionDescription[], runningLocation: Map<string, ExtensionRunningLocation | null>, desiredRunningLocation: ExtensionRunningLocation): IExtensionDescription[];
