import { ITunnelService } from 'vs/platform/tunnel/common/tunnel';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IRemoteExplorerService } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { ILogService } from 'vs/platform/log/common/log';
export declare class TunnelFactoryContribution extends Disposable implements IWorkbenchContribution {
    private openerService;
    constructor(tunnelService: ITunnelService, environmentService: IBrowserWorkbenchEnvironmentService, openerService: IOpenerService, remoteExplorerService: IRemoteExplorerService, logService: ILogService);
    private resolveExternalUri;
}
