import { Codicon } from 'vs/base/common/codicons';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { ColorIdentifier } from 'vs/platform/theme/common/colorRegistry';
import { IconContribution, IconDefinition } from 'vs/platform/theme/common/iconRegistry';
import { ColorScheme } from 'vs/platform/theme/common/theme';
export declare const IThemeService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IThemeService>;
export interface ThemeColor {
    id: string;
}
export declare namespace ThemeColor {
    function isThemeColor(obj: any): obj is ThemeColor;
}
export declare function themeColorFromId(id: ColorIdentifier): {
    id: string;
};
export interface ThemeIcon {
    readonly id: string;
    readonly color?: ThemeColor;
}
export declare namespace ThemeIcon {
    function isThemeIcon(obj: any): obj is ThemeIcon;
    function fromString(str: string): ThemeIcon | undefined;
    function fromId(id: string): ThemeIcon;
    function modify(icon: ThemeIcon, modifier: 'disabled' | 'spin' | undefined): ThemeIcon;
    function getModifier(icon: ThemeIcon): string | undefined;
    function isEqual(ti1: ThemeIcon, ti2: ThemeIcon): boolean;
    function asThemeIcon(codicon: Codicon, color?: string): ThemeIcon;
    const asClassNameArray: (icon: ThemeIcon) => string[];
    const asClassName: (icon: ThemeIcon) => string;
    const asCSSSelector: (icon: ThemeIcon) => string;
}
export declare const FileThemeIcon: Codicon;
export declare const FolderThemeIcon: Codicon;
export declare function getThemeTypeSelector(type: ColorScheme): string;
export interface ITokenStyle {
    readonly foreground: number | undefined;
    readonly bold: boolean | undefined;
    readonly underline: boolean | undefined;
    readonly strikethrough: boolean | undefined;
    readonly italic: boolean | undefined;
}
export interface IColorTheme {
    readonly type: ColorScheme;
    readonly label: string;
    /**
     * Resolves the color of the given color identifier. If the theme does not
     * specify the color, the default color is returned unless <code>useDefault</code> is set to false.
     * @param color the id of the color
     * @param useDefault specifies if the default color should be used. If not set, the default is used.
     */
    getColor(color: ColorIdentifier, useDefault?: boolean): Color | undefined;
    /**
     * Returns whether the theme defines a value for the color. If not, that means the
     * default color will be used.
     */
    defines(color: ColorIdentifier): boolean;
    /**
     * Returns the token style for a given classification. The result uses the <code>MetadataConsts</code> format
     */
    getTokenStyleMetadata(type: string, modifiers: string[], modelLanguage: string): ITokenStyle | undefined;
    /**
     * List of all colors used with tokens. <code>getTokenStyleMetadata</code> references the colors by index into this list.
     */
    readonly tokenColorMap: string[];
    /**
     * Defines whether semantic highlighting should be enabled for the theme.
     */
    readonly semanticHighlighting: boolean;
}
export interface IFileIconTheme {
    readonly hasFileIcons: boolean;
    readonly hasFolderIcons: boolean;
    readonly hidesExplorerArrows: boolean;
}
export interface IProductIconTheme {
    /**
     * Resolves the definition for the given icon as defined by the theme.
     *
     * @param iconContribution The icon
     */
    getIcon(iconContribution: IconContribution): IconDefinition | undefined;
}
export interface ICssStyleCollector {
    addRule(rule: string): void;
}
export interface IThemingParticipant {
    (theme: IColorTheme, collector: ICssStyleCollector, environment: IEnvironmentService): void;
}
export interface IThemeService {
    readonly _serviceBrand: undefined;
    getColorTheme(): IColorTheme;
    readonly onDidColorThemeChange: Event<IColorTheme>;
    getFileIconTheme(): IFileIconTheme;
    readonly onDidFileIconThemeChange: Event<IFileIconTheme>;
    getProductIconTheme(): IProductIconTheme;
    readonly onDidProductIconThemeChange: Event<IProductIconTheme>;
}
export declare const Extensions: {
    ThemingContribution: string;
};
export interface IThemingRegistry {
    /**
     * Register a theming participant that is invoked on every theme change.
     */
    onColorThemeChange(participant: IThemingParticipant): IDisposable;
    getThemingParticipants(): IThemingParticipant[];
    readonly onThemingParticipantAdded: Event<IThemingParticipant>;
}
export declare function registerThemingParticipant(participant: IThemingParticipant): IDisposable;
/**
 * Utility base class for all themable components.
 */
export declare class Themable extends Disposable {
    protected themeService: IThemeService;
    protected theme: IColorTheme;
    constructor(themeService: IThemeService);
    protected onThemeChange(theme: IColorTheme): void;
    protected updateStyles(): void;
    protected getColor(id: string, modify?: (color: Color, theme: IColorTheme) => Color): string | null;
}
export interface IPartsSplash {
    baseTheme: string;
    colorInfo: {
        background: string;
        foreground: string | undefined;
        editorBackground: string | undefined;
        titleBarBackground: string | undefined;
        activityBarBackground: string | undefined;
        sideBarBackground: string | undefined;
        statusBarBackground: string | undefined;
        statusBarNoFolderBackground: string | undefined;
        windowBorder: string | undefined;
    };
    layoutInfo: {
        sideBarSide: string;
        editorPartMinWidth: number;
        titleBarHeight: number;
        activityBarWidth: number;
        sideBarWidth: number;
        statusBarHeight: number;
        windowBorder: boolean;
        windowBorderRadius: string | undefined;
    } | undefined;
}
