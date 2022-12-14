import { AbstractExtensionService, ExtensionRunningPreference } from 'vs/workbench/services/extensions/common/abstractExtensionService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService, IWorkbenchExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IExtensionService, ExtensionHostKind, IExtensionHost, ExtensionRunningLocation } from 'vs/workbench/services/extensions/common/extensions';
import { IExtensionHostManager } from 'vs/workbench/services/extensions/common/extensionHostManager';
import { ExtensionIdentifier, IExtension, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ExtensionKind } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IRemoteExplorerService } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { IWebWorkerExtensionHostDataProvider } from 'vs/workbench/services/extensions/browser/webWorkerExtensionHost';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ILogService } from 'vs/platform/log/common/log';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { ILocalProcessExtensionHostDataProvider } from 'vs/workbench/services/extensions/electron-sandbox/localProcessExtensionHost';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare abstract class ElectronExtensionService extends AbstractExtensionService implements IExtensionService {
    private readonly _remoteAuthorityResolverService;
    private readonly _nativeHostService;
    private readonly _hostService;
    private readonly _remoteExplorerService;
    private readonly _extensionGalleryService;
    private readonly _workspaceTrustManagementService;
    private readonly _enableLocalWebWorker;
    private readonly _lazyLocalWebWorker;
    private readonly _remoteInitData;
    private readonly _extensionScanner;
    private readonly _localCrashTracker;
    private _resolveAuthorityAttempt;
    constructor(instantiationService: IInstantiationService, notificationService: INotificationService, environmentService: IWorkbenchEnvironmentService, telemetryService: ITelemetryService, extensionEnablementService: IWorkbenchExtensionEnablementService, fileService: IFileService, productService: IProductService, extensionManagementService: IWorkbenchExtensionManagementService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, logService: ILogService, remoteAgentService: IRemoteAgentService, lifecycleService: ILifecycleService, _remoteAuthorityResolverService: IRemoteAuthorityResolverService, _nativeHostService: INativeHostService, _hostService: IHostService, _remoteExplorerService: IRemoteExplorerService, _extensionGalleryService: IExtensionGalleryService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, userDataProfileService: IUserDataProfileService);
    private _isLocalWebWorkerEnabled;
    protected _scanSingleExtension(extension: IExtension): Promise<IExtensionDescription | null>;
    private _scanAllLocalExtensions;
    protected _createLocalExtensionHostDataProvider(isInitialStart: boolean, desiredRunningLocation: ExtensionRunningLocation): ILocalProcessExtensionHostDataProvider & IWebWorkerExtensionHostDataProvider;
    private _createRemoteExtensionHostDataProvider;
    protected _pickExtensionHostKind(extensionId: ExtensionIdentifier, extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference): ExtensionHostKind | null;
    static pickExtensionHostKind(extensionKinds: ExtensionKind[], isInstalledLocally: boolean, isInstalledRemotely: boolean, preference: ExtensionRunningPreference, hasRemoteExtHost: boolean, hasWebWorkerExtHost: boolean): ExtensionHostKind | null;
    protected _createExtensionHost(runningLocation: ExtensionRunningLocation, isInitialStart: boolean): IExtensionHost | null;
    protected _onExtensionHostCrashed(extensionHost: IExtensionHostManager, code: number, signal: string | null): void;
    private _sendExtensionHostCrashTelemetry;
    private _resolveAuthority;
    private _getCanonicalURI;
    private _resolveAuthorityInitial;
    private _resolveAuthorityAgain;
    protected _scanAndHandleExtensions(): Promise<void>;
    private _startLocalExtensionHost;
    private _startExtensionHost;
    _onExtensionHostExit(code: number): void;
    private _handleNoResolverFound;
}
