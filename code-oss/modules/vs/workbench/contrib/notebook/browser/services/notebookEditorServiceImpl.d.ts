import { NotebookEditorWidget } from 'vs/workbench/contrib/notebook/browser/notebookEditorWidget';
import { IEditorGroupsService, IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
import { IBorrowValue, INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { INotebookEditor, INotebookEditorCreationOptions } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { Dimension } from 'vs/base/browser/dom';
export declare class NotebookEditorWidgetService implements INotebookEditorService {
    readonly _serviceBrand: undefined;
    private _tokenPool;
    private readonly _disposables;
    private readonly _notebookEditors;
    private readonly _onNotebookEditorAdd;
    private readonly _onNotebookEditorsRemove;
    readonly onDidAddNotebookEditor: import("vs/base/common/event").Event<INotebookEditor>;
    readonly onDidRemoveNotebookEditor: import("vs/base/common/event").Event<INotebookEditor>;
    private readonly _borrowableEditors;
    constructor(editorGroupService: IEditorGroupsService);
    dispose(): void;
    private _disposeWidget;
    private _allowWidgetMove;
    retrieveWidget(accessor: ServicesAccessor, group: IEditorGroup, input: NotebookEditorInput, creationOptions?: INotebookEditorCreationOptions, initialDimension?: Dimension): IBorrowValue<NotebookEditorWidget>;
    private _createBorrowValue;
    addNotebookEditor(editor: INotebookEditor): void;
    removeNotebookEditor(editor: INotebookEditor): void;
    getNotebookEditor(editorId: string): INotebookEditor | undefined;
    listNotebookEditors(): readonly INotebookEditor[];
}
