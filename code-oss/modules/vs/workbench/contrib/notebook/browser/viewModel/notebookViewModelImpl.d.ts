import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IBulkEditService } from 'vs/editor/browser/services/bulkEditService';
import { Range } from 'vs/editor/common/core/range';
import { TrackedRangeStickiness } from 'vs/editor/common/model';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { FoldingRegions } from 'vs/editor/contrib/folding/browser/foldingRanges';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { CellFindMatch, CellFindMatchWithIndex, CellFoldingState, EditorFoldingStateDelegate, ICellViewModel, INotebookDeltaCellStatusBarItems, INotebookDeltaDecoration, IModelDecorationsChangeAccessor, INotebookEditorViewState, INotebookViewCellsUpdateEvent, INotebookViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CodeCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel';
import { MarkupCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel';
import { ViewContext } from 'vs/workbench/contrib/notebook/browser/viewModel/viewContext';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { INotebookSearchOptions, ISelectionState } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
import { NotebookLayoutInfo } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
export interface NotebookViewModelOptions {
    isReadOnly: boolean;
}
export declare class NotebookViewModel extends Disposable implements EditorFoldingStateDelegate, INotebookViewModel {
    viewType: string;
    private _notebook;
    private _viewContext;
    private _layoutInfo;
    private _options;
    private readonly _instantiationService;
    private readonly _bulkEditService;
    private readonly _undoService;
    private readonly _textModelService;
    private _localStore;
    private _handleToViewCellMapping;
    get options(): NotebookViewModelOptions;
    private readonly _onDidChangeOptions;
    get onDidChangeOptions(): Event<void>;
    private _viewCells;
    get viewCells(): ICellViewModel[];
    set viewCells(_: ICellViewModel[]);
    get length(): number;
    get notebookDocument(): NotebookTextModel;
    get uri(): URI;
    get metadata(): import("vs/workbench/contrib/notebook/common/notebookCommon").NotebookDocumentMetadata;
    private readonly _onDidChangeViewCells;
    get onDidChangeViewCells(): Event<INotebookViewCellsUpdateEvent>;
    private _lastNotebookEditResource;
    get lastNotebookEditResource(): URI | null;
    get layoutInfo(): NotebookLayoutInfo | null;
    private readonly _onDidChangeSelection;
    get onDidChangeSelection(): Event<string>;
    private _selectionCollection;
    private get selectionHandles();
    private set selectionHandles(value);
    private _decorationsTree;
    private _decorations;
    private _lastDecorationId;
    private readonly _instanceId;
    readonly id: string;
    private _foldingRanges;
    private _hiddenRanges;
    private _focused;
    get focused(): boolean;
    private _decorationIdToCellMap;
    private _statusBarItemIdToCellMap;
    constructor(viewType: string, _notebook: NotebookTextModel, _viewContext: ViewContext, _layoutInfo: NotebookLayoutInfo | null, _options: NotebookViewModelOptions, _instantiationService: IInstantiationService, _bulkEditService: IBulkEditService, _undoService: IUndoRedoService, _textModelService: ITextModelService);
    updateOptions(newOptions: Partial<NotebookViewModelOptions>): void;
    getFocus(): ICellRange;
    getSelections(): ICellRange[];
    setEditorFocus(focused: boolean): void;
    /**
     * Empty selection will be turned to `null`
     */
    validateRange(cellRange: ICellRange | null | undefined): ICellRange | null;
    updateSelectionsState(state: ISelectionState, source?: 'view' | 'model'): void;
    getFoldingStartIndex(index: number): number;
    getFoldingState(index: number): CellFoldingState;
    getFoldedLength(index: number): number;
    updateFoldingRanges(ranges: FoldingRegions): void;
    getHiddenRanges(): ICellRange[];
    getCellByHandle(handle: number): CellViewModel | undefined;
    getCellIndexByHandle(handle: number): number;
    getCellIndex(cell: ICellViewModel): number;
    cellAt(index: number): CellViewModel | undefined;
    getCellsInRange(range?: ICellRange): ReadonlyArray<ICellViewModel>;
    /**
     * If this._viewCells[index] is visible then return index
     */
    getNearestVisibleCellIndexUpwards(index: number): number;
    getNextVisibleCellIndex(index: number): number;
    getPreviousVisibleCellIndex(index: number): number;
    hasCell(cell: ICellViewModel): boolean;
    getVersionId(): number;
    getAlternativeId(): string;
    getTrackedRange(id: string): ICellRange | null;
    private _getDecorationRange;
    setTrackedRange(id: string | null, newRange: ICellRange | null, newStickiness: TrackedRangeStickiness): string | null;
    private _deltaCellDecorationsImpl;
    deltaCellDecorations(oldDecorations: string[], newDecorations: INotebookDeltaDecoration[]): string[];
    deltaCellStatusBarItems(oldItems: string[], newItems: INotebookDeltaCellStatusBarItems[]): string[];
    nearestCodeCellIndex(index: number): number;
    getEditorViewState(): INotebookEditorViewState;
    restoreEditorViewState(viewState: INotebookEditorViewState | undefined): void;
    /**
     * Editor decorations across cells. For example, find decorations for multiple code cells
     * The reason that we can't completely delegate this to CodeEditorWidget is most of the time, the editors for cells are not created yet but we already have decorations for them.
     */
    changeModelDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T | null;
    private _deltaModelDecorationsImpl;
    find(value: string, options: INotebookSearchOptions): CellFindMatchWithIndex[];
    replaceOne(cell: ICellViewModel, range: Range, text: string): Promise<void>;
    replaceAll(matches: CellFindMatch[], texts: string[]): Promise<void>;
    private _withElement;
    undo(): Promise<readonly URI[]>;
    redo(): Promise<readonly URI[]>;
    equal(notebook: NotebookTextModel): boolean;
    dispose(): void;
}
export declare type CellViewModel = CodeCellViewModel | MarkupCellViewModel;
export declare function createCellViewModel(instantiationService: IInstantiationService, notebookViewModel: NotebookViewModel, cell: NotebookCellTextModel, viewContext: ViewContext): CodeCellViewModel | MarkupCellViewModel;
