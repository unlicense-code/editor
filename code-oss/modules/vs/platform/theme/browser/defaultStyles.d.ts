import { IButtonStyles } from 'vs/base/browser/ui/button/button';
import { IKeybindingLabelStyles } from 'vs/base/browser/ui/keybindingLabel/keybindingLabel';
import { ColorIdentifier } from 'vs/platform/theme/common/colorRegistry';
import { IProgressBarStyles } from 'vs/base/browser/ui/progressbar/progressbar';
import { IStyleOverrides } from 'vs/platform/theme/common/styler';
export interface IKeybindingLabelStyleOverrides extends IStyleOverrides {
    keybindingLabelBackground?: ColorIdentifier;
    keybindingLabelForeground?: ColorIdentifier;
    keybindingLabelBorder?: ColorIdentifier;
    keybindingLabelBottomBorder?: ColorIdentifier;
    keybindingLabelShadow?: ColorIdentifier;
}
export declare function getKeybindingLabelStyles(style?: IKeybindingLabelStyleOverrides): IKeybindingLabelStyles;
export interface IButtonStyleOverrides extends IStyleOverrides {
    readonly buttonForeground?: ColorIdentifier;
    readonly buttonSeparator?: ColorIdentifier;
    readonly buttonBackground?: ColorIdentifier;
    readonly buttonHoverBackground?: ColorIdentifier;
    readonly buttonSecondaryForeground?: ColorIdentifier;
    readonly buttonSecondaryBackground?: ColorIdentifier;
    readonly buttonSecondaryHoverBackground?: ColorIdentifier;
    readonly buttonBorder?: ColorIdentifier;
}
export declare const defaultButtonStyles: IButtonStyles;
export declare function getButtonStyles(style: IButtonStyleOverrides): IButtonStyles;
export interface IProgressBarStyleOverrides extends IStyleOverrides {
    progressBarBackground?: ColorIdentifier;
}
export declare function getProgressBarStyles(style?: IProgressBarStyleOverrides): IProgressBarStyles;
