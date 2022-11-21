import { URI } from 'vs/base/common/uri';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
export declare const IEnvironmentService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IEnvironmentService>;
export declare const INativeEnvironmentService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<INativeEnvironmentService>;
export interface IDebugParams {
    port: number | null;
    break: boolean;
}
export interface IExtensionHostDebugParams extends IDebugParams {
    debugId?: string;
    env?: Record<string, string>;
}
/**
 * Type of extension.
 *
 * **NOTE**: This is defined in `platform/environment` because it can appear as a CLI argument.
 */
export declare type ExtensionKind = 'ui' | 'workspace' | 'web';
/**
 * A basic environment service that can be used in various processes,
 * such as main, renderer and shared process. Use subclasses of this
 * service for specific environment.
 */
export interface IEnvironmentService {
    readonly _serviceBrand: undefined;
    stateResource: URI;
    userRoamingDataHome: URI;
    keyboardLayoutResource: URI;
    argvResource: URI;
    untitledWorkspacesHome: URI;
    workspaceStorageHome: URI;
    localHistoryHome: URI;
    cacheHome: URI;
    userDataSyncHome: URI;
    userDataSyncLogResource: URI;
    sync: 'on' | 'off' | undefined;
    continueOn?: string;
    editSessionId?: string;
    editSessionsLogResource: URI;
    remoteTunnelLogResource: URI;
    debugExtensionHost: IExtensionHostDebugParams;
    isExtensionDevelopment: boolean;
    disableExtensions: boolean | string[];
    enableExtensions?: readonly string[];
    extensionDevelopmentLocationURI?: URI[];
    extensionDevelopmentKind?: ExtensionKind[];
    extensionTestsLocationURI?: URI;
    logsPath: string;
    logLevel?: string;
    extensionLogLevel?: [string, string][];
    verbose: boolean;
    isBuilt: boolean;
    disableTelemetry: boolean;
    telemetryLogResource: URI;
    serviceMachineIdResource: URI;
    policyFile?: URI;
}
/**
 * A subclass of the `IEnvironmentService` to be used only in native
 * environments (Windows, Linux, macOS) but not e.g. web.
 */
export interface INativeEnvironmentService extends IEnvironmentService {
    args: NativeParsedArgs;
    /**
     * Root path of the JavaScript sources.
     *
     * Note: This is NOT the installation root
     * directory itself but contained in it at
     * a level that is platform dependent.
     */
    appRoot: string;
    userHome: URI;
    appSettingsHome: URI;
    tmpDir: URI;
    userDataPath: string;
    machineSettingsResource: URI;
    installSourcePath: string;
    extensionsPath: string;
    extensionsDownloadLocation: URI;
    builtinExtensionsPath: string;
    disableKeytar?: boolean;
    crossOriginIsolated?: boolean;
}
