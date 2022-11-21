import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { INotification, INotificationHandle, INotificationService, IPromptChoice, IPromptOptions, IStatusMessageOptions, Severity } from 'vs/platform/notification/common/notification';
export declare class TestNotificationService implements INotificationService {
    readonly onDidAddNotification: Event<INotification>;
    readonly onDidRemoveNotification: Event<INotification>;
    readonly onDidChangeDoNotDisturbMode: Event<void>;
    readonly _serviceBrand: undefined;
    doNotDisturbMode: boolean;
    private static readonly NO_OP;
    info(message: string): INotificationHandle;
    warn(message: string): INotificationHandle;
    error(error: string | Error): INotificationHandle;
    notify(notification: INotification): INotificationHandle;
    prompt(severity: Severity, message: string, choices: IPromptChoice[], options?: IPromptOptions): INotificationHandle;
    status(message: string | Error, options?: IStatusMessageOptions): IDisposable;
}
