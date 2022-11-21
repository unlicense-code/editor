import { StandardTokenType } from 'vs/editor/common/encodedTokenAttributes';
import { ScopedLineTokens } from 'vs/editor/common/languages/supports';
export interface TokenText {
    text: string;
    type: StandardTokenType;
}
export declare function createFakeScopedLineTokens(rawTokens: TokenText[]): ScopedLineTokens;
