import { URI } from 'vs/base/common/uri';
import { ExtensionKind, IExtensionHostDebugParams } from 'vs/platform/environment/common/environment';
import { IPath } from 'vs/platform/window/common/window';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkbenchConstructionOptions } from 'vs/workbench/browser/web.api';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITextEditorOptions } from 'vs/platform/editor/common/editor';
export declare const IBrowserWorkbenchEnvironmentService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IBrowserWorkbenchEnvironmentService>;
/**
 * A subclass of the `IWorkbenchEnvironmentService` to be used only environments
 * where the web API is available (browsers, Electron).
 */
export interface IBrowserWorkbenchEnvironmentService extends IWorkbenchEnvironmentService {
    /**
     * Options used to configure the workbench.
     */
    readonly options?: IWorkbenchConstructionOptions;
}
export declare class BrowserWorkbenchEnvironmentService implements IBrowserWorkbenchEnvironmentService {
    private readonly workspaceId;
    private readonly logsHome;
    readonly options: IWorkbenchConstructionOptions;
    private readonly productService;
    readonly _serviceBrand: undefined;
    get remoteAuthority(): string | undefined;
    get isBuilt(): boolean;
    get logsPath(): string;
    get logLevel(): string | undefined;
    get extensionLogLevel(): [string, string][] | undefined;
    get windowLogsPath(): URI;
    get logFile(): URI;
    get userRoamingDataHome(): URI;
    get argvResource(): URI;
    get cacheHome(): URI;
    get workspaceStorageHome(): URI;
    get localHistoryHome(): URI;
    get stateResource(): URI;
    /**
     * In Web every workspace can potentially have scoped user-data
     * and/or extensions and if Sync state is shared then it can make
     * Sync error prone - say removing extensions from another workspace.
     * Hence scope Sync state per workspace. Sync scoped to a workspace
     * is capable of handling opening same workspace in multiple windows.
     */
    get userDataSyncHome(): URI;
    get userDataSyncLogResource(): URI;
    get editSessionsLogResource(): URI;
    get remoteTunnelLogResource(): URI;
    get sync(): 'on' | 'off' | undefined;
    get keyboardLayoutResource(): URI;
    get untitledWorkspacesHome(): URI;
    get serviceMachineIdResource(): URI;
    get extHostLogsPath(): URI;
    get extHostTelemetryLogFile(): URI;
    private extensionHostDebugEnvironment;
    get debugExtensionHost(): IExtensionHostDebugParams;
    get isExtensionDevelopment(): boolean;
    get extensionDevelopmentLocationURI(): URI[] | undefined;
    get extensionDevelopmentLocationKind(): ExtensionKind[] | undefined;
    get extensionTestsLocationURI(): URI | undefined;
    get extensionEnabledProposedApi(): string[] | undefined;
    get debugRenderer(): boolean;
    get enableSmokeTestDriver(): boolean | undefined;
    get disableExtensions(): boolean;
    get enableExtensions(): readonly string[] | undefined;
    get webviewExternalEndpoint(): string;
    get telemetryLogResource(): URI;
    get extensionTelemetryLogResource(): URI;
    get disableTelemetry(): boolean;
    get verbose(): boolean;
    get logExtensionHostCommunication(): boolean;
    get skipReleaseNotes(): boolean;
    get skipWelcome(): boolean;
    get disableWorkspaceTrust(): boolean;
    get lastActiveProfile(): string | undefined;
    editSessionId: string | undefined;
    private payload;
    constructor(workspaceId: string, logsHome: URI, options: IWorkbenchConstructionOptions, productService: IProductService);
    private resolveExtensionHostDebugEnvironment;
    get filesToOpenOrCreate(): IPath<ITextEditorOptions>[] | undefined;
    get filesToDiff(): IPath[] | undefined;
    get filesToMerge(): IPath[] | undefined;
}
