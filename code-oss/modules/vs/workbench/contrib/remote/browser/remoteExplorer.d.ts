import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IViewsService } from 'vs/workbench/common/views';
import { IRemoteExplorerService } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { ITunnelService } from 'vs/platform/tunnel/common/tunnel';
import { IActivityService } from 'vs/workbench/services/activity/common/activity';
import { IExternalUriOpenerService } from 'vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { ILogService } from 'vs/platform/log/common/log';
export declare const VIEWLET_ID = "workbench.view.remote";
export declare class ForwardedPortsView extends Disposable implements IWorkbenchContribution {
    private readonly contextKeyService;
    private readonly environmentService;
    private readonly remoteExplorerService;
    private readonly tunnelService;
    private readonly activityService;
    private readonly statusbarService;
    private contextKeyListener?;
    private _activityBadge?;
    private entryAccessor;
    constructor(contextKeyService: IContextKeyService, environmentService: IWorkbenchEnvironmentService, remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService, activityService: IActivityService, statusbarService: IStatusbarService);
    private getViewContainer;
    private enableForwardedPortsView;
    private enableBadgeAndStatusBar;
    private updateActivityBadge;
    private updateStatusBar;
    private get entry();
}
export declare class PortRestore implements IWorkbenchContribution {
    readonly remoteExplorerService: IRemoteExplorerService;
    readonly logService: ILogService;
    constructor(remoteExplorerService: IRemoteExplorerService, logService: ILogService);
    private restore;
}
export declare class AutomaticPortForwarding extends Disposable implements IWorkbenchContribution {
    readonly terminalService: ITerminalService;
    readonly notificationService: INotificationService;
    readonly openerService: IOpenerService;
    readonly externalOpenerService: IExternalUriOpenerService;
    readonly viewsService: IViewsService;
    readonly remoteExplorerService: IRemoteExplorerService;
    readonly environmentService: IWorkbenchEnvironmentService;
    readonly contextKeyService: IContextKeyService;
    readonly configurationService: IConfigurationService;
    readonly debugService: IDebugService;
    readonly remoteAgentService: IRemoteAgentService;
    readonly tunnelService: ITunnelService;
    readonly hostService: IHostService;
    readonly logService: ILogService;
    constructor(terminalService: ITerminalService, notificationService: INotificationService, openerService: IOpenerService, externalOpenerService: IExternalUriOpenerService, viewsService: IViewsService, remoteExplorerService: IRemoteExplorerService, environmentService: IWorkbenchEnvironmentService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, debugService: IDebugService, remoteAgentService: IRemoteAgentService, tunnelService: ITunnelService, hostService: IHostService, logService: ILogService);
}
