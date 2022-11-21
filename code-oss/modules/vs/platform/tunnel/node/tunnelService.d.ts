import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IAddressProvider, ISocketFactory } from 'vs/platform/remote/common/remoteAgentConnection';
import { AbstractTunnelService, ISharedTunnelsService as ISharedTunnelsService, RemoteTunnel } from 'vs/platform/tunnel/common/tunnel';
import { ISignService } from 'vs/platform/sign/common/sign';
export declare class BaseTunnelService extends AbstractTunnelService {
    private readonly socketFactory;
    private readonly signService;
    private readonly productService;
    constructor(socketFactory: ISocketFactory, logService: ILogService, signService: ISignService, productService: IProductService, configurationService: IConfigurationService);
    isPortPrivileged(port: number): boolean;
    protected retainOrCreateTunnel(addressProvider: IAddressProvider, remoteHost: string, remotePort: number, localPort: number | undefined, elevateIfNeeded: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | undefined> | undefined;
}
export declare class TunnelService extends BaseTunnelService {
    constructor(logService: ILogService, signService: ISignService, productService: IProductService, configurationService: IConfigurationService);
}
export declare class SharedTunnelsService extends Disposable implements ISharedTunnelsService {
    protected readonly logService: ILogService;
    private readonly productService;
    private readonly signService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    private readonly _tunnelServices;
    constructor(logService: ILogService, productService: IProductService, signService: ISignService, configurationService: IConfigurationService);
    openTunnel(authority: string, addressProvider: IAddressProvider | undefined, remoteHost: string | undefined, remotePort: number, localPort?: number, elevateIfNeeded?: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | undefined>;
}
