import { INotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
export declare class CollapsedCellInput extends CellContentPart {
    private readonly notebookEditor;
    constructor(notebookEditor: INotebookEditor, cellInputCollapsedContainer: HTMLElement);
}
