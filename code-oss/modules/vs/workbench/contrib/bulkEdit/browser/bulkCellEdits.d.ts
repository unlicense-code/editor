import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { ResourceEdit } from 'vs/editor/browser/services/bulkEditService';
import { WorkspaceEditMetadata } from 'vs/editor/common/languages';
import { IProgress } from 'vs/platform/progress/common/progress';
import { UndoRedoGroup, UndoRedoSource } from 'vs/platform/undoRedo/common/undoRedo';
import { ICellPartialMetadataEdit, ICellReplaceEdit, IDocumentMetadataEdit, IWorkspaceNotebookCellEdit } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookEditorModelResolverService } from 'vs/workbench/contrib/notebook/common/notebookEditorModelResolverService';
export declare class ResourceNotebookCellEdit extends ResourceEdit implements IWorkspaceNotebookCellEdit {
    readonly resource: URI;
    readonly cellEdit: ICellPartialMetadataEdit | IDocumentMetadataEdit | ICellReplaceEdit;
    readonly notebookVersionId: number | undefined;
    static is(candidate: any): candidate is IWorkspaceNotebookCellEdit;
    static lift(edit: IWorkspaceNotebookCellEdit): ResourceNotebookCellEdit;
    constructor(resource: URI, cellEdit: ICellPartialMetadataEdit | IDocumentMetadataEdit | ICellReplaceEdit, notebookVersionId?: number | undefined, metadata?: WorkspaceEditMetadata);
}
export declare class BulkCellEdits {
    private readonly _undoRedoGroup;
    private readonly _progress;
    private readonly _token;
    private readonly _edits;
    private readonly _notebookModelService;
    constructor(_undoRedoGroup: UndoRedoGroup, undoRedoSource: UndoRedoSource | undefined, _progress: IProgress<void>, _token: CancellationToken, _edits: ResourceNotebookCellEdit[], _notebookModelService: INotebookEditorModelResolverService);
    apply(): Promise<readonly URI[]>;
}
