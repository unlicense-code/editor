import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { ViewportData } from 'vs/editor/common/viewLayout/viewLinesViewportData';
import { IViewLayout, ViewModelDecoration } from 'vs/editor/common/viewModel';
export interface IViewLines {
    linesVisibleRangesForRange(range: Range, includeNewLines: boolean): LineVisibleRanges[] | null;
    visibleRangeForPosition(position: Position): HorizontalPosition | null;
}
export declare abstract class RestrictedRenderingContext {
    _restrictedRenderingContextBrand: void;
    readonly viewportData: ViewportData;
    readonly scrollWidth: number;
    readonly scrollHeight: number;
    readonly visibleRange: Range;
    readonly bigNumbersDelta: number;
    readonly scrollTop: number;
    readonly scrollLeft: number;
    readonly viewportWidth: number;
    readonly viewportHeight: number;
    private readonly _viewLayout;
    constructor(viewLayout: IViewLayout, viewportData: ViewportData);
    getScrolledTopFromAbsoluteTop(absoluteTop: number): number;
    getVerticalOffsetForLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    getVerticalOffsetAfterLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    getDecorationsInViewport(): ViewModelDecoration[];
}
export declare class RenderingContext extends RestrictedRenderingContext {
    _renderingContextBrand: void;
    private readonly _viewLines;
    constructor(viewLayout: IViewLayout, viewportData: ViewportData, viewLines: IViewLines);
    linesVisibleRangesForRange(range: Range, includeNewLines: boolean): LineVisibleRanges[] | null;
    visibleRangeForPosition(position: Position): HorizontalPosition | null;
}
export declare class LineVisibleRanges {
    readonly outsideRenderedLine: boolean;
    readonly lineNumber: number;
    readonly ranges: HorizontalRange[];
    /**
     * Returns the element with the smallest `lineNumber`.
     */
    static firstLine(ranges: LineVisibleRanges[] | null): LineVisibleRanges | null;
    /**
     * Returns the element with the largest `lineNumber`.
     */
    static lastLine(ranges: LineVisibleRanges[] | null): LineVisibleRanges | null;
    constructor(outsideRenderedLine: boolean, lineNumber: number, ranges: HorizontalRange[]);
}
export declare class HorizontalRange {
    _horizontalRangeBrand: void;
    left: number;
    width: number;
    static from(ranges: FloatHorizontalRange[]): HorizontalRange[];
    constructor(left: number, width: number);
    toString(): string;
}
export declare class FloatHorizontalRange {
    _floatHorizontalRangeBrand: void;
    left: number;
    width: number;
    constructor(left: number, width: number);
    toString(): string;
    static compare(a: FloatHorizontalRange, b: FloatHorizontalRange): number;
}
export declare class HorizontalPosition {
    outsideRenderedLine: boolean;
    /**
     * Math.round(this.originalLeft)
     */
    left: number;
    originalLeft: number;
    constructor(outsideRenderedLine: boolean, left: number);
}
export declare class VisibleRanges {
    readonly outsideRenderedLine: boolean;
    readonly ranges: FloatHorizontalRange[];
    constructor(outsideRenderedLine: boolean, ranges: FloatHorizontalRange[]);
}
