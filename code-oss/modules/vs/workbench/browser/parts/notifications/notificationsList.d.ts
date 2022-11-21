import 'vs/css!./media/notificationsList';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IListOptions } from 'vs/base/browser/ui/list/listWidget';
import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
import { INotificationViewItem } from 'vs/workbench/common/notifications';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
export interface INotificationsListOptions extends IListOptions<INotificationViewItem> {
    widgetAriaLabel?: string;
}
export declare class NotificationsList extends Themable {
    private readonly container;
    private readonly options;
    private readonly instantiationService;
    private readonly contextMenuService;
    private listContainer;
    private list;
    private listDelegate;
    private viewModel;
    private isVisible;
    constructor(container: HTMLElement, options: INotificationsListOptions, instantiationService: IInstantiationService, themeService: IThemeService, contextMenuService: IContextMenuService);
    show(focus?: boolean): void;
    private createNotificationsList;
    updateNotificationsList(start: number, deleteCount: number, items?: INotificationViewItem[]): void;
    updateNotificationHeight(item: INotificationViewItem): void;
    hide(): void;
    focusFirst(): void;
    hasFocus(): boolean;
    protected updateStyles(): void;
    layout(width: number, maxHeight?: number): void;
    dispose(): void;
}
