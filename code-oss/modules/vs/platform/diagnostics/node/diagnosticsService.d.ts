import { IDiagnosticsService, IMachineInfo, IMainProcessDiagnostics, IRemoteDiagnosticError, IRemoteDiagnosticInfo, IWorkspaceInformation, PerformanceInfo, SystemInfo, WorkspaceStatItem, WorkspaceStats } from 'vs/platform/diagnostics/common/diagnostics';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspace } from 'vs/platform/workspace/common/workspace';
export interface VersionInfo {
    vscodeVersion: string;
    os: string;
}
export interface ProcessInfo {
    cpu: number;
    memory: number;
    pid: number;
    name: string;
}
export declare function collectWorkspaceStats(folder: string, filter: string[]): Promise<WorkspaceStats>;
export declare function getMachineInfo(): IMachineInfo;
export declare function collectLaunchConfigs(folder: string): Promise<WorkspaceStatItem[]>;
export declare class DiagnosticsService implements IDiagnosticsService {
    private readonly telemetryService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    constructor(telemetryService: ITelemetryService, productService: IProductService);
    private formatMachineInfo;
    private formatEnvironment;
    getPerformanceInfo(info: IMainProcessDiagnostics, remoteData: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<PerformanceInfo>;
    getSystemInfo(info: IMainProcessDiagnostics, remoteData: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<SystemInfo>;
    getDiagnostics(info: IMainProcessDiagnostics, remoteDiagnostics: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<string>;
    private formatWorkspaceStats;
    private expandGPUFeatures;
    private formatWorkspaceMetadata;
    private formatProcessList;
    private formatProcessItem;
    getWorkspaceFileExtensions(workspace: IWorkspace): Promise<{
        extensions: string[];
    }>;
    reportWorkspaceStats(workspace: IWorkspaceInformation): Promise<void>;
}
