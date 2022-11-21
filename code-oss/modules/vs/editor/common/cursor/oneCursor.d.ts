import { CursorState, SingleCursorState } from 'vs/editor/common/cursorCommon';
import { CursorContext } from 'vs/editor/common/cursor/cursorContext';
import { Selection } from 'vs/editor/common/core/selection';
/**
 * Represents a single cursor.
*/
export declare class Cursor {
    modelState: SingleCursorState;
    viewState: SingleCursorState;
    private _selTrackedRange;
    private _trackSelection;
    constructor(context: CursorContext);
    dispose(context: CursorContext): void;
    startTrackingSelection(context: CursorContext): void;
    stopTrackingSelection(context: CursorContext): void;
    private _updateTrackedRange;
    private _removeTrackedRange;
    asCursorState(): CursorState;
    readSelectionFromMarkers(context: CursorContext): Selection;
    ensureValidState(context: CursorContext): void;
    setState(context: CursorContext, modelState: SingleCursorState | null, viewState: SingleCursorState | null): void;
    private static _validatePositionWithCache;
    private static _validateViewState;
    private _setState;
}
