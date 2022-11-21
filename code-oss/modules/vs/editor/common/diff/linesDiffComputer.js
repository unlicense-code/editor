/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Maps a line range in the original text model to a line range in the modified text model.
 */
export class LineRangeMapping {
    /**
     * The line range in the original text model.
     */
    originalRange;
    /**
     * The line range in the modified text model.
     */
    modifiedRange;
    /**
     * If inner changes have not been computed, this is set to undefined.
     * Otherwise, it represents the character-level diff in this line range.
     * The original range of each range mapping should be contained in the original line range (same for modified).
     * Must not be an empty array.
     */
    innerChanges;
    constructor(originalRange, modifiedRange, innerChanges) {
        this.originalRange = originalRange;
        this.modifiedRange = modifiedRange;
        this.innerChanges = innerChanges;
    }
    toString() {
        return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
    }
}
/**
 * Maps a range in the original text model to a range in the modified text model.
 */
export class RangeMapping {
    /**
     * The original range.
     */
    originalRange;
    /**
     * The modified range.
     */
    modifiedRange;
    constructor(originalRange, modifiedRange) {
        this.originalRange = originalRange;
        this.modifiedRange = modifiedRange;
    }
    toString() {
        return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
    }
}
/**
 * A range of lines (1-based).
 */
export class LineRange {
    /**
     * The start line number.
     */
    startLineNumber;
    /**
     * The end line number (exclusive).
     */
    endLineNumberExclusive;
    constructor(startLineNumber, endLineNumberExclusive) {
        this.startLineNumber = startLineNumber;
        this.endLineNumberExclusive = endLineNumberExclusive;
    }
    /**
     * Indicates if this line range is empty.
     */
    get isEmpty() {
        return this.startLineNumber === this.endLineNumberExclusive;
    }
    /**
     * Moves this line range by the given offset of line numbers.
     */
    delta(offset) {
        return new LineRange(this.startLineNumber + offset, this.endLineNumberExclusive + offset);
    }
    /**
     * The number of lines this line range spans.
     */
    get length() {
        return this.endLineNumberExclusive - this.startLineNumber;
    }
    /**
     * Creates a line range that combines this and the given line range.
     */
    join(other) {
        return new LineRange(Math.min(this.startLineNumber, other.startLineNumber), Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive));
    }
    toString() {
        return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
    }
}
