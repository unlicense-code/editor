import { ActionViewItem, BaseActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { DropdownMenuActionViewItem, IDropdownMenuActionViewItemOptions } from 'vs/base/browser/ui/dropdown/dropdownActionViewItem';
import { IAction, SubmenuAction } from 'vs/base/common/actions';
import { Event } from 'vs/base/common/event';
import 'vs/css!./menuEntryActionViewItem';
import { IMenu, IMenuActionOptions, IMenuService, MenuItemAction, SubmenuItemAction } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IHoverDelegate } from 'vs/base/browser/ui/iconLabel/iconHoverDelegate';
export declare function createAndFillInContextMenuActions(menu: IMenu, options: IMenuActionOptions | undefined, target: IAction[] | {
    primary: IAction[];
    secondary: IAction[];
}, primaryGroup?: string): void;
export declare function createAndFillInActionBarActions(menu: IMenu, options: IMenuActionOptions | undefined, target: IAction[] | {
    primary: IAction[];
    secondary: IAction[];
}, primaryGroup?: string | ((actionGroup: string) => boolean), primaryMaxCount?: number, shouldInlineSubmenu?: (action: SubmenuAction, group: string, groupSize: number) => boolean, useSeparatorsInPrimaryActions?: boolean): void;
export interface IMenuEntryActionViewItemOptions {
    draggable?: boolean;
    keybinding?: string;
    hoverDelegate?: IHoverDelegate;
}
export declare class MenuEntryActionViewItem extends ActionViewItem {
    protected readonly _keybindingService: IKeybindingService;
    protected _notificationService: INotificationService;
    protected _contextKeyService: IContextKeyService;
    protected _themeService: IThemeService;
    protected _contextMenuService: IContextMenuService;
    private _wantsAltCommand;
    private readonly _itemClassDispose;
    private readonly _altKey;
    constructor(action: MenuItemAction, options: IMenuEntryActionViewItemOptions | undefined, _keybindingService: IKeybindingService, _notificationService: INotificationService, _contextKeyService: IContextKeyService, _themeService: IThemeService, _contextMenuService: IContextMenuService);
    protected get _menuItemAction(): MenuItemAction;
    protected get _commandAction(): MenuItemAction;
    onClick(event: MouseEvent): Promise<void>;
    render(container: HTMLElement): void;
    protected updateLabel(): void;
    protected getTooltip(): string;
    protected updateClass(): void;
    private _updateItemClass;
}
export declare class SubmenuEntryActionViewItem extends DropdownMenuActionViewItem {
    protected _contextMenuService: IContextMenuService;
    protected _themeService: IThemeService;
    constructor(action: SubmenuItemAction, options: IDropdownMenuActionViewItemOptions | undefined, _contextMenuService: IContextMenuService, _themeService: IThemeService);
    render(container: HTMLElement): void;
}
export interface IDropdownWithDefaultActionViewItemOptions extends IDropdownMenuActionViewItemOptions {
    renderKeybindingWithDefaultActionLabel?: boolean;
}
export declare class DropdownWithDefaultActionViewItem extends BaseActionViewItem {
    protected readonly _keybindingService: IKeybindingService;
    protected _notificationService: INotificationService;
    protected _contextMenuService: IContextMenuService;
    protected _menuService: IMenuService;
    protected _instaService: IInstantiationService;
    protected _storageService: IStorageService;
    private readonly _options;
    private _defaultAction;
    private _dropdown;
    private _container;
    private _storageKey;
    get onDidChangeDropdownVisibility(): Event<boolean>;
    constructor(submenuAction: SubmenuItemAction, options: IDropdownWithDefaultActionViewItemOptions | undefined, _keybindingService: IKeybindingService, _notificationService: INotificationService, _contextMenuService: IContextMenuService, _menuService: IMenuService, _instaService: IInstantiationService, _storageService: IStorageService);
    private update;
    private _getDefaultActionKeybindingLabel;
    setActionContext(newContext: unknown): void;
    render(container: HTMLElement): void;
    focus(fromRight?: boolean): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    dispose(): void;
}
/**
 * Creates action view items for menu actions or submenu actions.
 */
export declare function createActionViewItem(instaService: IInstantiationService, action: IAction, options?: IDropdownMenuActionViewItemOptions | IMenuEntryActionViewItemOptions): undefined | MenuEntryActionViewItem | SubmenuEntryActionViewItem | BaseActionViewItem;
