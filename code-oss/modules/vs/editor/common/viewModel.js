/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as strings from 'vs/base/common/strings';
import { Range } from 'vs/editor/common/core/range';
export class Viewport {
    _viewportBrand = undefined;
    top;
    left;
    width;
    height;
    constructor(top, left, width, height) {
        this.top = top | 0;
        this.left = left | 0;
        this.width = width | 0;
        this.height = height | 0;
    }
}
export class MinimapLinesRenderingData {
    tabSize;
    data;
    constructor(tabSize, data) {
        this.tabSize = tabSize;
        this.data = data;
    }
}
export class ViewLineData {
    _viewLineDataBrand = undefined;
    /**
     * The content at this view line.
     */
    content;
    /**
     * Does this line continue with a wrapped line?
     */
    continuesWithWrappedLine;
    /**
     * The minimum allowed column at this view line.
     */
    minColumn;
    /**
     * The maximum allowed column at this view line.
     */
    maxColumn;
    /**
     * The visible column at the start of the line (after the fauxIndent).
     */
    startVisibleColumn;
    /**
     * The tokens at this view line.
     */
    tokens;
    /**
     * Additional inline decorations for this line.
    */
    inlineDecorations;
    constructor(content, continuesWithWrappedLine, minColumn, maxColumn, startVisibleColumn, tokens, inlineDecorations) {
        this.content = content;
        this.continuesWithWrappedLine = continuesWithWrappedLine;
        this.minColumn = minColumn;
        this.maxColumn = maxColumn;
        this.startVisibleColumn = startVisibleColumn;
        this.tokens = tokens;
        this.inlineDecorations = inlineDecorations;
    }
}
export class ViewLineRenderingData {
    /**
     * The minimum allowed column at this view line.
     */
    minColumn;
    /**
     * The maximum allowed column at this view line.
     */
    maxColumn;
    /**
     * The content at this view line.
     */
    content;
    /**
     * Does this line continue with a wrapped line?
     */
    continuesWithWrappedLine;
    /**
     * Describes if `content` contains RTL characters.
     */
    containsRTL;
    /**
     * Describes if `content` contains non basic ASCII chars.
     */
    isBasicASCII;
    /**
     * The tokens at this view line.
     */
    tokens;
    /**
     * Inline decorations at this view line.
     */
    inlineDecorations;
    /**
     * The tab size for this view model.
     */
    tabSize;
    /**
     * The visible column at the start of the line (after the fauxIndent)
     */
    startVisibleColumn;
    constructor(minColumn, maxColumn, content, continuesWithWrappedLine, mightContainRTL, mightContainNonBasicASCII, tokens, inlineDecorations, tabSize, startVisibleColumn) {
        this.minColumn = minColumn;
        this.maxColumn = maxColumn;
        this.content = content;
        this.continuesWithWrappedLine = continuesWithWrappedLine;
        this.isBasicASCII = ViewLineRenderingData.isBasicASCII(content, mightContainNonBasicASCII);
        this.containsRTL = ViewLineRenderingData.containsRTL(content, this.isBasicASCII, mightContainRTL);
        this.tokens = tokens;
        this.inlineDecorations = inlineDecorations;
        this.tabSize = tabSize;
        this.startVisibleColumn = startVisibleColumn;
    }
    static isBasicASCII(lineContent, mightContainNonBasicASCII) {
        if (mightContainNonBasicASCII) {
            return strings.isBasicASCII(lineContent);
        }
        return true;
    }
    static containsRTL(lineContent, isBasicASCII, mightContainRTL) {
        if (!isBasicASCII && mightContainRTL) {
            return strings.containsRTL(lineContent);
        }
        return false;
    }
}
export var InlineDecorationType;
(function (InlineDecorationType) {
    InlineDecorationType[InlineDecorationType["Regular"] = 0] = "Regular";
    InlineDecorationType[InlineDecorationType["Before"] = 1] = "Before";
    InlineDecorationType[InlineDecorationType["After"] = 2] = "After";
    InlineDecorationType[InlineDecorationType["RegularAffectingLetterSpacing"] = 3] = "RegularAffectingLetterSpacing";
})(InlineDecorationType || (InlineDecorationType = {}));
export class InlineDecoration {
    range;
    inlineClassName;
    type;
    constructor(range, inlineClassName, type) {
        this.range = range;
        this.inlineClassName = inlineClassName;
        this.type = type;
    }
}
export class SingleLineInlineDecoration {
    startOffset;
    endOffset;
    inlineClassName;
    inlineClassNameAffectsLetterSpacing;
    constructor(startOffset, endOffset, inlineClassName, inlineClassNameAffectsLetterSpacing) {
        this.startOffset = startOffset;
        this.endOffset = endOffset;
        this.inlineClassName = inlineClassName;
        this.inlineClassNameAffectsLetterSpacing = inlineClassNameAffectsLetterSpacing;
    }
    toInlineDecoration(lineNumber) {
        return new InlineDecoration(new Range(lineNumber, this.startOffset + 1, lineNumber, this.endOffset + 1), this.inlineClassName, this.inlineClassNameAffectsLetterSpacing ? 3 /* InlineDecorationType.RegularAffectingLetterSpacing */ : 0 /* InlineDecorationType.Regular */);
    }
}
export class ViewModelDecoration {
    _viewModelDecorationBrand = undefined;
    range;
    options;
    constructor(range, options) {
        this.range = range;
        this.options = options;
    }
}
export class OverviewRulerDecorationsGroup {
    color;
    zIndex;
    data;
    constructor(color, zIndex, 
    /**
     * Decorations are encoded in a number array using the following scheme:
     *  - 3*i = lane
     *  - 3*i+1 = startLineNumber
     *  - 3*i+2 = endLineNumber
     */
    data) {
        this.color = color;
        this.zIndex = zIndex;
        this.data = data;
    }
    static cmp(a, b) {
        if (a.zIndex === b.zIndex) {
            if (a.color < b.color) {
                return -1;
            }
            if (a.color > b.color) {
                return 1;
            }
            return 0;
        }
        return a.zIndex - b.zIndex;
    }
}
