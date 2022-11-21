import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { IButtonStyles } from 'vs/base/browser/ui/button/button';
import { ICheckboxStyles } from 'vs/base/browser/ui/toggle/toggle';
import { Codicon } from 'vs/base/common/codicons';
import { Color } from 'vs/base/common/color';
import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!./dialog';
export interface IDialogInputOptions {
    readonly placeholder?: string;
    readonly type?: 'text' | 'password';
    readonly value?: string;
}
export interface IDialogOptions {
    readonly cancelId?: number;
    readonly detail?: string;
    readonly checkboxLabel?: string;
    readonly checkboxChecked?: boolean;
    readonly type?: 'none' | 'info' | 'error' | 'question' | 'warning' | 'pending';
    readonly inputs?: IDialogInputOptions[];
    readonly keyEventProcessor?: (event: StandardKeyboardEvent) => void;
    readonly renderBody?: (container: HTMLElement) => void;
    readonly icon?: Codicon;
    readonly buttonDetails?: string[];
    readonly disableCloseAction?: boolean;
    readonly disableDefaultAction?: boolean;
    readonly buttonStyles: IButtonStyles;
}
export interface IDialogResult {
    readonly button: number;
    readonly checkboxChecked?: boolean;
    readonly values?: string[];
}
export interface IDialogStyles extends ICheckboxStyles {
    readonly dialogForeground?: Color;
    readonly dialogBackground?: Color;
    readonly dialogShadow?: Color;
    readonly dialogBorder?: Color;
    readonly errorIconForeground?: Color;
    readonly warningIconForeground?: Color;
    readonly infoIconForeground?: Color;
    readonly inputBackground?: Color;
    readonly inputForeground?: Color;
    readonly inputBorder?: Color;
    readonly textLinkForeground?: Color;
}
export declare class Dialog extends Disposable {
    private container;
    private message;
    private readonly options;
    private readonly element;
    private readonly shadowElement;
    private modalElement;
    private readonly buttonsContainer;
    private readonly messageDetailElement;
    private readonly messageContainer;
    private readonly iconElement;
    private readonly checkbox;
    private readonly toolbarContainer;
    private buttonBar;
    private styles;
    private focusToReturn;
    private readonly inputs;
    private readonly buttons;
    private readonly buttonStyles;
    constructor(container: HTMLElement, message: string, buttons: string[] | undefined, options: IDialogOptions);
    private getIconAriaLabel;
    updateMessage(message: string): void;
    show(): Promise<IDialogResult>;
    private applyStyles;
    style(style: IDialogStyles): void;
    dispose(): void;
    private rearrangeButtons;
}
