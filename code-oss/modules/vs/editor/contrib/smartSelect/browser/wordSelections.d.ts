import { Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { SelectionRange, SelectionRangeProvider } from 'vs/editor/common/languages';
export declare class WordSelectionRangeProvider implements SelectionRangeProvider {
    provideSelectionRanges(model: ITextModel, positions: Position[]): SelectionRange[][];
    private _addInWordRanges;
    private _addWordRanges;
    private _addWhitespaceLine;
}
