import { Event } from 'vs/base/common/event';
export interface IRemoteTunnelAccount {
    readonly authenticationProviderId: string;
    readonly token: string;
}
export declare const IRemoteTunnelService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IRemoteTunnelService>;
export interface IRemoteTunnelService {
    readonly _serviceBrand: undefined;
    readonly onDidTokenFailed: Event<boolean>;
    readonly onDidChangeTunnelStatus: Event<TunnelStatus>;
    getTunnelStatus(): Promise<TunnelStatus>;
    getAccount(): Promise<IRemoteTunnelAccount | undefined>;
    readonly onDidChangeAccount: Event<IRemoteTunnelAccount | undefined>;
    updateAccount(account: IRemoteTunnelAccount | undefined): Promise<void>;
}
export declare type TunnelStatus = TunnelStates.Connected | TunnelStates.Disconnected | TunnelStates.Connecting | TunnelStates.Uninitialized;
export declare namespace TunnelStates {
    interface Uninitialized {
        readonly type: 'uninitialized';
    }
    interface Connecting {
        readonly type: 'connecting';
        readonly progress?: string;
    }
    interface Connected {
        readonly type: 'connected';
        readonly info: ConnectionInfo;
    }
    interface Disconnected {
        readonly type: 'disconnected';
    }
    const disconnected: Disconnected;
    const uninitialized: Uninitialized;
    const connected: (info: ConnectionInfo) => Connected;
    const connecting: (progress?: string) => Connecting;
}
export interface ConnectionInfo {
    link: string;
    domain: string;
    hostName: string;
    extensionId: string;
}
export declare const CONFIGURATION_KEY_PREFIX = "remote.tunnels.access";
export declare const CONFIGURATION_KEY_HOST_NAME: string;
