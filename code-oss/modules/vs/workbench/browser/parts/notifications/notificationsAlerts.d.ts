import { INotificationsModel } from 'vs/workbench/common/notifications';
import { Disposable } from 'vs/base/common/lifecycle';
export declare class NotificationsAlerts extends Disposable {
    private readonly model;
    constructor(model: INotificationsModel);
    private registerListeners;
    private onDidChangeNotification;
    private triggerAriaAlert;
    private doTriggerAriaAlert;
}
