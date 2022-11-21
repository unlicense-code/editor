import { NotificationsModel } from 'vs/workbench/common/notifications';
export declare const SHOW_NOTIFICATIONS_CENTER = "notifications.showList";
export declare const HIDE_NOTIFICATIONS_CENTER = "notifications.hideList";
export declare const HIDE_NOTIFICATION_TOAST = "notifications.hideToasts";
export declare const COLLAPSE_NOTIFICATION = "notification.collapse";
export declare const EXPAND_NOTIFICATION = "notification.expand";
export declare const CLEAR_NOTIFICATION = "notification.clear";
export declare const CLEAR_ALL_NOTIFICATIONS = "notifications.clearAll";
export declare const TOGGLE_DO_NOT_DISTURB_MODE = "notifications.toggleDoNotDisturbMode";
export interface INotificationsCenterController {
    readonly isVisible: boolean;
    show(): void;
    hide(): void;
    clearAll(): void;
}
export interface INotificationsToastController {
    focus(): void;
    focusNext(): void;
    focusPrevious(): void;
    focusFirst(): void;
    focusLast(): void;
    hide(): void;
}
export declare function registerNotificationCommands(center: INotificationsCenterController, toasts: INotificationsToastController, model: NotificationsModel): void;
