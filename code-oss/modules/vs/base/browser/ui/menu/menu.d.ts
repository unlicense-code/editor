import { ActionBar, IActionViewItemProvider } from 'vs/base/browser/ui/actionbar/actionbar';
import { AnchorAlignment } from 'vs/base/browser/ui/contextview/contextview';
import { IAction, IActionRunner } from 'vs/base/common/actions';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { ResolvedKeybinding } from 'vs/base/common/keybindings';
import { ScrollEvent } from 'vs/base/common/scrollable';
export declare const MENU_MNEMONIC_REGEX: RegExp;
export declare const MENU_ESCAPED_MNEMONIC_REGEX: RegExp;
export declare enum Direction {
    Right = 0,
    Left = 1
}
export interface IMenuOptions {
    context?: unknown;
    actionViewItemProvider?: IActionViewItemProvider;
    actionRunner?: IActionRunner;
    getKeyBinding?: (action: IAction) => ResolvedKeybinding | undefined;
    ariaLabel?: string;
    enableMnemonics?: boolean;
    anchorAlignment?: AnchorAlignment;
    expandDirection?: Direction;
    useEventAsContext?: boolean;
    submenuIds?: Set<string>;
}
export interface IMenuStyles {
    shadowColor?: Color;
    borderColor?: Color;
    foregroundColor?: Color;
    backgroundColor?: Color;
    selectionForegroundColor?: Color;
    selectionBackgroundColor?: Color;
    selectionBorderColor?: Color;
    separatorColor?: Color;
    scrollbarShadow?: Color;
    scrollbarSliderBackground?: Color;
    scrollbarSliderHoverBackground?: Color;
    scrollbarSliderActiveBackground?: Color;
}
export declare class Menu extends ActionBar {
    private mnemonics;
    private readonly menuDisposables;
    private scrollableElement;
    private menuElement;
    static globalStyleSheet: HTMLStyleElement;
    protected styleSheet: HTMLStyleElement | undefined;
    constructor(container: HTMLElement, actions: ReadonlyArray<IAction>, options?: IMenuOptions);
    private initializeOrUpdateStyleSheet;
    style(style: IMenuStyles): void;
    getContainer(): HTMLElement;
    get onScroll(): Event<ScrollEvent>;
    get scrollOffset(): number;
    trigger(index: number): void;
    private focusItemByElement;
    private setFocusedItem;
    protected updateFocus(fromRight?: boolean): void;
    private doGetActionViewItem;
}
export declare function cleanMnemonic(label: string): string;
