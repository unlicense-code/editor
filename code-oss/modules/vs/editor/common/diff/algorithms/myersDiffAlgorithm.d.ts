import { IDiffAlgorithm, ISequence, SequenceDiff } from 'vs/editor/common/diff/algorithms/diffAlgorithm';
/**
 * An O(ND) diff algorithm that has a quadratic space worst-case complexity.
*/
export declare class MyersDiffAlgorithm implements IDiffAlgorithm {
    compute(seq1: ISequence, seq2: ISequence): SequenceDiff[];
}
