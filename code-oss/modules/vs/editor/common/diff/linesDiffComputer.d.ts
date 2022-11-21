import { Range } from 'vs/editor/common/core/range';
export interface ILinesDiffComputer {
    computeDiff(originalLines: string[], modifiedLines: string[], options: ILinesDiffComputerOptions): ILinesDiff;
}
export interface ILinesDiffComputerOptions {
    readonly ignoreTrimWhitespace: boolean;
    readonly maxComputationTimeMs: number;
}
export interface ILinesDiff {
    readonly quitEarly: boolean;
    readonly changes: LineRangeMapping[];
}
/**
 * Maps a line range in the original text model to a line range in the modified text model.
 */
export declare class LineRangeMapping {
    /**
     * The line range in the original text model.
     */
    readonly originalRange: LineRange;
    /**
     * The line range in the modified text model.
     */
    readonly modifiedRange: LineRange;
    /**
     * If inner changes have not been computed, this is set to undefined.
     * Otherwise, it represents the character-level diff in this line range.
     * The original range of each range mapping should be contained in the original line range (same for modified).
     * Must not be an empty array.
     */
    readonly innerChanges: RangeMapping[] | undefined;
    constructor(originalRange: LineRange, modifiedRange: LineRange, innerChanges: RangeMapping[] | undefined);
    toString(): string;
}
/**
 * Maps a range in the original text model to a range in the modified text model.
 */
export declare class RangeMapping {
    /**
     * The original range.
     */
    readonly originalRange: Range;
    /**
     * The modified range.
     */
    readonly modifiedRange: Range;
    constructor(originalRange: Range, modifiedRange: Range);
    toString(): string;
}
/**
 * A range of lines (1-based).
 */
export declare class LineRange {
    /**
     * The start line number.
     */
    readonly startLineNumber: number;
    /**
     * The end line number (exclusive).
     */
    readonly endLineNumberExclusive: number;
    constructor(startLineNumber: number, endLineNumberExclusive: number);
    /**
     * Indicates if this line range is empty.
     */
    get isEmpty(): boolean;
    /**
     * Moves this line range by the given offset of line numbers.
     */
    delta(offset: number): LineRange;
    /**
     * The number of lines this line range spans.
     */
    get length(): number;
    /**
     * Creates a line range that combines this and the given line range.
     */
    join(other: LineRange): LineRange;
    toString(): string;
}
