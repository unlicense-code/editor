import { IToolBarOptions, ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { IAction, SubmenuAction } from 'vs/base/common/actions';
import { IMenuActionOptions, IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare const enum HiddenItemStrategy {
    /** This toolbar doesn't support hiding*/
    NoHide = -1,
    /** Hidden items aren't shown anywhere */
    Ignore = 0,
    /** Hidden items move into the secondary group */
    RenderInSecondaryGroup = 1
}
export declare type IWorkbenchToolBarOptions = IToolBarOptions & {
    /**
     * Items of the primary group can be hidden. When this happens the item can
     * - move into the secondary popup-menu, or
     * - not be shown at all
     */
    hiddenItemStrategy?: HiddenItemStrategy;
    /**
     * Optional menu id which is used for a "Reset Menu" command. This should be the
     * menu id that defines the contents of this workbench menu
     */
    resetMenu?: MenuId;
    /**
     * Optional menu id which items are used for the context menu of the toolbar.
     */
    contextMenu?: MenuId;
    /**
     * Optional options how menu actions are created and invoked
     */
    menuOptions?: IMenuActionOptions;
    /**
     * When set the `workbenchActionExecuted` is automatically send for each invoked action. The `from` property
     * of the event will the passed `telemetrySource`-value
     */
    telemetrySource?: string;
    /** This is controlled by the WorkbenchToolBar */
    allowContextMenu?: never;
};
/**
 * The `WorkbenchToolBar` does
 * - support hiding of menu items
 * - lookup keybindings for each actions automatically
 * - send `workbenchActionExecuted`-events for each action
 *
 * See {@link MenuWorkbenchToolBar} for a toolbar that is backed by a menu.
 */
export declare class WorkbenchToolBar extends ToolBar {
    private _options;
    private readonly _menuService;
    private readonly _contextKeyService;
    private readonly _contextMenuService;
    private readonly _sessionDisposables;
    constructor(container: HTMLElement, _options: IWorkbenchToolBarOptions | undefined, _menuService: IMenuService, _contextKeyService: IContextKeyService, _contextMenuService: IContextMenuService, keybindingService: IKeybindingService, telemetryService: ITelemetryService);
    setActions(_primary: readonly IAction[], _secondary?: readonly IAction[], menuIds?: readonly MenuId[]): void;
}
export interface IToolBarRenderOptions {
    /**
     * Determines what groups are considered primary. Defaults to `navigation`. Items of the primary
     * group are rendered with buttons and the rest is rendered in the secondary popup-menu.
     */
    primaryGroup?: string | ((actionGroup: string) => boolean);
    /**
     * Limits the number of items that make it in the primary group. The rest overflows into the
     * secondary menu.
     */
    primaryMaxCount?: number;
    /**
     * Inlinse submenus with just a single item
     */
    shouldInlineSubmenu?: (action: SubmenuAction, group: string, groupSize: number) => boolean;
    /**
     * Should the primary group allow for separators.
     */
    useSeparatorsInPrimaryActions?: boolean;
}
export interface IMenuWorkbenchToolBarOptions extends IWorkbenchToolBarOptions {
    /**
     * Optional options to configure how the toolbar renderes items.
     */
    toolbarOptions?: IToolBarRenderOptions;
    /**
     * Only `undefined` to disable the reset command is allowed, otherwise the menus
     * id is used.
     */
    resetMenu?: undefined;
}
/**
 * A {@link WorkbenchToolBar workbench toolbar} that is purely driven from a {@link MenuId menu}-identifier.
 *
 * *Note* that Manual updates via `setActions` are NOT supported.
 */
export declare class MenuWorkbenchToolBar extends WorkbenchToolBar {
    constructor(container: HTMLElement, menuId: MenuId, options: IMenuWorkbenchToolBarOptions | undefined, menuService: IMenuService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, telemetryService: ITelemetryService);
    /**
     * @deprecated The WorkbenchToolBar does not support this method because it works with menus.
     */
    setActions(): void;
}
