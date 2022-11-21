import { IRemoteTunnelAccount, IRemoteTunnelService, TunnelStatus } from 'vs/platform/remoteTunnel/common/remoteTunnel';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILoggerService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { ISharedProcessLifecycleService } from 'vs/platform/lifecycle/electron-browser/sharedProcessLifecycleService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
/**
 * This service runs on the shared service. It is running the `code-tunnel` command
 * to make the current machine available for remote access.
 */
export declare class RemoteTunnelService extends Disposable implements IRemoteTunnelService {
    private readonly telemetryService;
    private readonly productService;
    private readonly environmentService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidTokenFailedEmitter;
    readonly onDidTokenFailed: import("vs/base/common/event").Event<boolean>;
    private readonly _onDidChangeTunnelStatusEmitter;
    readonly onDidChangeTunnelStatus: import("vs/base/common/event").Event<TunnelStatus>;
    private readonly _onDidChangeAccountEmitter;
    readonly onDidChangeAccount: import("vs/base/common/event").Event<IRemoteTunnelAccount | undefined>;
    private readonly _logger;
    private _account;
    private _tunnelProcess;
    private _tunnelStatus;
    private _startTunnelProcessDelayer;
    private _tunnelCommand;
    constructor(telemetryService: ITelemetryService, productService: IProductService, environmentService: INativeEnvironmentService, loggerService: ILoggerService, sharedProcessLifecycleService: ISharedProcessLifecycleService, configurationService: IConfigurationService);
    getAccount(): Promise<IRemoteTunnelAccount | undefined>;
    updateAccount(account: IRemoteTunnelAccount | undefined): Promise<void>;
    private getTunnelCommandLocation;
    private updateTunnelProcess;
    getTunnelStatus(): Promise<TunnelStatus>;
    private setTunnelStatus;
    private runCodeTunneCommand;
    private getHostName;
}
