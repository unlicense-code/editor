import 'vs/css!./glyphMargin';
import { DynamicViewOverlay } from 'vs/editor/browser/view/dynamicViewOverlay';
import { RenderingContext } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import * as viewEvents from 'vs/editor/common/viewEvents';
export declare class DecorationToRender {
    _decorationToRenderBrand: void;
    startLineNumber: number;
    endLineNumber: number;
    className: string;
    constructor(startLineNumber: number, endLineNumber: number, className: string);
}
export declare abstract class DedupOverlay extends DynamicViewOverlay {
    protected _render(visibleStartLineNumber: number, visibleEndLineNumber: number, decorations: DecorationToRender[]): string[][];
}
export declare class GlyphMarginOverlay extends DedupOverlay {
    private readonly _context;
    private _lineHeight;
    private _glyphMargin;
    private _glyphMarginLeft;
    private _glyphMarginWidth;
    private _renderResult;
    constructor(context: ViewContext);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    protected _getDecorations(ctx: RenderingContext): DecorationToRender[];
    prepareRender(ctx: RenderingContext): void;
    render(startLineNumber: number, lineNumber: number): string;
}
