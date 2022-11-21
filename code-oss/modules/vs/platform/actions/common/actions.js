/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { SubmenuAction } from 'vs/base/common/actions';
import { CSSIcon } from 'vs/base/common/codicons';
import { MicrotaskEmitter } from 'vs/base/common/event';
import { DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { LinkedList } from 'vs/base/common/linkedList';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
export function isIMenuItem(item) {
    return item.command !== undefined;
}
export function isISubmenuItem(item) {
    return item.submenu !== undefined;
}
export class MenuId {
    static _instances = new Map();
    static CommandPalette = new MenuId('CommandPalette');
    static DebugBreakpointsContext = new MenuId('DebugBreakpointsContext');
    static DebugCallStackContext = new MenuId('DebugCallStackContext');
    static DebugConsoleContext = new MenuId('DebugConsoleContext');
    static DebugVariablesContext = new MenuId('DebugVariablesContext');
    static DebugWatchContext = new MenuId('DebugWatchContext');
    static DebugToolBar = new MenuId('DebugToolBar');
    static DebugToolBarStop = new MenuId('DebugToolBarStop');
    static EditorContext = new MenuId('EditorContext');
    static SimpleEditorContext = new MenuId('SimpleEditorContext');
    static EditorContent = new MenuId('EditorContent');
    static EditorContextCopy = new MenuId('EditorContextCopy');
    static EditorContextPeek = new MenuId('EditorContextPeek');
    static EditorContextShare = new MenuId('EditorContextShare');
    static EditorTitle = new MenuId('EditorTitle');
    static EditorTitleRun = new MenuId('EditorTitleRun');
    static EditorTitleContext = new MenuId('EditorTitleContext');
    static EmptyEditorGroup = new MenuId('EmptyEditorGroup');
    static EmptyEditorGroupContext = new MenuId('EmptyEditorGroupContext');
    static ExplorerContext = new MenuId('ExplorerContext');
    static ExtensionContext = new MenuId('ExtensionContext');
    static GlobalActivity = new MenuId('GlobalActivity');
    static CommandCenter = new MenuId('CommandCenter');
    static LayoutControlMenuSubmenu = new MenuId('LayoutControlMenuSubmenu');
    static LayoutControlMenu = new MenuId('LayoutControlMenu');
    static MenubarMainMenu = new MenuId('MenubarMainMenu');
    static MenubarAppearanceMenu = new MenuId('MenubarAppearanceMenu');
    static MenubarDebugMenu = new MenuId('MenubarDebugMenu');
    static MenubarEditMenu = new MenuId('MenubarEditMenu');
    static MenubarCopy = new MenuId('MenubarCopy');
    static MenubarFileMenu = new MenuId('MenubarFileMenu');
    static MenubarGoMenu = new MenuId('MenubarGoMenu');
    static MenubarHelpMenu = new MenuId('MenubarHelpMenu');
    static MenubarLayoutMenu = new MenuId('MenubarLayoutMenu');
    static MenubarNewBreakpointMenu = new MenuId('MenubarNewBreakpointMenu');
    static MenubarPanelAlignmentMenu = new MenuId('MenubarPanelAlignmentMenu');
    static MenubarPanelPositionMenu = new MenuId('MenubarPanelPositionMenu');
    static MenubarPreferencesMenu = new MenuId('MenubarPreferencesMenu');
    static MenubarRecentMenu = new MenuId('MenubarRecentMenu');
    static MenubarSelectionMenu = new MenuId('MenubarSelectionMenu');
    static MenubarShare = new MenuId('MenubarShare');
    static MenubarSwitchEditorMenu = new MenuId('MenubarSwitchEditorMenu');
    static MenubarSwitchGroupMenu = new MenuId('MenubarSwitchGroupMenu');
    static MenubarTerminalMenu = new MenuId('MenubarTerminalMenu');
    static MenubarViewMenu = new MenuId('MenubarViewMenu');
    static MenubarHomeMenu = new MenuId('MenubarHomeMenu');
    static OpenEditorsContext = new MenuId('OpenEditorsContext');
    static ProblemsPanelContext = new MenuId('ProblemsPanelContext');
    static SCMChangeContext = new MenuId('SCMChangeContext');
    static SCMResourceContext = new MenuId('SCMResourceContext');
    static SCMResourceFolderContext = new MenuId('SCMResourceFolderContext');
    static SCMResourceGroupContext = new MenuId('SCMResourceGroupContext');
    static SCMSourceControl = new MenuId('SCMSourceControl');
    static SCMTitle = new MenuId('SCMTitle');
    static SearchContext = new MenuId('SearchContext');
    static SearchActionMenu = new MenuId('SearchActionContext');
    static StatusBarWindowIndicatorMenu = new MenuId('StatusBarWindowIndicatorMenu');
    static StatusBarRemoteIndicatorMenu = new MenuId('StatusBarRemoteIndicatorMenu');
    static StickyScrollContext = new MenuId('StickyScrollContext');
    static TestItem = new MenuId('TestItem');
    static TestItemGutter = new MenuId('TestItemGutter');
    static TestPeekElement = new MenuId('TestPeekElement');
    static TestPeekTitle = new MenuId('TestPeekTitle');
    static TouchBarContext = new MenuId('TouchBarContext');
    static TitleBarContext = new MenuId('TitleBarContext');
    static TitleBarTitleContext = new MenuId('TitleBarTitleContext');
    static TunnelContext = new MenuId('TunnelContext');
    static TunnelPrivacy = new MenuId('TunnelPrivacy');
    static TunnelProtocol = new MenuId('TunnelProtocol');
    static TunnelPortInline = new MenuId('TunnelInline');
    static TunnelTitle = new MenuId('TunnelTitle');
    static TunnelLocalAddressInline = new MenuId('TunnelLocalAddressInline');
    static TunnelOriginInline = new MenuId('TunnelOriginInline');
    static ViewItemContext = new MenuId('ViewItemContext');
    static ViewContainerTitle = new MenuId('ViewContainerTitle');
    static ViewContainerTitleContext = new MenuId('ViewContainerTitleContext');
    static ViewTitle = new MenuId('ViewTitle');
    static ViewTitleContext = new MenuId('ViewTitleContext');
    static CommentThreadTitle = new MenuId('CommentThreadTitle');
    static CommentThreadActions = new MenuId('CommentThreadActions');
    static CommentThreadTitleContext = new MenuId('CommentThreadTitleContext');
    static CommentThreadCommentContext = new MenuId('CommentThreadCommentContext');
    static CommentTitle = new MenuId('CommentTitle');
    static CommentActions = new MenuId('CommentActions');
    static InteractiveToolbar = new MenuId('InteractiveToolbar');
    static InteractiveCellTitle = new MenuId('InteractiveCellTitle');
    static InteractiveCellDelete = new MenuId('InteractiveCellDelete');
    static InteractiveCellExecute = new MenuId('InteractiveCellExecute');
    static InteractiveInputExecute = new MenuId('InteractiveInputExecute');
    static NotebookToolbar = new MenuId('NotebookToolbar');
    static NotebookCellTitle = new MenuId('NotebookCellTitle');
    static NotebookCellDelete = new MenuId('NotebookCellDelete');
    static NotebookCellInsert = new MenuId('NotebookCellInsert');
    static NotebookCellBetween = new MenuId('NotebookCellBetween');
    static NotebookCellListTop = new MenuId('NotebookCellTop');
    static NotebookCellExecute = new MenuId('NotebookCellExecute');
    static NotebookCellExecutePrimary = new MenuId('NotebookCellExecutePrimary');
    static NotebookDiffCellInputTitle = new MenuId('NotebookDiffCellInputTitle');
    static NotebookDiffCellMetadataTitle = new MenuId('NotebookDiffCellMetadataTitle');
    static NotebookDiffCellOutputsTitle = new MenuId('NotebookDiffCellOutputsTitle');
    static NotebookOutputToolbar = new MenuId('NotebookOutputToolbar');
    static NotebookEditorLayoutConfigure = new MenuId('NotebookEditorLayoutConfigure');
    static NotebookKernelSource = new MenuId('NotebookKernelSource');
    static BulkEditTitle = new MenuId('BulkEditTitle');
    static BulkEditContext = new MenuId('BulkEditContext');
    static TimelineItemContext = new MenuId('TimelineItemContext');
    static TimelineTitle = new MenuId('TimelineTitle');
    static TimelineTitleContext = new MenuId('TimelineTitleContext');
    static TimelineFilterSubMenu = new MenuId('TimelineFilterSubMenu');
    static AccountsContext = new MenuId('AccountsContext');
    static PanelTitle = new MenuId('PanelTitle');
    static AuxiliaryBarTitle = new MenuId('AuxiliaryBarTitle');
    static TerminalInstanceContext = new MenuId('TerminalInstanceContext');
    static TerminalEditorInstanceContext = new MenuId('TerminalEditorInstanceContext');
    static TerminalNewDropdownContext = new MenuId('TerminalNewDropdownContext');
    static TerminalTabContext = new MenuId('TerminalTabContext');
    static TerminalTabEmptyAreaContext = new MenuId('TerminalTabEmptyAreaContext');
    static TerminalInlineTabContext = new MenuId('TerminalInlineTabContext');
    static WebviewContext = new MenuId('WebviewContext');
    static InlineCompletionsActions = new MenuId('InlineCompletionsActions');
    static NewFile = new MenuId('NewFile');
    static MergeInput1Toolbar = new MenuId('MergeToolbar1Toolbar');
    static MergeInput2Toolbar = new MenuId('MergeToolbar2Toolbar');
    static MergeBaseToolbar = new MenuId('MergeBaseToolbar');
    static MergeInputResultToolbar = new MenuId('MergeToolbarResultToolbar');
    /**
     * Create or reuse a `MenuId` with the given identifier
     */
    static for(identifier) {
        return MenuId._instances.get(identifier) ?? new MenuId(identifier);
    }
    id;
    /**
     * Create a new `MenuId` with the unique identifier. Will throw if a menu
     * with the identifier already exists, use `MenuId.for(ident)` or a unique
     * identifier
     */
    constructor(identifier) {
        if (MenuId._instances.has(identifier)) {
            throw new TypeError(`MenuId with identifier '${identifier}' already exists. Use MenuId.for(ident) or a unique identifier`);
        }
        MenuId._instances.set(identifier, this);
        this.id = identifier;
    }
}
export const IMenuService = createDecorator('menuService');
class MenuRegistryChangeEvent {
    id;
    static _all = new Map();
    static for(id) {
        let value = this._all.get(id);
        if (!value) {
            value = new MenuRegistryChangeEvent(id);
            this._all.set(id, value);
        }
        return value;
    }
    static merge(events) {
        const ids = new Set();
        for (const item of events) {
            if (item instanceof MenuRegistryChangeEvent) {
                ids.add(item.id);
            }
        }
        return ids;
    }
    has;
    constructor(id) {
        this.id = id;
        this.has = candidate => candidate === id;
    }
}
export const MenuRegistry = new class {
    _commands = new Map();
    _menuItems = new Map();
    _onDidChangeMenu = new MicrotaskEmitter({
        merge: MenuRegistryChangeEvent.merge
    });
    onDidChangeMenu = this._onDidChangeMenu.event;
    addCommand(command) {
        this._commands.set(command.id, command);
        this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
        return toDisposable(() => {
            if (this._commands.delete(command.id)) {
                this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(MenuId.CommandPalette));
            }
        });
    }
    getCommand(id) {
        return this._commands.get(id);
    }
    getCommands() {
        const map = new Map();
        this._commands.forEach((value, key) => map.set(key, value));
        return map;
    }
    appendMenuItem(id, item) {
        let list = this._menuItems.get(id);
        if (!list) {
            list = new LinkedList();
            this._menuItems.set(id, list);
        }
        const rm = list.push(item);
        this._onDidChangeMenu.fire(MenuRegistryChangeEvent.for(id));
        return toDisposable(rm);
    }
    appendMenuItems(items) {
        const result = new DisposableStore();
        for (const { id, item } of items) {
            result.add(this.appendMenuItem(id, item));
        }
        return result;
    }
    getMenuItems(id) {
        let result;
        if (this._menuItems.has(id)) {
            result = [...this._menuItems.get(id)];
        }
        else {
            result = [];
        }
        if (id === MenuId.CommandPalette) {
            // CommandPalette is special because it shows
            // all commands by default
            this._appendImplicitItems(result);
        }
        return result;
    }
    _appendImplicitItems(result) {
        const set = new Set();
        for (const item of result) {
            if (isIMenuItem(item)) {
                set.add(item.command.id);
                if (item.alt) {
                    set.add(item.alt.id);
                }
            }
        }
        this._commands.forEach((command, id) => {
            if (!set.has(id)) {
                result.push({ command });
            }
        });
    }
};
export class SubmenuItemAction extends SubmenuAction {
    item;
    hideActions;
    constructor(item, hideActions, actions) {
        super(`submenuitem.${item.submenu.id}`, typeof item.title === 'string' ? item.title : item.title.value, actions, 'submenu');
        this.item = item;
        this.hideActions = hideActions;
    }
}
// implements IAction, does NOT extend Action, so that no one
// subscribes to events of Action or modified properties
let MenuItemAction = class MenuItemAction {
    hideActions;
    _commandService;
    static label(action, options) {
        return options?.renderShortTitle && action.shortTitle
            ? (typeof action.shortTitle === 'string' ? action.shortTitle : action.shortTitle.value)
            : (typeof action.title === 'string' ? action.title : action.title.value);
    }
    item;
    alt;
    _options;
    id;
    label;
    tooltip;
    class;
    enabled;
    checked;
    constructor(item, alt, options, hideActions, contextKeyService, _commandService) {
        this.hideActions = hideActions;
        this._commandService = _commandService;
        this.id = item.id;
        this.label = MenuItemAction.label(item, options);
        this.tooltip = (typeof item.tooltip === 'string' ? item.tooltip : item.tooltip?.value) ?? '';
        this.enabled = !item.precondition || contextKeyService.contextMatchesRules(item.precondition);
        this.checked = undefined;
        if (item.toggled) {
            const toggled = (item.toggled.condition ? item.toggled : { condition: item.toggled });
            this.checked = contextKeyService.contextMatchesRules(toggled.condition);
            if (this.checked && toggled.tooltip) {
                this.tooltip = typeof toggled.tooltip === 'string' ? toggled.tooltip : toggled.tooltip.value;
            }
            if (toggled.title) {
                this.label = typeof toggled.title === 'string' ? toggled.title : toggled.title.value;
            }
        }
        this.item = item;
        this.alt = alt ? new MenuItemAction(alt, undefined, options, hideActions, contextKeyService, _commandService) : undefined;
        this._options = options;
        if (ThemeIcon.isThemeIcon(item.icon)) {
            this.class = CSSIcon.asClassName(item.icon);
        }
    }
    run(...args) {
        let runArgs = [];
        if (this._options?.arg) {
            runArgs = [...runArgs, this._options.arg];
        }
        if (this._options?.shouldForwardArgs) {
            runArgs = [...runArgs, ...args];
        }
        return this._commandService.executeCommand(this.id, ...runArgs);
    }
};
MenuItemAction = __decorate([
    __param(4, IContextKeyService),
    __param(5, ICommandService)
], MenuItemAction);
export { MenuItemAction };
/**
 * @deprecated Use {@link registerAction2} instead.
 */
