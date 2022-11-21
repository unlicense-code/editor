import { IContextMenuProvider } from 'vs/base/browser/contextmenu';
import { IActionViewItemProvider } from 'vs/base/browser/ui/actionbar/actionbar';
import { ActionViewItem, BaseActionViewItem, IActionViewItemOptions, IBaseActionViewItemOptions } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { AnchorAlignment } from 'vs/base/browser/ui/contextview/contextview';
import { IActionProvider } from 'vs/base/browser/ui/dropdown/dropdown';
import { IAction, IActionRunner } from 'vs/base/common/actions';
import { ResolvedKeybinding } from 'vs/base/common/keybindings';
import 'vs/css!./dropdown';
export interface IKeybindingProvider {
    (action: IAction): ResolvedKeybinding | undefined;
}
export interface IAnchorAlignmentProvider {
    (): AnchorAlignment;
}
export interface IDropdownMenuActionViewItemOptions extends IBaseActionViewItemOptions {
    readonly actionViewItemProvider?: IActionViewItemProvider;
    readonly keybindingProvider?: IKeybindingProvider;
    readonly actionRunner?: IActionRunner;
    readonly classNames?: string[] | string;
    readonly anchorAlignmentProvider?: IAnchorAlignmentProvider;
    readonly menuAsChild?: boolean;
}
export declare class DropdownMenuActionViewItem extends BaseActionViewItem {
    private menuActionsOrProvider;
    private dropdownMenu;
    private contextMenuProvider;
    private actionItem;
    private _onDidChangeVisibility;
    readonly onDidChangeVisibility: import("vs/base/common/event").Event<boolean>;
    protected readonly options: IDropdownMenuActionViewItemOptions;
    constructor(action: IAction, menuActionsOrProvider: readonly IAction[] | IActionProvider, contextMenuProvider: IContextMenuProvider, options?: IDropdownMenuActionViewItemOptions);
    render(container: HTMLElement): void;
    protected getTooltip(): string | undefined;
    setActionContext(newContext: unknown): void;
    show(): void;
    protected updateEnabled(): void;
}
export interface IActionWithDropdownActionViewItemOptions extends IActionViewItemOptions {
    readonly menuActionsOrProvider: readonly IAction[] | IActionProvider;
    readonly menuActionClassNames?: string[];
}
export declare class ActionWithDropdownActionViewItem extends ActionViewItem {
    private readonly contextMenuProvider;
    protected dropdownMenuActionViewItem: DropdownMenuActionViewItem | undefined;
    constructor(context: unknown, action: IAction, options: IActionWithDropdownActionViewItemOptions, contextMenuProvider: IContextMenuProvider);
    render(container: HTMLElement): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
}
