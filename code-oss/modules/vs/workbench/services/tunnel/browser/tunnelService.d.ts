import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IAddressProvider } from 'vs/platform/remote/common/remoteAgentConnection';
import { AbstractTunnelService, RemoteTunnel } from 'vs/platform/tunnel/common/tunnel';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
export declare class TunnelService extends AbstractTunnelService {
    private environmentService;
    constructor(logService: ILogService, environmentService: IWorkbenchEnvironmentService, configurationService: IConfigurationService);
    isPortPrivileged(_port: number): boolean;
    protected retainOrCreateTunnel(_addressProvider: IAddressProvider, remoteHost: string, remotePort: number, localPort: number | undefined, elevateIfNeeded: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | undefined> | undefined;
    canTunnel(uri: URI): boolean;
}
