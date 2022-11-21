import { ILogService } from 'vs/platform/log/common/log';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { URI } from 'vs/base/common/uri';
import { AbstractTunnelService, RemoteTunnel } from 'vs/platform/tunnel/common/tunnel';
import { IAddressProvider } from 'vs/platform/remote/common/remoteAgentConnection';
import { ISharedProcessTunnelService } from 'vs/platform/remote/common/sharedProcessTunnelService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class TunnelService extends AbstractTunnelService {
    private readonly _environmentService;
    private readonly _sharedProcessTunnelService;
    private readonly _instantiationService;
    private readonly _nativeWorkbenchEnvironmentService;
    private readonly _activeSharedProcessTunnels;
    constructor(logService: ILogService, _environmentService: IWorkbenchEnvironmentService, _sharedProcessTunnelService: ISharedProcessTunnelService, _instantiationService: IInstantiationService, lifecycleService: ILifecycleService, _nativeWorkbenchEnvironmentService: INativeWorkbenchEnvironmentService, configurationService: IConfigurationService);
    isPortPrivileged(port: number): boolean;
    protected retainOrCreateTunnel(addressProvider: IAddressProvider, remoteHost: string, remotePort: number, localPort: number | undefined, elevateIfNeeded: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | undefined> | undefined;
    private _createSharedProcessTunnel;
    canTunnel(uri: URI): boolean;
}
