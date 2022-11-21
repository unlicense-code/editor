/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class RestrictedRenderingContext {
    _restrictedRenderingContextBrand = undefined;
    viewportData;
    scrollWidth;
    scrollHeight;
    visibleRange;
    bigNumbersDelta;
    scrollTop;
    scrollLeft;
    viewportWidth;
    viewportHeight;
    _viewLayout;
    constructor(viewLayout, viewportData) {
        this._viewLayout = viewLayout;
        this.viewportData = viewportData;
        this.scrollWidth = this._viewLayout.getScrollWidth();
        this.scrollHeight = this._viewLayout.getScrollHeight();
        this.visibleRange = this.viewportData.visibleRange;
        this.bigNumbersDelta = this.viewportData.bigNumbersDelta;
        const vInfo = this._viewLayout.getCurrentViewport();
        this.scrollTop = vInfo.top;
        this.scrollLeft = vInfo.left;
        this.viewportWidth = vInfo.width;
        this.viewportHeight = vInfo.height;
    }
    getScrolledTopFromAbsoluteTop(absoluteTop) {
        return absoluteTop - this.scrollTop;
    }
    getVerticalOffsetForLineNumber(lineNumber, includeViewZones) {
        return this._viewLayout.getVerticalOffsetForLineNumber(lineNumber, includeViewZones);
    }
    getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones) {
        return this._viewLayout.getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones);
    }
    getDecorationsInViewport() {
        return this.viewportData.getDecorationsInViewport();
    }
}
export class RenderingContext extends RestrictedRenderingContext {
    _renderingContextBrand = undefined;
    _viewLines;
    constructor(viewLayout, viewportData, viewLines) {
        super(viewLayout, viewportData);
        this._viewLines = viewLines;
    }
    linesVisibleRangesForRange(range, includeNewLines) {
        return this._viewLines.linesVisibleRangesForRange(range, includeNewLines);
    }
    visibleRangeForPosition(position) {
        return this._viewLines.visibleRangeForPosition(position);
    }
}
export class LineVisibleRanges {
    outsideRenderedLine;
    lineNumber;
    ranges;
    /**
     * Returns the element with the smallest `lineNumber`.
     */
    static firstLine(ranges) {
        if (!ranges) {
            return null;
        }
        let result = null;
        for (const range of ranges) {
            if (!result || range.lineNumber < result.lineNumber) {
                result = range;
            }
        }
        return result;
    }
    /**
     * Returns the element with the largest `lineNumber`.
     */
    static lastLine(ranges) {
        if (!ranges) {
            return null;
        }
        let result = null;
        for (const range of ranges) {
            if (!result || range.lineNumber > result.lineNumber) {
                result = range;
            }
        }
        return result;
    }
    constructor(outsideRenderedLine, lineNumber, ranges) {
        this.outsideRenderedLine = outsideRenderedLine;
        this.lineNumber = lineNumber;
        this.ranges = ranges;
    }
}
export class HorizontalRange {
    _horizontalRangeBrand = undefined;
    left;
    width;
    static from(ranges) {
        const result = new Array(ranges.length);
        for (let i = 0, len = ranges.length; i < len; i++) {
            const range = ranges[i];
            result[i] = new HorizontalRange(range.left, range.width);
        }
        return result;
    }
    constructor(left, width) {
        this.left = Math.round(left);
        this.width = Math.round(width);
    }
    toString() {
        return `[${this.left},${this.width}]`;
    }
}
export class FloatHorizontalRange {
    _floatHorizontalRangeBrand = undefined;
    left;
    width;
    constructor(left, width) {
        this.left = left;
        this.width = width;
    }
    toString() {
        return `[${this.left},${this.width}]`;
    }
    static compare(a, b) {
        return a.left - b.left;
    }
}
export class HorizontalPosition {
    outsideRenderedLine;
    /**
     * Math.round(this.originalLeft)
     */
    left;
    originalLeft;
    constructor(outsideRenderedLine, left) {
        this.outsideRenderedLine = outsideRenderedLine;
        this.originalLeft = left;
        this.left = Math.round(this.originalLeft);
    }
}
export class VisibleRanges {
    outsideRenderedLine;
    ranges;
    constructor(outsideRenderedLine, ranges) {
        this.outsideRenderedLine = outsideRenderedLine;
        this.ranges = ranges;
    }
}
