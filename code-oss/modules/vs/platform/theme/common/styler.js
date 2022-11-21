/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Color } from 'vs/base/common/color';
import { activeContrastBorder, badgeBackground, badgeForeground, breadcrumbsActiveSelectionForeground, breadcrumbsBackground, breadcrumbsFocusForeground, breadcrumbsForeground, buttonBackground, buttonBorder, buttonForeground, buttonHoverBackground, buttonSecondaryBackground, buttonSecondaryForeground, buttonSecondaryHoverBackground, contrastBorder, editorWidgetBackground, editorWidgetBorder, editorWidgetForeground, focusBorder, inputActiveOptionBackground, inputActiveOptionBorder, inputActiveOptionForeground, inputBackground, inputBorder, inputForeground, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, inputValidationInfoBackground, inputValidationInfoBorder, inputValidationInfoForeground, inputValidationWarningBackground, inputValidationWarningBorder, inputValidationWarningForeground, listActiveSelectionBackground, listActiveSelectionForeground, listActiveSelectionIconForeground, listDropBackground, listFilterWidgetBackground, listFilterWidgetNoMatchesOutline, listFilterWidgetOutline, listFocusBackground, listFocusForeground, listFocusOutline, listHoverBackground, listHoverForeground, listInactiveFocusBackground, listInactiveFocusOutline, listInactiveSelectionBackground, listInactiveSelectionForeground, listInactiveSelectionIconForeground, menuBackground, menuBorder, menuForeground, menuSelectionBackground, menuSelectionBorder, menuSelectionForeground, menuSeparatorBackground, pickerGroupForeground, problemsErrorIconForeground, problemsInfoIconForeground, problemsWarningIconForeground, quickInputListFocusBackground, quickInputListFocusForeground, quickInputListFocusIconForeground, resolveColorValue, scrollbarShadow, scrollbarSliderActiveBackground, scrollbarSliderBackground, scrollbarSliderHoverBackground, selectBackground, selectBorder, selectForeground, selectListBackground, checkboxBackground, checkboxBorder, checkboxForeground, tableColumnsBorder, tableOddRowsBackgroundColor, textLinkForeground, treeIndentGuidesStroke, widgetShadow, listFocusAndSelectionOutline, listFilterWidgetShadow, buttonSeparator } from 'vs/platform/theme/common/colorRegistry';
import { isHighContrast } from 'vs/platform/theme/common/theme';
export function computeStyles(theme, styleMap) {
    const styles = Object.create(null);
    for (const key in styleMap) {
        const value = styleMap[key];
        if (value) {
            styles[key] = resolveColorValue(value, theme);
        }
    }
    return styles;
}
export function attachStyler(themeService, styleMap, widgetOrCallback) {
    function applyStyles() {
        const styles = computeStyles(themeService.getColorTheme(), styleMap);
        if (typeof widgetOrCallback === 'function') {
            widgetOrCallback(styles);
        }
        else {
            widgetOrCallback.style(styles);
        }
    }
    applyStyles();
    return themeService.onDidColorThemeChange(applyStyles);
}
export function attachToggleStyler(widget, themeService, style) {
    return attachStyler(themeService, {
        inputActiveOptionBorder: style?.inputActiveOptionBorderColor || inputActiveOptionBorder,
        inputActiveOptionForeground: style?.inputActiveOptionForegroundColor || inputActiveOptionForeground,
        inputActiveOptionBackground: style?.inputActiveOptionBackgroundColor || inputActiveOptionBackground
    }, widget);
}
export function attachBadgeStyler(widget, themeService, style) {
    return attachStyler(themeService, {
        badgeBackground: style?.badgeBackground || badgeBackground,
        badgeForeground: style?.badgeForeground || badgeForeground,
        badgeBorder: contrastBorder
    }, widget);
}
export function attachInputBoxStyler(widget, themeService, style) {
    return attachStyler(themeService, {
        inputBackground: style?.inputBackground || inputBackground,
        inputForeground: style?.inputForeground || inputForeground,
        inputBorder: style?.inputBorder || inputBorder,
        inputValidationInfoBorder: style?.inputValidationInfoBorder || inputValidationInfoBorder,
        inputValidationInfoBackground: style?.inputValidationInfoBackground || inputValidationInfoBackground,
        inputValidationInfoForeground: style?.inputValidationInfoForeground || inputValidationInfoForeground,
        inputValidationWarningBorder: style?.inputValidationWarningBorder || inputValidationWarningBorder,
        inputValidationWarningBackground: style?.inputValidationWarningBackground || inputValidationWarningBackground,
        inputValidationWarningForeground: style?.inputValidationWarningForeground || inputValidationWarningForeground,
        inputValidationErrorBorder: style?.inputValidationErrorBorder || inputValidationErrorBorder,
        inputValidationErrorBackground: style?.inputValidationErrorBackground || inputValidationErrorBackground,
        inputValidationErrorForeground: style?.inputValidationErrorForeground || inputValidationErrorForeground
    }, widget);
}
export function attachSelectBoxStyler(widget, themeService, style) {
    return attachStyler(themeService, {
        selectBackground: style?.selectBackground || selectBackground,
        selectListBackground: style?.selectListBackground || selectListBackground,
        selectForeground: style?.selectForeground || selectForeground,
        decoratorRightForeground: style?.pickerGroupForeground || pickerGroupForeground,
        selectBorder: style?.selectBorder || selectBorder,
        focusBorder: style?.focusBorder || focusBorder,
        listFocusBackground: style?.listFocusBackground || quickInputListFocusBackground,
        listInactiveSelectionIconForeground: style?.listInactiveSelectionIconForeground || quickInputListFocusIconForeground,
        listFocusForeground: style?.listFocusForeground || quickInputListFocusForeground,
        listFocusOutline: style?.listFocusOutline || ((theme) => isHighContrast(theme.type) ? activeContrastBorder : Color.transparent),
        listHoverBackground: style?.listHoverBackground || listHoverBackground,
        listHoverForeground: style?.listHoverForeground || listHoverForeground,
        listHoverOutline: style?.listFocusOutline || activeContrastBorder,
        selectListBorder: style?.selectListBorder || editorWidgetBorder
    }, widget);
}
export function attachFindReplaceInputBoxStyler(widget, themeService, style) {
    return attachStyler(themeService, {
        inputBackground: style?.inputBackground || inputBackground,
        inputForeground: style?.inputForeground || inputForeground,
        inputBorder: style?.inputBorder || inputBorder,
        inputActiveOptionBorder: style?.inputActiveOptionBorder || inputActiveOptionBorder,
        inputActiveOptionForeground: style?.inputActiveOptionForeground || inputActiveOptionForeground,
        inputActiveOptionBackground: style?.inputActiveOptionBackground || inputActiveOptionBackground,
        inputValidationInfoBorder: style?.inputValidationInfoBorder || inputValidationInfoBorder,
        inputValidationInfoBackground: style?.inputValidationInfoBackground || inputValidationInfoBackground,
        inputValidationInfoForeground: style?.inputValidationInfoForeground || inputValidationInfoForeground,
        inputValidationWarningBorder: style?.inputValidationWarningBorder || inputValidationWarningBorder,
        inputValidationWarningBackground: style?.inputValidationWarningBackground || inputValidationWarningBackground,
        inputValidationWarningForeground: style?.inputValidationWarningForeground || inputValidationWarningForeground,
        inputValidationErrorBorder: style?.inputValidationErrorBorder || inputValidationErrorBorder,
        inputValidationErrorBackground: style?.inputValidationErrorBackground || inputValidationErrorBackground,
        inputValidationErrorForeground: style?.inputValidationErrorForeground || inputValidationErrorForeground
    }, widget);
}
export function attachListStyler(widget, themeService, overrides) {
    return attachStyler(themeService, { ...defaultListStyles, ...(overrides || {}) }, widget);
}
export const defaultListStyles = {
    listFocusBackground,
    listFocusForeground,
    listFocusOutline,
    listActiveSelectionBackground,
    listActiveSelectionForeground,
    listActiveSelectionIconForeground,
    listFocusAndSelectionOutline,
    listFocusAndSelectionBackground: listActiveSelectionBackground,
    listFocusAndSelectionForeground: listActiveSelectionForeground,
    listInactiveSelectionBackground,
    listInactiveSelectionIconForeground,
    listInactiveSelectionForeground,
    listInactiveFocusBackground,
    listInactiveFocusOutline,
    listHoverBackground,
    listHoverForeground,
    listDropBackground,
    listSelectionOutline: activeContrastBorder,
    listHoverOutline: activeContrastBorder,
    listFilterWidgetBackground,
    listFilterWidgetOutline,
    listFilterWidgetNoMatchesOutline,
    listFilterWidgetShadow,
    treeIndentGuidesStroke,
    tableColumnsBorder,
    tableOddRowsBackgroundColor,
    inputActiveOptionBorder,
    inputActiveOptionForeground,
    inputActiveOptionBackground,
    inputBackground,
    inputForeground,
    inputBorder,
    inputValidationInfoBackground,
    inputValidationInfoForeground,
    inputValidationInfoBorder,
    inputValidationWarningBackground,
    inputValidationWarningForeground,
    inputValidationWarningBorder,
    inputValidationErrorBackground,
    inputValidationErrorForeground,
    inputValidationErrorBorder,
};
export function attachStylerCallback(themeService, colors, callback) {
    return attachStyler(themeService, colors, callback);
}
export const defaultBreadcrumbsStyles = {
    breadcrumbsBackground: breadcrumbsBackground,
    breadcrumbsForeground: breadcrumbsForeground,
    breadcrumbsHoverForeground: breadcrumbsFocusForeground,
    breadcrumbsFocusForeground: breadcrumbsFocusForeground,
    breadcrumbsFocusAndSelectionForeground: breadcrumbsActiveSelectionForeground,
};
export function attachBreadcrumbsStyler(widget, themeService, style) {
    return attachStyler(themeService, { ...defaultBreadcrumbsStyles, ...style }, widget);
}
export const defaultMenuStyles = {
    shadowColor: widgetShadow,
    borderColor: menuBorder,
    foregroundColor: menuForeground,
    backgroundColor: menuBackground,
    selectionForegroundColor: menuSelectionForeground,
    selectionBackgroundColor: menuSelectionBackground,
    selectionBorderColor: menuSelectionBorder,
    separatorColor: menuSeparatorBackground,
    scrollbarShadow: scrollbarShadow,
    scrollbarSliderBackground: scrollbarSliderBackground,
    scrollbarSliderHoverBackground: scrollbarSliderHoverBackground,
    scrollbarSliderActiveBackground: scrollbarSliderActiveBackground
};
export function attachMenuStyler(widget, themeService, style) {
    return attachStyler(themeService, { ...defaultMenuStyles, ...style }, widget);
}
export const defaultDialogStyles = {
    dialogBackground: editorWidgetBackground,
    dialogForeground: editorWidgetForeground,
    dialogShadow: widgetShadow,
    dialogBorder: contrastBorder,
    buttonForeground: buttonForeground,
    buttonSeparator: buttonSeparator,
    buttonBackground: buttonBackground,
    buttonSecondaryBackground: buttonSecondaryBackground,
    buttonSecondaryForeground: buttonSecondaryForeground,
    buttonSecondaryHoverBackground: buttonSecondaryHoverBackground,
    buttonHoverBackground: buttonHoverBackground,
    buttonBorder: buttonBorder,
    checkboxBorder: checkboxBorder,
    checkboxBackground: checkboxBackground,
    checkboxForeground: checkboxForeground,
    errorIconForeground: problemsErrorIconForeground,
    warningIconForeground: problemsWarningIconForeground,
    infoIconForeground: problemsInfoIconForeground,
    inputBackground: inputBackground,
    inputForeground: inputForeground,
    inputBorder: inputBorder,
    textLinkForeground: textLinkForeground
};
export function attachDialogStyler(widget, themeService, style) {
    return attachStyler(themeService, { ...defaultDialogStyles, ...style }, widget);
}
