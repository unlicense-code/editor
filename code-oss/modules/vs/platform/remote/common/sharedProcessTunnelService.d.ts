import { IAddress } from 'vs/platform/remote/common/remoteAgentConnection';
export declare const ISharedProcessTunnelService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISharedProcessTunnelService>;
export declare const ipcSharedProcessTunnelChannelName = "sharedProcessTunnel";
export interface ISharedProcessTunnel {
    tunnelLocalPort: number | undefined;
    localAddress: string;
}
/**
 * A service that creates tunnels on the shared process
 */
export interface ISharedProcessTunnelService {
    readonly _serviceBrand: undefined;
    /**
     * Create a tunnel.
     */
    createTunnel(): Promise<{
        id: string;
    }>;
    /**
     * Start a previously created tunnel.
     * Can only be called once per created tunnel.
     */
    startTunnel(authority: string, id: string, tunnelRemoteHost: string, tunnelRemotePort: number, tunnelLocalPort: number | undefined, elevateIfNeeded: boolean | undefined): Promise<ISharedProcessTunnel>;
    /**
     * Set the remote address info for a previously created tunnel.
     * Should be called as often as the resolver resolves.
     */
    setAddress(id: string, address: IAddress): Promise<void>;
    /**
     * Destroy a previously created tunnel.
     */
    destroyTunnel(id: string): Promise<void>;
}
