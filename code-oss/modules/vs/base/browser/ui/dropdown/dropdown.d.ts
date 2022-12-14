import { IContextMenuProvider } from 'vs/base/browser/contextmenu';
import { IAnchor, IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { IMenuOptions } from 'vs/base/browser/ui/menu/menu';
import { ActionRunner, IAction } from 'vs/base/common/actions';
import { IDisposable } from 'vs/base/common/lifecycle';
import 'vs/css!./dropdown';
export interface ILabelRenderer {
    (container: HTMLElement): IDisposable | null;
}
export interface IBaseDropdownOptions {
    label?: string;
    labelRenderer?: ILabelRenderer;
}
export declare class BaseDropdown extends ActionRunner {
    private _element;
    private boxContainer?;
    private _label?;
    private contents?;
    private visible;
    private _onDidChangeVisibility;
    readonly onDidChangeVisibility: import("vs/base/common/event").Event<boolean>;
    constructor(container: HTMLElement, options: IBaseDropdownOptions);
    get element(): HTMLElement;
    get label(): HTMLElement | undefined;
    set tooltip(tooltip: string);
    show(): void;
    hide(): void;
    isVisible(): boolean;
    protected onEvent(_e: Event, activeElement: HTMLElement): void;
    dispose(): void;
}
export interface IDropdownOptions extends IBaseDropdownOptions {
    contextViewProvider: IContextViewProvider;
}
export declare class Dropdown extends BaseDropdown {
    private contextViewProvider;
    constructor(container: HTMLElement, options: IDropdownOptions);
    show(): void;
    protected getAnchor(): HTMLElement | IAnchor;
    protected onHide(): void;
    hide(): void;
    protected renderContents(container: HTMLElement): IDisposable | null;
}
export interface IActionProvider {
    getActions(): readonly IAction[];
}
export interface IDropdownMenuOptions extends IBaseDropdownOptions {
    contextMenuProvider: IContextMenuProvider;
    readonly actions?: IAction[];
    readonly actionProvider?: IActionProvider;
    menuClassName?: string;
    menuAsChild?: boolean;
}
export declare class DropdownMenu extends BaseDropdown {
    private _contextMenuProvider;
    private _menuOptions;
    private _actions;
    private actionProvider?;
    private menuClassName;
    private menuAsChild?;
    constructor(container: HTMLElement, options: IDropdownMenuOptions);
    set menuOptions(options: IMenuOptions | undefined);
    get menuOptions(): IMenuOptions | undefined;
    private get actions();
    private set actions(value);
    show(): void;
    hide(): void;
    private onHide;
}
