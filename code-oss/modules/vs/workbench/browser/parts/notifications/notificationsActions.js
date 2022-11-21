/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import 'vs/css!./media/notificationsActions';
import { isNotificationViewItem } from 'vs/workbench/common/notifications';
import { localize } from 'vs/nls';
import { Action, ActionRunner } from 'vs/base/common/actions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { CLEAR_NOTIFICATION, EXPAND_NOTIFICATION, COLLAPSE_NOTIFICATION, CLEAR_ALL_NOTIFICATIONS, HIDE_NOTIFICATIONS_CENTER, TOGGLE_DO_NOT_DISTURB_MODE } from 'vs/workbench/browser/parts/notifications/notificationsCommands';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { Codicon } from 'vs/base/common/codicons';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { hash } from 'vs/base/common/hash';
const clearIcon = registerIcon('notifications-clear', Codicon.close, localize('clearIcon', 'Icon for the clear action in notifications.'));
const clearAllIcon = registerIcon('notifications-clear-all', Codicon.clearAll, localize('clearAllIcon', 'Icon for the clear all action in notifications.'));
const hideIcon = registerIcon('notifications-hide', Codicon.chevronDown, localize('hideIcon', 'Icon for the hide action in notifications.'));
const expandIcon = registerIcon('notifications-expand', Codicon.chevronUp, localize('expandIcon', 'Icon for the expand action in notifications.'));
const collapseIcon = registerIcon('notifications-collapse', Codicon.chevronDown, localize('collapseIcon', 'Icon for the collapse action in notifications.'));
const configureIcon = registerIcon('notifications-configure', Codicon.gear, localize('configureIcon', 'Icon for the configure action in notifications.'));
const doNotDisturbIcon = registerIcon('notifications-do-not-disturb', Codicon.bellSlash, localize('doNotDisturbIcon', 'Icon for the mute all action in notifications.'));
let ClearNotificationAction = class ClearNotificationAction extends Action {
    commandService;
    static ID = CLEAR_NOTIFICATION;
    static LABEL = localize('clearNotification', "Clear Notification");
    constructor(id, label, commandService) {
        super(id, label, ThemeIcon.asClassName(clearIcon));
        this.commandService = commandService;
    }
    async run(notification) {
        this.commandService.executeCommand(CLEAR_NOTIFICATION, notification);
    }
};
ClearNotificationAction = __decorate([
    __param(2, ICommandService)
], ClearNotificationAction);
export { ClearNotificationAction };
let ClearAllNotificationsAction = class ClearAllNotificationsAction extends Action {
    commandService;
    static ID = CLEAR_ALL_NOTIFICATIONS;
    static LABEL = localize('clearNotifications', "Clear All Notifications");
    constructor(id, label, commandService) {
        super(id, label, ThemeIcon.asClassName(clearAllIcon));
        this.commandService = commandService;
    }
    async run() {
        this.commandService.executeCommand(CLEAR_ALL_NOTIFICATIONS);
    }
};
ClearAllNotificationsAction = __decorate([
    __param(2, ICommandService)
], ClearAllNotificationsAction);
export { ClearAllNotificationsAction };
let ToggleDoNotDisturbAction = class ToggleDoNotDisturbAction extends Action {
    commandService;
    static ID = TOGGLE_DO_NOT_DISTURB_MODE;
    static LABEL = localize('toggleDoNotDisturbMode', "Toggle Do Not Disturb Mode");
    constructor(id, label, commandService) {
        super(id, label, ThemeIcon.asClassName(doNotDisturbIcon));
        this.commandService = commandService;
    }
    async run() {
        this.commandService.executeCommand(TOGGLE_DO_NOT_DISTURB_MODE);
    }
};
ToggleDoNotDisturbAction = __decorate([
    __param(2, ICommandService)
], ToggleDoNotDisturbAction);
export { ToggleDoNotDisturbAction };
let HideNotificationsCenterAction = class HideNotificationsCenterAction extends Action {
    commandService;
    static ID = HIDE_NOTIFICATIONS_CENTER;
    static LABEL = localize('hideNotificationsCenter', "Hide Notifications");
    constructor(id, label, commandService) {
        super(id, label, ThemeIcon.asClassName(hideIcon));
        this.commandService = commandService;
    }
    async run() {
        this.commandService.executeCommand(HIDE_NOTIFICATIONS_CENTER);
    }
};
HideNotificationsCenterAction = __decorate([
    __param(2, ICommandService)
], HideNotificationsCenterAction);
export { HideNotificationsCenterAction };
let ExpandNotificationAction = class ExpandNotificationAction extends Action {
    commandService;
    static ID = EXPAND_NOTIFICATION;
    static LABEL = localize('expandNotification', "Expand Notification");
    constructor(id, label, commandService) {
        super(id, label, ThemeIcon.asClassName(expandIcon));
        this.commandService = commandService;
    }
    async run(notification) {
        this.commandService.executeCommand(EXPAND_NOTIFICATION, notification);
    }
};
ExpandNotificationAction = __decorate([
    __param(2, ICommandService)
], ExpandNotificationAction);
export { ExpandNotificationAction };
let CollapseNotificationAction = class CollapseNotificationAction extends Action {
    commandService;
    static ID = COLLAPSE_NOTIFICATION;
    static LABEL = localize('collapseNotification', "Collapse Notification");
    constructor(id, label, commandService) {
        super(id, label, ThemeIcon.asClassName(collapseIcon));
        this.commandService = commandService;
    }
    async run(notification) {
        this.commandService.executeCommand(COLLAPSE_NOTIFICATION, notification);
    }
};
CollapseNotificationAction = __decorate([
    __param(2, ICommandService)
], CollapseNotificationAction);
export { CollapseNotificationAction };
export class ConfigureNotificationAction extends Action {
    configurationActions;
    static ID = 'workbench.action.configureNotification';
    static LABEL = localize('configureNotification', "Configure Notification");
    constructor(id, label, configurationActions) {
        super(id, label, ThemeIcon.asClassName(configureIcon));
        this.configurationActions = configurationActions;
    }
}
let CopyNotificationMessageAction = class CopyNotificationMessageAction extends Action {
    clipboardService;
    static ID = 'workbench.action.copyNotificationMessage';
    static LABEL = localize('copyNotification', "Copy Text");
    constructor(id, label, clipboardService) {
        super(id, label);
        this.clipboardService = clipboardService;
    }
    run(notification) {
        return this.clipboardService.writeText(notification.message.raw);
    }
};
CopyNotificationMessageAction = __decorate([
    __param(2, IClipboardService)
], CopyNotificationMessageAction);
export { CopyNotificationMessageAction };
let NotificationActionRunner = class NotificationActionRunner extends ActionRunner {
    telemetryService;
    notificationService;
    constructor(telemetryService, notificationService) {
        super();
        this.telemetryService = telemetryService;
        this.notificationService = notificationService;
    }
    async runAction(action, context) {
        this.telemetryService.publicLog2('workbenchActionExecuted', { id: action.id, from: 'message' });
        if (isNotificationViewItem(context)) {
            // Log some additional telemetry specifically for actions
            // that are triggered from within notifications.
            this.telemetryService.publicLog2('notification:actionExecuted', {
                id: hash(context.message.original.toString()).toString(),
                actionLabel: action.label,
                source: context.sourceId || 'core',
                silent: context.silent
            });
        }
        // Run and make sure to notify on any error again
        try {
            await super.runAction(action, context);
        }
        catch (error) {
            this.notificationService.error(error);
        }
    }
};
NotificationActionRunner = __decorate([
    __param(0, ITelemetryService),
    __param(1, INotificationService)
], NotificationActionRunner);
export { NotificationActionRunner };
