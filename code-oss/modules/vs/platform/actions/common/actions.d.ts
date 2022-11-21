import { Action, IAction, SubmenuAction } from 'vs/base/common/actions';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ICommandAction, ICommandActionTitle, Icon, ILocalizedString } from 'vs/platform/action/common/action';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { ICommandHandlerDescription, ICommandService } from 'vs/platform/commands/common/commands';
import { ContextKeyExpression, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SyncDescriptor0 } from 'vs/platform/instantiation/common/descriptors';
import { BrandedService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingRule, IKeybindings } from 'vs/platform/keybinding/common/keybindingsRegistry';
export interface IMenuItem {
    command: ICommandAction;
    alt?: ICommandAction;
    when?: ContextKeyExpression;
    group?: 'navigation' | string;
    order?: number;
}
export interface ISubmenuItem {
    title: string | ICommandActionTitle;
    submenu: MenuId;
    icon?: Icon;
    when?: ContextKeyExpression;
    group?: 'navigation' | string;
    order?: number;
    isSelection?: boolean;
    rememberDefaultAction?: boolean;
}
export declare function isIMenuItem(item: any): item is IMenuItem;
export declare function isISubmenuItem(item: any): item is ISubmenuItem;
export declare class MenuId {
    private static readonly _instances;
    static readonly CommandPalette: MenuId;
    static readonly DebugBreakpointsContext: MenuId;
    static readonly DebugCallStackContext: MenuId;
    static readonly DebugConsoleContext: MenuId;
    static readonly DebugVariablesContext: MenuId;
    static readonly DebugWatchContext: MenuId;
    static readonly DebugToolBar: MenuId;
    static readonly DebugToolBarStop: MenuId;
    static readonly EditorContext: MenuId;
    static readonly SimpleEditorContext: MenuId;
    static readonly EditorContent: MenuId;
    static readonly EditorContextCopy: MenuId;
    static readonly EditorContextPeek: MenuId;
    static readonly EditorContextShare: MenuId;
    static readonly EditorTitle: MenuId;
    static readonly EditorTitleRun: MenuId;
    static readonly EditorTitleContext: MenuId;
    static readonly EmptyEditorGroup: MenuId;
    static readonly EmptyEditorGroupContext: MenuId;
    static readonly ExplorerContext: MenuId;
    static readonly ExtensionContext: MenuId;
    static readonly GlobalActivity: MenuId;
    static readonly CommandCenter: MenuId;
    static readonly LayoutControlMenuSubmenu: MenuId;
    static readonly LayoutControlMenu: MenuId;
    static readonly MenubarMainMenu: MenuId;
    static readonly MenubarAppearanceMenu: MenuId;
    static readonly MenubarDebugMenu: MenuId;
    static readonly MenubarEditMenu: MenuId;
    static readonly MenubarCopy: MenuId;
    static readonly MenubarFileMenu: MenuId;
    static readonly MenubarGoMenu: MenuId;
    static readonly MenubarHelpMenu: MenuId;
    static readonly MenubarLayoutMenu: MenuId;
    static readonly MenubarNewBreakpointMenu: MenuId;
    static readonly MenubarPanelAlignmentMenu: MenuId;
    static readonly MenubarPanelPositionMenu: MenuId;
    static readonly MenubarPreferencesMenu: MenuId;
    static readonly MenubarRecentMenu: MenuId;
    static readonly MenubarSelectionMenu: MenuId;
    static readonly MenubarShare: MenuId;
    static readonly MenubarSwitchEditorMenu: MenuId;
    static readonly MenubarSwitchGroupMenu: MenuId;
    static readonly MenubarTerminalMenu: MenuId;
    static readonly MenubarViewMenu: MenuId;
    static readonly MenubarHomeMenu: MenuId;
    static readonly OpenEditorsContext: MenuId;
    static readonly ProblemsPanelContext: MenuId;
    static readonly SCMChangeContext: MenuId;
    static readonly SCMResourceContext: MenuId;
    static readonly SCMResourceFolderContext: MenuId;
    static readonly SCMResourceGroupContext: MenuId;
    static readonly SCMSourceControl: MenuId;
    static readonly SCMTitle: MenuId;
    static readonly SearchContext: MenuId;
    static readonly SearchActionMenu: MenuId;
    static readonly StatusBarWindowIndicatorMenu: MenuId;
    static readonly StatusBarRemoteIndicatorMenu: MenuId;
    static readonly StickyScrollContext: MenuId;
    static readonly TestItem: MenuId;
    static readonly TestItemGutter: MenuId;
    static readonly TestPeekElement: MenuId;
    static readonly TestPeekTitle: MenuId;
    static readonly TouchBarContext: MenuId;
    static readonly TitleBarContext: MenuId;
    static readonly TitleBarTitleContext: MenuId;
    static readonly TunnelContext: MenuId;
    static readonly TunnelPrivacy: MenuId;
    static readonly TunnelProtocol: MenuId;
    static readonly TunnelPortInline: MenuId;
    static readonly TunnelTitle: MenuId;
    static readonly TunnelLocalAddressInline: MenuId;
    static readonly TunnelOriginInline: MenuId;
    static readonly ViewItemContext: MenuId;
    static readonly ViewContainerTitle: MenuId;
    static readonly ViewContainerTitleContext: MenuId;
    static readonly ViewTitle: MenuId;
    static readonly ViewTitleContext: MenuId;
    static readonly CommentThreadTitle: MenuId;
    static readonly CommentThreadActions: MenuId;
    static readonly CommentThreadTitleContext: MenuId;
    static readonly CommentThreadCommentContext: MenuId;
    static readonly CommentTitle: MenuId;
    static readonly CommentActions: MenuId;
    static readonly InteractiveToolbar: MenuId;
    static readonly InteractiveCellTitle: MenuId;
    static readonly InteractiveCellDelete: MenuId;
    static readonly InteractiveCellExecute: MenuId;
    static readonly InteractiveInputExecute: MenuId;
    static readonly NotebookToolbar: MenuId;
    static readonly NotebookCellTitle: MenuId;
    static readonly NotebookCellDelete: MenuId;
    static readonly NotebookCellInsert: MenuId;
    static readonly NotebookCellBetween: MenuId;
    static readonly NotebookCellListTop: MenuId;
    static readonly NotebookCellExecute: MenuId;
    static readonly NotebookCellExecutePrimary: MenuId;
    static readonly NotebookDiffCellInputTitle: MenuId;
    static readonly NotebookDiffCellMetadataTitle: MenuId;
    static readonly NotebookDiffCellOutputsTitle: MenuId;
    static readonly NotebookOutputToolbar: MenuId;
    static readonly NotebookEditorLayoutConfigure: MenuId;
    static readonly NotebookKernelSource: MenuId;
    static readonly BulkEditTitle: MenuId;
    static readonly BulkEditContext: MenuId;
    static readonly TimelineItemContext: MenuId;
    static readonly TimelineTitle: MenuId;
    static readonly TimelineTitleContext: MenuId;
    static readonly TimelineFilterSubMenu: MenuId;
    static readonly AccountsContext: MenuId;
    static readonly PanelTitle: MenuId;
    static readonly AuxiliaryBarTitle: MenuId;
    static readonly TerminalInstanceContext: MenuId;
    static readonly TerminalEditorInstanceContext: MenuId;
    static readonly TerminalNewDropdownContext: MenuId;
    static readonly TerminalTabContext: MenuId;
    static readonly TerminalTabEmptyAreaContext: MenuId;
    static readonly TerminalInlineTabContext: MenuId;
    static readonly WebviewContext: MenuId;
    static readonly InlineCompletionsActions: MenuId;
    static readonly NewFile: MenuId;
    static readonly MergeInput1Toolbar: MenuId;
    static readonly MergeInput2Toolbar: MenuId;
    static readonly MergeBaseToolbar: MenuId;
    static readonly MergeInputResultToolbar: MenuId;
    /**
     * Create or reuse a `MenuId` with the given identifier
     */
    static for(identifier: string): MenuId;
    readonly id: string;
    /**
     * Create a new `MenuId` with the unique identifier. Will throw if a menu
     * with the identifier already exists, use `MenuId.for(ident)` or a unique
     * identifier
     */
    constructor(identifier: string);
}
export interface IMenuActionOptions {
    arg?: any;
    shouldForwardArgs?: boolean;
    renderShortTitle?: boolean;
}
export interface IMenuChangeEvent {
    readonly menu: IMenu;
    readonly isStructuralChange: boolean;
    readonly isToggleChange: boolean;
    readonly isEnablementChange: boolean;
}
export interface IMenu extends IDisposable {
    readonly onDidChange: Event<IMenuChangeEvent>;
    getActions(options?: IMenuActionOptions): [string, Array<MenuItemAction | SubmenuItemAction>][];
}
export declare const IMenuService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IMenuService>;
export interface IMenuCreateOptions {
    emitEventsForSubmenuChanges?: boolean;
    eventDebounceDelay?: number;
}
export interface IMenuService {
    readonly _serviceBrand: undefined;
    /**
     * Create a new menu for the given menu identifier. A menu sends events when it's entries
     * have changed (placement, enablement, checked-state). By default it does not send events for
     * submenu entries. That is more expensive and must be explicitly enabled with the
     * `emitEventsForSubmenuChanges` flag.
     */
    createMenu(id: MenuId, contextKeyService: IContextKeyService, options?: IMenuCreateOptions): IMenu;
    /**
     * Reset **all** menu item hidden states.
     */
    resetHiddenStates(): void;
    /**
     * Reset the menu's hidden states.
     */
    resetHiddenStates(menuIds: readonly MenuId[] | undefined): void;
}
declare type ICommandsMap = Map<string, ICommandAction>;
export interface IMenuRegistryChangeEvent {
    has(id: MenuId): boolean;
}
export interface IMenuRegistry {
    readonly onDidChangeMenu: Event<IMenuRegistryChangeEvent>;
    addCommand(userCommand: ICommandAction): IDisposable;
    getCommand(id: string): ICommandAction | undefined;
    getCommands(): ICommandsMap;
    /**
     * @deprecated Use `appendMenuItem` or most likely use `registerAction2` instead. There should be no strong
     * reason to use this directly.
     */
    appendMenuItems(items: Iterable<{
        id: MenuId;
        item: IMenuItem | ISubmenuItem;
    }>): IDisposable;
    appendMenuItem(menu: MenuId, item: IMenuItem | ISubmenuItem): IDisposable;
    getMenuItems(loc: MenuId): Array<IMenuItem | ISubmenuItem>;
}
export declare const MenuRegistry: IMenuRegistry;
export declare class SubmenuItemAction extends SubmenuAction {
    readonly item: ISubmenuItem;
    readonly hideActions: IMenuItemHide | undefined;
    constructor(item: ISubmenuItem, hideActions: IMenuItemHide | undefined, actions: IAction[]);
}
export interface IMenuItemHide {
    readonly isHidden: boolean;
    readonly hide: IAction;
    readonly toggle: IAction;
}
export declare class MenuItemAction implements IAction {
    readonly hideActions: IMenuItemHide | undefined;
    private _commandService;
    static label(action: ICommandAction, options?: IMenuActionOptions): string;
    readonly item: ICommandAction;
    readonly alt: MenuItemAction | undefined;
    private readonly _options;
    readonly id: string;
    readonly label: string;
    readonly tooltip: string;
    readonly class: string | undefined;
    readonly enabled: boolean;
    readonly checked?: boolean;
    constructor(item: ICommandAction, alt: ICommandAction | undefined, options: IMenuActionOptions | undefined, hideActions: IMenuItemHide | undefined, contextKeyService: IContextKeyService, _commandService: ICommandService);
    run(...args: any[]): Promise<void>;
}
/**
 * @deprecated Use {@link registerAction2} instead.
 */
