import { Action, IAction } from 'vs/base/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService, IColorTheme } from 'vs/platform/theme/common/themeService';
import { IBadge } from 'vs/workbench/services/activity/common/activity';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IActivity } from 'vs/workbench/common/activity';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { Event } from 'vs/base/common/event';
import { ICompositeDragAndDrop } from 'vs/workbench/browser/dnd';
import { Color } from 'vs/base/common/color';
import { IBaseActionViewItemOptions, BaseActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { HoverPosition } from 'vs/base/browser/ui/hover/hoverWidget';
export interface ICompositeActivity {
    readonly badge: IBadge;
    readonly clazz?: string;
    readonly priority: number;
}
export interface ICompositeBar {
    /**
     * Unpins a composite from the composite bar.
     */
    unpin(compositeId: string): void;
    /**
     * Pin a composite inside the composite bar.
     */
    pin(compositeId: string): void;
    /**
     * Find out if a composite is pinned in the composite bar.
     */
    isPinned(compositeId: string): boolean;
    /**
     * Reorder composite ordering by moving a composite to the location of another composite.
     */
    move(compositeId: string, tocompositeId: string): void;
}
export declare class ActivityAction extends Action {
    private _activity;
    private readonly _onDidChangeActivity;
    readonly onDidChangeActivity: Event<ActivityAction>;
    private readonly _onDidChangeBadge;
    readonly onDidChangeBadge: Event<ActivityAction>;
    private badge;
    private clazz;
    constructor(_activity: IActivity);
    get activity(): IActivity;
    set activity(activity: IActivity);
    activate(): void;
    deactivate(): void;
    getBadge(): IBadge | undefined;
    getClass(): string | undefined;
    setBadge(badge: IBadge | undefined, clazz?: string): void;
    dispose(): void;
}
export interface ICompositeBarColors {
    readonly activeBackgroundColor?: Color;
    readonly inactiveBackgroundColor?: Color;
    readonly activeBorderColor?: Color;
    readonly activeBackground?: Color;
    readonly activeBorderBottomColor?: Color;
    readonly activeForegroundColor?: Color;
    readonly inactiveForegroundColor?: Color;
    readonly badgeBackground?: Color;
    readonly badgeForeground?: Color;
    readonly dragAndDropBorder?: Color;
}
export interface IActivityHoverOptions {
    readonly position: () => HoverPosition;
}
export interface IActivityActionViewItemOptions extends IBaseActionViewItemOptions {
    readonly icon?: boolean;
    readonly colors: (theme: IColorTheme) => ICompositeBarColors;
    readonly hoverOptions: IActivityHoverOptions;
    readonly hasPopup?: boolean;
}
export declare class ActivityActionViewItem extends BaseActionViewItem {
    protected readonly themeService: IThemeService;
    private readonly hoverService;
    protected readonly configurationService: IConfigurationService;
    protected readonly keybindingService: IKeybindingService;
    private static hoverLeaveTime;
    protected container: HTMLElement;
    protected label: HTMLElement;
    protected badge: HTMLElement;
    protected readonly options: IActivityActionViewItemOptions;
    private badgeContent;
    private readonly badgeDisposable;
    private mouseUpTimeout;
    private keybindingLabel;
    private readonly hoverDisposables;
    private lastHover;
    private readonly showHoverScheduler;
    constructor(action: ActivityAction, options: IActivityActionViewItemOptions, themeService: IThemeService, hoverService: IHoverService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    protected get activity(): IActivity;
    protected updateStyles(): void;
    render(container: HTMLElement): void;
    private onThemeChange;
    protected updateActivity(): void;
    protected updateBadge(): void;
    protected updateLabel(): void;
    private updateTitle;
    protected computeTitle(): string;
    private computeKeybindingLabel;
    private updateHover;
    private showHover;
    dispose(): void;
}
export declare class CompositeOverflowActivityAction extends ActivityAction {
    private showMenu;
    constructor(showMenu: () => void);
    run(): Promise<void>;
}
export declare class CompositeOverflowActivityActionViewItem extends ActivityActionViewItem {
    private getOverflowingComposites;
    private getActiveCompositeId;
    private getBadge;
    private getCompositeOpenAction;
    private readonly contextMenuService;
    private actions;
    constructor(action: ActivityAction, getOverflowingComposites: () => {
        id: string;
        name?: string;
    }[], getActiveCompositeId: () => string | undefined, getBadge: (compositeId: string) => IBadge, getCompositeOpenAction: (compositeId: string) => IAction, colors: (theme: IColorTheme) => ICompositeBarColors, hoverOptions: IActivityHoverOptions, contextMenuService: IContextMenuService, themeService: IThemeService, hoverService: IHoverService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    showMenu(): void;
    private getActions;
    dispose(): void;
}
export declare class CompositeActionViewItem extends ActivityActionViewItem {
    private readonly compositeActivityAction;
    private readonly toggleCompositePinnedAction;
    private readonly compositeContextMenuActionsProvider;
    private readonly contextMenuActionsProvider;
    private readonly dndHandler;
    private readonly compositeBar;
    private readonly contextMenuService;
    private static manageExtensionAction;
    constructor(options: IActivityActionViewItemOptions, compositeActivityAction: ActivityAction, toggleCompositePinnedAction: IAction, compositeContextMenuActionsProvider: (compositeId: string) => IAction[], contextMenuActionsProvider: () => IAction[], dndHandler: ICompositeDragAndDrop, compositeBar: ICompositeBar, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, themeService: IThemeService, hoverService: IHoverService, configurationService: IConfigurationService);
    render(container: HTMLElement): void;
    private updateFromDragging;
    private showContextMenu;
    protected updateChecked(): void;
    protected updateEnabled(): void;
    dispose(): void;
}
export declare class ToggleCompositePinnedAction extends Action {
    private activity;
    private compositeBar;
    constructor(activity: IActivity | undefined, compositeBar: ICompositeBar);
    run(context: string): Promise<void>;
}
