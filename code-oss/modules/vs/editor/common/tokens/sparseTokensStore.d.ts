import { IRange, Range } from 'vs/editor/common/core/range';
import { LineTokens } from 'vs/editor/common/tokens/lineTokens';
import { SparseMultilineTokens } from 'vs/editor/common/tokens/sparseMultilineTokens';
import { ILanguageIdCodec } from 'vs/editor/common/languages';
/**
 * Represents sparse tokens in a text model.
 */
export declare class SparseTokensStore {
    private _pieces;
    private _isComplete;
    private readonly _languageIdCodec;
    constructor(languageIdCodec: ILanguageIdCodec);
    flush(): void;
    isEmpty(): boolean;
    set(pieces: SparseMultilineTokens[] | null, isComplete: boolean): void;
    setPartial(_range: Range, pieces: SparseMultilineTokens[]): Range;
    isComplete(): boolean;
    addSparseTokens(lineNumber: number, aTokens: LineTokens): LineTokens;
    private static _findFirstPieceWithLine;
    acceptEdit(range: IRange, eolCount: number, firstLineLength: number, lastLineLength: number, firstCharCode: number): void;
}
