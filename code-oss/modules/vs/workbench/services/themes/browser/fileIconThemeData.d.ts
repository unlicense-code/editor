import { URI } from 'vs/base/common/uri';
import { ExtensionData, IThemeExtensionPoint, IWorkbenchFileIconTheme } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { ILanguageService } from 'vs/editor/common/languages/language';
export declare class FileIconThemeData implements IWorkbenchFileIconTheme {
    static readonly STORAGE_KEY = "iconThemeData";
    id: string;
    label: string;
    settingsId: string | null;
    description?: string;
    hasFileIcons: boolean;
    hasFolderIcons: boolean;
    hidesExplorerArrows: boolean;
    isLoaded: boolean;
    location?: URI;
    extensionData?: ExtensionData;
    watch?: boolean;
    styleSheetContent?: string;
    private constructor();
    ensureLoaded(themeLoader: FileIconThemeLoader): Promise<string | undefined>;
    reload(themeLoader: FileIconThemeLoader): Promise<string | undefined>;
    private load;
    static fromExtensionTheme(iconTheme: IThemeExtensionPoint, iconThemeLocation: URI, extensionData: ExtensionData): FileIconThemeData;
    private static _noIconTheme;
    static get noIconTheme(): FileIconThemeData;
    static createUnloadedTheme(id: string): FileIconThemeData;
    static fromStorageData(storageService: IStorageService): FileIconThemeData | undefined;
    toStorage(storageService: IStorageService): void;
}
export declare class FileIconThemeLoader {
    private readonly fileService;
    private readonly languageService;
    constructor(fileService: IExtensionResourceLoaderService, languageService: ILanguageService);
    load(data: FileIconThemeData): Promise<string | undefined>;
    private loadIconThemeDocument;
    private processIconThemeDocument;
}
