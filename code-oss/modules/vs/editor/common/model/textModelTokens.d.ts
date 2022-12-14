import { LineTokens } from 'vs/editor/common/tokens/lineTokens';
import { Position } from 'vs/editor/common/core/position';
import { IRange } from 'vs/editor/common/core/range';
import { ILanguageIdCodec, IState, ITokenizationSupport } from 'vs/editor/common/languages';
import { StandardTokenType } from 'vs/editor/common/encodedTokenAttributes';
import { TextModel } from 'vs/editor/common/model/textModel';
import { Disposable } from 'vs/base/common/lifecycle';
import { IModelContentChangedEvent, IModelLanguageChangedEvent } from 'vs/editor/common/textModelEvents';
import { TokenizationTextModelPart } from 'vs/editor/common/model/tokenizationTextModelPart';
/**
 * Stores the states at the start of each line and keeps track of which lines
 * must be retokenized. Also uses state equality to quickly validate lines
 * that don't need to be retokenized.
 *
 * For example, when typing on a line, the line gets marked as needing to be tokenized.
 * Once the line is tokenized, the end state is checked for equality against the begin
 * state of the next line. If the states are equal, tokenization doesn't need to run
 * again over the rest of the file. If the states are not equal, the next line gets marked
 * as needing to be tokenized.
 */
export declare class TokenizationStateStore {
    readonly tokenizationSupport: ITokenizationSupport;
    readonly initialState: IState;
    /**
     * `lineBeginState[i]` contains the begin state used to tokenize line number `i + 1`.
     */
    private readonly _lineBeginState;
    /**
     * `lineNeedsTokenization[i]` describes if line number `i + 1` needs to be tokenized.
     */
    private readonly _lineNeedsTokenization;
    /**
     * `invalidLineStartIndex` indicates that line number `invalidLineStartIndex + 1`
     *  is the first one that needs to be retokenized.
     */
    private _firstLineNeedsTokenization;
    get invalidLineStartIndex(): number;
    constructor(tokenizationSupport: ITokenizationSupport, initialState: IState);
    markMustBeTokenized(lineIndex: number): void;
    getBeginState(lineIndex: number): IState | null;
    setEndState(linesLength: number, lineIndex: number, endState: IState): void;
    applyEdits(range: IRange, eolCount: number): void;
}
export declare class TextModelTokenization extends Disposable {
    private readonly _textModel;
    private readonly _tokenizationPart;
    private readonly _languageIdCodec;
    private _tokenizationStateStore;
    private _isDisposed;
    constructor(_textModel: TextModel, _tokenizationPart: TokenizationTextModelPart, _languageIdCodec: ILanguageIdCodec);
    dispose(): void;
    handleDidChangeContent(e: IModelContentChangedEvent): void;
    handleDidChangeAttached(): void;
    handleDidChangeLanguage(e: IModelLanguageChangedEvent): void;
    private _resetTokenizationState;
    private _isScheduled;
    private _beginBackgroundTokenization;
    /**
     * Tokenize until the deadline occurs, but try to yield every 1-2ms.
     */
    private _backgroundTokenizeWithDeadline;
    /**
     * Tokenize for at least 1ms.
     */
    private _backgroundTokenizeForAtLeast1ms;
    tokenizeViewport(startLineNumber: number, endLineNumber: number): void;
    reset(): void;
    forceTokenization(lineNumber: number): void;
    getTokenTypeIfInsertingCharacter(position: Position, character: string): StandardTokenType;
    tokenizeLineWithEdit(position: Position, length: number, newText: string): LineTokens | null;
    isCheapToTokenize(lineNumber: number): boolean;
    private _hasLinesToTokenize;
    private _isTokenizationComplete;
    private _tokenizeOneInvalidLine;
    private _updateTokensUntilLine;
    private _tokenizeViewport;
}
