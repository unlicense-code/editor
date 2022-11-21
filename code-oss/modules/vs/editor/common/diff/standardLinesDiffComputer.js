/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { assertFn, checkAdjacentItems } from 'vs/base/common/assert';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { OffsetRange, SequenceDiff } from 'vs/editor/common/diff/algorithms/diffAlgorithm';
import { DynamicProgrammingDiffing } from 'vs/editor/common/diff/algorithms/dynamicProgrammingDiffing';
import { optimizeSequenceDiffs } from 'vs/editor/common/diff/algorithms/joinSequenceDiffs';
import { MyersDiffAlgorithm } from 'vs/editor/common/diff/algorithms/myersDiffAlgorithm';
import { LineRange, LineRangeMapping, RangeMapping } from 'vs/editor/common/diff/linesDiffComputer';
export class StandardLinesDiffComputer {
    dynamicProgrammingDiffing = new DynamicProgrammingDiffing();
    myersDiffingAlgorithm = new MyersDiffAlgorithm();
    constructor() { }
    computeDiff(originalLines, modifiedLines, options) {
        const perfectHashes = new Map();
        function getOrCreateHash(text) {
            let hash = perfectHashes.get(text);
            if (hash === undefined) {
                hash = perfectHashes.size;
                perfectHashes.set(text, hash);
            }
            return hash;
        }
        const srcDocLines = originalLines.map((l) => getOrCreateHash(l.trim()));
        const tgtDocLines = modifiedLines.map((l) => getOrCreateHash(l.trim()));
        const sequence1 = new LineSequence(srcDocLines, originalLines);
        const sequence2 = new LineSequence(tgtDocLines, modifiedLines);
        let lineAlignments = (() => {
            if (sequence1.length + sequence2.length < 1500) {
                // Use the improved algorithm for small files
                return this.dynamicProgrammingDiffing.compute(sequence1, sequence2, (offset1, offset2) => originalLines[offset1] === modifiedLines[offset2]
                    ? modifiedLines[offset2].length === 0
                        ? 0.1
                        : 1 + Math.log(1 + modifiedLines[offset2].length)
                    : 0.99);
            }
            return this.myersDiffingAlgorithm.compute(sequence1, sequence2);
        })();
        lineAlignments = optimizeSequenceDiffs(sequence1, sequence2, lineAlignments);
        const alignments = [];
        const scanForWhitespaceChanges = (equalLinesCount) => {
            for (let i = 0; i < equalLinesCount; i++) {
                const seq1Offset = seq1LastStart + i;
                const seq2Offset = seq2LastStart + i;
                if (originalLines[seq1Offset] !== modifiedLines[seq2Offset]) {
                    // This is because of whitespace changes, diff these lines
                    const characterDiffs = this.refineDiff(originalLines, modifiedLines, new SequenceDiff(new OffsetRange(seq1Offset, seq1Offset + 1), new OffsetRange(seq2Offset, seq2Offset + 1)));
                    for (const a of characterDiffs) {
                        alignments.push(a);
                    }
                }
            }
        };
        let seq1LastStart = 0;
        let seq2LastStart = 0;
        for (const diff of lineAlignments) {
            assertFn(() => diff.seq1Range.start - seq1LastStart === diff.seq2Range.start - seq2LastStart);
            const equalLinesCount = diff.seq1Range.start - seq1LastStart;
            scanForWhitespaceChanges(equalLinesCount);
            seq1LastStart = diff.seq1Range.endExclusive;
            seq2LastStart = diff.seq2Range.endExclusive;
            const characterDiffs = this.refineDiff(originalLines, modifiedLines, diff);
            for (const a of characterDiffs) {
                alignments.push(a);
            }
        }
        scanForWhitespaceChanges(originalLines.length - seq1LastStart);
        const changes = lineRangeMappingFromRangeMappings(alignments);
        return {
            quitEarly: false,
            changes: changes,
        };
    }
    refineDiff(originalLines, modifiedLines, diff) {
        const sourceSlice = new Slice(originalLines, diff.seq1Range);
        const targetSlice = new Slice(modifiedLines, diff.seq2Range);
        const originalDiffs = sourceSlice.length + targetSlice.length < 500
            ? this.dynamicProgrammingDiffing.compute(sourceSlice, targetSlice)
            : this.myersDiffingAlgorithm.compute(sourceSlice, targetSlice);
        const diffs = optimizeSequenceDiffs(sourceSlice, targetSlice, originalDiffs);
        const result = diffs.map((d) => new RangeMapping(sourceSlice.translateRange(d.seq1Range).delta(diff.seq1Range.start), targetSlice.translateRange(d.seq2Range).delta(diff.seq2Range.start)));
        return result;
    }
}
export function lineRangeMappingFromRangeMappings(alignments) {
    const changes = [];
    for (const g of group(alignments, (a1, a2) => (a2.originalRange.startLineNumber - (a1.originalRange.endLineNumber - (a1.originalRange.endColumn > 1 ? 0 : 1)) <= 1)
        || (a2.modifiedRange.startLineNumber - (a1.modifiedRange.endLineNumber - (a1.modifiedRange.endColumn > 1 ? 0 : 1)) <= 1))) {
        const first = g[0];
        const last = g[g.length - 1];
        changes.push(new LineRangeMapping(new LineRange(first.originalRange.startLineNumber, last.originalRange.endLineNumber + (last.originalRange.endColumn > 1 || last.modifiedRange.endColumn > 1 ? 1 : 0)), new LineRange(first.modifiedRange.startLineNumber, last.modifiedRange.endLineNumber + (last.originalRange.endColumn > 1 || last.modifiedRange.endColumn > 1 ? 1 : 0)), g));
    }
    assertFn(() => {
        return checkAdjacentItems(changes, (m1, m2) => m2.originalRange.startLineNumber - m1.originalRange.endLineNumberExclusive === m2.modifiedRange.startLineNumber - m1.modifiedRange.endLineNumberExclusive &&
            // There has to be an unchanged line in between (otherwise both diffs should have been joined)
            m1.originalRange.endLineNumberExclusive < m2.originalRange.startLineNumber &&
            m1.modifiedRange.endLineNumberExclusive < m2.modifiedRange.startLineNumber);
    });
    return changes;
}
function* group(items, shouldBeGrouped) {
    let currentGroup;
    let last;
    for (const item of items) {
        if (last !== undefined && shouldBeGrouped(last, item)) {
            currentGroup.push(item);
        }
        else {
            if (currentGroup) {
                yield currentGroup;
            }
            currentGroup = [item];
        }
        last = item;
    }
    if (currentGroup) {
        yield currentGroup;
    }
}
export class LineSequence {
    trimmedHash;
    lines;
    constructor(trimmedHash, lines) {
        this.trimmedHash = trimmedHash;
        this.lines = lines;
    }
    getElement(offset) {
        return this.trimmedHash[offset];
    }
    get length() {
        return this.trimmedHash.length;
    }
    getBoundaryScore(length) {
        const indentationBefore = length === 0 ? 0 : getIndentation(this.lines[length - 1]);
        const indentationAfter = length === this.lines.length ? 0 : getIndentation(this.lines[length]);
        return 1000 - (indentationBefore + indentationAfter);
    }
}
function getIndentation(str) {
    let i = 0;
    while (i < str.length && (str.charCodeAt(i) === 32 /* CharCode.Space */ || str.charCodeAt(i) === 9 /* CharCode.Tab */)) {
        i++;
    }
    return i;
}
class Slice {
    lines;
    lineRange;
    elements;
    firstCharOnLineOffsets;
    constructor(lines, lineRange) {
        this.lines = lines;
        this.lineRange = lineRange;
        let chars = 0;
        this.firstCharOnLineOffsets = new Int32Array(lineRange.length);
        for (let i = lineRange.start; i < lineRange.endExclusive; i++) {
            const line = lines[i];
            chars += line.length;
            this.firstCharOnLineOffsets[i - lineRange.start] = chars + 1;
            chars++;
        }
        this.elements = new Int32Array(chars);
        let offset = 0;
        for (let i = lineRange.start; i < lineRange.endExclusive; i++) {
            const line = lines[i];
            for (let i = 0; i < line.length; i++) {
                this.elements[offset + i] = line.charCodeAt(i);
            }
            offset += line.length;
            if (i < lines.length - 1) {
                this.elements[offset] = '\n'.charCodeAt(0);
                offset += 1;
            }
        }
    }
    getElement(offset) {
        return this.elements[offset];
    }
    get length() {
        return this.elements.length;
    }
    getBoundaryScore(length) {
        //   a   b   c   ,           d   e   f
        // 11  0   0   12  15  6   13  0   0   11
        const prevCategory = getCategory(length > 0 ? this.elements[length - 1] : -1);
        const nextCategory = getCategory(length < this.elements.length ? this.elements[length] : -1);
        let score = 0;
        if (prevCategory !== nextCategory) {
            score += 10;
        }
        score += getCategoryBoundaryScore(prevCategory);
        score += getCategoryBoundaryScore(nextCategory);
        return score;
    }
    translateOffset(offset) {
        // find smallest i, so that lineBreakOffsets[i] > offset using binary search
        let i = 0;
        let j = this.firstCharOnLineOffsets.length;
        while (i < j) {
            const k = Math.floor((i + j) / 2);
            if (this.firstCharOnLineOffsets[k] > offset) {
                j = k;
            }
            else {
                i = k + 1;
            }
        }
        const offsetOfPrevLineBreak = i === 0 ? 0 : this.firstCharOnLineOffsets[i - 1];
        return new Position(i + 1, offset - offsetOfPrevLineBreak + 1);
    }
    translateRange(range) {
        return Range.fromPositions(this.translateOffset(range.start), this.translateOffset(range.endExclusive));
    }
}
var CharBoundaryCategory;
(function (CharBoundaryCategory) {
    CharBoundaryCategory[CharBoundaryCategory["Word"] = 0] = "Word";
    CharBoundaryCategory[CharBoundaryCategory["End"] = 1] = "End";
    CharBoundaryCategory[CharBoundaryCategory["Other"] = 2] = "Other";
    CharBoundaryCategory[CharBoundaryCategory["Space"] = 3] = "Space";
})(CharBoundaryCategory || (CharBoundaryCategory = {}));
function getCategoryBoundaryScore(category) {
    return category;
}
function getCategory(charCode) {
    if (isSpace(charCode)) {
        return 3 /* CharBoundaryCategory.Space */;
    }
    else if (isWordChar(charCode)) {
        return 0 /* CharBoundaryCategory.Word */;
    }
    else if (charCode === -1) {
        return 1 /* CharBoundaryCategory.End */;
    }
    else {
        return 2 /* CharBoundaryCategory.Other */;
    }
}
function isWordChar(charCode) {
    return ((charCode >= 97 /* CharCode.a */ && charCode <= 122 /* CharCode.z */)
        || (charCode >= 65 /* CharCode.A */ && charCode <= 90 /* CharCode.Z */)
        || (charCode >= 48 /* CharCode.Digit0 */ && charCode <= 57 /* CharCode.Digit9 */));
}
function isSpace(charCode) {
    return charCode === 32 /* CharCode.Space */ || charCode === 9 /* CharCode.Tab */ || charCode === 10 /* CharCode.LineFeed */ || charCode === 13 /* CharCode.CarriageReturn */;
}
