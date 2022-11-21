import { Disposable } from 'vs/base/common/lifecycle';
import { ITextModel } from 'vs/editor/common/model';
import { DetailedLineRangeMapping } from 'vs/workbench/contrib/mergeEditor/browser/model/mapping';
import { LineRangeEdit } from 'vs/workbench/contrib/mergeEditor/browser/model/editing';
import { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';
import { IMergeDiffComputer } from './diffComputer';
import { IObservable, IReader, ITransaction } from 'vs/base/common/observable';
export declare class TextModelDiffs extends Disposable {
    private readonly baseTextModel;
    private readonly textModel;
    private readonly diffComputer;
    private recomputeCount;
    private readonly _state;
    private readonly _diffs;
    private readonly barrier;
    private isDisposed;
    get isApplyingChange(): boolean;
    constructor(baseTextModel: ITextModel, textModel: ITextModel, diffComputer: IMergeDiffComputer);
    get state(): IObservable<TextModelDiffState, TextModelDiffChangeReason>;
    /**
     * Diffs from base to input.
    */
    get diffs(): IObservable<DetailedLineRangeMapping[], TextModelDiffChangeReason>;
    private isInitializing;
    private recompute;
    private ensureUpToDate;
    removeDiffs(diffToRemoves: DetailedLineRangeMapping[], transaction: ITransaction | undefined): void;
    /**
     * Edit must be conflict free.
     */
    applyEditRelativeToOriginal(edit: LineRangeEdit, transaction: ITransaction | undefined): void;
    findTouchingDiffs(baseRange: LineRange): DetailedLineRangeMapping[];
    private getResultLine;
    getResultLineRange(baseRange: LineRange, reader?: IReader): LineRange;
}
export declare const enum TextModelDiffChangeReason {
    other = 0,
    textChange = 1
}
export declare const enum TextModelDiffState {
    initializing = 1,
    upToDate = 2,
    updating = 3,
    error = 4
}
export interface ITextModelDiffsState {
    state: TextModelDiffState;
    diffs: DetailedLineRangeMapping[];
}
