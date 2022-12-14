import { Color } from 'vs/base/common/color';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IThemable, styleFn } from 'vs/base/common/styler';
import { ColorIdentifier, ColorTransform, ColorValue } from 'vs/platform/theme/common/colorRegistry';
import { IColorTheme, IThemeService } from 'vs/platform/theme/common/themeService';
export interface IStyleOverrides {
    [color: string]: ColorIdentifier | undefined;
}
export interface IColorMapping {
    [optionsKey: string]: ColorValue | undefined;
}
export interface IComputedStyles {
    [color: string]: Color | undefined;
}
export declare function computeStyles(theme: IColorTheme, styleMap: IColorMapping): IComputedStyles;
export declare function attachStyler<T extends IColorMapping>(themeService: IThemeService, styleMap: T, widgetOrCallback: IThemable | styleFn): IDisposable;
export interface IToggleStyleOverrides extends IStyleOverrides {
    inputActiveOptionBorderColor?: ColorIdentifier;
    inputActiveOptionForegroundColor?: ColorIdentifier;
    inputActiveOptionBackgroundColor?: ColorIdentifier;
}
export declare function attachToggleStyler(widget: IThemable, themeService: IThemeService, style?: IToggleStyleOverrides): IDisposable;
export interface IBadgeStyleOverrides extends IStyleOverrides {
    badgeBackground?: ColorIdentifier;
    badgeForeground?: ColorIdentifier;
}
export declare function attachBadgeStyler(widget: IThemable, themeService: IThemeService, style?: IBadgeStyleOverrides): IDisposable;
export interface IInputBoxStyleOverrides extends IStyleOverrides {
    inputBackground?: ColorIdentifier;
    inputForeground?: ColorIdentifier;
    inputBorder?: ColorIdentifier;
    inputActiveOptionBorder?: ColorIdentifier;
    inputActiveOptionForeground?: ColorIdentifier;
    inputActiveOptionBackground?: ColorIdentifier;
    inputValidationInfoBorder?: ColorIdentifier;
    inputValidationInfoBackground?: ColorIdentifier;
    inputValidationInfoForeground?: ColorIdentifier;
    inputValidationWarningBorder?: ColorIdentifier;
    inputValidationWarningBackground?: ColorIdentifier;
    inputValidationWarningForeground?: ColorIdentifier;
    inputValidationErrorBorder?: ColorIdentifier;
    inputValidationErrorBackground?: ColorIdentifier;
    inputValidationErrorForeground?: ColorIdentifier;
}
export declare function attachInputBoxStyler(widget: IThemable, themeService: IThemeService, style?: IInputBoxStyleOverrides): IDisposable;
export interface ISelectBoxStyleOverrides extends IStyleOverrides, IListStyleOverrides {
    selectBackground?: ColorIdentifier;
    selectListBackground?: ColorIdentifier;
    selectForeground?: ColorIdentifier;
    decoratorRightForeground?: ColorIdentifier;
    selectBorder?: ColorIdentifier;
    focusBorder?: ColorIdentifier;
}
export declare function attachSelectBoxStyler(widget: IThemable, themeService: IThemeService, style?: ISelectBoxStyleOverrides): IDisposable;
export declare function attachFindReplaceInputBoxStyler(widget: IThemable, themeService: IThemeService, style?: IInputBoxStyleOverrides): IDisposable;
export interface IListStyleOverrides extends IStyleOverrides {
    listBackground?: ColorIdentifier;
    listFocusBackground?: ColorIdentifier;
    listFocusForeground?: ColorIdentifier;
    listFocusOutline?: ColorIdentifier;
    listActiveSelectionBackground?: ColorIdentifier;
    listActiveSelectionForeground?: ColorIdentifier;
    listActiveSelectionIconForeground?: ColorIdentifier;
    listFocusAndSelectionOutline?: ColorIdentifier;
    listFocusAndSelectionBackground?: ColorIdentifier;
    listFocusAndSelectionForeground?: ColorIdentifier;
    listInactiveSelectionBackground?: ColorIdentifier;
    listInactiveSelectionIconForeground?: ColorIdentifier;
    listInactiveSelectionForeground?: ColorIdentifier;
    listInactiveFocusBackground?: ColorIdentifier;
    listInactiveFocusOutline?: ColorIdentifier;
    listHoverBackground?: ColorIdentifier;
    listHoverForeground?: ColorIdentifier;
    listDropBackground?: ColorIdentifier;
    listSelectionOutline?: ColorIdentifier;
    listHoverOutline?: ColorIdentifier;
    listFilterWidgetBackground?: ColorIdentifier;
    listFilterWidgetOutline?: ColorIdentifier;
    listFilterWidgetNoMatchesOutline?: ColorIdentifier;
    listFilterWidgetShadow?: ColorIdentifier;
    treeIndentGuidesStroke?: ColorIdentifier;
    tableColumnsBorder?: ColorIdentifier;
    tableOddRowsBackgroundColor?: ColorIdentifier;
}
export declare function attachListStyler(widget: IThemable, themeService: IThemeService, overrides?: IColorMapping): IDisposable;
export declare const defaultListStyles: IColorMapping;
export declare function attachStylerCallback(themeService: IThemeService, colors: {
    [name: string]: ColorIdentifier;
}, callback: styleFn): IDisposable;
export interface IBreadcrumbsWidgetStyleOverrides extends IColorMapping {
    breadcrumbsBackground?: ColorIdentifier | ColorTransform;
    breadcrumbsForeground?: ColorIdentifier;
    breadcrumbsHoverForeground?: ColorIdentifier;
    breadcrumbsFocusForeground?: ColorIdentifier;
    breadcrumbsFocusAndSelectionForeground?: ColorIdentifier;
}
export declare const defaultBreadcrumbsStyles: IBreadcrumbsWidgetStyleOverrides;
export declare function attachBreadcrumbsStyler(widget: IThemable, themeService: IThemeService, style?: IBreadcrumbsWidgetStyleOverrides): IDisposable;
export interface IMenuStyleOverrides extends IColorMapping {
    shadowColor?: ColorIdentifier;
    borderColor?: ColorIdentifier;
    foregroundColor?: ColorIdentifier;
    backgroundColor?: ColorIdentifier;
    selectionForegroundColor?: ColorIdentifier;
    selectionBackgroundColor?: ColorIdentifier;
    selectionBorderColor?: ColorIdentifier;
    separatorColor?: ColorIdentifier;
}
export declare const defaultMenuStyles: IMenuStyleOverrides;
export declare function attachMenuStyler(widget: IThemable, themeService: IThemeService, style?: IMenuStyleOverrides): IDisposable;
interface IButtonStyleOverrides extends IStyleOverrides {
    buttonForeground?: ColorIdentifier;
    buttonSeparator?: ColorIdentifier;
    buttonBackground?: ColorIdentifier;
    buttonHoverBackground?: ColorIdentifier;
    buttonSecondaryForeground?: ColorIdentifier;
    buttonSecondaryBackground?: ColorIdentifier;
    buttonSecondaryHoverBackground?: ColorIdentifier;
    buttonBorder?: ColorIdentifier;
}
export interface IDialogStyleOverrides extends IButtonStyleOverrides {
    dialogForeground?: ColorIdentifier;
    dialogBackground?: ColorIdentifier;
    dialogShadow?: ColorIdentifier;
    dialogBorder?: ColorIdentifier;
    checkboxBorder?: ColorIdentifier;
    checkboxBackground?: ColorIdentifier;
    checkboxForeground?: ColorIdentifier;
    errorIconForeground?: ColorIdentifier;
    warningIconForeground?: ColorIdentifier;
    infoIconForeground?: ColorIdentifier;
    inputBackground?: ColorIdentifier;
    inputForeground?: ColorIdentifier;
    inputBorder?: ColorIdentifier;
}
export declare const defaultDialogStyles: IDialogStyleOverrides;
export declare function attachDialogStyler(widget: IThemable, themeService: IThemeService, style?: IDialogStyleOverrides): IDisposable;
export {};
