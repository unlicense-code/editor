import { IContentActionHandler } from 'vs/base/browser/formattedTextRenderer';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { IListStyles } from 'vs/base/browser/ui/list/listWidget';
import { Widget } from 'vs/base/browser/ui/widget';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IThemable } from 'vs/base/common/styler';
import 'vs/css!./selectBox';
export interface ISelectBoxDelegate extends IDisposable {
    readonly onDidSelect: Event<ISelectData>;
    setOptions(options: ISelectOptionItem[], selected?: number): void;
    select(index: number): void;
    setAriaLabel(label: string): void;
    focus(): void;
    blur(): void;
    setFocusable(focus: boolean): void;
    render(container: HTMLElement): void;
    style(styles: ISelectBoxStyles): void;
    applyStyles(): void;
}
export interface ISelectBoxOptions {
    useCustomDrawn?: boolean;
    ariaLabel?: string;
    ariaDescription?: string;
    minBottomMargin?: number;
    optionsAsChildren?: boolean;
}
export interface ISelectOptionItem {
    text: string;
    detail?: string;
    decoratorRight?: string;
    description?: string;
    descriptionIsMarkdown?: boolean;
    descriptionMarkdownActionHandler?: IContentActionHandler;
    isDisabled?: boolean;
}
export interface ISelectBoxStyles extends IListStyles {
    selectBackground?: Color;
    selectListBackground?: Color;
    selectForeground?: Color;
    decoratorRightForeground?: Color;
    selectBorder?: Color;
    selectListBorder?: Color;
    focusBorder?: Color;
}
export declare const defaultStyles: {
    selectBackground: Color;
    selectForeground: Color;
    selectBorder: Color;
};
export interface ISelectData {
    selected: string;
    index: number;
}
export declare class SelectBox extends Widget implements ISelectBoxDelegate, IThemable {
    private selectBoxDelegate;
    constructor(options: ISelectOptionItem[], selected: number, contextViewProvider: IContextViewProvider, styles?: ISelectBoxStyles, selectBoxOptions?: ISelectBoxOptions);
    get onDidSelect(): Event<ISelectData>;
    setOptions(options: ISelectOptionItem[], selected?: number): void;
    select(index: number): void;
    setAriaLabel(label: string): void;
    focus(): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    render(container: HTMLElement): void;
    style(styles: ISelectBoxStyles): void;
    applyStyles(): void;
}
