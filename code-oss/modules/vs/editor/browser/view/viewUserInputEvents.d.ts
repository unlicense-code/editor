import { IKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { IEditorMouseEvent, IMouseTarget, IPartialEditorMouseEvent } from 'vs/editor/browser/editorBrowser';
import { ICoordinatesConverter } from 'vs/editor/common/viewModel';
import { IMouseWheelEvent } from 'vs/base/browser/mouseEvent';
export interface EventCallback<T> {
    (event: T): void;
}
export declare class ViewUserInputEvents {
    onKeyDown: EventCallback<IKeyboardEvent> | null;
    onKeyUp: EventCallback<IKeyboardEvent> | null;
    onContextMenu: EventCallback<IEditorMouseEvent> | null;
    onMouseMove: EventCallback<IEditorMouseEvent> | null;
    onMouseLeave: EventCallback<IPartialEditorMouseEvent> | null;
    onMouseDown: EventCallback<IEditorMouseEvent> | null;
    onMouseUp: EventCallback<IEditorMouseEvent> | null;
    onMouseDrag: EventCallback<IEditorMouseEvent> | null;
    onMouseDrop: EventCallback<IPartialEditorMouseEvent> | null;
    onMouseDropCanceled: EventCallback<void> | null;
    onMouseWheel: EventCallback<IMouseWheelEvent> | null;
    private readonly _coordinatesConverter;
    constructor(coordinatesConverter: ICoordinatesConverter);
    emitKeyDown(e: IKeyboardEvent): void;
    emitKeyUp(e: IKeyboardEvent): void;
    emitContextMenu(e: IEditorMouseEvent): void;
    emitMouseMove(e: IEditorMouseEvent): void;
    emitMouseLeave(e: IPartialEditorMouseEvent): void;
    emitMouseDown(e: IEditorMouseEvent): void;
    emitMouseUp(e: IEditorMouseEvent): void;
    emitMouseDrag(e: IEditorMouseEvent): void;
    emitMouseDrop(e: IPartialEditorMouseEvent): void;
    emitMouseDropCanceled(): void;
    emitMouseWheel(e: IMouseWheelEvent): void;
    private _convertViewToModelMouseEvent;
    private _convertViewToModelMouseTarget;
    static convertViewToModelMouseTarget(target: IMouseTarget, coordinatesConverter: ICoordinatesConverter): IMouseTarget;
}
