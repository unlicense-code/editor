import { IDiffAlgorithm, SequenceDiff, ISequence } from 'vs/editor/common/diff/algorithms/diffAlgorithm';
/**
 * A O(MN) diffing algorithm that supports a score function.
 * The algorithm can be improved by processing the 2d array diagonally.
*/
export declare class DynamicProgrammingDiffing implements IDiffAlgorithm {
    compute(sequence1: ISequence, sequence2: ISequence, equalityScore?: (offset1: number, offset2: number) => number): SequenceDiff[];
}
