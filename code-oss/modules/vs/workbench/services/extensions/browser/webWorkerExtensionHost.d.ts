import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IMessagePassingProtocol } from 'vs/base/parts/ipc/common/ipc';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IExtensionHost, LocalWebWorkerRunningLocation, ExtensionHostExtensions } from 'vs/workbench/services/extensions/common/extensions';
import { IProductService } from 'vs/platform/product/common/productService';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export interface IWebWorkerExtensionHostInitData {
    readonly autoStart: boolean;
    readonly allExtensions: IExtensionDescription[];
    readonly myExtensions: ExtensionIdentifier[];
}
export interface IWebWorkerExtensionHostDataProvider {
    getInitData(): Promise<IWebWorkerExtensionHostInitData>;
}
export declare class WebWorkerExtensionHost extends Disposable implements IExtensionHost {
    readonly runningLocation: LocalWebWorkerRunningLocation;
    private readonly _initDataProvider;
    private readonly _telemetryService;
    private readonly _contextService;
    private readonly _labelService;
    private readonly _logService;
    private readonly _environmentService;
    private readonly _userDataProfilesService;
    private readonly _productService;
    private readonly _layoutService;
    private readonly _storageService;
    readonly remoteAuthority: null;
    readonly lazyStart: boolean;
    readonly extensions: ExtensionHostExtensions;
    private readonly _onDidExit;
    readonly onExit: Event<[number, string | null]>;
    private _isTerminating;
    private _protocolPromise;
    private _protocol;
    private readonly _extensionHostLogsLocation;
    private readonly _extensionHostLogFile;
    constructor(runningLocation: LocalWebWorkerRunningLocation, lazyStart: boolean, _initDataProvider: IWebWorkerExtensionHostDataProvider, _telemetryService: ITelemetryService, _contextService: IWorkspaceContextService, _labelService: ILabelService, _logService: ILogService, _environmentService: IBrowserWorkbenchEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _productService: IProductService, _layoutService: ILayoutService, _storageService: IStorageService);
    private _getWebWorkerExtensionHostIframeSrc;
    start(): Promise<IMessagePassingProtocol>;
    private _startInsideIframe;
    private _performHandshake;
    dispose(): void;
    getInspectPort(): number | undefined;
    enableInspectPort(): Promise<boolean>;
    private _createExtHostInitData;
}
