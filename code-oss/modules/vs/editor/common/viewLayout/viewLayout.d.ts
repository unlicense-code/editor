import { Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IScrollPosition, ScrollEvent, Scrollable, INewScrollPosition } from 'vs/base/common/scrollable';
import { ConfigurationChangedEvent } from 'vs/editor/common/config/editorOptions';
import { ScrollType } from 'vs/editor/common/editorCommon';
import { IEditorConfiguration } from 'vs/editor/common/config/editorConfiguration';
import { IEditorWhitespace, IPartialViewLinesViewportData, IViewLayout, IViewWhitespaceViewportData, IWhitespaceChangeAccessor, Viewport } from 'vs/editor/common/viewModel';
import { ContentSizeChangedEvent } from 'vs/editor/common/viewModelEventDispatcher';
export declare class ViewLayout extends Disposable implements IViewLayout {
    private readonly _configuration;
    private readonly _linesLayout;
    private readonly _scrollable;
    readonly onDidScroll: Event<ScrollEvent>;
    readonly onDidContentSizeChange: Event<ContentSizeChangedEvent>;
    constructor(configuration: IEditorConfiguration, lineCount: number, scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable);
    dispose(): void;
    getScrollable(): Scrollable;
    onHeightMaybeChanged(): void;
    private _configureSmoothScrollDuration;
    onConfigurationChanged(e: ConfigurationChangedEvent): void;
    onFlushed(lineCount: number): void;
    onLinesDeleted(fromLineNumber: number, toLineNumber: number): void;
    onLinesInserted(fromLineNumber: number, toLineNumber: number): void;
    private _getHorizontalScrollbarHeight;
    private _getContentHeight;
    private _updateHeight;
    getCurrentViewport(): Viewport;
    getFutureViewport(): Viewport;
    private _computeContentWidth;
    setMaxLineWidth(maxLineWidth: number): void;
    saveState(): {
        scrollTop: number;
        scrollTopWithoutViewZones: number;
        scrollLeft: number;
    };
    changeWhitespace(callback: (accessor: IWhitespaceChangeAccessor) => void): boolean;
    getVerticalOffsetForLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    getVerticalOffsetAfterLineNumber(lineNumber: number, includeViewZones?: boolean): number;
    isAfterLines(verticalOffset: number): boolean;
    isInTopPadding(verticalOffset: number): boolean;
    isInBottomPadding(verticalOffset: number): boolean;
    getLineNumberAtVerticalOffset(verticalOffset: number): number;
    getWhitespaceAtVerticalOffset(verticalOffset: number): IViewWhitespaceViewportData | null;
    getLinesViewportData(): IPartialViewLinesViewportData;
    getLinesViewportDataAtScrollTop(scrollTop: number): IPartialViewLinesViewportData;
    getWhitespaceViewportData(): IViewWhitespaceViewportData[];
    getWhitespaces(): IEditorWhitespace[];
    getContentWidth(): number;
    getScrollWidth(): number;
    getContentHeight(): number;
    getScrollHeight(): number;
    getCurrentScrollLeft(): number;
    getCurrentScrollTop(): number;
    validateScrollPosition(scrollPosition: INewScrollPosition): IScrollPosition;
    setScrollPosition(position: INewScrollPosition, type: ScrollType): void;
    deltaScrollNow(deltaScrollLeft: number, deltaScrollTop: number): void;
}
