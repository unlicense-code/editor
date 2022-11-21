import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IEditorContributionDescription } from 'vs/editor/browser/editorExtensions';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { FontInfo } from 'vs/editor/common/config/fontInfo';
import { IPosition } from 'vs/editor/common/core/position';
import { IRange, Range } from 'vs/editor/common/core/range';
import { FindMatch, IModelDeltaDecoration, IReadonlyTextBuffer, ITextModel, TrackedRangeStickiness } from 'vs/editor/common/model';
import { MenuId } from 'vs/platform/actions/common/actions';
import { ITextEditorOptions, ITextResourceEditorInput } from 'vs/platform/editor/common/editor';
import { IConstructorSignature } from 'vs/platform/instantiation/common/instantiation';
import { IEditorPane, IEditorPaneWithSelection } from 'vs/workbench/common/editor';
import { CellViewModelStateChangeEvent, NotebookCellStateChangedEvent, NotebookLayoutInfo } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { CellKind, ICellOutput, INotebookCellStatusBarItem, INotebookRendererInfo, INotebookSearchOptions, IOrderedMimeType, NotebookCellInternalMetadata, NotebookCellMetadata } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookKernel } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
import { IWebviewElement } from 'vs/workbench/contrib/webview/browser/webview';
import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
export declare const EXPAND_CELL_INPUT_COMMAND_ID = "notebook.cell.expandCellInput";
export declare const EXECUTE_CELL_COMMAND_ID = "notebook.cell.execute";
export declare const DETECT_CELL_LANGUAGE = "notebook.cell.detectLanguage";
export declare const CHANGE_CELL_LANGUAGE = "notebook.cell.changeLanguage";
export declare const QUIT_EDIT_CELL_COMMAND_ID = "notebook.cell.quitEdit";
export declare const EXPAND_CELL_OUTPUT_COMMAND_ID = "notebook.cell.expandCellOutput";
export declare const IPYNB_VIEW_TYPE = "jupyter-notebook";
export declare const JUPYTER_EXTENSION_ID = "ms-toolsai.jupyter";
/** @deprecated use the notebookKernel<Type> "keyword" instead */
export declare const KERNEL_EXTENSIONS: Map<string, string>;
export declare const KERNEL_RECOMMENDATIONS: Map<string, Map<string, INotebookExtensionRecommendation>>;
export interface INotebookExtensionRecommendation {
    readonly extensionId: string;
    readonly displayName?: string;
}
export declare const enum RenderOutputType {
    Html = 0,
    Extension = 1
}
export interface IRenderPlainHtmlOutput {
    readonly type: RenderOutputType.Html;
    readonly source: IDisplayOutputViewModel;
    readonly htmlContent: string;
}
export interface IRenderOutputViaExtension {
    readonly type: RenderOutputType.Extension;
    readonly source: IDisplayOutputViewModel;
    readonly mimeType: string;
    readonly renderer: INotebookRendererInfo;
}
export declare type IInsetRenderOutput = IRenderPlainHtmlOutput | IRenderOutputViaExtension;
export interface ICellOutputViewModel extends IDisposable {
    cellViewModel: IGenericCellViewModel;
    /**
     * When rendering an output, `model` should always be used as we convert legacy `text/error` output to `display_data` output under the hood.
     */
    model: ICellOutput;
    resolveMimeTypes(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined): [readonly IOrderedMimeType[], number];
    pickedMimeType: IOrderedMimeType | undefined;
    hasMultiMimeType(): boolean;
    readonly onDidResetRenderer: Event<void>;
    resetRenderer(): void;
    toRawJSON(): any;
}
export interface IDisplayOutputViewModel extends ICellOutputViewModel {
    resolveMimeTypes(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined): [readonly IOrderedMimeType[], number];
}
export interface IGenericCellViewModel {
    id: string;
    handle: number;
    uri: URI;
    metadata: NotebookCellMetadata;
    outputIsHovered: boolean;
    outputIsFocused: boolean;
    outputsViewModels: ICellOutputViewModel[];
    getOutputOffset(index: number): number;
    updateOutputHeight(index: number, height: number, source?: string): void;
}
export interface IDisplayOutputLayoutUpdateRequest {
    readonly cell: IGenericCellViewModel;
    output: IDisplayOutputViewModel;
    cellTop: number;
    outputOffset: number;
    forceDisplay: boolean;
}
export interface ICommonCellInfo {
    readonly cellId: string;
    readonly cellHandle: number;
    readonly cellUri: URI;
}
export interface IFocusNotebookCellOptions {
    readonly skipReveal?: boolean;
    readonly focusEditorLine?: number;
}
export declare enum CellLayoutState {
    Uninitialized = 0,
    Estimated = 1,
    FromCache = 2,
    Measured = 3
}
export interface CodeCellLayoutInfo {
    readonly fontInfo: FontInfo | null;
    readonly editorHeight: number;
    readonly editorWidth: number;
    readonly estimatedHasHorizontalScrolling: boolean;
    readonly statusBarHeight: number;
    readonly commentHeight: number;
    readonly totalHeight: number;
    readonly outputContainerOffset: number;
    readonly outputTotalHeight: number;
    readonly outputShowMoreContainerHeight: number;
    readonly outputShowMoreContainerOffset: number;
    readonly bottomToolbarOffset: number;
    readonly layoutState: CellLayoutState;
    readonly codeIndicatorHeight: number;
    readonly outputIndicatorHeight: number;
}
export interface CodeCellLayoutChangeEvent {
    readonly source?: string;
    readonly editorHeight?: boolean;
    readonly commentHeight?: boolean;
    readonly outputHeight?: boolean;
    readonly outputShowMoreContainerHeight?: number;
    readonly totalHeight?: boolean;
    readonly outerWidth?: number;
    readonly font?: FontInfo;
}
export interface MarkupCellLayoutInfo {
    readonly fontInfo: FontInfo | null;
    readonly editorWidth: number;
    readonly editorHeight: number;
    readonly statusBarHeight: number;
    readonly previewHeight: number;
    readonly bottomToolbarOffset: number;
    readonly totalHeight: number;
    readonly layoutState: CellLayoutState;
    readonly foldHintHeight: number;
}
export declare enum CellLayoutContext {
    Fold = 0
}
export interface MarkupCellLayoutChangeEvent {
    readonly font?: FontInfo;
    readonly outerWidth?: number;
    readonly editorHeight?: number;
    readonly previewHeight?: number;
    totalHeight?: number;
    readonly context?: CellLayoutContext;
}
export interface ICommonCellViewModelLayoutChangeInfo {
    readonly totalHeight?: boolean | number;
    readonly outerWidth?: number;
    readonly context?: CellLayoutContext;
}
export interface ICellViewModel extends IGenericCellViewModel {
    readonly model: NotebookCellTextModel;
    readonly id: string;
    readonly textBuffer: IReadonlyTextBuffer;
    readonly layoutInfo: {
        totalHeight: number;
        bottomToolbarOffset: number;
        editorWidth: number;
        editorHeight: number;
        statusBarHeight: number;
    };
    readonly onDidChangeLayout: Event<ICommonCellViewModelLayoutChangeInfo>;
    readonly onDidChangeCellStatusBarItems: Event<void>;
    readonly onCellDecorationsChanged: Event<{
        added: INotebookCellDecorationOptions[];
        removed: INotebookCellDecorationOptions[];
    }>;
    readonly onDidChangeState: Event<CellViewModelStateChangeEvent>;
    readonly editStateSource: string;
    readonly editorAttached: boolean;
    isInputCollapsed: boolean;
    isOutputCollapsed: boolean;
    dragging: boolean;
    handle: number;
    uri: URI;
    language: string;
    readonly mime: string;
    cellKind: CellKind;
    lineNumbers: 'on' | 'off' | 'inherit';
    focusMode: CellFocusMode;
    outputIsHovered: boolean;
    getText(): string;
    getTextLength(): number;
    getHeight(lineHeight: number): number;
    metadata: NotebookCellMetadata;
    internalMetadata: NotebookCellInternalMetadata;
    textModel: ITextModel | undefined;
    hasModel(): this is IEditableCellViewModel;
    resolveTextModel(): Promise<ITextModel>;
    getSelectionsStartPosition(): IPosition[] | undefined;
    getCellDecorations(): INotebookCellDecorationOptions[];
    getCellStatusBarItems(): INotebookCellStatusBarItem[];
    getEditState(): CellEditState;
    updateEditState(state: CellEditState, source: string): void;
    deltaModelDecorations(oldDecorations: readonly string[], newDecorations: readonly IModelDeltaDecoration[]): string[];
    getCellDecorationRange(id: string): Range | null;
}
export interface IEditableCellViewModel extends ICellViewModel {
    textModel: ITextModel;
}
export interface INotebookEditorMouseEvent {
    readonly event: MouseEvent;
    readonly target: ICellViewModel;
}
export interface INotebookEditorContribution {
    /**
     * Dispose this contribution.
     */
    dispose(): void;
    /**
     * Store view state.
     */
    saveViewState?(): unknown;
    /**
     * Restore view state.
     */
    restoreViewState?(state: unknown): void;
}
export interface INotebookCellDecorationOptions {
    className?: string;
    gutterClassName?: string;
    outputClassName?: string;
    topClassName?: string;
    overviewRuler?: {
        color: string;
        modelRanges: Range[];
        includeOutput: boolean;
    };
}
export interface INotebookDeltaDecoration {
    readonly handle: number;
    readonly options: INotebookCellDecorationOptions;
}
export interface INotebookDeltaCellStatusBarItems {
    readonly handle: number;
    readonly items: readonly INotebookCellStatusBarItem[];
}
export declare enum CellRevealType {
    NearTopIfOutsideViewport = 0,
    CenterIfOutsideViewport = 1
}
export interface INotebookEditorOptions extends ITextEditorOptions {
    readonly cellOptions?: ITextResourceEditorInput;
    readonly cellRevealType?: CellRevealType;
    readonly cellSelections?: ICellRange[];
    readonly isReadOnly?: boolean;
    readonly viewState?: INotebookEditorViewState;
    readonly indexedCellOptions?: {
        index: number;
        selection?: IRange;
    };
}
export declare type INotebookEditorContributionCtor = IConstructorSignature<INotebookEditorContribution, [INotebookEditor]>;
export interface INotebookEditorContributionDescription {
    id: string;
    ctor: INotebookEditorContributionCtor;
}
export interface INotebookEditorCreationOptions {
    readonly isEmbedded?: boolean;
    readonly isReadOnly?: boolean;
    readonly contributions?: INotebookEditorContributionDescription[];
    readonly cellEditorContributions?: IEditorContributionDescription[];
    readonly menuIds: {
        notebookToolbar: MenuId;
        cellTitleToolbar: MenuId;
        cellDeleteToolbar: MenuId;
        cellInsertToolbar: MenuId;
        cellTopInsertToolbar: MenuId;
        cellExecuteToolbar: MenuId;
        cellExecutePrimary?: MenuId;
    };
    readonly options?: NotebookOptions;
}
export interface INotebookWebviewMessage {
    readonly message: unknown;
}
export interface INotebookEditorViewState {
    editingCells: {
        [key: number]: boolean;
    };
    collapsedInputCells: {
        [key: number]: boolean;
    };
    collapsedOutputCells: {
        [key: number]: boolean;
    };
    editorViewStates: {
        [key: number]: editorCommon.ICodeEditorViewState | null;
    };
    hiddenFoldingRanges?: ICellRange[];
    cellTotalHeights?: {
        [key: number]: number;
    };
    scrollPosition?: {
        left: number;
        top: number;
    };
    focus?: number;
    editorFocused?: boolean;
    contributionsState?: {
        [id: string]: unknown;
    };
    selectedKernelId?: string;
}
export interface ICellModelDecorations {
    readonly ownerId: number;
    readonly decorations: readonly string[];
}
export interface ICellModelDeltaDecorations {
    readonly ownerId: number;
    readonly decorations: readonly IModelDeltaDecoration[];
}
export interface IModelDecorationsChangeAccessor {
    deltaDecorations(oldDecorations: ICellModelDecorations[], newDecorations: ICellModelDeltaDecorations[]): ICellModelDecorations[];
}
export declare type NotebookViewCellsSplice = [
    number,
    number,
    ICellViewModel[]
];
export interface INotebookViewCellsUpdateEvent {
    readonly synchronous: boolean;
    readonly splices: readonly NotebookViewCellsSplice[];
}
export interface INotebookViewModel {
    notebookDocument: NotebookTextModel;
    viewCells: ICellViewModel[];
    layoutInfo: NotebookLayoutInfo | null;
    onDidChangeViewCells: Event<INotebookViewCellsUpdateEvent>;
    onDidChangeSelection: Event<string>;
    getNearestVisibleCellIndexUpwards(index: number): number;
    getTrackedRange(id: string): ICellRange | null;
    setTrackedRange(id: string | null, newRange: ICellRange | null, newStickiness: TrackedRangeStickiness): string | null;
    getSelections(): ICellRange[];
    getCellIndex(cell: ICellViewModel): number;
    deltaCellStatusBarItems(oldItems: string[], newItems: INotebookDeltaCellStatusBarItems[]): string[];
    getFoldedLength(index: number): number;
    replaceOne(cell: ICellViewModel, range: Range, text: string): Promise<void>;
    replaceAll(matches: CellFindMatch[], texts: string[]): Promise<void>;
}
export interface INotebookEditor {
    readonly onDidChangeCellState: Event<NotebookCellStateChangedEvent>;
    readonly onDidChangeViewCells: Event<INotebookViewCellsUpdateEvent>;
    readonly onDidChangeVisibleRanges: Event<void>;
    readonly onDidChangeSelection: Event<void>;
    /**
     * An event emitted when the model of this editor has changed.
     */
    readonly onDidChangeModel: Event<NotebookTextModel | undefined>;
    readonly onDidFocusWidget: Event<void>;
    readonly onDidBlurWidget: Event<void>;
    readonly onDidScroll: Event<void>;
    readonly onDidChangeActiveCell: Event<void>;
    readonly onDidChangeActiveKernel: Event<void>;
    readonly onMouseUp: Event<INotebookEditorMouseEvent>;
    readonly onMouseDown: Event<INotebookEditorMouseEvent>;
    readonly visibleRanges: ICellRange[];
    readonly textModel?: NotebookTextModel;
    readonly isReadOnly: boolean;
    readonly notebookOptions: NotebookOptions;
    readonly isDisposed: boolean;
    readonly activeKernel: INotebookKernel | undefined;
    readonly scrollTop: number;
    readonly scopedContextKeyService: IContextKeyService;
    getLength(): number;
    getSelections(): ICellRange[];
    setSelections(selections: ICellRange[]): void;
    getFocus(): ICellRange;
    setFocus(focus: ICellRange): void;
    getId(): string;
    _getViewModel(): INotebookViewModel | undefined;
    hasModel(): this is IActiveNotebookEditor;
    dispose(): void;
    getDomNode(): HTMLElement;
    getInnerWebview(): IWebviewElement | undefined;
    getSelectionViewModels(): ICellViewModel[];
    getEditorViewState(): INotebookEditorViewState;
    restoreListViewState(viewState: INotebookEditorViewState | undefined): void;
    /**
     * Focus the active cell in notebook cell list
     */
    focus(): void;
    /**
     * Focus the notebook cell list container
     */
    focusContainer(): void;
    hasEditorFocus(): boolean;
    hasWebviewFocus(): boolean;
    hasOutputTextSelection(): boolean;
    setOptions(options: INotebookEditorOptions | undefined): Promise<void>;
    /**
     * Select & focus cell
     */
    focusElement(cell: ICellViewModel): void;
    /**
     * Layout info for the notebook editor
     */
    getLayoutInfo(): NotebookLayoutInfo;
    getVisibleRangesPlusViewportAboveAndBelow(): ICellRange[];
    /**
     * Focus the container of a cell (the monaco editor inside is not focused).
     */
    focusNotebookCell(cell: ICellViewModel, focus: 'editor' | 'container' | 'output', options?: IFocusNotebookCellOptions): Promise<void>;
    /**
     * Execute the given notebook cells
     */
    executeNotebookCells(cells?: Iterable<ICellViewModel>): Promise<void>;
    /**
     * Cancel the given notebook cells
     */
    cancelNotebookCells(cells?: Iterable<ICellViewModel>): Promise<void>;
    /**
     * Get current active cell
     */
    getActiveCell(): ICellViewModel | undefined;
    /**
     * Layout the cell with a new height
     */
    layoutNotebookCell(cell: ICellViewModel, height: number): Promise<void>;
    /**
     * Render the output in webview layer
     */
    createOutput(cell: ICellViewModel, output: IInsetRenderOutput, offset: number): Promise<void>;
    /**
     * Update the output in webview layer with latest content. It will delegate to `createOutput` is the output is not rendered yet
     */
    updateOutput(cell: ICellViewModel, output: IInsetRenderOutput, offset: number): Promise<void>;
    readonly onDidReceiveMessage: Event<INotebookWebviewMessage>;
    /**
     * Send message to the webview for outputs.
     */
    postMessage(message: any): void;
    /**
     * Remove class name on the notebook editor root DOM node.
     */
    addClassName(className: string): void;
    /**
     * Remove class name on the notebook editor root DOM node.
     */
    removeClassName(className: string): void;
    /**
     * The range will be revealed with as little scrolling as possible.
     */
    revealCellRangeInView(range: ICellRange): void;
    /**
     * Reveal cell into viewport.
     */
    revealInView(cell: ICellViewModel): void;
    /**
     * Reveal cell into the top of viewport.
     */
    revealInViewAtTop(cell: ICellViewModel): void;
    /**
     * Reveal cell into viewport center.
     */
    revealInCenter(cell: ICellViewModel): void;
    /**
     * Reveal cell into viewport center if cell is currently out of the viewport.
     */
    revealInCenterIfOutsideViewport(cell: ICellViewModel): void;
    /**
     * Reveal a line in notebook cell into viewport with minimal scrolling.
     */
    revealLineInViewAsync(cell: ICellViewModel, line: number): Promise<void>;
    /**
     * Reveal a line in notebook cell into viewport center.
     */
    revealLineInCenterAsync(cell: ICellViewModel, line: number): Promise<void>;
    /**
     * Reveal a line in notebook cell into viewport center.
     */
    revealLineInCenterIfOutsideViewportAsync(cell: ICellViewModel, line: number): Promise<void>;
    /**
     * Reveal a range in notebook cell into viewport with minimal scrolling.
     */
    revealRangeInViewAsync(cell: ICellViewModel, range: Range): Promise<void>;
    /**
     * Reveal a range in notebook cell into viewport center.
     */
    revealRangeInCenterAsync(cell: ICellViewModel, range: Range): Promise<void>;
    /**
     * Reveal a range in notebook cell into viewport center.
     */
    revealRangeInCenterIfOutsideViewportAsync(cell: ICellViewModel, range: Range): Promise<void>;
    /**
     * Reveal a position with `offset` in a cell into viewport center.
     */
    revealCellOffsetInCenterAsync(cell: ICellViewModel, offset: number): Promise<void>;
    /**
     * Convert the view range to model range
     * @param startIndex Inclusive
     * @param endIndex Exclusive
     */
    getCellRangeFromViewRange(startIndex: number, endIndex: number): ICellRange | undefined;
    /**
     * Set hidden areas on cell text models.
     */
    setHiddenAreas(_ranges: ICellRange[]): boolean;
    /**
     * Set selectiosn on the text editor attached to the cell
     */
    setCellEditorSelection(cell: ICellViewModel, selection: Range): void;
    /**
     *Change the decorations on the notebook cell list
     */
    deltaCellDecorations(oldDecorations: string[], newDecorations: INotebookDeltaDecoration[]): string[];
    /**
     * Change the decorations on cell editors.
     * The notebook is virtualized and this method should be called to create/delete editor decorations safely.
     */
    changeModelDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T | null;
    /**
     * Get a contribution of this editor.
     * @id Unique identifier of the contribution.
     * @return The contribution or null if contribution not found.
     */
    getContribution<T extends INotebookEditorContribution>(id: string): T;
    /**
     * Get the view index of a cell at model `index`
     */
    getViewIndexByModelIndex(index: number): number;
    getCellsInRange(range?: ICellRange): ReadonlyArray<ICellViewModel>;
    cellAt(index: number): ICellViewModel | undefined;
    getCellByHandle(handle: number): ICellViewModel | undefined;
    getCellIndex(cell: ICellViewModel): number | undefined;
    getNextVisibleCellIndex(index: number): number | undefined;
    getPreviousVisibleCellIndex(index: number): number | undefined;
    find(query: string, options: INotebookSearchOptions, token: CancellationToken): Promise<CellFindMatchWithIndex[]>;
    highlightFind(cell: ICellViewModel, matchIndex: number): Promise<number>;
    unHighlightFind(matchIndex: number): Promise<void>;
    findStop(): void;
    showProgress(): void;
    hideProgress(): void;
    getAbsoluteTopOfElement(cell: ICellViewModel): number;
}
export interface IActiveNotebookEditor extends INotebookEditor {
    _getViewModel(): INotebookViewModel;
    textModel: NotebookTextModel;
    getFocus(): ICellRange;
    cellAt(index: number): ICellViewModel;
    getCellIndex(cell: ICellViewModel): number;
    getNextVisibleCellIndex(index: number): number;
}
export interface INotebookEditorPane extends IEditorPaneWithSelection {
    getControl(): INotebookEditor | undefined;
    readonly onDidChangeModel: Event<void>;
    textModel: NotebookTextModel | undefined;
}
export interface IBaseCellEditorOptions extends IDisposable {
    readonly value: IEditorOptions;
    readonly onDidChange: Event<void>;
}
/**
 * A mix of public interface and internal one (used by internal rendering code, e.g., cellRenderer)
 */
