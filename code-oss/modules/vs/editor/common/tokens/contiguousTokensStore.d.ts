import { IRange } from 'vs/editor/common/core/range';
import { LineTokens } from 'vs/editor/common/tokens/lineTokens';
import { ILanguageIdCodec } from 'vs/editor/common/languages';
/**
 * Represents contiguous tokens in a text model.
 */
export declare class ContiguousTokensStore {
    private _lineTokens;
    private _len;
    private readonly _languageIdCodec;
    constructor(languageIdCodec: ILanguageIdCodec);
    flush(): void;
    getTokens(topLevelLanguageId: string, lineIndex: number, lineText: string): LineTokens;
    private static _massageTokens;
    private _ensureLine;
    private _deleteLines;
    private _insertLines;
    setTokens(topLevelLanguageId: string, lineIndex: number, lineTextLength: number, _tokens: Uint32Array | ArrayBuffer | null, checkEquality: boolean): boolean;
    private static _equals;
    acceptEdit(range: IRange, eolCount: number, firstLineLength: number): void;
    private _acceptDeleteRange;
    private _acceptInsertText;
}
