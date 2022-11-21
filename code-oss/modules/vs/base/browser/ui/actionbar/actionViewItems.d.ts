import { EventLike } from 'vs/base/browser/dom';
import { IActionViewItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { IHoverDelegate } from 'vs/base/browser/ui/iconLabel/iconHoverDelegate';
import { ISelectBoxOptions, ISelectOptionItem, SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { IAction, IActionRunner } from 'vs/base/common/actions';
import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./actionbar';
export interface IBaseActionViewItemOptions {
    draggable?: boolean;
    isMenu?: boolean;
    useEventAsContext?: boolean;
    hoverDelegate?: IHoverDelegate;
}
export declare class BaseActionViewItem extends Disposable implements IActionViewItem {
    protected options: IBaseActionViewItemOptions;
    element: HTMLElement | undefined;
    _context: unknown;
    readonly _action: IAction;
    private customHover?;
    get action(): IAction;
    private _actionRunner;
    constructor(context: unknown, action: IAction, options?: IBaseActionViewItemOptions);
    private handleActionChangeEvent;
    get actionRunner(): IActionRunner;
    set actionRunner(actionRunner: IActionRunner);
    isEnabled(): boolean;
    setActionContext(newContext: unknown): void;
    render(container: HTMLElement): void;
    onClick(event: EventLike, preserveFocus?: boolean): void;
    focus(): void;
    isFocused(): boolean;
    blur(): void;
    setFocusable(focusable: boolean): void;
    get trapsArrowNavigation(): boolean;
    protected updateEnabled(): void;
    protected updateLabel(): void;
    protected getTooltip(): string | undefined;
    protected updateTooltip(): void;
    protected updateAriaLabel(): void;
    protected updateClass(): void;
    protected updateChecked(): void;
    dispose(): void;
}
export interface IActionViewItemOptions extends IBaseActionViewItemOptions {
    icon?: boolean;
    label?: boolean;
    keybinding?: string | null;
}
export declare class ActionViewItem extends BaseActionViewItem {
    protected label: HTMLElement | undefined;
    protected options: IActionViewItemOptions;
    private cssClass?;
    constructor(context: unknown, action: IAction, options?: IActionViewItemOptions);
    render(container: HTMLElement): void;
    focus(): void;
    isFocused(): boolean;
    blur(): void;
    setFocusable(focusable: boolean): void;
    protected updateLabel(): void;
    protected getTooltip(): string | undefined;
    protected updateClass(): void;
    protected updateEnabled(): void;
    protected updateAriaLabel(): void;
    protected updateChecked(): void;
}
export declare class SelectActionViewItem extends BaseActionViewItem {
    protected selectBox: SelectBox;
    constructor(ctx: unknown, action: IAction, options: ISelectOptionItem[], selected: number, contextViewProvider: IContextViewProvider, selectBoxOptions?: ISelectBoxOptions);
    setOptions(options: ISelectOptionItem[], selected?: number): void;
    select(index: number): void;
    private registerListeners;
    protected runAction(option: string, index: number): void;
    protected getActionContext(option: string, index: number): string;
    setFocusable(focusable: boolean): void;
    focus(): void;
    blur(): void;
    render(container: HTMLElement): void;
}
