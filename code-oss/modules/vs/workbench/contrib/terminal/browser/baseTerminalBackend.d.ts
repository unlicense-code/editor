import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IPtyHostController, ISerializedTerminalState } from 'vs/platform/terminal/common/terminal';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
export declare abstract class BaseTerminalBackend extends Disposable {
    protected readonly _logService: ILogService;
    protected readonly _workspaceContextService: IWorkspaceContextService;
    private _isPtyHostUnresponsive;
    protected readonly _onPtyHostRestart: Emitter<void>;
    readonly onPtyHostRestart: import("vs/base/common/event").Event<void>;
    protected readonly _onPtyHostUnresponsive: Emitter<void>;
    readonly onPtyHostUnresponsive: import("vs/base/common/event").Event<void>;
    protected readonly _onPtyHostResponsive: Emitter<void>;
    readonly onPtyHostResponsive: import("vs/base/common/event").Event<void>;
    constructor(eventSource: IPtyHostController, _logService: ILogService, notificationService: INotificationService, historyService: IHistoryService, configurationResolverService: IConfigurationResolverService, _workspaceContextService: IWorkspaceContextService);
    protected _deserializeTerminalState(serializedState: string | undefined): ISerializedTerminalState[] | undefined;
}
