import { IExtensionPoint } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { ExtensionData, IThemeExtensionPoint } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
export declare function registerColorThemeExtensionPoint(): IExtensionPoint<IThemeExtensionPoint[]>;
export declare function registerFileIconThemeExtensionPoint(): IExtensionPoint<IThemeExtensionPoint[]>;
export declare function registerProductIconThemeExtensionPoint(): IExtensionPoint<IThemeExtensionPoint[]>;
export interface ThemeChangeEvent<T> {
    themes: T[];
    added: T[];
    removed: T[];
}
export interface IThemeData {
    id: string;
    settingsId: string | null;
    location?: URI;
}
export declare class ThemeRegistry<T extends IThemeData> {
    private readonly themesExtPoint;
    private create;
    private idRequired;
    private builtInTheme;
    private extensionThemes;
    private readonly onDidChangeEmitter;
    readonly onDidChange: Event<ThemeChangeEvent<T>>;
    constructor(themesExtPoint: IExtensionPoint<IThemeExtensionPoint[]>, create: (theme: IThemeExtensionPoint, themeLocation: URI, extensionData: ExtensionData) => T, idRequired?: boolean, builtInTheme?: T | undefined);
    private initialize;
    private onThemes;
    findThemeById(themeId: string, defaultId?: string): T | undefined;
    findThemeBySettingsId(settingsId: string | null, defaultId?: string): T | undefined;
    findThemeByExtensionLocation(extLocation: URI | undefined): T[];
    getThemes(): T[];
    getMarketplaceThemes(manifest: any, extensionLocation: URI, extensionData: ExtensionData): T[];
}