export class SyncActionDescriptor {
    _descriptor;
    _id;
    _label;
    _keybindings;
    _keybindingContext;
    _keybindingWeight;
    static create(ctor, id, label, keybindings, keybindingContext, keybindingWeight) {
        return new SyncActionDescriptor(ctor, id, label, keybindings, keybindingContext, keybindingWeight);
    }
    static from(ctor, keybindings, keybindingContext, keybindingWeight) {
        return SyncActionDescriptor.create(ctor, ctor.ID, ctor.LABEL, keybindings, keybindingContext, keybindingWeight);
    }
    constructor(ctor, id, label, keybindings, keybindingContext, keybindingWeight) {
        this._id = id;
        this._label = label;
        this._keybindings = keybindings;
        this._keybindingContext = keybindingContext;
        this._keybindingWeight = keybindingWeight;
        this._descriptor = new SyncDescriptor(ctor, [this._id, this._label]);
    }
    get syncDescriptor() {
        return this._descriptor;
    }
    get id() {
        return this._id;
    }
    get label() {
        return this._label;
    }
    get keybindings() {
        return this._keybindings;
    }
    get keybindingContext() {
        return this._keybindingContext;
    }
    get keybindingWeight() {
        return this._keybindingWeight;
    }
}
export class Action2 {
    desc;
    constructor(desc) {
        this.desc = desc;
    }
}
export function registerAction2(ctor) {
    const disposables = new DisposableStore();
    const action = new ctor();
    const { f1, menu, keybinding, description, ...command } = action.desc;
    // command
    disposables.add(CommandsRegistry.registerCommand({
        id: command.id,
        handler: (accessor, ...args) => action.run(accessor, ...args),
        description: description,
    }));
    // menu
    if (Array.isArray(menu)) {
        for (const item of menu) {
            disposables.add(MenuRegistry.appendMenuItem(item.id, { command, ...item }));
        }
    }
    else if (menu) {
        disposables.add(MenuRegistry.appendMenuItem(menu.id, { command, ...menu }));
    }
    if (f1) {
        disposables.add(MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command, when: command.precondition }));
        disposables.add(MenuRegistry.addCommand(command));
    }
    // keybinding
    if (Array.isArray(keybinding)) {
        for (const item of keybinding) {
            disposables.add(KeybindingsRegistry.registerKeybindingRule({
                ...item,
                id: command.id,
                when: command.precondition ? ContextKeyExpr.and(command.precondition, item.when) : item.when
            }));
        }
    }
    else if (keybinding) {
        disposables.add(KeybindingsRegistry.registerKeybindingRule({
            ...keybinding,
            id: command.id,
            when: command.precondition ? ContextKeyExpr.and(command.precondition, keybinding.when) : keybinding.when
        }));
    }
    return disposables;
}
//#endregion
