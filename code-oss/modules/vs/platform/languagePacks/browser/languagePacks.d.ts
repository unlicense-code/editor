import { URI } from 'vs/base/common/uri';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { ILanguagePackItem, LanguagePackBaseService } from 'vs/platform/languagePacks/common/languagePacks';
import { ILogService } from 'vs/platform/log/common/log';
export declare class WebLanguagePacksService extends LanguagePackBaseService {
    private readonly extensionResourceLoaderService;
    private readonly logService;
    constructor(extensionResourceLoaderService: IExtensionResourceLoaderService, extensionGalleryService: IExtensionGalleryService, logService: ILogService);
    getBuiltInExtensionTranslationsUri(id: string): Promise<URI | undefined>;
    getInstalledLanguages(): Promise<ILanguagePackItem[]>;
}
