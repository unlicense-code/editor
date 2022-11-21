import 'vs/css!./media/remoteViewlet';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILogService } from 'vs/platform/log/common/log';
import { ITimerService } from 'vs/workbench/services/timer/browser/timerService';
export declare class RemoteMarkers implements IWorkbenchContribution {
    constructor(remoteAgentService: IRemoteAgentService, timerService: ITimerService);
}
export declare class RemoteAgentConnectionStatusListener extends Disposable implements IWorkbenchContribution {
    private _reloadWindowShown;
    constructor(remoteAgentService: IRemoteAgentService, progressService: IProgressService, dialogService: IDialogService, commandService: ICommandService, quickInputService: IQuickInputService, logService: ILogService, environmentService: IWorkbenchEnvironmentService, telemetryService: ITelemetryService);
}
