import { Event } from 'vs/base/common/event';
import { ILanguageExtensionPoint } from 'vs/editor/common/languages/language';
import { IDisposable } from 'vs/base/common/lifecycle';
export declare const Extensions: {
    ModesRegistry: string;
};
export declare class EditorModesRegistry {
    private readonly _languages;
    private readonly _onDidChangeLanguages;
    readonly onDidChangeLanguages: Event<void>;
    constructor();
    registerLanguage(def: ILanguageExtensionPoint): IDisposable;
    getLanguages(): ReadonlyArray<ILanguageExtensionPoint>;
}
export declare const ModesRegistry: EditorModesRegistry;
export declare const PLAINTEXT_LANGUAGE_ID = "plaintext";
export declare const PLAINTEXT_EXTENSION = ".txt";
