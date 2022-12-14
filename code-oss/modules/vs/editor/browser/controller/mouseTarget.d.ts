import { IPointerHandlerHelper } from 'vs/editor/browser/controller/mouseHandler';
import { IMouseTargetContentEmptyData, IMouseTargetMarginData, IMouseTarget, IMouseTargetContentEmpty, IMouseTargetContentText, IMouseTargetContentWidget, IMouseTargetMargin, IMouseTargetOutsideEditor, IMouseTargetOverlayWidget, IMouseTargetScrollbar, IMouseTargetTextarea, IMouseTargetUnknown, IMouseTargetViewZone, IMouseTargetContentTextData, IMouseTargetViewZoneData, MouseTargetType } from 'vs/editor/browser/editorBrowser';
import { EditorMouseEvent, EditorPagePosition, PageCoordinates, CoordinatesRelativeToEditor } from 'vs/editor/browser/editorDom';
import { IViewCursorRenderData } from 'vs/editor/browser/viewParts/viewCursors/viewCursor';
import { EditorLayoutInfo } from 'vs/editor/common/config/editorOptions';
import { Position } from 'vs/editor/common/core/position';
import { Range as EditorRange } from 'vs/editor/common/core/range';
import { HorizontalPosition } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import { IViewModel } from 'vs/editor/common/viewModel';
export declare class PointerHandlerLastRenderData {
    readonly lastViewCursorsRenderData: IViewCursorRenderData[];
    readonly lastTextareaPosition: Position | null;
    constructor(lastViewCursorsRenderData: IViewCursorRenderData[], lastTextareaPosition: Position | null);
}
export declare class MouseTarget {
    private static _deduceRage;
    static createUnknown(element: Element | null, mouseColumn: number, position: Position | null): IMouseTargetUnknown;
    static createTextarea(element: Element | null, mouseColumn: number): IMouseTargetTextarea;
    static createMargin(type: MouseTargetType.GUTTER_GLYPH_MARGIN | MouseTargetType.GUTTER_LINE_NUMBERS | MouseTargetType.GUTTER_LINE_DECORATIONS, element: Element | null, mouseColumn: number, position: Position, range: EditorRange, detail: IMouseTargetMarginData): IMouseTargetMargin;
    static createViewZone(type: MouseTargetType.GUTTER_VIEW_ZONE | MouseTargetType.CONTENT_VIEW_ZONE, element: Element | null, mouseColumn: number, position: Position, detail: IMouseTargetViewZoneData): IMouseTargetViewZone;
    static createContentText(element: Element | null, mouseColumn: number, position: Position, range: EditorRange | null, detail: IMouseTargetContentTextData): IMouseTargetContentText;
    static createContentEmpty(element: Element | null, mouseColumn: number, position: Position, detail: IMouseTargetContentEmptyData): IMouseTargetContentEmpty;
    static createContentWidget(element: Element | null, mouseColumn: number, detail: string): IMouseTargetContentWidget;
    static createScrollbar(element: Element | null, mouseColumn: number, position: Position): IMouseTargetScrollbar;
    static createOverlayWidget(element: Element | null, mouseColumn: number, detail: string): IMouseTargetOverlayWidget;
    static createOutsideEditor(mouseColumn: number, position: Position, outsidePosition: 'above' | 'below' | 'left' | 'right', outsideDistance: number): IMouseTargetOutsideEditor;
    private static _typeToString;
    static toString(target: IMouseTarget): string;
}
export declare class HitTestContext {
    readonly viewModel: IViewModel;
    readonly layoutInfo: EditorLayoutInfo;
    readonly viewDomNode: HTMLElement;
    readonly lineHeight: number;
    readonly stickyTabStops: boolean;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly lastRenderData: PointerHandlerLastRenderData;
    private readonly _context;
    private readonly _viewHelper;
    constructor(context: ViewContext, viewHelper: IPointerHandlerHelper, lastRenderData: PointerHandlerLastRenderData);
    getZoneAtCoord(mouseVerticalOffset: number): IMouseTargetViewZoneData | null;
    static getZoneAtCoord(context: ViewContext, mouseVerticalOffset: number): IMouseTargetViewZoneData | null;
    getFullLineRangeAtCoord(mouseVerticalOffset: number): {
        range: EditorRange;
        isAfterLines: boolean;
    };
    getLineNumberAtVerticalOffset(mouseVerticalOffset: number): number;
    isAfterLines(mouseVerticalOffset: number): boolean;
    isInTopPadding(mouseVerticalOffset: number): boolean;
    isInBottomPadding(mouseVerticalOffset: number): boolean;
    getVerticalOffsetForLineNumber(lineNumber: number): number;
    findAttribute(element: Element, attr: string): string | null;
    private static _findAttribute;
    getLineWidth(lineNumber: number): number;
    visibleRangeForPosition(lineNumber: number, column: number): HorizontalPosition | null;
    getPositionFromDOMInfo(spanNode: HTMLElement, offset: number): Position | null;
    getCurrentScrollTop(): number;
    getCurrentScrollLeft(): number;
}
export declare class MouseTargetFactory {
    private readonly _context;
    private readonly _viewHelper;
    constructor(context: ViewContext, viewHelper: IPointerHandlerHelper);
    mouseTargetIsWidget(e: EditorMouseEvent): boolean;
    createMouseTarget(lastRenderData: PointerHandlerLastRenderData, editorPos: EditorPagePosition, pos: PageCoordinates, relativePos: CoordinatesRelativeToEditor, target: HTMLElement | null): IMouseTarget;
    private static _createMouseTarget;
    private static _hitTestContentWidget;
    private static _hitTestOverlayWidget;
    private static _hitTestViewCursor;
    private static _hitTestViewZone;
    private static _hitTestTextArea;
    private static _hitTestMargin;
    private static _hitTestViewLines;
    private static _hitTestMinimap;
    private static _hitTestScrollbarSlider;
    private static _hitTestScrollbar;
    getMouseColumn(relativePos: CoordinatesRelativeToEditor): number;
    static _getMouseColumn(mouseContentHorizontalOffset: number, typicalHalfwidthCharacterWidth: number): number;
    private static createMouseTargetFromHitTestPosition;
    /**
     * Most probably WebKit browsers and Edge
     */
    private static _doHitTestWithCaretRangeFromPoint;
    private static _actualDoHitTestWithCaretRangeFromPoint;
    /**
     * Most probably Gecko
     */
    private static _doHitTestWithCaretPositionFromPoint;
    private static _snapToSoftTabBoundary;
    private static _doHitTest;
}
