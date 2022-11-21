import { IStringDictionary } from 'vs/base/common/collections';
import { ProcessItem } from 'vs/base/common/processes';
import { UriComponents } from 'vs/base/common/uri';
import { IWorkspace } from 'vs/platform/workspace/common/workspace';
export declare const ID = "diagnosticsService";
export declare const IDiagnosticsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IDiagnosticsService>;
export interface IDiagnosticsService {
    readonly _serviceBrand: undefined;
    getPerformanceInfo(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<PerformanceInfo>;
    getSystemInfo(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<SystemInfo>;
    getDiagnostics(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<string>;
    getWorkspaceFileExtensions(workspace: IWorkspace): Promise<{
        extensions: string[];
    }>;
    reportWorkspaceStats(workspace: IWorkspaceInformation): Promise<void>;
}
export interface IMachineInfo {
    os: string;
    cpus?: string;
    memory: string;
    vmHint: string;
    linuxEnv?: ILinuxEnv;
}
export interface ILinuxEnv {
    desktopSession?: string;
    xdgSessionDesktop?: string;
    xdgCurrentDesktop?: string;
    xdgSessionType?: string;
}
export interface IDiagnosticInfo {
    machineInfo: IMachineInfo;
    workspaceMetadata?: IStringDictionary<WorkspaceStats>;
    processes?: ProcessItem;
}
export interface SystemInfo extends IMachineInfo {
    processArgs: string;
    gpuStatus: any;
    screenReader: string;
    remoteData: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[];
    load?: string;
}
export interface IRemoteDiagnosticInfo extends IDiagnosticInfo {
    hostName: string;
}
export interface IRemoteDiagnosticError {
    hostName: string;
    errorMessage: string;
}
export interface IDiagnosticInfoOptions {
    includeProcesses?: boolean;
    folders?: UriComponents[];
    includeExtensions?: boolean;
}
export interface WorkspaceStatItem {
    name: string;
    count: number;
}
export interface WorkspaceStats {
    fileTypes: WorkspaceStatItem[];
    configFiles: WorkspaceStatItem[];
    fileCount: number;
    maxFilesReached: boolean;
    launchConfigFiles: WorkspaceStatItem[];
}
export interface PerformanceInfo {
    processInfo?: string;
    workspaceInfo?: string;
}
export interface IWorkspaceInformation extends IWorkspace {
    telemetryId: string | undefined;
    rendererSessionId: string;
}
export declare function isRemoteDiagnosticError(x: any): x is IRemoteDiagnosticError;
export declare class NullDiagnosticsService implements IDiagnosticsService {
    _serviceBrand: undefined;
    getPerformanceInfo(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<PerformanceInfo>;
    getSystemInfo(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<SystemInfo>;
    getDiagnostics(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<string>;
    getWorkspaceFileExtensions(workspace: IWorkspace): Promise<{
        extensions: string[];
    }>;
    reportWorkspaceStats(workspace: IWorkspaceInformation): Promise<void>;
}
export interface IWindowDiagnostics {
    readonly pid: number;
    readonly title: string;
    readonly folderURIs: UriComponents[];
    readonly remoteAuthority?: string;
}
export interface IMainProcessDiagnostics {
    readonly mainPID: number;
    readonly mainArguments: string[];
    readonly windows: IWindowDiagnostics[];
    readonly screenReader: boolean;
    readonly gpuFeatureStatus: any;
}
