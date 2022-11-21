/**
 * Represents a synchronous diff algorithm. Should be executed in a worker.
*/
export interface IDiffAlgorithm {
    compute(sequence1: ISequence, sequence2: ISequence): SequenceDiff[];
}
export declare class SequenceDiff {
    readonly seq1Range: OffsetRange;
    readonly seq2Range: OffsetRange;
    constructor(seq1Range: OffsetRange, seq2Range: OffsetRange);
    reverse(): SequenceDiff;
    toString(): string;
}
/**
 * Todo move this class to some top level utils.
*/
export declare class OffsetRange {
    readonly start: number;
    readonly endExclusive: number;
    constructor(start: number, endExclusive: number);
    get isEmpty(): boolean;
    delta(offset: number): OffsetRange;
    get length(): number;
    toString(): string;
}
export interface ISequence {
    getElement(offset: number): number;
    get length(): number;
    /**
     * The higher the score, the better that offset can be used to split the sequence.
     * Is used to optimize insertions.
     * Must not be negative.
    */
    getBoundaryScore?(length: number): number;
}
