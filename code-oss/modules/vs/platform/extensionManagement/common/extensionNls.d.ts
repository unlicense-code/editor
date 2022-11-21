import { IExtensionManifest } from 'vs/platform/extensions/common/extensions';
export interface ITranslations {
    [key: string]: string | {
        message: string;
        comment: string[];
    } | undefined;
}
export declare function localizeManifest(extensionManifest: IExtensionManifest, translations: ITranslations, fallbackTranslations?: ITranslations): IExtensionManifest;
