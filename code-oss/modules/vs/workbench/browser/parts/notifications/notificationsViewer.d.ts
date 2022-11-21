import { IListVirtualDelegate, IListRenderer } from 'vs/base/browser/ui/list/list';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { IActionRunner } from 'vs/base/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { DisposableStore, Disposable } from 'vs/base/common/lifecycle';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { INotificationViewItem } from 'vs/workbench/common/notifications';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ProgressBar } from 'vs/base/browser/ui/progressbar/progressbar';
export declare class NotificationsListDelegate implements IListVirtualDelegate<INotificationViewItem> {
    private static readonly ROW_HEIGHT;
    private static readonly LINE_HEIGHT;
    private offsetHelper;
    constructor(container: HTMLElement);
    private createOffsetHelper;
    getHeight(notification: INotificationViewItem): number;
    private computePreferredHeight;
    getTemplateId(element: INotificationViewItem): string;
}
export interface INotificationTemplateData {
    container: HTMLElement;
    toDispose: DisposableStore;
    mainRow: HTMLElement;
    icon: HTMLElement;
    message: HTMLElement;
    toolbar: ActionBar;
    detailsRow: HTMLElement;
    source: HTMLElement;
    buttonsContainer: HTMLElement;
    progress: ProgressBar;
    renderer: NotificationTemplateRenderer;
}
export declare class NotificationRenderer implements IListRenderer<INotificationViewItem, INotificationTemplateData> {
    private actionRunner;
    private readonly contextMenuService;
    private readonly instantiationService;
    static readonly TEMPLATE_ID = "notification";
    constructor(actionRunner: IActionRunner, contextMenuService: IContextMenuService, instantiationService: IInstantiationService);
    get templateId(): string;
    renderTemplate(container: HTMLElement): INotificationTemplateData;
    renderElement(notification: INotificationViewItem, index: number, data: INotificationTemplateData): void;
    disposeTemplate(templateData: INotificationTemplateData): void;
}
export declare class NotificationTemplateRenderer extends Disposable {
    private template;
    private actionRunner;
    private readonly openerService;
    private readonly instantiationService;
    private readonly keybindingService;
    private readonly contextMenuService;
    private static closeNotificationAction;
    private static expandNotificationAction;
    private static collapseNotificationAction;
    private static readonly SEVERITIES;
    private readonly inputDisposables;
    constructor(template: INotificationTemplateData, actionRunner: IActionRunner, openerService: IOpenerService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextMenuService: IContextMenuService);
    setInput(notification: INotificationViewItem): void;
    private render;
    private renderSeverity;
    private renderMessage;
    private renderSecondaryActions;
    private renderSource;
    private renderButtons;
    private renderProgress;
    private toSeverityIcon;
    private getKeybindingLabel;
}
