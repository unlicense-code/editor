import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { IColorTheme } from 'vs/platform/theme/common/themeService';
export declare type ColorIdentifier = string;
export interface ColorContribution {
    readonly id: ColorIdentifier;
    readonly description: string;
    readonly defaults: ColorDefaults | null;
    readonly needsTransparency: boolean;
    readonly deprecationMessage: string | undefined;
}
/**
 * Returns the css variable name for the given color identifier. Dots (`.`) are replaced with hyphens (`-`) and
 * everything is prefixed with `--vscode-`.
 *
 * @sample `editorSuggestWidget.background` is `--vscode-editorSuggestWidget-background`.
 */
export declare function asCssVariableName(colorIdent: ColorIdentifier): string;
export declare function asCssValue(color: ColorIdentifier): string;
export declare const enum ColorTransformType {
    Darken = 0,
    Lighten = 1,
    Transparent = 2,
    OneOf = 3,
    LessProminent = 4,
    IfDefinedThenElse = 5
}
export declare type ColorTransform = {
    op: ColorTransformType.Darken;
    value: ColorValue;
    factor: number;
} | {
    op: ColorTransformType.Lighten;
    value: ColorValue;
    factor: number;
} | {
    op: ColorTransformType.Transparent;
    value: ColorValue;
    factor: number;
} | {
    op: ColorTransformType.OneOf;
    values: readonly ColorValue[];
} | {
    op: ColorTransformType.LessProminent;
    value: ColorValue;
    background: ColorValue;
    factor: number;
    transparency: number;
} | {
    op: ColorTransformType.IfDefinedThenElse;
    if: ColorIdentifier;
    then: ColorValue;
    else: ColorValue;
};
export interface ColorDefaults {
    light: ColorValue | null;
    dark: ColorValue | null;
    hcDark: ColorValue | null;
    hcLight: ColorValue | null;
}
/**
 * A Color Value is either a color literal, a reference to an other color or a derived color
 */
export declare type ColorValue = Color | string | ColorIdentifier | ColorTransform;
export declare const Extensions: {
    ColorContribution: string;
};
export interface IColorRegistry {
    readonly onDidChangeSchema: Event<void>;
    /**
     * Register a color to the registry.
     * @param id The color id as used in theme description files
     * @param defaults The default values
     * @description the description
     */
    registerColor(id: string, defaults: ColorDefaults, description: string): ColorIdentifier;
    /**
     * Register a color to the registry.
     */
    deregisterColor(id: string): void;
    /**
     * Get all color contributions
     */
    getColors(): ColorContribution[];
    /**
     * Gets the default color of the given id
     */
    resolveDefaultColor(id: ColorIdentifier, theme: IColorTheme): Color | undefined;
    /**
     * JSON schema for an object to assign color values to one of the color contributions.
     */
    getColorSchema(): IJSONSchema;
    /**
     * JSON schema to for a reference to a color contribution.
     */
    getColorReferenceSchema(): IJSONSchema;
}
export declare function registerColor(id: string, defaults: ColorDefaults | null, description: string, needsTransparency?: boolean, deprecationMessage?: string): ColorIdentifier;
export declare function getColorRegistry(): IColorRegistry;
export declare const foreground: string;
export declare const disabledForeground: string;
export declare const errorForeground: string;
export declare const descriptionForeground: string;
export declare const iconForeground: string;
export declare const focusBorder: string;
export declare const contrastBorder: string;
export declare const activeContrastBorder: string;
export declare const selectionBackground: string;
export declare const textSeparatorForeground: string;
export declare const textLinkForeground: string;
export declare const textLinkActiveForeground: string;
export declare const textPreformatForeground: string;
export declare const textBlockQuoteBackground: string;
export declare const textBlockQuoteBorder: string;
export declare const textCodeBlockBackground: string;
export declare const widgetShadow: string;
export declare const inputBackground: string;
export declare const inputForeground: string;
export declare const inputBorder: string;
export declare const inputActiveOptionBorder: string;
export declare const inputActiveOptionHoverBackground: string;
export declare const inputActiveOptionBackground: string;
export declare const inputActiveOptionForeground: string;
export declare const inputPlaceholderForeground: string;
export declare const inputValidationInfoBackground: string;
export declare const inputValidationInfoForeground: string;
export declare const inputValidationInfoBorder: string;
export declare const inputValidationWarningBackground: string;
export declare const inputValidationWarningForeground: string;
export declare const inputValidationWarningBorder: string;
export declare const inputValidationErrorBackground: string;
export declare const inputValidationErrorForeground: string;
export declare const inputValidationErrorBorder: string;
export declare const selectBackground: string;
export declare const selectListBackground: string;
export declare const selectForeground: string;
export declare const selectBorder: string;
export declare const buttonForeground: string;
export declare const buttonSeparator: string;
export declare const buttonBackground: string;
export declare const buttonHoverBackground: string;
export declare const buttonBorder: string;
export declare const buttonSecondaryForeground: string;
export declare const buttonSecondaryBackground: string;
export declare const buttonSecondaryHoverBackground: string;
export declare const badgeBackground: string;
export declare const badgeForeground: string;
export declare const scrollbarShadow: string;
export declare const scrollbarSliderBackground: string;
export declare const scrollbarSliderHoverBackground: string;
export declare const scrollbarSliderActiveBackground: string;
export declare const progressBarBackground: string;
export declare const editorErrorBackground: string;
export declare const editorErrorForeground: string;
export declare const editorErrorBorder: string;
export declare const editorWarningBackground: string;
export declare const editorWarningForeground: string;
export declare const editorWarningBorder: string;
export declare const editorInfoBackground: string;
export declare const editorInfoForeground: string;
export declare const editorInfoBorder: string;
export declare const editorHintForeground: string;
export declare const editorHintBorder: string;
export declare const sashHoverBorder: string;
/**
 * Editor background color.
 */
