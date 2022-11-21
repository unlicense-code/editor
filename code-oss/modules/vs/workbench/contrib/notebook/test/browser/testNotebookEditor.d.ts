import { VSBuffer } from 'vs/base/common/buffer';
import { Emitter, Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { IActiveNotebookEditorDelegate, INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { NotebookCellList } from 'vs/workbench/contrib/notebook/browser/view/notebookCellList';
import { NotebookViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl';
import { ViewContext } from 'vs/workbench/contrib/notebook/browser/viewModel/viewContext';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { CellKind, INotebookDiffEditorModel, INotebookEditorModel, IOutputDto, IResolvedNotebookEditorModel, NotebookCellMetadata } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { IWorkingCopySaveEvent } from 'vs/workbench/services/workingCopy/common/workingCopy';
export declare class TestCell extends NotebookCellTextModel {
    viewType: string;
    source: string;
    constructor(viewType: string, handle: number, source: string, language: string, cellKind: CellKind, outputs: IOutputDto[], languageService: ILanguageService);
}
export declare class NotebookEditorTestModel extends EditorModel implements INotebookEditorModel {
    private _notebook;
    private _dirty;
    protected readonly _onDidSave: Emitter<IWorkingCopySaveEvent>;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    protected readonly _onDidChangeDirty: Emitter<void>;
    readonly onDidChangeDirty: Event<void>;
    readonly onDidChangeOrphaned: Event<any>;
    readonly onDidChangeReadonly: Event<any>;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    get viewType(): string;
    get resource(): URI;
    get notebook(): NotebookTextModel;
    constructor(_notebook: NotebookTextModel);
    isReadonly(): boolean;
    isOrphaned(): boolean;
    hasAssociatedFilePath(): boolean;
    isDirty(): boolean;
    getNotebook(): NotebookTextModel;
    load(): Promise<IResolvedNotebookEditorModel>;
    save(): Promise<boolean>;
    saveAs(): Promise<EditorInput | undefined>;
    revert(): Promise<void>;
}
export declare function setupInstantiationService(disposables?: DisposableStore): TestInstantiationService;
export declare function createTestNotebookEditor(instantiationService: TestInstantiationService, cells: [source: string, lang: string, kind: CellKind, output?: IOutputDto[], metadata?: NotebookCellMetadata][]): {
    editor: INotebookEditorDelegate;
    viewModel: NotebookViewModel;
};
export declare function withTestNotebookDiffModel<R = any>(originalCells: [source: string, lang: string, kind: CellKind, output?: IOutputDto[], metadata?: NotebookCellMetadata][], modifiedCells: [source: string, lang: string, kind: CellKind, output?: IOutputDto[], metadata?: NotebookCellMetadata][], callback: (diffModel: INotebookDiffEditorModel, accessor: TestInstantiationService) => Promise<R> | R): Promise<R>;
export declare function withTestNotebook<R = any>(cells: [source: string, lang: string, kind: CellKind, output?: IOutputDto[], metadata?: NotebookCellMetadata][], callback: (editor: IActiveNotebookEditorDelegate, viewModel: NotebookViewModel, accessor: TestInstantiationService) => Promise<R> | R, accessor?: TestInstantiationService): Promise<R>;
export declare function createNotebookCellList(instantiationService: TestInstantiationService, viewContext?: ViewContext): NotebookCellList;
export declare function valueBytesFromString(value: string): VSBuffer;
