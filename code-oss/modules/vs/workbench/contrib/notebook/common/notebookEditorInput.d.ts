import { GroupIdentifier, ISaveOptions, IMoveResult, IRevertOptions, EditorInputCapabilities, Verbosity, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { INotebookEditorModelResolverService } from 'vs/workbench/contrib/notebook/common/notebookEditorModelResolverService';
import { IResolvedNotebookEditorModel } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { ILabelService } from 'vs/platform/label/common/label';
import { IFileService } from 'vs/platform/files/common/files';
import { AbstractResourceEditorInput } from 'vs/workbench/common/editor/resourceEditorInput';
import { IResourceEditorInput } from 'vs/platform/editor/common/editor';
import { IWorkingCopyIdentifier } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { NotebookPerfMarks } from 'vs/workbench/contrib/notebook/common/notebookPerformance';
export interface NotebookEditorInputOptions {
    startDirty?: boolean;
    /**
     * backupId for webview
     */
    _backupId?: string;
    _workingCopy?: IWorkingCopyIdentifier;
}
export declare class NotebookEditorInput extends AbstractResourceEditorInput {
    readonly viewType: string;
    readonly options: NotebookEditorInputOptions;
    private readonly _notebookService;
    private readonly _notebookModelResolverService;
    private readonly _fileDialogService;
    private readonly _instantiationService;
    static create(instantiationService: IInstantiationService, resource: URI, viewType: string, options?: NotebookEditorInputOptions): NotebookEditorInput;
    static readonly ID: string;
    private _editorModelReference;
    private _sideLoadedListener;
    private _defaultDirtyState;
    constructor(resource: URI, viewType: string, options: NotebookEditorInputOptions, _notebookService: INotebookService, _notebookModelResolverService: INotebookEditorModelResolverService, _fileDialogService: IFileDialogService, _instantiationService: IInstantiationService, labelService: ILabelService, fileService: IFileService);
    dispose(): void;
    get typeId(): string;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    getDescription(verbosity?: Verbosity): string | undefined;
    isDirty(): boolean;
    save(group: GroupIdentifier, options?: ISaveOptions): Promise<EditorInput | IUntypedEditorInput | undefined>;
    saveAs(group: GroupIdentifier, options?: ISaveOptions): Promise<IUntypedEditorInput | undefined>;
    private _suggestName;
    rename(group: GroupIdentifier, target: URI): Promise<IMoveResult | undefined>;
    private _move;
    revert(_group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
    resolve(perf?: NotebookPerfMarks): Promise<IResolvedNotebookEditorModel | null>;
    toUntyped(): IResourceEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
}
export interface ICompositeNotebookEditorInput {
    readonly editorInputs: NotebookEditorInput[];
}
export declare function isCompositeNotebookEditorInput(thing: unknown): thing is ICompositeNotebookEditorInput;
