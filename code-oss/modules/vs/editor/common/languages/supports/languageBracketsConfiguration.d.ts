import { LanguageConfiguration } from 'vs/editor/common/languages/languageConfiguration';
/**
 * Captures all bracket related configurations for a single language.
 * Immutable.
*/
export declare class LanguageBracketsConfiguration {
    readonly languageId: string;
    private readonly _openingBrackets;
    private readonly _closingBrackets;
    constructor(languageId: string, config: LanguageConfiguration);
    /**
     * No two brackets have the same bracket text.
    */
    get openingBrackets(): readonly OpeningBracketKind[];
    /**
     * No two brackets have the same bracket text.
    */
    get closingBrackets(): readonly ClosingBracketKind[];
    getOpeningBracketInfo(bracketText: string): OpeningBracketKind | undefined;
    getClosingBracketInfo(bracketText: string): ClosingBracketKind | undefined;
    getBracketInfo(bracketText: string): BracketKind | undefined;
}
export declare type BracketKind = OpeningBracketKind | ClosingBracketKind;
export declare class BracketKindBase {
    protected readonly config: LanguageBracketsConfiguration;
    readonly bracketText: string;
    constructor(config: LanguageBracketsConfiguration, bracketText: string);
    get languageId(): string;
}
export declare class OpeningBracketKind extends BracketKindBase {
    readonly openedBrackets: ReadonlySet<ClosingBracketKind>;
    readonly isOpeningBracket = true;
    constructor(config: LanguageBracketsConfiguration, bracketText: string, openedBrackets: ReadonlySet<ClosingBracketKind>);
}
export declare class ClosingBracketKind extends BracketKindBase {
    /**
     * Non empty array of all opening brackets this bracket closes.
    */
    readonly closedBrackets: ReadonlySet<OpeningBracketKind>;
    readonly isOpeningBracket = false;
    constructor(config: LanguageBracketsConfiguration, bracketText: string, 
    /**
     * Non empty array of all opening brackets this bracket closes.
    */
    closedBrackets: ReadonlySet<OpeningBracketKind>);
    /**
     * Checks if this bracket closes the given other bracket.
     * Brackets from other language configuration can be used (they will always return false).
     * If other is a bracket with the same language id, they have to be from the same configuration.
    */
    closes(other: OpeningBracketKind): boolean;
    getClosedBrackets(): readonly OpeningBracketKind[];
}
