import { IWorkbenchColorTheme, IWorkbenchFileIconTheme, IColorCustomizations, ITokenColorCustomizations, IWorkbenchProductIconTheme, ISemanticTokenColorCustomizations, ThemeSettingTarget } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { IConfigurationService, ConfigurationTarget } from 'vs/platform/configuration/common/configuration';
export declare const DEFAULT_PRODUCT_ICON_THEME_SETTING_VALUE = "Default";
export declare function updateColorThemeConfigurationSchemas(themes: IWorkbenchColorTheme[]): void;
export declare function updateFileIconThemeConfigurationSchemas(themes: IWorkbenchFileIconTheme[]): void;
export declare function updateProductIconThemeConfigurationSchemas(themes: IWorkbenchProductIconTheme[]): void;
export declare class ThemeConfiguration {
    private configurationService;
    constructor(configurationService: IConfigurationService);
    get colorTheme(): string;
    get fileIconTheme(): string | null;
    get productIconTheme(): string;
    get colorCustomizations(): IColorCustomizations;
    get tokenColorCustomizations(): ITokenColorCustomizations;
    get semanticTokenColorCustomizations(): ISemanticTokenColorCustomizations | undefined;
    setColorTheme(theme: IWorkbenchColorTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchColorTheme>;
    setFileIconTheme(theme: IWorkbenchFileIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchFileIconTheme>;
    setProductIconTheme(theme: IWorkbenchProductIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchProductIconTheme>;
    isDefaultColorTheme(): boolean;
    findAutoConfigurationTarget(key: string): ConfigurationTarget.USER | ConfigurationTarget.USER_REMOTE | ConfigurationTarget.WORKSPACE | ConfigurationTarget.WORKSPACE_FOLDER;
    private writeConfiguration;
}
