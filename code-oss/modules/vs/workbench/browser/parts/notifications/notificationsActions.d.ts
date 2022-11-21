import 'vs/css!./media/notificationsActions';
import { INotificationViewItem } from 'vs/workbench/common/notifications';
import { Action, IAction, ActionRunner } from 'vs/base/common/actions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
export declare class ClearNotificationAction extends Action {
    private readonly commandService;
    static readonly ID = "notification.clear";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class ClearAllNotificationsAction extends Action {
    private readonly commandService;
    static readonly ID = "notifications.clearAll";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ToggleDoNotDisturbAction extends Action {
    private readonly commandService;
    static readonly ID = "notifications.toggleDoNotDisturbMode";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class HideNotificationsCenterAction extends Action {
    private readonly commandService;
    static readonly ID = "notifications.hideList";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ExpandNotificationAction extends Action {
    private readonly commandService;
    static readonly ID = "notification.expand";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class CollapseNotificationAction extends Action {
    private readonly commandService;
    static readonly ID = "notification.collapse";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class ConfigureNotificationAction extends Action {
    readonly configurationActions: readonly IAction[];
    static readonly ID = "workbench.action.configureNotification";
    static readonly LABEL: string;
    constructor(id: string, label: string, configurationActions: readonly IAction[]);
}
export declare class CopyNotificationMessageAction extends Action {
    private readonly clipboardService;
    static readonly ID = "workbench.action.copyNotificationMessage";
    static readonly LABEL: string;
    constructor(id: string, label: string, clipboardService: IClipboardService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class NotificationActionRunner extends ActionRunner {
    private readonly telemetryService;
    private readonly notificationService;
    constructor(telemetryService: ITelemetryService, notificationService: INotificationService);
    protected runAction(action: IAction, context: unknown): Promise<void>;
}
