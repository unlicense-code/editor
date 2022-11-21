import { URI } from 'vs/base/common/uri';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { ExtensionKind, IDebugParams, IExtensionHostDebugParams, INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IProductService } from 'vs/platform/product/common/productService';
export declare const EXTENSION_IDENTIFIER_WITH_LOG_REGEX: RegExp;
export interface INativeEnvironmentPaths {
    /**
     * The user data directory to use for anything that should be
     * persisted except for the content that is meant for the `homeDir`.
     *
     * Only one instance of VSCode can use the same `userDataDir`.
     */
    userDataDir: string;
    /**
     * The user home directory mainly used for persisting extensions
     * and global configuration that should be shared across all
     * versions.
     */
    homeDir: string;
    /**
     * OS tmp dir.
     */
    tmpDir: string;
}
export declare abstract class AbstractNativeEnvironmentService implements INativeEnvironmentService {
    private readonly _args;
    private readonly paths;
    protected readonly productService: IProductService;
    readonly _serviceBrand: undefined;
    get appRoot(): string;
    get userHome(): URI;
    get userDataPath(): string;
    get appSettingsHome(): URI;
    get tmpDir(): URI;
    get cacheHome(): URI;
    get stateResource(): URI;
    get userRoamingDataHome(): URI;
    get userDataSyncHome(): URI;
    get logsPath(): string;
    get userDataSyncLogResource(): URI;
    get editSessionsLogResource(): URI;
    get remoteTunnelLogResource(): URI;
    get sync(): 'on' | 'off' | undefined;
    get machineSettingsResource(): URI;
    get workspaceStorageHome(): URI;
    get localHistoryHome(): URI;
    get keyboardLayoutResource(): URI;
    get argvResource(): URI;
    get isExtensionDevelopment(): boolean;
    get untitledWorkspacesHome(): URI;
    get installSourcePath(): string;
    get builtinExtensionsPath(): string;
    get extensionsDownloadLocation(): URI;
    get extensionsPath(): string;
    get extensionDevelopmentLocationURI(): URI[] | undefined;
    get extensionDevelopmentKind(): ExtensionKind[] | undefined;
    get extensionTestsLocationURI(): URI | undefined;
    get disableExtensions(): boolean | string[];
    get debugExtensionHost(): IExtensionHostDebugParams;
    get debugRenderer(): boolean;
    get isBuilt(): boolean;
    get verbose(): boolean;
    get logLevel(): string | undefined;
    get extensionLogLevel(): [string, string][] | undefined;
    get serviceMachineIdResource(): URI;
    get crashReporterId(): string | undefined;
    get crashReporterDirectory(): string | undefined;
    get telemetryLogResource(): URI;
    get disableTelemetry(): boolean;
    get disableWorkspaceTrust(): boolean;
    get policyFile(): URI | undefined;
    editSessionId: string | undefined;
    get continueOn(): string | undefined;
    set continueOn(value: string | undefined);
    get args(): NativeParsedArgs;
    constructor(_args: NativeParsedArgs, paths: INativeEnvironmentPaths, productService: IProductService);
}
export declare function parseExtensionHostPort(args: NativeParsedArgs, isBuild: boolean): IExtensionHostDebugParams;
export declare function parseSearchPort(args: NativeParsedArgs, isBuild: boolean): IDebugParams;
export declare function parsePtyHostPort(args: NativeParsedArgs, isBuild: boolean): IDebugParams;
