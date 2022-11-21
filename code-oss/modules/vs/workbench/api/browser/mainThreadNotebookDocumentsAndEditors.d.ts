import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare class MainThreadNotebooksAndEditors {
    private readonly _notebookService;
    private readonly _notebookEditorService;
    private readonly _editorService;
    private readonly _editorGroupService;
    private readonly _proxy;
    private readonly _disposables;
    private readonly _editorListeners;
    private _currentState?;
    private readonly _mainThreadNotebooks;
    private readonly _mainThreadEditors;
    constructor(extHostContext: IExtHostContext, instantiationService: IInstantiationService, _notebookService: INotebookService, _notebookEditorService: INotebookEditorService, _editorService: IEditorService, _editorGroupService: IEditorGroupsService);
    dispose(): void;
    private _handleEditorAdd;
    private _handleEditorRemove;
    private _updateState;
    private _onDelta;
    private static _isDeltaEmpty;
    private static _asModelAddData;
    private _asEditorAddData;
}
