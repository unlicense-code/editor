import { CallbackIterable } from 'vs/base/common/arrays';
import { Disposable } from 'vs/base/common/lifecycle';
import { IPosition } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { TextModel } from 'vs/editor/common/model/textModel';
import { BracketInfo, BracketPairInfo, BracketPairWithMinIndentationInfo, IBracketPairsTextModelPart, IFoundBracket } from 'vs/editor/common/textModelBracketPairs';
import { IModelContentChangedEvent, IModelLanguageChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent } from 'vs/editor/common/textModelEvents';
export declare class BracketPairsTextModelPart extends Disposable implements IBracketPairsTextModelPart {
    private readonly textModel;
    private readonly languageConfigurationService;
    private readonly bracketPairsTree;
    private readonly onDidChangeEmitter;
    readonly onDidChange: import("vs/base/common/event").Event<void>;
    private get canBuildAST();
    private bracketsRequested;
    constructor(textModel: TextModel, languageConfigurationService: ILanguageConfigurationService);
    handleDidChangeOptions(e: IModelOptionsChangedEvent): void;
    handleDidChangeLanguage(e: IModelLanguageChangedEvent): void;
    handleDidChangeContent(change: IModelContentChangedEvent): void;
    handleDidChangeBackgroundTokenizationState(): void;
    handleDidChangeTokens(e: IModelTokensChangedEvent): void;
    private updateBracketPairsTree;
    /**
     * Returns all bracket pairs that intersect the given range.
     * The result is sorted by the start position.
    */
    getBracketPairsInRange(range: Range): CallbackIterable<BracketPairInfo>;
    getBracketPairsInRangeWithMinIndentation(range: Range): CallbackIterable<BracketPairWithMinIndentationInfo>;
    getBracketsInRange(range: Range): CallbackIterable<BracketInfo>;
    findMatchingBracketUp(_bracket: string, _position: IPosition, maxDuration?: number): Range | null;
    matchBracket(position: IPosition, maxDuration?: number): [Range, Range] | null;
    private _establishBracketSearchOffsets;
    private _matchBracket;
    private _matchFoundBracket;
    private _findMatchingBracketUp;
    private _findMatchingBracketDown;
    findPrevBracket(_position: IPosition): IFoundBracket | null;
    findNextBracket(_position: IPosition): IFoundBracket | null;
    findEnclosingBrackets(_position: IPosition, maxDuration?: number): [Range, Range] | null;
    private _toFoundBracket;
}
