import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ICellViewModel, INotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare function runPasteCells(editor: INotebookEditor, activeCell: ICellViewModel | undefined, pasteCells: {
    items: NotebookCellTextModel[];
    isCopy: boolean;
}): boolean;
export declare function runCopyCells(accessor: ServicesAccessor, editor: INotebookEditor, targetCell: ICellViewModel | undefined): boolean;
export declare function runCutCells(accessor: ServicesAccessor, editor: INotebookEditor, targetCell: ICellViewModel | undefined): boolean;
export declare class NotebookClipboardContribution extends Disposable {
    private readonly _editorService;
    constructor(_editorService: IEditorService);
    private _getContext;
    private _focusInsideEmebedMonaco;
    runCopyAction(accessor: ServicesAccessor): boolean;
    runPasteAction(accessor: ServicesAccessor): boolean;
    runCutAction(accessor: ServicesAccessor): boolean;
}
