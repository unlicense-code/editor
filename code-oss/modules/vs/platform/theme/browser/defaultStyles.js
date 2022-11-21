import { keybindingLabelBackground, keybindingLabelBorder, keybindingLabelBottomBorder, keybindingLabelForeground, asCssValue, widgetShadow, buttonForeground, buttonSeparator, buttonBackground, buttonHoverBackground, buttonSecondaryForeground, buttonSecondaryBackground, buttonSecondaryHoverBackground, buttonBorder, progressBarBackground } from 'vs/platform/theme/common/colorRegistry';
export function getKeybindingLabelStyles(style) {
    return {
        keybindingLabelBackground: asCssValue(style?.keybindingLabelBackground || keybindingLabelBackground),
        keybindingLabelForeground: asCssValue(style?.keybindingLabelForeground || keybindingLabelForeground),
        keybindingLabelBorder: asCssValue(style?.keybindingLabelBorder || keybindingLabelBorder),
        keybindingLabelBottomBorder: asCssValue(style?.keybindingLabelBottomBorder || keybindingLabelBottomBorder),
        keybindingLabelShadow: asCssValue(style?.keybindingLabelShadow || widgetShadow)
    };
}
export const defaultButtonStyles = getButtonStyles({});
export function getButtonStyles(style) {
    return {
        buttonForeground: asCssValue(style.buttonForeground || buttonForeground),
        buttonSeparator: asCssValue(style.buttonSeparator || buttonSeparator),
        buttonBackground: asCssValue(style.buttonBackground || buttonBackground),
        buttonHoverBackground: asCssValue(style.buttonHoverBackground || buttonHoverBackground),
        buttonSecondaryForeground: asCssValue(style.buttonSecondaryForeground || buttonSecondaryForeground),
        buttonSecondaryBackground: asCssValue(style.buttonSecondaryBackground || buttonSecondaryBackground),
        buttonSecondaryHoverBackground: asCssValue(style.buttonSecondaryHoverBackground || buttonSecondaryHoverBackground),
        buttonBorder: asCssValue(style.buttonBorder || buttonBorder),
    };
}
export function getProgressBarStyles(style) {
    return {
        progressBarBackground: asCssValue(style?.progressBarBackground || progressBarBackground)
    };
}
