import { FastDomNode } from 'vs/base/browser/fastDomNode';
import { Position } from 'vs/editor/common/core/position';
import { RenderingContext, RestrictedRenderingContext } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import * as viewEvents from 'vs/editor/common/viewEvents';
export interface IViewCursorRenderData {
    domNode: HTMLElement;
    position: Position;
    contentLeft: number;
    width: number;
    height: number;
}
export declare class ViewCursor {
    private readonly _context;
    private readonly _domNode;
    private _cursorStyle;
    private _lineCursorWidth;
    private _lineHeight;
    private _typicalHalfwidthCharacterWidth;
    private _isVisible;
    private _position;
    private _lastRenderedContent;
    private _renderData;
    constructor(context: ViewContext);
    getDomNode(): FastDomNode<HTMLElement>;
    getPosition(): Position;
    show(): void;
    hide(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorPositionChanged(position: Position): boolean;
    /**
     * If `this._position` is inside a grapheme, returns the position where the grapheme starts.
     * Also returns the next grapheme.
     */
    private _getGraphemeAwarePosition;
    private _prepareRender;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): IViewCursorRenderData | null;
}
