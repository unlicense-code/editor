import { URI } from 'vs/base/common/uri';
import { Disposable } from 'vs/base/common/lifecycle';
import { LanguageId, StandardTokenType } from 'vs/editor/common/encodedTokenAttributes';
export interface IValidGrammarDefinition {
    location: URI;
    language?: string;
    scopeName: string;
    embeddedLanguages: IValidEmbeddedLanguagesMap;
    tokenTypes: IValidTokenTypeMap;
    injectTo?: string[];
    balancedBracketSelectors: string[];
    unbalancedBracketSelectors: string[];
}
export interface IValidTokenTypeMap {
    [selector: string]: StandardTokenType;
}
export interface IValidEmbeddedLanguagesMap {
    [scopeName: string]: LanguageId;
}
export declare class TMScopeRegistry extends Disposable {
    private _scopeNameToLanguageRegistration;
    constructor();
    reset(): void;
    register(def: IValidGrammarDefinition): void;
    getGrammarDefinition(scopeName: string): IValidGrammarDefinition | null;
}
