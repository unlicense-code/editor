import { IKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { BaseActionViewItem, IActionViewItemOptions } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { Widget } from 'vs/base/browser/ui/widget';
import { IAction } from 'vs/base/common/actions';
import { CSSIcon } from 'vs/base/common/codicons';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import 'vs/css!./toggle';
export interface IToggleOpts extends IToggleStyles {
    readonly actionClassName?: string;
    readonly icon?: CSSIcon;
    readonly title: string;
    readonly isChecked: boolean;
    readonly notFocusable?: boolean;
}
export interface IToggleStyles {
    inputActiveOptionBorder?: Color;
    inputActiveOptionForeground?: Color;
    inputActiveOptionBackground?: Color;
}
export interface ICheckboxStyles {
    checkboxBackground?: Color;
    checkboxBorder?: Color;
    checkboxForeground?: Color;
}
export declare class ToggleActionViewItem extends BaseActionViewItem {
    protected readonly toggle: Toggle;
    constructor(context: any, action: IAction, options: IActionViewItemOptions | undefined);
    render(container: HTMLElement): void;
    protected updateEnabled(): void;
    protected updateChecked(): void;
    focus(): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
}
export declare class Toggle extends Widget {
    private readonly _onChange;
    readonly onChange: Event<boolean>;
    private readonly _onKeyDown;
    readonly onKeyDown: Event<IKeyboardEvent>;
    private readonly _opts;
    private _icon;
    readonly domNode: HTMLElement;
    private _checked;
    constructor(opts: IToggleOpts);
    get enabled(): boolean;
    focus(): void;
    get checked(): boolean;
    set checked(newIsChecked: boolean);
    setIcon(icon: CSSIcon | undefined): void;
    width(): number;
    style(styles: IToggleStyles): void;
    protected applyStyles(): void;
    enable(): void;
    disable(): void;
    setTitle(newTitle: string): void;
}
export declare class Checkbox extends Widget {
    private title;
    private isChecked;
    private checkbox;
    private styles;
    readonly domNode: HTMLElement;
    constructor(title: string, isChecked: boolean);
    get checked(): boolean;
    set checked(newIsChecked: boolean);
    focus(): void;
    hasFocus(): boolean;
    style(styles: ICheckboxStyles): void;
    protected applyStyles(): void;
}
