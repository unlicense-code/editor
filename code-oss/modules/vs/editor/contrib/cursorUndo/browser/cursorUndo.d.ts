import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
export declare class CursorUndoRedoController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.cursorUndoRedoController";
    static get(editor: ICodeEditor): CursorUndoRedoController | null;
    private readonly _editor;
    private _isCursorUndoRedo;
    private _undoStack;
    private _redoStack;
    constructor(editor: ICodeEditor);
    cursorUndo(): void;
    cursorRedo(): void;
    private _applyState;
}
export declare class CursorUndo extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
export declare class CursorRedo extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
