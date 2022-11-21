import { ISequence } from 'vs/editor/common/diff/algorithms/diffAlgorithm';
import { ILinesDiff, ILinesDiffComputer, ILinesDiffComputerOptions, LineRangeMapping, RangeMapping } from 'vs/editor/common/diff/linesDiffComputer';
export declare class StandardLinesDiffComputer implements ILinesDiffComputer {
    private readonly dynamicProgrammingDiffing;
    private readonly myersDiffingAlgorithm;
    constructor();
    computeDiff(originalLines: string[], modifiedLines: string[], options: ILinesDiffComputerOptions): ILinesDiff;
    private refineDiff;
}
export declare function lineRangeMappingFromRangeMappings(alignments: RangeMapping[]): LineRangeMapping[];
export declare class LineSequence implements ISequence {
    private readonly trimmedHash;
    private readonly lines;
    constructor(trimmedHash: number[], lines: string[]);
    getElement(offset: number): number;
    get length(): number;
    getBoundaryScore(length: number): number;
}
