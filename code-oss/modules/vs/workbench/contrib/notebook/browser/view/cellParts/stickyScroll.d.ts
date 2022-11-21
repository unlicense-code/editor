import { IDisposable } from 'vs/base/common/lifecycle';
import { ICellViewModel, INotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
export declare function registerStickyScroll(notebookEditor: INotebookEditor, cell: ICellViewModel, element: HTMLElement, opts?: {
    extraOffset?: number;
    min?: number;
}): IDisposable;
