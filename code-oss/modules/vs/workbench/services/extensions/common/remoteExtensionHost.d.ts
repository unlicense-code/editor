import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IMessagePassingProtocol } from 'vs/base/parts/ipc/common/ipc';
import { IExtensionHostDebugService } from 'vs/platform/debug/common/extensionHostDebug';
import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { ISocketFactory } from 'vs/platform/remote/common/remoteAgentConnection';
import { IRemoteAuthorityResolverService, IRemoteConnectionData } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { ISignService } from 'vs/platform/sign/common/sign';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ExtensionHostExtensions, IExtensionHost, RemoteRunningLocation } from 'vs/workbench/services/extensions/common/extensions';
export interface IRemoteExtensionHostInitData {
    readonly connectionData: IRemoteConnectionData | null;
    readonly pid: number;
    readonly appRoot: URI;
    readonly extensionHostLogsPath: URI;
    readonly globalStorageHome: URI;
    readonly workspaceStorageHome: URI;
    readonly allExtensions: IExtensionDescription[];
    readonly myExtensions: ExtensionIdentifier[];
}
export interface IRemoteExtensionHostDataProvider {
    readonly remoteAuthority: string;
    getInitData(): Promise<IRemoteExtensionHostInitData>;
}
export declare class RemoteExtensionHost extends Disposable implements IExtensionHost {
    readonly runningLocation: RemoteRunningLocation;
    private readonly _initDataProvider;
    private readonly _socketFactory;
    private readonly _contextService;
    private readonly _environmentService;
    private readonly _telemetryService;
    private readonly _logService;
    private readonly _labelService;
    private readonly remoteAuthorityResolverService;
    private readonly _extensionHostDebugService;
    private readonly _productService;
    private readonly _signService;
    readonly remoteAuthority: string;
    readonly lazyStart = false;
    readonly extensions: ExtensionHostExtensions;
    private _onExit;
    readonly onExit: Event<[number, string | null]>;
    private _protocol;
    private _hasLostConnection;
    private _terminating;
    private readonly _isExtensionDevHost;
    constructor(runningLocation: RemoteRunningLocation, _initDataProvider: IRemoteExtensionHostDataProvider, _socketFactory: ISocketFactory, _contextService: IWorkspaceContextService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, _logService: ILogService, _labelService: ILabelService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, _extensionHostDebugService: IExtensionHostDebugService, _productService: IProductService, _signService: ISignService);
    start(): Promise<IMessagePassingProtocol>;
    private _onExtHostConnectionLost;
    private _createExtHostInitData;
    getInspectPort(): number | undefined;
    enableInspectPort(): Promise<boolean>;
    dispose(): void;
}
