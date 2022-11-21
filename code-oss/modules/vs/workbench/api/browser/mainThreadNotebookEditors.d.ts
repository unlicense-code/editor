import { UriComponents } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { INotebookDocumentShowOptions, MainThreadNotebookEditorsShape, NotebookEditorRevealType } from '../common/extHost.protocol';
export declare class MainThreadNotebookEditors implements MainThreadNotebookEditorsShape {
    private readonly _editorService;
    private readonly _notebookEditorService;
    private readonly _editorGroupService;
    private readonly _configurationService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _mainThreadEditors;
    private _currentViewColumnInfo?;
    constructor(extHostContext: IExtHostContext, _editorService: IEditorService, _notebookEditorService: INotebookEditorService, _editorGroupService: IEditorGroupsService, _configurationService: IConfigurationService);
    dispose(): void;
    handleEditorsAdded(editors: readonly INotebookEditor[]): void;
    handleEditorsRemoved(editorIds: readonly string[]): void;
    private _updateEditorViewColumns;
    $tryShowNotebookDocument(resource: UriComponents, viewType: string, options: INotebookDocumentShowOptions): Promise<string>;
    $tryRevealRange(id: string, range: ICellRange, revealType: NotebookEditorRevealType): Promise<void>;
    $trySetSelections(id: string, ranges: ICellRange[]): void;
}
