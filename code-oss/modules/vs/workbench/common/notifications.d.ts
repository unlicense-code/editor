import { INotification, INotificationHandle, INotificationActions, INotificationProgress, Severity, NotificationMessage, IPromptChoice, IStatusMessageOptions, NotificationsFilter } from 'vs/platform/notification/common/notification';
import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { Action } from 'vs/base/common/actions';
import { LinkedText } from 'vs/base/common/linkedText';
export interface INotificationsModel {
    readonly notifications: INotificationViewItem[];
    readonly onDidChangeNotification: Event<INotificationChangeEvent>;
    readonly onDidChangeFilter: Event<NotificationsFilter>;
    addNotification(notification: INotification): INotificationHandle;
    setFilter(filter: NotificationsFilter): void;
    readonly statusMessage: IStatusMessageViewItem | undefined;
    readonly onDidChangeStatusMessage: Event<IStatusMessageChangeEvent>;
    showStatusMessage(message: NotificationMessage, options?: IStatusMessageOptions): IDisposable;
}
export declare const enum NotificationChangeType {
    /**
     * A notification was added.
     */
    ADD = 0,
    /**
     * A notification changed. Check `detail` property
     * on the event for additional information.
     */
    CHANGE = 1,
    /**
     * A notification expanded or collapsed.
     */
    EXPAND_COLLAPSE = 2,
    /**
     * A notification was removed.
     */
    REMOVE = 3
}
export interface INotificationChangeEvent {
    /**
     * The index this notification has in the list of notifications.
     */
    index: number;
    /**
     * The notification this change is about.
     */
    item: INotificationViewItem;
    /**
     * The kind of notification change.
     */
    kind: NotificationChangeType;
    /**
     * Additional detail about the item change. Only applies to
     * `NotificationChangeType.CHANGE`.
     */
    detail?: NotificationViewItemContentChangeKind;
}
export declare const enum StatusMessageChangeType {
    ADD = 0,
    REMOVE = 1
}
export interface IStatusMessageViewItem {
    message: string;
    options?: IStatusMessageOptions;
}
export interface IStatusMessageChangeEvent {
    /**
     * The status message item this change is about.
     */
    item: IStatusMessageViewItem;
    /**
     * The kind of status message change.
     */
    kind: StatusMessageChangeType;
}
export declare class NotificationHandle extends Disposable implements INotificationHandle {
    private readonly item;
    private readonly onClose;
    private readonly _onDidClose;
    readonly onDidClose: Event<void>;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<boolean>;
    constructor(item: INotificationViewItem, onClose: (item: INotificationViewItem) => void);
    private registerListeners;
    get progress(): INotificationProgress;
    updateSeverity(severity: Severity): void;
    updateMessage(message: NotificationMessage): void;
    updateActions(actions?: INotificationActions): void;
    close(): void;
}
export declare class NotificationsModel extends Disposable implements INotificationsModel {
    private static readonly NO_OP_NOTIFICATION;
    private readonly _onDidChangeNotification;
    readonly onDidChangeNotification: Event<INotificationChangeEvent>;
    private readonly _onDidChangeStatusMessage;
    readonly onDidChangeStatusMessage: Event<IStatusMessageChangeEvent>;
    private readonly _onDidChangeFilter;
    readonly onDidChangeFilter: Event<NotificationsFilter>;
    private readonly _notifications;
    get notifications(): INotificationViewItem[];
    private _statusMessage;
    get statusMessage(): IStatusMessageViewItem | undefined;
    private filter;
    setFilter(filter: NotificationsFilter): void;
    addNotification(notification: INotification): INotificationHandle;
    private onClose;
    private findNotification;
    private createViewItem;
    showStatusMessage(message: NotificationMessage, options?: IStatusMessageOptions): IDisposable;
}
export interface INotificationViewItem {
    readonly id: string | undefined;
    readonly severity: Severity;
    readonly sticky: boolean;
    readonly silent: boolean;
    readonly message: INotificationMessage;
    readonly source: string | undefined;
    readonly sourceId: string | undefined;
    readonly actions: INotificationActions | undefined;
    readonly progress: INotificationViewItemProgress;
    readonly expanded: boolean;
    readonly visible: boolean;
    readonly canCollapse: boolean;
    readonly hasProgress: boolean;
    readonly onDidChangeExpansion: Event<void>;
    readonly onDidChangeVisibility: Event<boolean>;
    readonly onDidChangeContent: Event<INotificationViewItemContentChangeEvent>;
    readonly onDidClose: Event<void>;
    expand(): void;
    collapse(skipEvents?: boolean): void;
    toggle(): void;
    updateSeverity(severity: Severity): void;
    updateMessage(message: NotificationMessage): void;
    updateActions(actions?: INotificationActions): void;
    updateVisibility(visible: boolean): void;
    close(): void;
    equals(item: INotificationViewItem): boolean;
}
export declare function isNotificationViewItem(obj: unknown): obj is INotificationViewItem;
export declare const enum NotificationViewItemContentChangeKind {
    SEVERITY = 0,
    MESSAGE = 1,
    ACTIONS = 2,
    PROGRESS = 3
}
export interface INotificationViewItemContentChangeEvent {
    kind: NotificationViewItemContentChangeKind;
}
export interface INotificationViewItemProgressState {
    infinite?: boolean;
    total?: number;
    worked?: number;
    done?: boolean;
}
export interface INotificationViewItemProgress extends INotificationProgress {
    readonly state: INotificationViewItemProgressState;
    dispose(): void;
}
export declare class NotificationViewItemProgress extends Disposable implements INotificationViewItemProgress {
    private readonly _state;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    constructor();
    get state(): INotificationViewItemProgressState;
    infinite(): void;
    done(): void;
    total(value: number): void;
    worked(value: number): void;
}
export interface IMessageLink {
    href: string;
    name: string;
    title: string;
    offset: number;
    length: number;
}
export interface INotificationMessage {
    raw: string;
    original: NotificationMessage;
    linkedText: LinkedText;
}
export declare class NotificationViewItem extends Disposable implements INotificationViewItem {
    readonly id: string | undefined;
    private _severity;
    private _sticky;
    private _silent;
    private _message;
    private _source;
    private static readonly MAX_MESSAGE_LENGTH;
    private _expanded;
    private _visible;
    private _actions;
    private _progress;
    private readonly _onDidChangeExpansion;
    readonly onDidChangeExpansion: Event<void>;
    private readonly _onDidClose;
    readonly onDidClose: Event<void>;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<INotificationViewItemContentChangeEvent>;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<boolean>;
    static create(notification: INotification, filter?: NotificationsFilter): INotificationViewItem | undefined;
    private static parseNotificationMessage;
    private constructor();
    private setProgress;
    private setActions;
    get canCollapse(): boolean;
    get expanded(): boolean;
    get severity(): Severity;
    get sticky(): boolean;
    get silent(): boolean;
    private get hasActions();
    get hasProgress(): boolean;
    get progress(): INotificationViewItemProgress;
    get message(): INotificationMessage;
    get source(): string | undefined;
    get sourceId(): string | undefined;
    get actions(): INotificationActions | undefined;
    get visible(): boolean;
    updateSeverity(severity: Severity): void;
    updateMessage(input: NotificationMessage): void;
    updateActions(actions?: INotificationActions): void;
    updateVisibility(visible: boolean): void;
    expand(): void;
    collapse(skipEvents?: boolean): void;
    toggle(): void;
    close(): void;
    equals(other: INotificationViewItem): boolean;
}
export declare class ChoiceAction extends Action {
    private readonly _onDidRun;
    readonly onDidRun: Event<void>;
    private readonly _keepOpen;
    private readonly _menu;
    constructor(id: string, choice: IPromptChoice);
    get menu(): ChoiceAction[] | undefined;
    get keepOpen(): boolean;
}
