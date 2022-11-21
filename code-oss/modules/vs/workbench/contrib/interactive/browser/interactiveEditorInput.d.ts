import { URI } from 'vs/base/common/uri';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IInteractiveDocumentService } from 'vs/workbench/contrib/interactive/browser/interactiveDocumentService';
import { IInteractiveHistoryService } from 'vs/workbench/contrib/interactive/browser/interactiveHistoryService';
import { CellKind, IResolvedNotebookEditorModel, NotebookCellCollapseState, NotebookCellInternalMetadata, NotebookCellMetadata } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { ICompositeNotebookEditorInput, NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
export declare class InteractiveEditorInput extends EditorInput implements ICompositeNotebookEditorInput {
    static create(instantiationService: IInstantiationService, resource: URI, inputResource: URI, title?: string): InteractiveEditorInput;
    static readonly ID: string;
    get editorId(): string;
    get typeId(): string;
    private _initTitle?;
    private _notebookEditorInput;
    get notebookEditorInput(): NotebookEditorInput;
    get editorInputs(): NotebookEditorInput[];
    private _resource;
    get resource(): URI;
    private _inputResource;
    get inputResource(): URI;
    private _inputResolver;
    private _editorModelReference;
    private _inputModelRef;
    get primary(): EditorInput;
    private _textModelService;
    private _interactiveDocumentService;
    private _historyService;
    constructor(resource: URI, inputResource: URI, title: string | undefined, instantiationService: IInstantiationService, textModelService: ITextModelService, interactiveDocumentService: IInteractiveDocumentService, historyService: IInteractiveHistoryService);
    private _registerListeners;
    isDirty(): boolean;
    private _resolveEditorModel;
    resolve(): Promise<IResolvedNotebookEditorModel | null>;
    resolveInput(language: string): Promise<import("../../../../editor/common/model").ITextModel>;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    getName(): string;
    getSerialization(): {
        notebookData: any | undefined;
        inputData: any | undefined;
    };
    private _data;
    restoreSerialization(data: {
        notebookData: any | undefined;
        inputData: any | undefined;
    } | undefined): Promise<void>;
    private _serializeNotebook;
    dispose(): void;
    get historyService(): IInteractiveHistoryService;
}
/**
 * Serialization of interactive notebook.
 * This is not placed in notebook land as regular notebooks are handled by file service directly.
 */
interface ISerializedOutputItem {
    readonly mime: string;
    readonly data: number[];
}
interface ISerializedCellOutput {
    outputs: ISerializedOutputItem[];
    metadata?: Record<string, any>;
    outputId: string;
}
export interface ISerializedCell {
    source: string;
    language: string;
    mime: string | undefined;
    cellKind: CellKind;
    outputs: ISerializedCellOutput[];
    metadata?: NotebookCellMetadata;
    internalMetadata?: NotebookCellInternalMetadata;
    collapseState?: NotebookCellCollapseState;
}
export {};