export declare const editorBackground: string;
/**
 * Editor foreground color.
 */
export declare const editorForeground: string;
/**
 * Sticky scroll
 */
export declare const editorStickyScrollBackground: string;
export declare const editorStickyScrollHoverBackground: string;
/**
 * Editor widgets
 */
export declare const editorWidgetBackground: string;
export declare const editorWidgetForeground: string;
export declare const editorWidgetBorder: string;
export declare const editorWidgetResizeBorder: string;
/**
 * Quick pick widget
 */
export declare const quickInputBackground: string;
export declare const quickInputForeground: string;
export declare const quickInputTitleBackground: string;
export declare const pickerGroupForeground: string;
export declare const pickerGroupBorder: string;
/**
 * Keybinding label
 */
export declare const keybindingLabelBackground: string;
export declare const keybindingLabelForeground: string;
export declare const keybindingLabelBorder: string;
export declare const keybindingLabelBottomBorder: string;
/**
 * Editor selection colors.
 */
export declare const editorSelectionBackground: string;
export declare const editorSelectionForeground: string;
export declare const editorInactiveSelection: string;
export declare const editorSelectionHighlight: string;
export declare const editorSelectionHighlightBorder: string;
/**
 * Editor find match colors.
 */
export declare const editorFindMatch: string;
export declare const editorFindMatchHighlight: string;
export declare const editorFindRangeHighlight: string;
export declare const editorFindMatchBorder: string;
export declare const editorFindMatchHighlightBorder: string;
export declare const editorFindRangeHighlightBorder: string;
/**
 * Search Editor query match colors.
 *
 * Distinct from normal editor find match to allow for better differentiation
 */
export declare const searchEditorFindMatch: string;
export declare const searchEditorFindMatchBorder: string;
/**
 * Editor hover
 */
export declare const editorHoverHighlight: string;
export declare const editorHoverBackground: string;
export declare const editorHoverForeground: string;
export declare const editorHoverBorder: string;
export declare const editorHoverStatusBarBackground: string;
/**
 * Editor link colors
 */
export declare const editorActiveLinkForeground: string;
/**
 * Inline hints
 */
export declare const editorInlayHintForeground: string;
export declare const editorInlayHintBackground: string;
export declare const editorInlayHintTypeForeground: string;
export declare const editorInlayHintTypeBackground: string;
export declare const editorInlayHintParameterForeground: string;
export declare const editorInlayHintParameterBackground: string;
/**
 * Editor lighbulb icon colors
 */
export declare const editorLightBulbForeground: string;
export declare const editorLightBulbAutoFixForeground: string;
/**
 * Diff Editor Colors
 */
export declare const defaultInsertColor: Color;
export declare const defaultRemoveColor: Color;
export declare const diffInserted: string;
export declare const diffRemoved: string;
export declare const diffInsertedLine: string;
export declare const diffRemovedLine: string;
export declare const diffInsertedLineGutter: string;
export declare const diffRemovedLineGutter: string;
export declare const diffOverviewRulerInserted: string;
export declare const diffOverviewRulerRemoved: string;
export declare const diffInsertedOutline: string;
export declare const diffRemovedOutline: string;
export declare const diffBorder: string;
export declare const diffDiagonalFill: string;
/**
 * List and tree colors
 */
