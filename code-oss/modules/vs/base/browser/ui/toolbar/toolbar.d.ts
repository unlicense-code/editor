import { IContextMenuProvider } from 'vs/base/browser/contextmenu';
import { ActionBar, ActionsOrientation, IActionViewItemProvider } from 'vs/base/browser/ui/actionbar/actionbar';
import { AnchorAlignment } from 'vs/base/browser/ui/contextview/contextview';
import { Action, IAction, IActionRunner } from 'vs/base/common/actions';
import { CSSIcon } from 'vs/base/common/codicons';
import { ResolvedKeybinding } from 'vs/base/common/keybindings';
import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./toolbar';
export interface IToolBarOptions {
    orientation?: ActionsOrientation;
    actionViewItemProvider?: IActionViewItemProvider;
    ariaLabel?: string;
    getKeyBinding?: (action: IAction) => ResolvedKeybinding | undefined;
    actionRunner?: IActionRunner;
    toggleMenuTitle?: string;
    anchorAlignmentProvider?: () => AnchorAlignment;
    renderDropdownAsChildElement?: boolean;
    moreIcon?: CSSIcon;
    allowContextMenu?: boolean;
}
/**
 * A widget that combines an action bar for primary actions and a dropdown for secondary actions.
 */
export declare class ToolBar extends Disposable {
    private options;
    protected readonly actionBar: ActionBar;
    private toggleMenuAction;
    private toggleMenuActionViewItem;
    private submenuActionViewItems;
    private hasSecondaryActions;
    private readonly lookupKeybindings;
    private readonly element;
    private _onDidChangeDropdownVisibility;
    readonly onDidChangeDropdownVisibility: import("vs/base/common/event").Event<boolean>;
    private disposables;
    constructor(container: HTMLElement, contextMenuProvider: IContextMenuProvider, options?: IToolBarOptions);
    set actionRunner(actionRunner: IActionRunner);
    get actionRunner(): IActionRunner;
    set context(context: unknown);
    getElement(): HTMLElement;
    focus(): void;
    getItemsWidth(): number;
    getItemAction(indexOrElement: number | HTMLElement): IAction | undefined;
    getItemWidth(index: number): number;
    getItemsLength(): number;
    setAriaLabel(label: string): void;
    setActions(primaryActions: ReadonlyArray<IAction>, secondaryActions?: ReadonlyArray<IAction>): void;
    private getKeybindingLabel;
    private clear;
    dispose(): void;
}
export declare class ToggleMenuAction extends Action {
    static readonly ID = "toolbar.toggle.more";
    private _menuActions;
    private toggleDropdownMenu;
    constructor(toggleDropdownMenu: () => void, title?: string);
    run(): Promise<void>;
    get menuActions(): ReadonlyArray<IAction>;
    set menuActions(actions: ReadonlyArray<IAction>);
}
