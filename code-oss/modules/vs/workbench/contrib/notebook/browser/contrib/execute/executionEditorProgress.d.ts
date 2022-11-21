import { Disposable } from 'vs/base/common/lifecycle';
import { INotebookEditor, INotebookEditorContribution } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
export declare class ExecutionEditorProgressController extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _notebookExecutionStateService;
    static id: string;
    constructor(_notebookEditor: INotebookEditor, _notebookExecutionStateService: INotebookExecutionStateService);
    private _update;
}
