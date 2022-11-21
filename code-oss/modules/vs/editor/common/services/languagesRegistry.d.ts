import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ILanguageIdCodec } from 'vs/editor/common/languages';
import { LanguageId } from 'vs/editor/common/encodedTokenAttributes';
import { ILanguageExtensionPoint, ILanguageNameIdPair, ILanguageIcon } from 'vs/editor/common/languages/language';
export declare class LanguageIdCodec implements ILanguageIdCodec {
    private _nextLanguageId;
    private readonly _languageIdToLanguage;
    private readonly _languageToLanguageId;
    constructor();
    private _register;
    register(language: string): void;
    encodeLanguageId(languageId: string): LanguageId;
    decodeLanguageId(languageId: LanguageId): string;
}
export declare class LanguagesRegistry extends Disposable {
    static instanceCount: number;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private readonly _warnOnOverwrite;
    readonly languageIdCodec: LanguageIdCodec;
    private _dynamicLanguages;
    private _languages;
    private _mimeTypesMap;
    private _nameMap;
    private _lowercaseNameMap;
    constructor(useModesRegistry?: boolean, warnOnOverwrite?: boolean);
    dispose(): void;
    setDynamicLanguages(def: ILanguageExtensionPoint[]): void;
    private _initializeFromRegistry;
    registerLanguage(desc: ILanguageExtensionPoint): IDisposable;
    _registerLanguages(desc: ILanguageExtensionPoint[]): void;
    private _registerLanguage;
    private _mergeLanguage;
    isRegisteredLanguageId(languageId: string | null | undefined): boolean;
    getRegisteredLanguageIds(): string[];
    getSortedRegisteredLanguageNames(): ILanguageNameIdPair[];
    getLanguageName(languageId: string): string | null;
    getMimeType(languageId: string): string | null;
    getExtensions(languageId: string): ReadonlyArray<string>;
    getFilenames(languageId: string): ReadonlyArray<string>;
    getIcon(languageId: string): ILanguageIcon | null;
    getConfigurationFiles(languageId: string): ReadonlyArray<URI>;
    getLanguageIdByLanguageName(languageName: string): string | null;
    getLanguageIdByMimeType(mimeType: string | null | undefined): string | null;
    guessLanguageIdByFilepathOrFirstLine(resource: URI | null, firstLine?: string): string[];
}
