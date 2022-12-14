import { Color } from 'vs/base/common/color';
import { ITokenThemeRule, TokenTheme } from 'vs/editor/common/languages/supports/tokenization';
import { IColorTheme, IThemeService } from 'vs/platform/theme/common/themeService';
export declare const IStandaloneThemeService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IStandaloneThemeService>;
export declare type BuiltinTheme = 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
export declare type IColors = {
    [colorId: string]: string;
};
export interface IStandaloneThemeData {
    base: BuiltinTheme;
    inherit: boolean;
    rules: ITokenThemeRule[];
    encodedTokensColors?: string[];
    colors: IColors;
}
export interface IStandaloneTheme extends IColorTheme {
    tokenTheme: TokenTheme;
    themeName: string;
}
export interface IStandaloneThemeService extends IThemeService {
    readonly _serviceBrand: undefined;
    setTheme(themeName: string): void;
    setAutoDetectHighContrast(autoDetectHighContrast: boolean): void;
    defineTheme(themeName: string, themeData: IStandaloneThemeData): void;
    getColorTheme(): IStandaloneTheme;
    setColorMapOverride(colorMapOverride: Color[] | null): void;
}
