import { IMouseWheelEvent } from 'vs/base/browser/mouseEvent';
import { Disposable } from 'vs/base/common/lifecycle';
import { MouseTargetFactory, PointerHandlerLastRenderData } from 'vs/editor/browser/controller/mouseTarget';
import { IMouseTarget, MouseTargetType } from 'vs/editor/browser/editorBrowser';
import { EditorMouseEvent } from 'vs/editor/browser/editorDom';
import { ViewController } from 'vs/editor/browser/view/viewController';
import { Position } from 'vs/editor/common/core/position';
import { HorizontalPosition } from 'vs/editor/browser/view/renderingContext';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import * as viewEvents from 'vs/editor/common/viewEvents';
import { ViewEventHandler } from 'vs/editor/common/viewEventHandler';
export interface IPointerHandlerHelper {
    viewDomNode: HTMLElement;
    linesContentDomNode: HTMLElement;
    viewLinesDomNode: HTMLElement;
    focusTextArea(): void;
    dispatchTextAreaEvent(event: CustomEvent): void;
    /**
     * Get the last rendered information for cursors & textarea.
     */
    getLastRenderData(): PointerHandlerLastRenderData;
    /**
     * Render right now
     */
    renderNow(): void;
    shouldSuppressMouseDownOnViewZone(viewZoneId: string): boolean;
    shouldSuppressMouseDownOnWidget(widgetId: string): boolean;
    /**
     * Decode a position from a rendered dom node
     */
    getPositionFromDOMInfo(spanNode: HTMLElement, offset: number): Position | null;
    visibleRangeForPosition(lineNumber: number, column: number): HorizontalPosition | null;
    getLineWidth(lineNumber: number): number;
}
export declare class MouseHandler extends ViewEventHandler {
    protected _context: ViewContext;
    protected viewController: ViewController;
    protected viewHelper: IPointerHandlerHelper;
    protected mouseTargetFactory: MouseTargetFactory;
    protected readonly _mouseDownOperation: MouseDownOperation;
    private lastMouseLeaveTime;
    private _height;
    private _mouseLeaveMonitor;
    constructor(context: ViewContext, viewController: ViewController, viewHelper: IPointerHandlerHelper);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean;
    getTargetAtClientPoint(clientX: number, clientY: number): IMouseTarget | null;
    protected _createMouseTarget(e: EditorMouseEvent, testEventTarget: boolean): IMouseTarget;
    private _getMouseColumn;
    protected _onContextMenu(e: EditorMouseEvent, testEventTarget: boolean): void;
    _onMouseMove(e: EditorMouseEvent): void;
    _onMouseLeave(e: EditorMouseEvent): void;
    _onMouseUp(e: EditorMouseEvent): void;
    _onMouseDown(e: EditorMouseEvent, pointerId: number): void;
    _onMouseWheel(e: IMouseWheelEvent): void;
}
declare class MouseDownOperation extends Disposable {
    private readonly _context;
    private readonly _viewController;
    private readonly _viewHelper;
    private readonly _mouseTargetFactory;
    private readonly _createMouseTarget;
    private readonly _getMouseColumn;
    private readonly _mouseMoveMonitor;
    private readonly _topBottomDragScrolling;
    private readonly _mouseState;
    private _currentSelection;
    private _isActive;
    private _lastMouseEvent;
    constructor(_context: ViewContext, _viewController: ViewController, _viewHelper: IPointerHandlerHelper, _mouseTargetFactory: MouseTargetFactory, createMouseTarget: (e: EditorMouseEvent, testEventTarget: boolean) => IMouseTarget, getMouseColumn: (e: EditorMouseEvent) => number);
    dispose(): void;
    isActive(): boolean;
    private _onMouseDownThenMove;
    start(targetType: MouseTargetType, e: EditorMouseEvent, pointerId: number): void;
    private _stop;
    onHeightChanged(): void;
    onPointerUp(): void;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): void;
    private _getPositionOutsideEditor;
    private _findMousePosition;
    private _helpPositionJumpOverViewZone;
    private _dispatchMouse;
}
export {};
