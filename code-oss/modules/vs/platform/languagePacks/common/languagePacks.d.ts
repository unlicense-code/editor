import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IQuickPickItem } from 'vs/base/parts/quickinput/common/quickInput';
import { IExtensionGalleryService, IGalleryExtension } from 'vs/platform/extensionManagement/common/extensionManagement';
export declare const ILanguagePackService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILanguagePackService>;
export interface ILanguagePackItem extends IQuickPickItem {
    readonly extensionId: string;
    readonly galleryExtension?: IGalleryExtension;
}
export interface ILanguagePackService {
    readonly _serviceBrand: undefined;
    getAvailableLanguages(): Promise<Array<ILanguagePackItem>>;
    getInstalledLanguages(): Promise<Array<ILanguagePackItem>>;
    getBuiltInExtensionTranslationsUri(id: string): Promise<URI | undefined>;
    getLocale(extension: IGalleryExtension): string | undefined;
}
export declare abstract class LanguagePackBaseService extends Disposable implements ILanguagePackService {
    protected readonly extensionGalleryService: IExtensionGalleryService;
    readonly _serviceBrand: undefined;
    constructor(extensionGalleryService: IExtensionGalleryService);
    abstract getBuiltInExtensionTranslationsUri(id: string): Promise<URI | undefined>;
    abstract getInstalledLanguages(): Promise<Array<ILanguagePackItem>>;
    getAvailableLanguages(): Promise<ILanguagePackItem[]>;
    getLocale(extension: IGalleryExtension): string | undefined;
    protected createQuickPickItem(locale: string, languageName?: string, languagePack?: IGalleryExtension): IQuickPickItem;
}
