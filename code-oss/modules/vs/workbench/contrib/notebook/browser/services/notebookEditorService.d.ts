import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
import { INotebookEditor, INotebookEditorCreationOptions } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { Event } from 'vs/base/common/event';
import { Dimension } from 'vs/base/browser/dom';
export declare const INotebookEditorService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<INotebookEditorService>;
export interface IBorrowValue<T> {
    readonly value: T | undefined;
}
export interface INotebookEditorService {
    _serviceBrand: undefined;
    retrieveWidget(accessor: ServicesAccessor, group: IEditorGroup, input: NotebookEditorInput, creationOptions?: INotebookEditorCreationOptions, dimension?: Dimension): IBorrowValue<INotebookEditor>;
    onDidAddNotebookEditor: Event<INotebookEditor>;
    onDidRemoveNotebookEditor: Event<INotebookEditor>;
    addNotebookEditor(editor: INotebookEditor): void;
    removeNotebookEditor(editor: INotebookEditor): void;
    getNotebookEditor(editorId: string): INotebookEditor | undefined;
    listNotebookEditors(): readonly INotebookEditor[];
}
