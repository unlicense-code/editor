import { INotificationsModel } from 'vs/workbench/common/notifications';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { Disposable } from 'vs/base/common/lifecycle';
import { INotificationService } from 'vs/platform/notification/common/notification';
export declare class NotificationsStatus extends Disposable {
    private readonly model;
    private readonly statusbarService;
    private readonly notificationService;
    private notificationsCenterStatusItem;
    private newNotificationsCount;
    private currentStatusMessage;
    private isNotificationsCenterVisible;
    private isNotificationsToastsVisible;
    constructor(model: INotificationsModel, statusbarService: IStatusbarService, notificationService: INotificationService);
    private registerListeners;
    private onDidChangeNotification;
    private updateNotificationsCenterStatusItem;
    private getTooltip;
    update(isCenterVisible: boolean, isToastsVisible: boolean): void;
    private onDidChangeStatusMessage;
    private doSetStatusMessage;
}
