import { ITokenizationSupport } from 'vs/editor/common/languages';
import { LanguageId, StandardTokenType } from 'vs/editor/common/encodedTokenAttributes';
export declare class TokenizedDocument {
    private readonly tokensByLine;
    constructor(tokens: TokenInfo[]);
    getText(): string;
    getTokenizationSupport(): ITokenizationSupport;
}
export declare class TokenInfo {
    readonly text: string;
    readonly languageId: LanguageId;
    readonly tokenType: StandardTokenType;
    readonly hasBalancedBrackets: boolean;
    constructor(text: string, languageId: LanguageId, tokenType: StandardTokenType, hasBalancedBrackets: boolean);
    getMetadata(): number;
    withText(text: string): TokenInfo;
}
