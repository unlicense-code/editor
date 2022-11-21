import { Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { SelectionRange, SelectionRangeProvider } from 'vs/editor/common/languages';
export declare class BracketSelectionRangeProvider implements SelectionRangeProvider {
    provideSelectionRanges(model: ITextModel, positions: Position[]): Promise<SelectionRange[][]>;
    static _maxDuration: number;
    private static readonly _maxRounds;
    private static _bracketsRightYield;
    private static _bracketsLeftYield;
    private static _addBracketLeading;
}
