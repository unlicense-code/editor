import { IHistoryNavigationWidget } from 'vs/base/browser/history';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { Widget } from 'vs/base/browser/ui/widget';
import { IAction } from 'vs/base/common/actions';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import 'vs/css!./inputBox';
export interface IInputOptions extends IInputBoxStyles {
    readonly placeholder?: string;
    readonly showPlaceholderOnFocus?: boolean;
    readonly tooltip?: string;
    readonly ariaLabel?: string;
    readonly type?: string;
    readonly validationOptions?: IInputValidationOptions;
    readonly flexibleHeight?: boolean;
    readonly flexibleWidth?: boolean;
    readonly flexibleMaxHeight?: number;
    readonly actions?: ReadonlyArray<IAction>;
}
export interface IInputBoxStyles {
    readonly inputBackground?: Color;
    readonly inputForeground?: Color;
    readonly inputBorder?: Color;
    readonly inputValidationInfoBorder?: Color;
    readonly inputValidationInfoBackground?: Color;
    readonly inputValidationInfoForeground?: Color;
    readonly inputValidationWarningBorder?: Color;
    readonly inputValidationWarningBackground?: Color;
    readonly inputValidationWarningForeground?: Color;
    readonly inputValidationErrorBorder?: Color;
    readonly inputValidationErrorBackground?: Color;
    readonly inputValidationErrorForeground?: Color;
}
export interface IInputValidator {
    (value: string): IMessage | null;
}
export interface IMessage {
    readonly content?: string;
    readonly formatContent?: boolean;
    readonly type?: MessageType;
}
export interface IInputValidationOptions {
    validation?: IInputValidator;
}
export declare const enum MessageType {
    INFO = 1,
    WARNING = 2,
    ERROR = 3
}
export interface IRange {
    start: number;
    end: number;
}
export declare class InputBox extends Widget {
    private contextViewProvider?;
    element: HTMLElement;
    protected input: HTMLInputElement;
    private actionbar?;
    private options;
    private message;
    protected placeholder: string;
    private tooltip;
    private ariaLabel;
    private validation?;
    private state;
    private mirror;
    private cachedHeight;
    private cachedContentHeight;
    private maxHeight;
    private scrollableElement;
    private inputBackground?;
    private inputForeground?;
    private inputBorder?;
    private inputValidationInfoBorder?;
    private inputValidationInfoBackground?;
    private inputValidationInfoForeground?;
    private inputValidationWarningBorder?;
    private inputValidationWarningBackground?;
    private inputValidationWarningForeground?;
    private inputValidationErrorBorder?;
    private inputValidationErrorBackground?;
    private inputValidationErrorForeground?;
    private _onDidChange;
    readonly onDidChange: Event<string>;
    private _onDidHeightChange;
    readonly onDidHeightChange: Event<number>;
    constructor(container: HTMLElement, contextViewProvider: IContextViewProvider | undefined, options?: IInputOptions);
    protected onBlur(): void;
    protected onFocus(): void;
    setPlaceHolder(placeHolder: string): void;
    setTooltip(tooltip: string): void;
    setAriaLabel(label: string): void;
    getAriaLabel(): string;
    get mirrorElement(): HTMLElement | undefined;
    get inputElement(): HTMLInputElement;
    get value(): string;
    set value(newValue: string);
    get height(): number;
    focus(): void;
    blur(): void;
    hasFocus(): boolean;
    select(range?: IRange | null): void;
    isSelectionAtEnd(): boolean;
    enable(): void;
    disable(): void;
    setEnabled(enabled: boolean): void;
    get width(): number;
    set width(width: number);
    set paddingRight(paddingRight: number);
    private updateScrollDimensions;
    showMessage(message: IMessage, force?: boolean): void;
    hideMessage(): void;
    isInputValid(): boolean;
    validate(): MessageType | undefined;
    stylesForType(type: MessageType | undefined): {
        border: Color | undefined;
        background: Color | undefined;
        foreground: Color | undefined;
    };
    private classForType;
    private _showMessage;
    private _hideMessage;
    private onValueChange;
    private updateMirror;
    style(styles: IInputBoxStyles): void;
    protected applyStyles(): void;
    layout(): void;
    insertAtCursor(text: string): void;
    dispose(): void;
}
export interface IHistoryInputOptions extends IInputOptions {
    history: string[];
    readonly showHistoryHint?: () => boolean;
}
export declare class HistoryInputBox extends InputBox implements IHistoryNavigationWidget {
    private readonly history;
    private observer;
    private readonly _onDidFocus;
    readonly onDidFocus: Event<void>;
    private readonly _onDidBlur;
    readonly onDidBlur: Event<void>;
    constructor(container: HTMLElement, contextViewProvider: IContextViewProvider | undefined, options: IHistoryInputOptions);
    dispose(): void;
    addToHistory(): void;
    getHistory(): string[];
    showNextValue(): void;
    showPreviousValue(): void;
    clearHistory(): void;
    protected onBlur(): void;
    protected onFocus(): void;
    private getCurrentValue;
    private getPreviousValue;
    private getNextValue;
}
