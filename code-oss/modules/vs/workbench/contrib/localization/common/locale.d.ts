import { ILanguagePackItem } from 'vs/platform/languagePacks/common/languagePacks';
export declare const ILocaleService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILocaleService>;
export interface ILocaleService {
    readonly _serviceBrand: undefined;
    setLocale(languagePackItem: ILanguagePackItem): Promise<void>;
    clearLocalePreference(): Promise<void>;
}
