import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
/**
 * Represents a non-negative length in terms of line and column count.
 * Prefer using {@link Length} for performance reasons.
*/
export declare class LengthObj {
    readonly lineCount: number;
    readonly columnCount: number;
    static zero: LengthObj;
    static lengthDiffNonNegative(start: LengthObj, end: LengthObj): LengthObj;
    constructor(lineCount: number, columnCount: number);
    isZero(): boolean;
    toLength(): Length;
    isLessThan(other: LengthObj): boolean;
    isGreaterThan(other: LengthObj): boolean;
    equals(other: LengthObj): boolean;
    compare(other: LengthObj): number;
    add(other: LengthObj): LengthObj;
    toString(): string;
}
/**
 * The end must be greater than or equal to the start.
*/
export declare function lengthDiff(startLineCount: number, startColumnCount: number, endLineCount: number, endColumnCount: number): Length;
/**
 * Represents a non-negative length in terms of line and column count.
 * Does not allocate.
*/
export declare type Length = {
    _brand: 'Length';
};
export declare const lengthZero: Length;
export declare function lengthIsZero(length: Length): boolean;
export declare function toLength(lineCount: number, columnCount: number): Length;
export declare function lengthToObj(length: Length): LengthObj;
export declare function lengthGetLineCount(length: Length): number;
/**
 * Returns the amount of columns of the given length, assuming that it does not span any line.
*/
export declare function lengthGetColumnCountIfZeroLineCount(length: Length): number;
export declare function lengthAdd(length1: Length, length2: Length): Length;
export declare function sumLengths<T>(items: readonly T[], lengthFn: (item: T) => Length): Length;
export declare function lengthEquals(length1: Length, length2: Length): boolean;
/**
 * Returns a non negative length `result` such that `lengthAdd(length1, result) = length2`, or zero if such length does not exist.
 */
export declare function lengthDiffNonNegative(length1: Length, length2: Length): Length;
export declare function lengthLessThan(length1: Length, length2: Length): boolean;
export declare function lengthLessThanEqual(length1: Length, length2: Length): boolean;
export declare function lengthGreaterThanEqual(length1: Length, length2: Length): boolean;
export declare function lengthToPosition(length: Length): Position;
export declare function positionToLength(position: Position): Length;
export declare function lengthsToRange(lengthStart: Length, lengthEnd: Length): Range;
export declare function lengthCompare(length1: Length, length2: Length): number;
export declare function lengthOfString(str: string): Length;
export declare function lengthOfStringObj(str: string): LengthObj;
/**
 * Computes a numeric hash of the given length.
*/
export declare function lengthHash(length: Length): number;
