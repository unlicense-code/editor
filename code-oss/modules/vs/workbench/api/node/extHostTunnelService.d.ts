import { PortAttributesProviderSelector, TunnelDto } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import type * as vscode from 'vscode';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostTunnelService } from 'vs/workbench/api/common/extHostTunnelService';
import { TunnelOptions, TunnelCreationOptions, ProvidedPortAttributes } from 'vs/platform/tunnel/common/tunnel';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { CandidatePort } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { ILogService } from 'vs/platform/log/common/log';
export declare function getSockets(stdout: string): Record<string, {
    pid: number;
    socket: number;
}>;
export declare function loadListeningPorts(...stdouts: string[]): {
    socket: number;
    ip: string;
    port: number;
}[];
export declare function loadConnectionTable(stdout: string): Record<string, string>[];
export declare function getRootProcesses(stdout: string): {
    pid: number;
    cmd: string;
    ppid: number;
}[];
export declare function findPorts(connections: {
    socket: number;
    ip: string;
    port: number;
}[], socketMap: Record<string, {
    pid: number;
    socket: number;
}>, processes: {
    pid: number;
    cwd: string;
    cmd: string;
}[]): Promise<CandidatePort[]>;
export declare function tryFindRootPorts(connections: {
    socket: number;
    ip: string;
    port: number;
}[], rootProcessesStdout: string, previousPorts: Map<number, CandidatePort & {
    ppid: number;
}>): Map<number, CandidatePort & {
    ppid: number;
}>;
export declare class ExtHostTunnelService extends Disposable implements IExtHostTunnelService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _proxy;
    private _forwardPortProvider;
    private _showCandidatePort;
    private _extensionTunnels;
    private _onDidChangeTunnels;
    onDidChangeTunnels: vscode.Event<void>;
    private _candidateFindingEnabled;
    private _foundRootPorts;
    private _providerHandleCounter;
    private _portAttributesProviders;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, logService: ILogService);
    openTunnel(extension: IExtensionDescription, forward: TunnelOptions): Promise<vscode.Tunnel | undefined>;
    getTunnels(): Promise<vscode.TunnelDescription[]>;
    private calculateDelay;
    private nextPortAttributesProviderHandle;
    registerPortsAttributesProvider(portSelector: PortAttributesProviderSelector, provider: vscode.PortAttributesProvider): vscode.Disposable;
    $providePortAttributes(handles: number[], ports: number[], pid: number | undefined, commandline: string | undefined, cancellationToken: vscode.CancellationToken): Promise<ProvidedPortAttributes[]>;
    $registerCandidateFinder(enable: boolean): Promise<void>;
    setTunnelFactory(provider: vscode.RemoteAuthorityResolver | undefined): Promise<IDisposable>;
    $closeTunnel(remote: {
        host: string;
        port: number;
    }, silent?: boolean): Promise<void>;
    $onDidTunnelsChange(): Promise<void>;
    $forwardPort(tunnelOptions: TunnelOptions, tunnelCreationOptions: TunnelCreationOptions): Promise<TunnelDto | undefined>;
    $applyCandidateFilter(candidates: CandidatePort[]): Promise<CandidatePort[]>;
    findCandidatePorts(): Promise<CandidatePort[]>;
}
