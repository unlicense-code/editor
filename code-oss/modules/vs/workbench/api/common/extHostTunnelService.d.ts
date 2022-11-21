import { ExtHostTunnelServiceShape, TunnelDto } from 'vs/workbench/api/common/extHost.protocol';
import * as vscode from 'vscode';
import { ProvidedPortAttributes, RemoteTunnel, TunnelCreationOptions, TunnelOptions } from 'vs/platform/tunnel/common/tunnel';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { CandidatePort } from 'vs/workbench/services/remote/common/remoteExplorerService';
export declare namespace TunnelDtoConverter {
    function fromApiTunnel(tunnel: vscode.Tunnel): TunnelDto;
    function fromServiceTunnel(tunnel: RemoteTunnel): TunnelDto;
}
export interface Tunnel extends vscode.Disposable {
    remote: {
        port: number;
        host: string;
    };
    localAddress: string;
}
export interface IExtHostTunnelService extends ExtHostTunnelServiceShape {
    readonly _serviceBrand: undefined;
    openTunnel(extension: IExtensionDescription, forward: TunnelOptions): Promise<vscode.Tunnel | undefined>;
    getTunnels(): Promise<vscode.TunnelDescription[]>;
    onDidChangeTunnels: vscode.Event<void>;
    setTunnelFactory(provider: vscode.RemoteAuthorityResolver | undefined): Promise<IDisposable>;
    registerPortsAttributesProvider(portSelector: {
        pid?: number;
        portRange?: [number, number];
        commandMatcher?: RegExp;
    }, provider: vscode.PortAttributesProvider): IDisposable;
}
export declare const IExtHostTunnelService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostTunnelService>;
export declare class ExtHostTunnelService implements IExtHostTunnelService {
    readonly _serviceBrand: undefined;
    onDidChangeTunnels: vscode.Event<void>;
    constructor(extHostRpc: IExtHostRpcService);
    $applyCandidateFilter(candidates: CandidatePort[]): Promise<CandidatePort[]>;
    openTunnel(extension: IExtensionDescription, forward: TunnelOptions): Promise<vscode.Tunnel | undefined>;
    getTunnels(): Promise<vscode.TunnelDescription[]>;
    setTunnelFactory(provider: vscode.RemoteAuthorityResolver | undefined): Promise<IDisposable>;
    registerPortsAttributesProvider(portSelector: {
        pid?: number;
        portRange?: [number, number];
    }, provider: vscode.PortAttributesProvider): {
        dispose: () => void;
    };
    $providePortAttributes(handles: number[], ports: number[], pid: number | undefined, commandline: string | undefined, cancellationToken: vscode.CancellationToken): Promise<ProvidedPortAttributes[]>;
    $forwardPort(tunnelOptions: TunnelOptions, tunnelCreationOptions: TunnelCreationOptions): Promise<TunnelDto | undefined>;
    $closeTunnel(remote: {
        host: string;
        port: number;
    }): Promise<void>;
    $onDidTunnelsChange(): Promise<void>;
    $registerCandidateFinder(): Promise<void>;
}
