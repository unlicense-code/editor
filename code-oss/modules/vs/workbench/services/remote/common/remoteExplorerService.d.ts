import { Event } from 'vs/base/common/event';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITunnelService, PortAttributesProvider, ProvidedOnAutoForward, RemoteTunnel, TunnelPrivacyId, TunnelProtocol } from 'vs/platform/tunnel/common/tunnel';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IEditableData } from 'vs/workbench/common/views';
import { ConfigurationTarget, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TunnelInformation, TunnelDescription, IRemoteAuthorityResolverService, TunnelPrivacy } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ILogService } from 'vs/platform/log/common/log';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { URI } from 'vs/base/common/uri';
export declare const IRemoteExplorerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IRemoteExplorerService>;
export declare const REMOTE_EXPLORER_TYPE_KEY: string;
export declare const TUNNEL_VIEW_ID = "~remote.forwardedPorts";
export declare const TUNNEL_VIEW_CONTAINER_ID = "~remote.forwardedPortsContainer";
export declare const PORT_AUTO_FORWARD_SETTING = "remote.autoForwardPorts";
export declare const PORT_AUTO_SOURCE_SETTING = "remote.autoForwardPortsSource";
export declare const PORT_AUTO_SOURCE_SETTING_PROCESS = "process";
export declare const PORT_AUTO_SOURCE_SETTING_OUTPUT = "output";
export declare enum TunnelType {
    Candidate = "Candidate",
    Detected = "Detected",
    Forwarded = "Forwarded",
    Add = "Add"
}
export interface ITunnelItem {
    tunnelType: TunnelType;
    remoteHost: string;
    remotePort: number;
    localAddress?: string;
    protocol: TunnelProtocol;
    localUri?: URI;
    localPort?: number;
    name?: string;
    closeable?: boolean;
    source: {
        source: TunnelSource;
        description: string;
    };
    privacy: TunnelPrivacy;
    processDescription?: string;
    readonly label: string;
}
export declare enum TunnelEditId {
    None = 0,
    New = 1,
    Label = 2,
    LocalPort = 3
}
interface TunnelProperties {
    remote: {
        host: string;
        port: number;
    };
    local?: number;
    name?: string;
    source?: {
        source: TunnelSource;
        description: string;
    };
    elevateIfNeeded?: boolean;
    privacy?: string;
}
export declare enum TunnelSource {
    User = 0,
    Auto = 1,
    Extension = 2
}
export declare const UserTunnelSource: {
    source: TunnelSource;
    description: string;
};
export declare const AutoTunnelSource: {
    source: TunnelSource;
    description: string;
};
export interface Tunnel {
    remoteHost: string;
    remotePort: number;
    localAddress: string;
    localUri: URI;
    protocol: TunnelProtocol;
    localPort?: number;
    name?: string;
    closeable?: boolean;
    privacy: TunnelPrivacyId | string;
    runningProcess: string | undefined;
    hasRunningProcess?: boolean;
    pid: number | undefined;
    source: {
        source: TunnelSource;
        description: string;
    };
}
export declare function makeAddress(host: string, port: number): string;
export declare function parseAddress(address: string): {
    host: string;
    port: number;
} | undefined;
export declare function mapHasAddress<T>(map: Map<string, T>, host: string, port: number): T | undefined;
export declare function mapHasAddressLocalhostOrAllInterfaces<T>(map: Map<string, T>, host: string, port: number): T | undefined;
export declare enum OnPortForward {
    Notify = "notify",
    OpenBrowser = "openBrowser",
    OpenBrowserOnce = "openBrowserOnce",
    OpenPreview = "openPreview",
    Silent = "silent",
    Ignore = "ignore"
}
export interface Attributes {
    label: string | undefined;
    onAutoForward: OnPortForward | undefined;
    elevateIfNeeded: boolean | undefined;
    requireLocalPort: boolean | undefined;
    protocol: TunnelProtocol | undefined;
}
export declare class PortsAttributes extends Disposable {
    private readonly configurationService;
    private static SETTING;
    private static DEFAULTS;
    private static RANGE;
    private static HOST_AND_PORT;
    private portsAttributes;
    private defaultPortAttributes;
    private _onDidChangeAttributes;
    readonly onDidChangeAttributes: Event<void>;
    constructor(configurationService: IConfigurationService);
    private updateAttributes;
    getAttributes(port: number, host: string, commandLine?: string): Attributes | undefined;
    private hasStartEnd;
    private hasHostAndPort;
    private findNextIndex;
    private readSetting;
    private sortAttributes;
    private getOtherAttributes;
    static providedActionToAction(providedAction: ProvidedOnAutoForward | undefined): OnPortForward | undefined;
    addAttributes(port: number, attributes: Partial<Attributes>, target: ConfigurationTarget): Promise<void>;
}
export declare class TunnelModel extends Disposable {
    private readonly tunnelService;
    private readonly storageService;
    private readonly configurationService;
    private readonly environmentService;
    private readonly remoteAuthorityResolverService;
    private readonly workspaceContextService;
    private readonly logService;
    private readonly dialogService;
    readonly forwarded: Map<string, Tunnel>;
    private readonly inProgress;
    readonly detected: Map<string, Tunnel>;
    private remoteTunnels;
    private _onForwardPort;
    onForwardPort: Event<Tunnel | void>;
    private _onClosePort;
    onClosePort: Event<{
        host: string;
        port: number;
    }>;
    private _onPortName;
    onPortName: Event<{
        host: string;
        port: number;
    }>;
    private _candidates;
    private _onCandidatesChanged;
    onCandidatesChanged: Event<Map<string, {
        host: string;
        port: number;
    }>>;
    private _candidateFilter;
    private tunnelRestoreValue;
    private _onEnvironmentTunnelsSet;
    onEnvironmentTunnelsSet: Event<void>;
    private _environmentTunnelsSet;
    readonly configPortsAttributes: PortsAttributes;
    private restoreListener;
    private knownPortsRestoreValue;
    private portAttributesProviders;
    constructor(tunnelService: ITunnelService, storageService: IStorageService, configurationService: IConfigurationService, environmentService: IWorkbenchEnvironmentService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, workspaceContextService: IWorkspaceContextService, logService: ILogService, dialogService: IDialogService);
    private onTunnelClosed;
    private makeLocalUri;
    private getStorageKey;
    private getTunnelRestoreValue;
    restoreForwarded(): Promise<void>;
    private storeForwarded;
    private mismatchCooldown;
    private showPortMismatchModalIfNeeded;
    forward(tunnelProperties: TunnelProperties, attributes?: Attributes | null): Promise<RemoteTunnel | void>;
    name(host: string, port: number, name: string): Promise<void>;
    close(host: string, port: number): Promise<void>;
    address(host: string, port: number): string | undefined;
    get environmentTunnelsSet(): boolean;
    addEnvironmentTunnels(tunnels: TunnelDescription[] | undefined): void;
    setCandidateFilter(filter: ((candidates: CandidatePort[]) => Promise<CandidatePort[]>) | undefined): void;
    setCandidates(candidates: CandidatePort[]): Promise<void>;
    private updateInResponseToCandidates;
    get candidates(): CandidatePort[];
    get candidatesOrUndefined(): CandidatePort[] | undefined;
    private updateAttributes;
    getAttributes(forwardedPorts: {
        host: string;
        port: number;
    }[], checkProviders?: boolean): Promise<Map<number, Attributes> | undefined>;
    addAttributesProvider(provider: PortAttributesProvider): void;
}
export interface CandidatePort {
    host: string;
    port: number;
    detail?: string;
    pid?: number;
}
export interface IRemoteExplorerService {
    readonly _serviceBrand: undefined;
    onDidChangeTargetType: Event<string[]>;
    targetType: string[];
    readonly tunnelModel: TunnelModel;
    onDidChangeEditable: Event<{
        tunnel: ITunnelItem;
        editId: TunnelEditId;
    } | undefined>;
    setEditable(tunnelItem: ITunnelItem | undefined, editId: TunnelEditId, data: IEditableData | null): void;
    getEditableData(tunnelItem: ITunnelItem | undefined, editId?: TunnelEditId): IEditableData | undefined;
    forward(tunnelProperties: TunnelProperties, attributes?: Attributes | null): Promise<RemoteTunnel | void>;
    close(remote: {
        host: string;
        port: number;
    }): Promise<void>;
    setTunnelInformation(tunnelInformation: TunnelInformation | undefined): void;
    setCandidateFilter(filter: ((candidates: CandidatePort[]) => Promise<CandidatePort[]>) | undefined): IDisposable;
    onFoundNewCandidates(candidates: CandidatePort[]): void;
    restore(): Promise<void>;
    enablePortsFeatures(): void;
    onEnabledPortsFeatures: Event<void>;
    portsFeaturesEnabled: boolean;
    readonly namedProcesses: Map<number, string>;
}
export {};
