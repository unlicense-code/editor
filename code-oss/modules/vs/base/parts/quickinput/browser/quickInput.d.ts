import * as dom from 'vs/base/browser/dom';
import { IButtonStyles } from 'vs/base/browser/ui/button/button';
import { ICountBadgetyles } from 'vs/base/browser/ui/countBadge/countBadge';
import { IInputBoxStyles } from 'vs/base/browser/ui/inputbox/inputBox';
import { IKeybindingLabelStyles } from 'vs/base/browser/ui/keybindingLabel/keybindingLabel';
import { IListRenderer, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IListOptions, IListStyles, List } from 'vs/base/browser/ui/list/listWidget';
import { IProgressBarStyles } from 'vs/base/browser/ui/progressbar/progressbar';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInputBox, IInputOptions, IKeyMods, IPickOptions, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, QuickInputHideReason, QuickPickInput } from 'vs/base/parts/quickinput/common/quickInput';
import 'vs/css!./media/quickInput';
export interface IQuickInputOptions {
    idPrefix: string;
    container: HTMLElement;
    ignoreFocusOut(): boolean;
    isScreenReaderOptimized(): boolean;
    backKeybindingLabel(): string | undefined;
    setContextKey(id?: string): void;
    returnFocus(): void;
    createList<T>(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: IListRenderer<T, any>[], options: IListOptions<T>): List<T>;
    styles: IQuickInputStyles;
}
export interface IQuickInputStyles {
    widget: IQuickInputWidgetStyles;
    inputBox: IInputBoxStyles;
    countBadge: ICountBadgetyles;
    button: IButtonStyles;
    progressBar: IProgressBarStyles;
    keybindingLabel: IKeybindingLabelStyles;
    list: IListStyles & {
        pickerGroupBorder?: Color;
        pickerGroupForeground?: Color;
    };
}
export interface IQuickInputWidgetStyles {
    quickInputBackground?: Color;
    quickInputForeground?: Color;
    quickInputTitleBackground?: Color;
    contrastBorder?: Color;
    widgetShadow?: Color;
}
export declare class QuickInputController extends Disposable {
    private options;
    private static readonly MAX_WIDTH;
    private idPrefix;
    private ui;
    private dimension?;
    private titleBarOffset?;
    private comboboxAccessibility;
    private enabled;
    private readonly onDidAcceptEmitter;
    private readonly onDidCustomEmitter;
    private readonly onDidTriggerButtonEmitter;
    private keyMods;
    private controller;
    private parentElement;
    private styles;
    private onShowEmitter;
    readonly onShow: Event<void>;
    private onHideEmitter;
    readonly onHide: Event<void>;
    private previousFocusElement?;
    constructor(options: IQuickInputOptions);
    private registerKeyModsListeners;
    private getUI;
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: O, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    private setValidationOnInput;
    input(options?: IInputOptions, token?: CancellationToken): Promise<string | undefined>;
    backButton: {
        iconClass: string;
        tooltip: string;
        handle: number;
    };
    createQuickPick<T extends IQuickPickItem>(): IQuickPick<T>;
    createInputBox(): IInputBox;
    private show;
    private setVisibilities;
    private setComboboxAccessibility;
    private setEnabled;
    hide(reason?: QuickInputHideReason): void;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    accept(keyMods?: IKeyMods): Promise<void>;
    back(): Promise<void>;
    cancel(): Promise<void>;
    layout(dimension: dom.IDimension, titleBarOffset: number): void;
    private updateLayout;
    applyStyles(styles: IQuickInputStyles): void;
    private updateStyles;
    private isDisplayed;
}
