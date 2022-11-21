import { INotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
export declare class CellFocusPart extends CellContentPart {
    constructor(containerElement: HTMLElement, focusSinkElement: HTMLElement | undefined, notebookEditor: INotebookEditor);
}
