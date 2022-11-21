import 'vs/css!./linesDecorations';
import { DecorationToRender, DedupOverlay } from 'vs/editor/browser/viewParts/glyphMargin/glyphMargin';
import { RenderingContext } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import * as viewEvents from 'vs/editor/common/viewEvents';
export declare class LinesDecorationsOverlay extends DedupOverlay {
    private readonly _context;
    private _decorationsLeft;
    private _decorationsWidth;
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
