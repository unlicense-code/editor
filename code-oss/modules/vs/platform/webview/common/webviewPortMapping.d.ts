import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IAddress } from 'vs/platform/remote/common/remoteAgentConnection';
import { ITunnelService } from 'vs/platform/tunnel/common/tunnel';
export interface IWebviewPortMapping {
    readonly webviewPort: number;
    readonly extensionHostPort: number;
}
/**
 * Manages port mappings for a single webview.
 */
export declare class WebviewPortMappingManager implements IDisposable {
    private readonly _getExtensionLocation;
    private readonly _getMappings;
    private readonly tunnelService;
    private readonly _tunnels;
    constructor(_getExtensionLocation: () => URI | undefined, _getMappings: () => readonly IWebviewPortMapping[], tunnelService: ITunnelService);
    getRedirect(resolveAuthority: IAddress | null | undefined, url: string): Promise<string | undefined>;
    dispose(): Promise<void>;
    private getOrCreateTunnel;
}
