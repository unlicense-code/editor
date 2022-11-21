import { IResourceDiffEditorInput, IResourceSideBySideEditorInput, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotebookDiffEditorModel, IResolvedNotebookEditorModel } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { DiffEditorInput } from 'vs/workbench/common/editor/diffEditorInput';
import { NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
declare class NotebookDiffEditorModel extends EditorModel implements INotebookDiffEditorModel {
    readonly original: IResolvedNotebookEditorModel;
    readonly modified: IResolvedNotebookEditorModel;
    constructor(original: IResolvedNotebookEditorModel, modified: IResolvedNotebookEditorModel);
}
export declare class NotebookDiffEditorInput extends DiffEditorInput {
    readonly original: NotebookEditorInput;
    readonly modified: NotebookEditorInput;
    readonly viewType: string;
    static create(instantiationService: IInstantiationService, resource: URI, name: string | undefined, description: string | undefined, originalResource: URI, viewType: string): NotebookDiffEditorInput;
    static readonly ID: string;
    private _modifiedTextModel;
    private _originalTextModel;
    get resource(): URI;
    get editorId(): string;
    private _cachedModel;
    constructor(name: string | undefined, description: string | undefined, original: NotebookEditorInput, modified: NotebookEditorInput, viewType: string, editorService: IEditorService);
    get typeId(): string;
    resolve(): Promise<NotebookDiffEditorModel>;
    toUntyped(): IResourceDiffEditorInput & IResourceSideBySideEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
}
export {};
