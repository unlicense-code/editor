import { Event } from 'vs/base/common/event';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { IMessagePassingProtocol } from 'vs/base/parts/ipc/common/ipc';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IExtensionHostDebugService } from 'vs/platform/debug/common/extensionHostDebug';
import { IExtensionHost, LocalProcessRunningLocation, ExtensionHostExtensions } from 'vs/workbench/services/extensions/common/extensions';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IShellEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/shellEnvironmentService';
import { IExtensionHostProcessOptions, IExtensionHostStarter } from 'vs/platform/extensions/common/extensionHostStarter';
import { SerializedError } from 'vs/base/common/errors';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export interface ILocalProcessExtensionHostInitData {
    readonly autoStart: boolean;
    readonly allExtensions: IExtensionDescription[];
    readonly myExtensions: ExtensionIdentifier[];
}
export interface ILocalProcessExtensionHostDataProvider {
    getInitData(): Promise<ILocalProcessExtensionHostInitData>;
}
export declare class ExtensionHostProcess {
    private readonly _extensionHostStarter;
    private readonly _id;
    get onStdout(): Event<string>;
    get onStderr(): Event<string>;
    get onMessage(): Event<any>;
    get onError(): Event<{
        error: SerializedError;
    }>;
    get onExit(): Event<{
        code: number;
        signal: string;
    }>;
    constructor(id: string, _extensionHostStarter: IExtensionHostStarter);
    start(opts: IExtensionHostProcessOptions): Promise<void>;
    enableInspectPort(): Promise<boolean>;
    kill(): Promise<void>;
}
export declare class SandboxLocalProcessExtensionHost implements IExtensionHost {
    readonly runningLocation: LocalProcessRunningLocation;
    private readonly _initDataProvider;
    private readonly _contextService;
    private readonly _notificationService;
    private readonly _nativeHostService;
    private readonly _lifecycleService;
    private readonly _environmentService;
    private readonly _userDataProfilesService;
    private readonly _telemetryService;
    protected readonly _logService: ILogService;
    private readonly _labelService;
    private readonly _extensionHostDebugService;
    private readonly _hostService;
    private readonly _productService;
    private readonly _shellEnvironmentService;
    protected readonly _extensionHostStarter: IExtensionHostStarter;
    protected readonly _configurationService: IConfigurationService;
    readonly remoteAuthority: null;
    readonly lazyStart = false;
    readonly extensions: ExtensionHostExtensions;
    private readonly _onExit;
    readonly onExit: Event<[number, string]>;
    private readonly _onDidSetInspectPort;
    protected readonly _toDispose: DisposableStore;
    private readonly _isExtensionDevHost;
    private readonly _isExtensionDevDebug;
    private readonly _isExtensionDevDebugBrk;
    private readonly _isExtensionDevTestFromCli;
    private _lastExtensionHostError;
    private _terminating;
    private _inspectPort;
    private _extensionHostProcess;
    private _messageProtocol;
    private readonly _extensionHostLogFile;
    constructor(runningLocation: LocalProcessRunningLocation, _initDataProvider: ILocalProcessExtensionHostDataProvider, _contextService: IWorkspaceContextService, _notificationService: INotificationService, _nativeHostService: INativeHostService, _lifecycleService: ILifecycleService, _environmentService: INativeWorkbenchEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _telemetryService: ITelemetryService, _logService: ILogService, _labelService: ILabelService, _extensionHostDebugService: IExtensionHostDebugService, _hostService: IHostService, _productService: IProductService, _shellEnvironmentService: IShellEnvironmentService, _extensionHostStarter: IExtensionHostStarter, _configurationService: IConfigurationService);
    dispose(): void;
    start(): Promise<IMessagePassingProtocol>;
    protected _start(): Promise<IMessagePassingProtocol>;
    protected _startWithCommunication<T>(communication: IExtHostCommunication<T>): Promise<IMessagePassingProtocol>;
    /**
     * Find a free port if extension host debugging is enabled.
     */
    private _tryFindDebugPort;
    private _performHandshake;
    private _createExtHostInitData;
    private _onExtHostProcessError;
    private _onExtHostProcessExit;
    private _handleProcessOutputStream;
    enableInspectPort(): Promise<boolean>;
    getInspectPort(): number | undefined;
    private _onWillShutdown;
}
export interface IExtHostCommunication<T> {
    readonly useUtilityProcess: boolean;
    prepare(): Promise<T>;
    establishProtocol(prepared: T, extensionHostProcess: ExtensionHostProcess, opts: IExtensionHostProcessOptions): Promise<IMessagePassingProtocol>;
}
export declare class ExtHostMessagePortCommunication extends Disposable implements IExtHostCommunication<void> {
    private readonly _logService;
    readonly useUtilityProcess = true;
    constructor(_logService: ILogService);
    prepare(): Promise<void>;
    establishProtocol(prepared: void, extensionHostProcess: ExtensionHostProcess, opts: IExtensionHostProcessOptions): Promise<IMessagePassingProtocol>;
}
