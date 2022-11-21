import { Disposable } from 'vs/base/common/lifecycle';
import { Range } from 'vs/editor/common/core/range';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICellViewModel, INotebookEditor, INotebookEditorContribution } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
export interface IShowNotebookFindWidgetOptions {
    isRegex?: boolean;
    wholeWord?: boolean;
    matchCase?: boolean;
    matchIndex?: number;
    focus?: boolean;
    searchStringSeededFrom?: {
        cell: ICellViewModel;
        range: Range;
    };
}
export declare class NotebookFindContrib extends Disposable implements INotebookEditorContribution {
    private readonly notebookEditor;
    private readonly instantiationService;
    static readonly id: string;
    private readonly widget;
    constructor(notebookEditor: INotebookEditor, instantiationService: IInstantiationService);
    show(initialInput?: string, options?: IShowNotebookFindWidgetOptions): Promise<void>;
    hide(): void;
    replace(searchString: string | undefined): void;
}
