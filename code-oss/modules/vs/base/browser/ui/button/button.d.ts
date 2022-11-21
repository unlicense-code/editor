import { IContextMenuProvider } from 'vs/base/browser/contextmenu';
import { IAction, IActionRunner } from 'vs/base/common/actions';
import { CSSIcon } from 'vs/base/common/codicons';
import { Event as BaseEvent } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import 'vs/css!./button';
export interface IButtonOptions extends IButtonStyles {
    readonly title?: boolean | string;
    readonly supportIcons?: boolean;
    readonly secondary?: boolean;
}
export interface IButtonStyles {
    readonly buttonBackground: string | undefined;
    readonly buttonHoverBackground: string | undefined;
    readonly buttonForeground: string | undefined;
    readonly buttonSeparator: string | undefined;
    readonly buttonSecondaryBackground: string | undefined;
    readonly buttonSecondaryHoverBackground: string | undefined;
    readonly buttonSecondaryForeground: string | undefined;
    readonly buttonBorder: string | undefined;
}
export declare const unthemedButtonStyles: IButtonStyles;
export interface IButton extends IDisposable {
    readonly element: HTMLElement;
    readonly onDidClick: BaseEvent<Event | undefined>;
    label: string;
    icon: CSSIcon;
    enabled: boolean;
    focus(): void;
    hasFocus(): boolean;
}
export interface IButtonWithDescription extends IButton {
    description: string;
}
export declare class Button extends Disposable implements IButton {
    protected _element: HTMLElement;
    protected options: IButtonOptions;
    private _onDidClick;
    get onDidClick(): BaseEvent<Event>;
    private focusTracker;
    constructor(container: HTMLElement, options: IButtonOptions);
    private updateBackground;
    get element(): HTMLElement;
    set label(value: string);
    set icon(icon: CSSIcon);
    set enabled(value: boolean);
    get enabled(): boolean;
    focus(): void;
    hasFocus(): boolean;
}
export interface IButtonWithDropdownOptions extends IButtonOptions {
    readonly contextMenuProvider: IContextMenuProvider;
    readonly actions: IAction[];
    readonly actionRunner?: IActionRunner;
    readonly addPrimaryActionToDropdown?: boolean;
}
export declare class ButtonWithDropdown extends Disposable implements IButton {
    private readonly button;
    private readonly action;
    private readonly dropdownButton;
    private readonly separatorContainer;
    private readonly separator;
    readonly element: HTMLElement;
    private readonly _onDidClick;
    readonly onDidClick: BaseEvent<Event | undefined>;
    constructor(container: HTMLElement, options: IButtonWithDropdownOptions);
    set label(value: string);
    set icon(icon: CSSIcon);
    set enabled(enabled: boolean);
    get enabled(): boolean;
    focus(): void;
    hasFocus(): boolean;
}
export declare class ButtonWithDescription extends Button implements IButtonWithDescription {
    private _labelElement;
    private _descriptionElement;
    constructor(container: HTMLElement, options: IButtonOptions);
    set label(value: string);
    set description(value: string);
}
export declare class ButtonBar extends Disposable {
    private readonly container;
    private _buttons;
    constructor(container: HTMLElement);
    get buttons(): IButton[];
    addButton(options: IButtonOptions): IButton;
    addButtonWithDescription(options: IButtonOptions): IButtonWithDescription;
    addButtonWithDropdown(options: IButtonWithDropdownOptions): IButton;
    private pushButton;
}
