import { Event } from 'vs/base/common/event';
import { IRange } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { IModelContentChangedEvent } from 'vs/editor/common/textModelEvents';
import { FoldingModel } from 'vs/editor/contrib/folding/browser/foldingModel';
export declare class HiddenRangeModel {
    private readonly _foldingModel;
    private _hiddenRanges;
    private _foldingModelListener;
    private readonly _updateEventEmitter;
    private _hasLineChanges;
    get onDidChange(): Event<IRange[]>;
    get hiddenRanges(): IRange[];
    constructor(model: FoldingModel);
    notifyChangeModelContent(e: IModelContentChangedEvent): void;
    private updateHiddenRanges;
    private applyHiddenRanges;
    hasRanges(): boolean;
    isHidden(line: number): boolean;
    adjustSelections(selections: Selection[]): boolean;
    dispose(): void;
}
