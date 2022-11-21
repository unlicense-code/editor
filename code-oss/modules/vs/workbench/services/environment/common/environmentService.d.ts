import { IPath } from 'vs/platform/window/common/window';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { URI } from 'vs/base/common/uri';
export declare const IWorkbenchEnvironmentService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWorkbenchEnvironmentService>;
/**
 * A workbench specific environment service that is only present in workbench
 * layer.
 */
export interface IWorkbenchEnvironmentService extends IEnvironmentService {
    readonly logFile: URI;
    readonly windowLogsPath: URI;
    readonly extHostLogsPath: URI;
    readonly extHostTelemetryLogFile: URI;
    readonly extensionEnabledProposedApi?: string[];
    readonly remoteAuthority?: string;
    readonly skipReleaseNotes: boolean;
    readonly skipWelcome: boolean;
    readonly disableWorkspaceTrust: boolean;
    readonly webviewExternalEndpoint: string;
    readonly debugRenderer: boolean;
    readonly logExtensionHostCommunication?: boolean;
    readonly enableSmokeTestDriver?: boolean;
    readonly filesToOpenOrCreate?: IPath[] | undefined;
    readonly filesToDiff?: IPath[] | undefined;
    readonly filesToMerge?: IPath[] | undefined;
}
