import { IBaseCellEditorOptions } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { NotebookEventDispatcher } from 'vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
export declare class ViewContext {
    readonly notebookOptions: NotebookOptions;
    readonly eventDispatcher: NotebookEventDispatcher;
    readonly getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions;
    constructor(notebookOptions: NotebookOptions, eventDispatcher: NotebookEventDispatcher, getBaseCellEditorOptions: (language: string) => IBaseCellEditorOptions);
}