export declare const listFocusBackground: string;
export declare const listFocusForeground: string;
export declare const listFocusOutline: string;
export declare const listFocusAndSelectionOutline: string;
export declare const listActiveSelectionBackground: string;
export declare const listActiveSelectionForeground: string;
export declare const listActiveSelectionIconForeground: string;
export declare const listInactiveSelectionBackground: string;
export declare const listInactiveSelectionForeground: string;
export declare const listInactiveSelectionIconForeground: string;
export declare const listInactiveFocusBackground: string;
export declare const listInactiveFocusOutline: string;
export declare const listHoverBackground: string;
export declare const listHoverForeground: string;
export declare const listDropBackground: string;
export declare const listHighlightForeground: string;
export declare const listFocusHighlightForeground: string;
export declare const listInvalidItemForeground: string;
export declare const listErrorForeground: string;
export declare const listWarningForeground: string;
export declare const listFilterWidgetBackground: string;
export declare const listFilterWidgetOutline: string;
export declare const listFilterWidgetNoMatchesOutline: string;
export declare const listFilterWidgetShadow: string;
export declare const listFilterMatchHighlight: string;
export declare const listFilterMatchHighlightBorder: string;
export declare const treeIndentGuidesStroke: string;
export declare const tableColumnsBorder: string;
export declare const tableOddRowsBackgroundColor: string;
export declare const listDeemphasizedForeground: string;
/**
 * Checkboxes
 */
export declare const checkboxBackground: string;
export declare const checkboxSelectBackground: string;
export declare const checkboxForeground: string;
export declare const checkboxBorder: string;
export declare const checkboxSelectBorder: string;
/**
 * Quick pick widget (dependent on List and tree colors)
 */
export declare const _deprecatedQuickInputListFocusBackground: string;
export declare const quickInputListFocusForeground: string;
export declare const quickInputListFocusIconForeground: string;
export declare const quickInputListFocusBackground: string;
/**
 * Menu colors
 */
export declare const menuBorder: string;
export declare const menuForeground: string;
export declare const menuBackground: string;
export declare const menuSelectionForeground: string;
export declare const menuSelectionBackground: string;
export declare const menuSelectionBorder: string;
export declare const menuSeparatorBackground: string;
/**
 * Toolbar colors
 */
export declare const toolbarHoverBackground: string;
export declare const toolbarHoverOutline: string;
export declare const toolbarActiveBackground: string;
/**
 * Snippet placeholder colors
 */
export declare const snippetTabstopHighlightBackground: string;
export declare const snippetTabstopHighlightBorder: string;
export declare const snippetFinalTabstopHighlightBackground: string;
export declare const snippetFinalTabstopHighlightBorder: string;
/**
 * Breadcrumb colors
 */
export declare const breadcrumbsForeground: string;
export declare const breadcrumbsBackground: string;
export declare const breadcrumbsFocusForeground: string;
export declare const breadcrumbsActiveSelectionForeground: string;
export declare const breadcrumbsPickerBackground: string;
export declare const mergeCurrentHeaderBackground: string;
export declare const mergeCurrentContentBackground: string;
export declare const mergeIncomingHeaderBackground: string;
export declare const mergeIncomingContentBackground: string;
export declare const mergeCommonHeaderBackground: string;
export declare const mergeCommonContentBackground: string;
export declare const mergeBorder: string;
export declare const overviewRulerCurrentContentForeground: string;
export declare const overviewRulerIncomingContentForeground: string;
export declare const overviewRulerCommonContentForeground: string;
export declare const overviewRulerFindMatchForeground: string;
export declare const overviewRulerSelectionHighlightForeground: string;
export declare const minimapFindMatch: string;
export declare const minimapSelectionOccurrenceHighlight: string;
export declare const minimapSelection: string;
export declare const minimapError: string;
export declare const minimapWarning: string;
export declare const minimapBackground: string;
export declare const minimapForegroundOpacity: string;
export declare const minimapSliderBackground: string;
export declare const minimapSliderHoverBackground: string;
export declare const minimapSliderActiveBackground: string;
export declare const problemsErrorIconForeground: string;
export declare const problemsWarningIconForeground: string;
export declare const problemsInfoIconForeground: string;
/**
 * Chart colors
 */
export declare const chartsForeground: string;
export declare const chartsLines: string;
export declare const chartsRed: string;
export declare const chartsBlue: string;
export declare const chartsYellow: string;
export declare const chartsOrange: string;
export declare const chartsGreen: string;
export declare const chartsPurple: string;
export declare function executeTransform(transform: ColorTransform, theme: IColorTheme): Color | undefined;
export declare function darken(colorValue: ColorValue, factor: number): ColorTransform;
export declare function lighten(colorValue: ColorValue, factor: number): ColorTransform;
export declare function transparent(colorValue: ColorValue, factor: number): ColorTransform;
export declare function oneOf(...colorValues: ColorValue[]): ColorTransform;
export declare function ifDefinedThenElse(ifArg: ColorIdentifier, thenArg: ColorValue, elseArg: ColorValue): ColorTransform;
/**
 * @param colorValue Resolve a color value in the context of a theme
 */
export declare function resolveColorValue(colorValue: ColorValue | null, theme: IColorTheme): Color | undefined;
export declare const workbenchColorsSchemaId = "vscode://schemas/workbench-colors";