export declare class SyncActionDescriptor {
    private readonly _descriptor;
    private readonly _id;
    private readonly _label?;
    private readonly _keybindings;
    private readonly _keybindingContext;
    private readonly _keybindingWeight;
    static create<Services extends BrandedService[]>(ctor: {
        new (id: string, label: string, ...services: Services): Action;
    }, id: string, label: string | undefined, keybindings?: IKeybindings, keybindingContext?: ContextKeyExpression, keybindingWeight?: number): SyncActionDescriptor;
    static from<Services extends BrandedService[]>(ctor: {
        new (id: string, label: string, ...services: Services): Action;
        readonly ID: string;
        readonly LABEL: string;
    }, keybindings?: IKeybindings, keybindingContext?: ContextKeyExpression, keybindingWeight?: number): SyncActionDescriptor;
    private constructor();
    get syncDescriptor(): SyncDescriptor0<Action>;
    get id(): string;
    get label(): string | undefined;
    get keybindings(): IKeybindings | undefined;
    get keybindingContext(): ContextKeyExpression | undefined;
    get keybindingWeight(): number | undefined;
}
declare type OneOrN<T> = T | T[];
interface IAction2CommonOptions extends ICommandAction {
    /**
     * One or many menu items.
     */
    menu?: OneOrN<{
        id: MenuId;
    } & Omit<IMenuItem, 'command'>>;
    /**
     * One keybinding.
     */
    keybinding?: OneOrN<Omit<IKeybindingRule, 'id'>>;
    /**
     * Metadata about this command, used for API commands or when
     * showing keybindings that have no other UX.
     */
    description?: ICommandHandlerDescription;
}
interface IBaseAction2Options extends IAction2CommonOptions {
    /**
     * This type is used when an action is not going to show up in the command palette.
     * In that case, it's able to use a string for the `title` and `category` properties.
     */
    f1?: false;
}
interface ICommandPaletteOptions extends IAction2CommonOptions {
    /**
     * The title of the command that will be displayed in the command palette after the category.
     *  This overrides {@link ICommandAction.title} to ensure a string isn't used so that the title
     *  includes the localized value and the original value for users using language packs.
     */
    title: ICommandActionTitle;
    /**
     * The category of the command that will be displayed in the command palette before the title suffixed.
     * with a colon This overrides {@link ICommandAction.title} to ensure a string isn't used so that
     * the title includes the localized value and the original value for users using language packs.
     */
    category?: keyof typeof Categories | ILocalizedString;
    /**
     * Shorthand to add this command to the command palette. Note: this is not the only way to declare that
     * a command should be in the command palette... however, enforcing ILocalizedString in the other scenarios
     * is much more challenging and this gets us most of the way there.
     */
    f1: true;
}
export declare type IAction2Options = ICommandPaletteOptions | IBaseAction2Options;
export interface IAction2F1RequiredOptions {
    title: ICommandActionTitle;
    category?: keyof typeof Categories | ILocalizedString;
}
export declare abstract class Action2 {
    readonly desc: Readonly<IAction2Options>;
    constructor(desc: Readonly<IAction2Options>);
    abstract run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare function registerAction2(ctor: {
    new (): Action2;
}): IDisposable;
export {};