export interface INotebookEditorDelegate extends INotebookEditor {
    hasModel(): this is IActiveNotebookEditorDelegate;
    readonly creationOptions: INotebookEditorCreationOptions;
    readonly onDidChangeOptions: Event<void>;
    readonly onDidChangeDecorations: Event<void>;
    getBaseCellEditorOptions(language: string): IBaseCellEditorOptions;
    createMarkupPreview(cell: ICellViewModel): Promise<void>;
    unhideMarkupPreviews(cells: readonly ICellViewModel[]): Promise<void>;
    hideMarkupPreviews(cells: readonly ICellViewModel[]): Promise<void>;
    /**
     * Remove the output from the webview layer
     */
    removeInset(output: IDisplayOutputViewModel): void;
    /**
     * Hide the inset in the webview layer without removing it
     */
    hideInset(output: IDisplayOutputViewModel): void;
    deltaCellContainerClassNames(cellId: string, added: string[], removed: string[]): void;
}
export interface IActiveNotebookEditorDelegate extends INotebookEditorDelegate {
    _getViewModel(): INotebookViewModel;
    textModel: NotebookTextModel;
    getFocus(): ICellRange;
    cellAt(index: number): ICellViewModel;
    getCellIndex(cell: ICellViewModel): number;
    getNextVisibleCellIndex(index: number): number;
}
export interface OutputFindMatch {
    readonly index: number;
}
export interface CellFindMatch {
    cell: ICellViewModel;
    matches: (FindMatch | OutputFindMatch)[];
    modelMatchCount: number;
}
export interface CellFindMatchWithIndex {
    cell: ICellViewModel;
    index: number;
    matches: (FindMatch | OutputFindMatch)[];
    modelMatchCount: number;
}
export declare enum CellEditState {
    /**
     * Default state.
     * For markup cells, this is the renderer version of the markup.
     * For code cell, the browser focus should be on the container instead of the editor
     */
    Preview = 0,
    /**
     * Editing mode. Source for markup or code is rendered in editors and the state will be persistent.
     */
    Editing = 1
}
export declare enum CellFocusMode {
    Container = 0,
    Editor = 1,
    Output = 2
}
export declare enum CursorAtBoundary {
    None = 0,
    Top = 1,
    Bottom = 2,
    Both = 3
}
export declare function getNotebookEditorFromEditorPane(editorPane?: IEditorPane): INotebookEditor | undefined;
/**
 * ranges: model selections
 * this will convert model selections to view indexes first, and then include the hidden ranges in the list view
 */
export declare function expandCellRangesWithHiddenCells(editor: INotebookEditor, ranges: ICellRange[]): ICellRange[];
export declare function cellRangeToViewCells(editor: IActiveNotebookEditor, ranges: ICellRange[]): ICellViewModel[];
export declare const enum CellFoldingState {
    None = 0,
    Expanded = 1,
    Collapsed = 2
}
export interface EditorFoldingStateDelegate {
    getCellIndex(cell: ICellViewModel): number;
    getFoldingState(index: number): CellFoldingState;
}
