import { URI } from 'vs/base/common/uri';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IProgress } from 'vs/platform/progress/common/progress';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IUndoRedoService, UndoRedoGroup, UndoRedoSource } from 'vs/platform/undoRedo/common/undoRedo';
import { IModelService } from 'vs/editor/common/services/model';
import { ResourceTextEdit } from 'vs/editor/browser/services/bulkEditService';
import { CancellationToken } from 'vs/base/common/cancellation';
export declare class BulkTextEdits {
    private readonly _label;
    private readonly _code;
    private readonly _editor;
    private readonly _undoRedoGroup;
    private readonly _undoRedoSource;
    private readonly _progress;
    private readonly _token;
    private readonly _editorWorker;
    private readonly _modelService;
    private readonly _textModelResolverService;
    private readonly _undoRedoService;
    private readonly _edits;
    constructor(_label: string, _code: string, _editor: ICodeEditor | undefined, _undoRedoGroup: UndoRedoGroup, _undoRedoSource: UndoRedoSource | undefined, _progress: IProgress<void>, _token: CancellationToken, edits: ResourceTextEdit[], _editorWorker: IEditorWorkerService, _modelService: IModelService, _textModelResolverService: ITextModelService, _undoRedoService: IUndoRedoService);
    private _validateBeforePrepare;
    private _createEditsTasks;
    private _validateTasks;
    apply(): Promise<readonly URI[]>;
}
