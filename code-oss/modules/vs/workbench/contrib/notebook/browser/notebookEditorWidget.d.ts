import 'vs/css!./media/notebook';
import 'vs/css!./media/notebookCellInsertToolbar';
import 'vs/css!./media/notebookCellStatusBar';
import 'vs/css!./media/notebookCellTitleToolbar';
import 'vs/css!./media/notebookFocusIndicator';
import 'vs/css!./media/notebookToolbar';
import * as DOM from 'vs/base/browser/dom';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { Range } from 'vs/editor/common/core/range';
import { IEditor } from 'vs/editor/common/editorCommon';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { IEditorProgressService } from 'vs/platform/progress/common/progress';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { CellFindMatchWithIndex, CellLayoutContext, IActiveNotebookEditorDelegate, IBaseCellEditorOptions, ICellOutputViewModel, ICellViewModel, ICommonCellInfo, IFocusNotebookCellOptions, IInsetRenderOutput, IModelDecorationsChangeAccessor, INotebookDeltaDecoration, INotebookEditor, INotebookEditorContribution, INotebookEditorCreationOptions, INotebookEditorDelegate, INotebookEditorMouseEvent, INotebookEditorOptions, INotebookEditorViewState, INotebookViewCellsUpdateEvent, INotebookWebviewMessage } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { NotebookCellStateChangedEvent, NotebookLayoutInfo } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
import { CodeCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel';
import { MarkupCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel';
import { NotebookViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { INotebookSearchOptions } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookExecutionService } from 'vs/workbench/contrib/notebook/common/notebookExecutionService';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
import { INotebookRendererMessagingService } from 'vs/workbench/contrib/notebook/common/notebookRendererMessagingService';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { IWebviewElement } from 'vs/workbench/contrib/webview/browser/webview';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { NotebookPerfMarks } from 'vs/workbench/contrib/notebook/common/notebookPerformance';
import { ILogService } from 'vs/platform/log/common/log';
export declare function getDefaultNotebookCreationOptions(): INotebookEditorCreationOptions;
export declare class NotebookEditorWidget extends Disposable implements INotebookEditorDelegate, INotebookEditor {
    readonly creationOptions: INotebookEditorCreationOptions;
    private readonly notebookRendererMessaging;
    private readonly notebookEditorService;
    private readonly notebookKernelService;
    private readonly _notebookService;
    private readonly configurationService;
    private readonly layoutService;
    private readonly contextMenuService;
    private readonly telemetryService;
    private readonly notebookExecutionService;
    private readonly editorProgressService;
    private readonly logService;
    private readonly _onDidChangeCellState;
    readonly onDidChangeCellState: Event<NotebookCellStateChangedEvent>;
    private readonly _onDidChangeViewCells;
    readonly onDidChangeViewCells: Event<INotebookViewCellsUpdateEvent>;
    private readonly _onDidChangeModel;
    readonly onDidChangeModel: Event<NotebookTextModel | undefined>;
    private readonly _onDidChangeOptions;
    readonly onDidChangeOptions: Event<void>;
    private readonly _onDidChangeDecorations;
    readonly onDidChangeDecorations: Event<void>;
    private readonly _onDidScroll;
    readonly onDidScroll: Event<void>;
    private readonly _onDidChangeActiveCell;
    readonly onDidChangeActiveCell: Event<void>;
    private readonly _onDidChangeSelection;
    readonly onDidChangeSelection: Event<void>;
    private readonly _onDidChangeVisibleRanges;
    readonly onDidChangeVisibleRanges: Event<void>;
    private readonly _onDidFocusEmitter;
    readonly onDidFocusWidget: Event<void>;
    private readonly _onDidBlurEmitter;
    readonly onDidBlurWidget: Event<void>;
    private readonly _onDidChangeActiveEditor;
    readonly onDidChangeActiveEditor: Event<this>;
    private readonly _onDidChangeActiveKernel;
    readonly onDidChangeActiveKernel: Event<void>;
    private readonly _onMouseUp;
    readonly onMouseUp: Event<INotebookEditorMouseEvent>;
    private readonly _onMouseDown;
    readonly onMouseDown: Event<INotebookEditorMouseEvent>;
    private readonly _onDidReceiveMessage;
    readonly onDidReceiveMessage: Event<INotebookWebviewMessage>;
    private readonly _onDidRenderOutput;
    private readonly onDidRenderOutput;
    private readonly _onDidResizeOutputEmitter;
    readonly onDidResizeOutput: Event<ICellViewModel>;
    private _overlayContainer;
    private _notebookTopToolbarContainer;
    private _notebookTopToolbar;
    private _notebookOverviewRulerContainer;
    private _notebookOverviewRuler;
    private _body;
    private _styleElement;
    private _overflowContainer;
    private _webview;
    private _webviewResolvePromise;
    private _webviewTransparentCover;
    private _listDelegate;
    private _list;
    private _listViewInfoAccessor;
    private _dndController;
    private _listTopCellToolbar;
    private _renderedEditors;
    private _viewContext;
    private _notebookViewModel;
    private _localStore;
    private _localCellStateListeners;
    private _fontInfo;
    private _dimension?;
    private _shadowElement?;
    private _shadowElementViewInfo;
    private readonly _editorFocus;
    private readonly _outputFocus;
    private readonly _editorEditable;
    private readonly _cursorNavMode;
    protected readonly _contributions: Map<string, INotebookEditorContribution>;
    private _scrollBeyondLastLine;
    private readonly _insetModifyQueueByOutputId;
    private _cellContextKeyManager;
    private _isVisible;
    private readonly _uuid;
    private _focusTracker;
    private _webviewFocused;
    private _isDisposed;
    get isDisposed(): boolean;
    set viewModel(newModel: NotebookViewModel | undefined);
    get viewModel(): NotebookViewModel | undefined;
    get textModel(): NotebookTextModel | undefined;
    get isReadOnly(): boolean;
    get activeCodeEditor(): IEditor | undefined;
    get visibleRanges(): ICellRange[];
    private _baseCellEditorOptions;
    readonly isEmbedded: boolean;
    private _readOnly;
    readonly scopedContextKeyService: IContextKeyService;
    private readonly instantiationService;
    private readonly _notebookOptions;
    private _currentProgress;
    get notebookOptions(): NotebookOptions;
    constructor(creationOptions: INotebookEditorCreationOptions, dimension: DOM.Dimension | undefined, instantiationService: IInstantiationService, editorGroupsService: IEditorGroupsService, notebookRendererMessaging: INotebookRendererMessagingService, notebookEditorService: INotebookEditorService, notebookKernelService: INotebookKernelService, _notebookService: INotebookService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, layoutService: ILayoutService, contextMenuService: IContextMenuService, telemetryService: ITelemetryService, notebookExecutionService: INotebookExecutionService, notebookExecutionStateService: INotebookExecutionStateService, editorProgressService: IEditorProgressService, logService: ILogService);
    private _debugFlag;
    private _debug;
    /**
     * EditorId
     */
    getId(): string;
    _getViewModel(): NotebookViewModel | undefined;
    getLength(): number;
    getSelections(): ICellRange[];
    setSelections(selections: ICellRange[]): void;
    getFocus(): ICellRange;
    setFocus(focus: ICellRange): void;
    getSelectionViewModels(): ICellViewModel[];
    hasModel(): this is IActiveNotebookEditorDelegate;
    showProgress(): void;
    hideProgress(): void;
    getBaseCellEditorOptions(language: string): IBaseCellEditorOptions;
    private _updateForNotebookConfiguration;
    private _generateFontInfo;
    private _createBody;
    private _generateFontFamily;
    private _createLayoutStyles;
    private _createCellList;
    private showListContextMenu;
    private _registerNotebookOverviewRuler;
    private _registerNotebookActionsToolbar;
    private _updateOutputRenderers;
    getDomNode(): HTMLElement;
    getOverflowContainerDomNode(): HTMLElement;
    getInnerWebview(): IWebviewElement | undefined;
    setParentContextKeyService(parentContextKeyService: IContextKeyService): void;
    setModel(textModel: NotebookTextModel, viewState: INotebookEditorViewState | undefined, perf?: NotebookPerfMarks): Promise<void>;
    private _backgroundMarkdownRenderRunning;
    private _backgroundMarkdownRendering;
    private _backgroundMarkdownRenderingWithDeadline;
    private updateContextKeysOnFocusChange;
    setOptions(options: INotebookEditorOptions | undefined): Promise<void>;
    private _parseIndexedCellOptions;
    private _detachModel;
    private _updateForOptions;
    private _resolveWebview;
    private _ensureWebview;
    private _attachModel;
    private _bindCellListener;
    private _lastCellWithEditorFocus;
    private _validateCellFocusMode;
    private _warmupWithMarkdownRenderer;
    private _warmupViewport;
    private createMarkupCellInitialization;
    restoreListViewState(viewState: INotebookEditorViewState | undefined): void;
    private _restoreSelectedKernel;
    getEditorViewState(): INotebookEditorViewState;
    private _allowScrollBeyondLastLine;
    layout(dimension: DOM.Dimension, shadowElement?: HTMLElement, position?: DOM.IDomPosition): void;
    private updateShadowElement;
    private layoutContainerOverShadowElement;
    focus(): void;
    private focusEditor;
    focusContainer(): void;
    onWillHide(): void;
    private editorHasDomFocus;
    updateEditorFocus(): void;
    updateCellFocusMode(): void;
    hasEditorFocus(): boolean;
    hasWebviewFocus(): boolean;
    hasOutputTextSelection(): boolean;
    focusElement(cell: ICellViewModel): void;
    get scrollTop(): number;
    getAbsoluteTopOfElement(cell: ICellViewModel): number;
    scrollToBottom(): void;
    revealCellRangeInView(range: ICellRange): void;
    revealInView(cell: ICellViewModel): void;
    revealInViewAtTop(cell: ICellViewModel): void;
    revealInCenterIfOutsideViewport(cell: ICellViewModel): void;
    revealInCenterIfOutsideViewportAsync(cell: ICellViewModel): Promise<void>;
    revealInCenter(cell: ICellViewModel): void;
    revealNearTopIfOutsideViewportAync(cell: ICellViewModel): Promise<void>;
    revealLineInViewAsync(cell: ICellViewModel, line: number): Promise<void>;
    revealLineInCenterAsync(cell: ICellViewModel, line: number): Promise<void>;
    revealLineInCenterIfOutsideViewportAsync(cell: ICellViewModel, line: number): Promise<void>;
    revealRangeInViewAsync(cell: ICellViewModel, range: Range): Promise<void>;
    revealRangeInCenterAsync(cell: ICellViewModel, range: Range): Promise<void>;
    revealRangeInCenterIfOutsideViewportAsync(cell: ICellViewModel, range: Range): Promise<void>;
    revealCellOffsetInCenterAsync(cell: ICellViewModel, offset: number): Promise<void>;
    getViewIndexByModelIndex(index: number): number;
    getViewHeight(cell: ICellViewModel): number;
    getCellRangeFromViewRange(startIndex: number, endIndex: number): ICellRange | undefined;
    getCellsInRange(range?: ICellRange): ReadonlyArray<ICellViewModel>;
    setCellEditorSelection(cell: ICellViewModel, range: Range): void;
    setHiddenAreas(_ranges: ICellRange[]): boolean;
    getVisibleRangesPlusViewportAboveAndBelow(): ICellRange[];
    deltaCellDecorations(oldDecorations: string[], newDecorations: INotebookDeltaDecoration[]): string[];
    deltaCellContainerClassNames(cellId: string, added: string[], removed: string[]): void;
    changeModelDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T | null;
    private _loadKernelPreloads;
    get activeKernel(): import("vs/workbench/contrib/notebook/common/notebookKernelService").INotebookKernel | undefined;
    cancelNotebookCells(cells?: Iterable<ICellViewModel>): Promise<void>;
    executeNotebookCells(cells?: Iterable<ICellViewModel>): Promise<void>;
    private _pendingLayouts;
    layoutNotebookCell(cell: ICellViewModel, height: number, context?: CellLayoutContext): Promise<void>;
    getActiveCell(): ICellViewModel | undefined;
    private _cellFocusAria;
    private _toggleNotebookCellSelection;
    private getCellsInViewRange;
    focusNotebookCell(cell: ICellViewModel, focusItem: 'editor' | 'container' | 'output', options?: IFocusNotebookCellOptions): Promise<void>;
    focusNextNotebookCell(cell: ICellViewModel, focusItem: 'editor' | 'container' | 'output'): Promise<void>;
    private _renderCell;
    private _warmupAll;
    find(query: string, options: INotebookSearchOptions, token: CancellationToken, skipWarmup?: boolean): Promise<CellFindMatchWithIndex[]>;
    highlightFind(cell: CodeCellViewModel, matchIndex: number): Promise<number>;
    unHighlightFind(matchIndex: number): Promise<void>;
    findStop(): void;
    getLayoutInfo(): NotebookLayoutInfo;
    createMarkupPreview(cell: MarkupCellViewModel): Promise<void>;
    private cellIsHidden;
    unhideMarkupPreviews(cells: readonly MarkupCellViewModel[]): Promise<void>;
    hideMarkupPreviews(cells: readonly MarkupCellViewModel[]): Promise<void>;
    deleteMarkupPreviews(cells: readonly MarkupCellViewModel[]): Promise<void>;
    private updateSelectedMarkdownPreviews;
    createOutput(cell: CodeCellViewModel, output: IInsetRenderOutput, offset: number): Promise<void>;
    updateOutput(cell: CodeCellViewModel, output: IInsetRenderOutput, offset: number): Promise<void>;
    removeInset(output: ICellOutputViewModel): void;
    hideInset(output: ICellOutputViewModel): void;
    postMessage(message: any): void;
    addClassName(className: string): void;
    removeClassName(className: string): void;
    cellAt(index: number): ICellViewModel | undefined;
    getCellByInfo(cellInfo: ICommonCellInfo): ICellViewModel;
    getCellByHandle(handle: number): ICellViewModel | undefined;
    getCellIndex(cell: ICellViewModel): number | undefined;
    getNextVisibleCellIndex(index: number): number | undefined;
    getPreviousVisibleCellIndex(index: number): number | undefined;
    private _updateScrollHeight;
    private _updateOutputHeight;
    private readonly _pendingOutputHeightAcks;
    private _scheduleOutputHeightAck;
    private _getCellById;
    private _updateMarkupCellHeight;
    private _setMarkupCellEditState;
    private _didStartDragMarkupCell;
    private _didDragMarkupCell;
    private _didDropMarkupCell;
    private _didEndDragMarkupCell;
    private _didResizeOutput;
    getContribution<T extends INotebookEditorContribution>(id: string): T;
    dispose(): void;
    toJSON(): {
        notebookUri: URI | undefined;
    };
}
export declare const notebookCellBorder: string;
export declare const focusedEditorBorderColor: string;
export declare const cellStatusIconSuccess: string;
export declare const cellStatusIconError: string;
export declare const cellStatusIconRunning: string;
export declare const notebookOutputContainerBorderColor: string;
export declare const notebookOutputContainerColor: string;
export declare const CELL_TOOLBAR_SEPERATOR: string;
export declare const focusedCellBackground: string;
export declare const selectedCellBackground: string;
export declare const cellHoverBackground: string;
export declare const selectedCellBorder: string;
export declare const inactiveSelectedCellBorder: string;
export declare const focusedCellBorder: string;
export declare const inactiveFocusedCellBorder: string;
export declare const cellStatusBarItemHover: string;
export declare const cellInsertionIndicator: string;
export declare const listScrollbarSliderBackground: string;
export declare const listScrollbarSliderHoverBackground: string;
export declare const listScrollbarSliderActiveBackground: string;
export declare const cellSymbolHighlight: string;
export declare const cellEditorBackground: string;
