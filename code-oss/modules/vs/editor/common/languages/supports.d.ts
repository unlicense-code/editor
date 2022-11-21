import { LineTokens } from 'vs/editor/common/tokens/lineTokens';
import { StandardTokenType } from 'vs/editor/common/encodedTokenAttributes';
export declare function createScopedLineTokens(context: LineTokens, offset: number): ScopedLineTokens;
export declare class ScopedLineTokens {
    _scopedLineTokensBrand: void;
    readonly languageId: string;
    private readonly _actual;
    private readonly _firstTokenIndex;
    private readonly _lastTokenIndex;
    readonly firstCharOffset: number;
    private readonly _lastCharOffset;
    constructor(actual: LineTokens, languageId: string, firstTokenIndex: number, lastTokenIndex: number, firstCharOffset: number, lastCharOffset: number);
    getLineContent(): string;
    getActualLineContentBefore(offset: number): string;
    getTokenCount(): number;
    findTokenIndexAtOffset(offset: number): number;
    getStandardTokenType(tokenIndex: number): StandardTokenType;
}
export declare function ignoreBracketsInToken(standardTokenType: StandardTokenType): boolean;
