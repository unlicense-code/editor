import { URI } from 'vs/base/common/uri';
import { ExtensionData, IThemeExtensionPoint, IWorkbenchProductIconTheme } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILogService } from 'vs/platform/log/common/log';
import { IconDefinition, IconContribution } from 'vs/platform/theme/common/iconRegistry';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
export declare const DEFAULT_PRODUCT_ICON_THEME_ID = "";
export declare class ProductIconThemeData implements IWorkbenchProductIconTheme {
    static readonly STORAGE_KEY = "productIconThemeData";
    id: string;
    label: string;
    settingsId: string;
    description?: string;
    isLoaded: boolean;
    location?: URI;
    extensionData?: ExtensionData;
    watch?: boolean;
    iconThemeDocument: ProductIconThemeDocument;
    styleSheetContent?: string;
    private constructor();
    getIcon(iconContribution: IconContribution): IconDefinition | undefined;
    ensureLoaded(fileService: IExtensionResourceLoaderService, logService: ILogService): Promise<string | undefined>;
    reload(fileService: IExtensionResourceLoaderService, logService: ILogService): Promise<string | undefined>;
    private load;
    static fromExtensionTheme(iconTheme: IThemeExtensionPoint, iconThemeLocation: URI, extensionData: ExtensionData): ProductIconThemeData;
    static createUnloadedTheme(id: string): ProductIconThemeData;
    private static _defaultProductIconTheme;
    static get defaultTheme(): ProductIconThemeData;
    static fromStorageData(storageService: IStorageService): ProductIconThemeData | undefined;
    toStorage(storageService: IStorageService): void;
}
interface ProductIconThemeDocument {
    iconDefinitions: Map<string, IconDefinition>;
}
export {};
