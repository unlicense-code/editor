import { ResolvedLanguageConfiguration } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { DenseKeyProvider, SmallImmutableSet } from './smallImmutableSet';
import { OpeningBracketId, Token } from './tokenizer';
export declare class BracketTokens {
    private readonly map;
    static createFromLanguage(configuration: ResolvedLanguageConfiguration, denseKeyProvider: DenseKeyProvider<string>): BracketTokens;
    private hasRegExp;
    private _regExpGlobal;
    constructor(map: Map<string, Token>);
    getRegExpStr(): string | null;
    /**
     * Returns null if there is no such regexp (because there are no brackets).
    */
    get regExpGlobal(): RegExp | null;
    getToken(value: string): Token | undefined;
    findClosingTokenText(openingBracketIds: SmallImmutableSet<OpeningBracketId>): string | undefined;
    get isEmpty(): boolean;
}
export declare class LanguageAgnosticBracketTokens {
    private readonly denseKeyProvider;
    private readonly getLanguageConfiguration;
    private readonly languageIdToBracketTokens;
    constructor(denseKeyProvider: DenseKeyProvider<string>, getLanguageConfiguration: (languageId: string) => ResolvedLanguageConfiguration);
    didLanguageChange(languageId: string): boolean;
    getSingleLanguageBracketTokens(languageId: string): BracketTokens;
    getToken(value: string, languageId: string): Token | undefined;
}
