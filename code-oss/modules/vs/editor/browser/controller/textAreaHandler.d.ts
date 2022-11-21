import 'vs/css!./textAreaHandler';
import { FastDomNode } from 'vs/base/browser/fastDomNode';
import { ViewController } from 'vs/editor/browser/view/viewController';
import { ViewPart } from 'vs/editor/browser/view/viewPart';
import { Position } from 'vs/editor/common/core/position';
import { RenderingContext, RestrictedRenderingContext, HorizontalPosition } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import * as viewEvents from 'vs/editor/common/viewEvents';
import { IEditorAriaOptions } from 'vs/editor/browser/editorBrowser';
export interface IVisibleRangeProvider {
    visibleRangeForPosition(position: Position): HorizontalPosition | null;
}
export declare class TextAreaHandler extends ViewPart {
    private readonly _viewController;
    private readonly _visibleRangeProvider;
    private _scrollLeft;
    private _scrollTop;
    private _accessibilitySupport;
    private _accessibilityPageSize;
    private _accessibilityWriteTimer;
    private _textAreaWrapping;
    private _textAreaWidth;
    private _contentLeft;
    private _contentWidth;
    private _contentHeight;
    private _fontInfo;
    private _lineHeight;
    private _emptySelectionClipboard;
    private _copyWithSyntaxHighlighting;
    /**
     * Defined only when the text area is visible (composition case).
     */
    private _visibleTextArea;
    private _selections;
    private _modelSelections;
    /**
     * The position at which the textarea was rendered.
     * This is useful for hit-testing and determining the mouse position.
     */
    private _lastRenderPosition;
    readonly textArea: FastDomNode<HTMLTextAreaElement>;
    readonly textAreaCover: FastDomNode<HTMLElement>;
    private readonly _textAreaInput;
    constructor(context: ViewContext, viewController: ViewController, visibleRangeProvider: IVisibleRangeProvider);
    dispose(): void;
    private _getAndroidWordAtPosition;
    private _getWordBeforePosition;
    private _getCharacterBeforePosition;
    private _getAriaLabel;
    private _setAccessibilityOptions;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    isFocused(): boolean;
    focusTextArea(): void;
    refreshFocusState(): void;
    getLastRenderData(): Position | null;
    setAriaOptions(options: IEditorAriaOptions): void;
    private _primaryCursorPosition;
    private _primaryCursorVisibleRange;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    private _render;
    private _newlinecount;
    private _renderAtTopLeft;
    private _doRender;
}
