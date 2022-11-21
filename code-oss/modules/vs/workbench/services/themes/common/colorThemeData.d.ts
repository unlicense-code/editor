import { Color } from 'vs/base/common/color';
import { ExtensionData, ITokenColorCustomizations, ITextMateThemingRule, IWorkbenchColorTheme, IThemeExtensionPoint, IColorCustomizations, ISemanticTokenColorCustomizations, IThemeScopableCustomizations, IThemeScopedCustomizations } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { ColorIdentifier } from 'vs/platform/theme/common/colorRegistry';
import { ITokenStyle } from 'vs/platform/theme/common/themeService';
import { URI } from 'vs/base/common/uri';
import { TokenStyle, SemanticTokenRule, ProbeScope, TokenStyleValue, TokenStyleData } from 'vs/platform/theme/common/tokenClassificationRegistry';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ThemeConfiguration } from 'vs/workbench/services/themes/common/themeConfiguration';
import { ColorScheme } from 'vs/platform/theme/common/theme';
export declare type TokenStyleDefinition = SemanticTokenRule | ProbeScope[] | TokenStyleValue;
export declare type TokenStyleDefinitions = {
    [P in keyof TokenStyleData]?: TokenStyleDefinition | undefined;
};
export declare type TextMateThemingRuleDefinitions = {
    [P in keyof TokenStyleData]?: ITextMateThemingRule | undefined;
} & {
    scope?: ProbeScope;
};
export declare class ColorThemeData implements IWorkbenchColorTheme {
    static readonly STORAGE_KEY = "colorThemeData";
    id: string;
    label: string;
    settingsId: string;
    description?: string;
    isLoaded: boolean;
    location?: URI;
    watch?: boolean;
    extensionData?: ExtensionData;
    private themeSemanticHighlighting;
    private customSemanticHighlighting;
    private customSemanticHighlightingDeprecated;
    private themeTokenColors;
    private customTokenColors;
    private colorMap;
    private customColorMap;
    private semanticTokenRules;
    private customSemanticTokenRules;
    private themeTokenScopeMatchers;
    private customTokenScopeMatchers;
    private textMateThemingRules;
    private tokenColorIndex;
    private constructor();
    get semanticHighlighting(): boolean;
    get tokenColors(): ITextMateThemingRule[];
    getColor(colorId: ColorIdentifier, useDefault?: boolean): Color | undefined;
    private getTokenStyle;
    /**
     * @param tokenStyleValue Resolve a tokenStyleValue in the context of a theme
     */
    resolveTokenStyleValue(tokenStyleValue: TokenStyleValue | undefined): TokenStyle | undefined;
    private getTokenColorIndex;
    get tokenColorMap(): string[];
    getTokenStyleMetadata(typeWithLanguage: string, modifiers: string[], defaultLanguage: string, useDefault?: boolean, definitions?: TokenStyleDefinitions): ITokenStyle | undefined;
    getTokenStylingRuleScope(rule: SemanticTokenRule): 'setting' | 'theme' | undefined;
    getDefault(colorId: ColorIdentifier): Color | undefined;
    resolveScopes(scopes: ProbeScope[], definitions?: TextMateThemingRuleDefinitions): TokenStyle | undefined;
    defines(colorId: ColorIdentifier): boolean;
    setCustomizations(settings: ThemeConfiguration): void;
    setCustomColors(colors: IColorCustomizations): void;
    private overwriteCustomColors;
    setCustomTokenColors(customTokenColors: ITokenColorCustomizations): void;
    setCustomSemanticTokenColors(semanticTokenColors: ISemanticTokenColorCustomizations | undefined): void;
    isThemeScope(key: string): boolean;
    isThemeScopeMatch(themeId: string): boolean;
    getThemeSpecificColors(colors: IThemeScopableCustomizations): IThemeScopedCustomizations | undefined;
    private readSemanticTokenRules;
    private addCustomTokenColors;
    ensureLoaded(extensionResourceLoaderService: IExtensionResourceLoaderService): Promise<void>;
    reload(extensionResourceLoaderService: IExtensionResourceLoaderService): Promise<void>;
    private load;
    clearCaches(): void;
    toStorage(storageService: IStorageService): void;
    get baseTheme(): string;
    get classNames(): string[];
    get type(): ColorScheme;
    static createUnloadedThemeForThemeType(themeType: ColorScheme, colorMap?: {
        [id: string]: string;
    }): ColorThemeData;
    static createUnloadedTheme(id: string, colorMap?: {
        [id: string]: string;
    }): ColorThemeData;
    static createLoadedEmptyTheme(id: string, settingsId: string): ColorThemeData;
    static fromStorageData(storageService: IStorageService): ColorThemeData | undefined;
    static fromExtensionTheme(theme: IThemeExtensionPoint, colorThemeLocation: URI, extensionData: ExtensionData): ColorThemeData;
}
