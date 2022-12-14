import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IExtensionManagementService, IExtensionIdentifier, IGlobalExtensionEnablementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService, EnablementState, IExtensionManagementServerService, IWorkbenchExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IExtension } from 'vs/platform/extensions/common/extensions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IUserDataSyncAccountService } from 'vs/platform/userDataSync/common/userDataSyncAccount';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IExtensionBisectService } from 'vs/workbench/services/extensionManagement/browser/extensionBisect';
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { ILogService } from 'vs/platform/log/common/log';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
declare type WorkspaceType = {
    readonly virtual: boolean;
    readonly trusted: boolean;
};
export declare class ExtensionEnablementService extends Disposable implements IWorkbenchExtensionEnablementService {
    protected readonly globalExtensionEnablementService: IGlobalExtensionEnablementService;
    private readonly contextService;
    private readonly environmentService;
    private readonly configurationService;
    private readonly extensionManagementServerService;
    private readonly userDataSyncEnablementService;
    private readonly userDataSyncAccountService;
    private readonly lifecycleService;
    private readonly notificationService;
    readonly hostService: IHostService;
    private readonly extensionBisectService;
    private readonly workspaceTrustManagementService;
    private readonly workspaceTrustRequestService;
    private readonly extensionManifestPropertiesService;
    readonly _serviceBrand: undefined;
    private readonly _onEnablementChanged;
    readonly onEnablementChanged: Event<readonly IExtension[]>;
    protected readonly extensionsManager: ExtensionsManager;
    private readonly storageManger;
    constructor(storageService: IStorageService, globalExtensionEnablementService: IGlobalExtensionEnablementService, contextService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, extensionManagementService: IExtensionManagementService, configurationService: IConfigurationService, extensionManagementServerService: IExtensionManagementServerService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataSyncAccountService: IUserDataSyncAccountService, lifecycleService: ILifecycleService, notificationService: INotificationService, hostService: IHostService, extensionBisectService: IExtensionBisectService, workspaceTrustManagementService: IWorkspaceTrustManagementService, workspaceTrustRequestService: IWorkspaceTrustRequestService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, instantiationService: IInstantiationService);
    private get hasWorkspace();
    private get allUserExtensionsDisabled();
    getEnablementState(extension: IExtension): EnablementState;
    getEnablementStates(extensions: IExtension[], workspaceTypeOverrides?: Partial<WorkspaceType>): EnablementState[];
    getDependenciesEnablementStates(extension: IExtension): [IExtension, EnablementState][];
    canChangeEnablement(extension: IExtension): boolean;
    canChangeWorkspaceEnablement(extension: IExtension): boolean;
    private throwErrorIfCannotChangeEnablement;
    private throwErrorIfEnablementStateCannotBeChanged;
    private throwErrorIfCannotChangeWorkspaceEnablement;
    setEnablement(extensions: IExtension[], newState: EnablementState): Promise<boolean[]>;
    private getExtensionsToEnableRecursively;
    private _setUserEnablementState;
    isEnabled(extension: IExtension): boolean;
    isEnabledEnablementState(enablementState: EnablementState): boolean;
    isDisabledGlobally(extension: IExtension): boolean;
    private _computeEnablementState;
    private _isDisabledInEnv;
    private _isEnabledInEnv;
    private _isDisabledByVirtualWorkspace;
    private _isDisabledByExtensionKind;
    private _isDisabledByWorkspaceTrust;
    private _isDisabledByExtensionDependency;
    private _getUserEnablementState;
    private _isDisabledGlobally;
    private _enableExtension;
    private _disableExtension;
    private _enableExtensionInWorkspace;
    private _disableExtensionInWorkspace;
    private _addToWorkspaceDisabledExtensions;
    private _removeFromWorkspaceDisabledExtensions;
    private _addToWorkspaceEnabledExtensions;
    private _removeFromWorkspaceEnabledExtensions;
    protected _getWorkspaceEnabledExtensions(): IExtensionIdentifier[];
    private _setEnabledExtensions;
    protected _getWorkspaceDisabledExtensions(): IExtensionIdentifier[];
    private _setDisabledExtensions;
    private _getExtensions;
    private _setExtensions;
    private _onDidChangeGloballyDisabledExtensions;
    private _onDidChangeExtensions;
    updateExtensionsEnablementsWhenWorkspaceTrustChanges(): Promise<void>;
    private getWorkspaceType;
    private _reset;
}
declare class ExtensionsManager extends Disposable {
    private readonly extensionManagementService;
    private readonly extensionManagementServerService;
    private readonly logService;
    private _extensions;
    get extensions(): readonly IExtension[];
    private _onDidChangeExtensions;
    readonly onDidChangeExtensions: Event<{
        added: readonly IExtension[];
        removed: readonly IExtension[];
    }>;
    private readonly initializePromise;
    private disposed;
    constructor(extensionManagementService: IWorkbenchExtensionManagementService, extensionManagementServerService: IExtensionManagementServerService, logService: ILogService);
    whenInitialized(): Promise<void>;
    private initialize;
    private onDidInstallExtensions;
    private onDidUninstallExtensions;
}
export {};
