import { CellLayoutState, ICellOutputViewModel, ICommonCellInfo, IGenericCellViewModel, IInsetRenderOutput } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { DiffElementViewModelBase } from 'vs/workbench/contrib/notebook/browser/diff/diffElementViewModel';
import { Event } from 'vs/base/common/event';
import { BareFontInfo } from 'vs/editor/common/config/fontInfo';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { DiffEditorWidget } from 'vs/editor/browser/widget/diffEditorWidget';
import { IMouseWheelEvent } from 'vs/base/browser/mouseEvent';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
import { NotebookLayoutInfo } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
import { WorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
export declare enum DiffSide {
    Original = 0,
    Modified = 1
}
export interface IDiffCellInfo extends ICommonCellInfo {
    diffElement: DiffElementViewModelBase;
}
export interface INotebookTextDiffEditor {
    notebookOptions: NotebookOptions;
    readonly textModel?: NotebookTextModel;
    onMouseUp: Event<{
        readonly event: MouseEvent;
        readonly target: DiffElementViewModelBase;
    }>;
    onDidScroll: Event<void>;
    onDidDynamicOutputRendered: Event<{
        cell: IGenericCellViewModel;
        output: ICellOutputViewModel;
    }>;
    getOverflowContainerDomNode(): HTMLElement;
    getLayoutInfo(): NotebookLayoutInfo;
    getScrollTop(): number;
    getScrollHeight(): number;
    layoutNotebookCell(cell: DiffElementViewModelBase, height: number): void;
    createOutput(cellDiffViewModel: DiffElementViewModelBase, cellViewModel: IDiffNestedCellViewModel, output: IInsetRenderOutput, getOffset: () => number, diffSide: DiffSide): void;
    showInset(cellDiffViewModel: DiffElementViewModelBase, cellViewModel: IDiffNestedCellViewModel, displayOutput: ICellOutputViewModel, diffSide: DiffSide): void;
    removeInset(cellDiffViewModel: DiffElementViewModelBase, cellViewModel: IDiffNestedCellViewModel, output: ICellOutputViewModel, diffSide: DiffSide): void;
    hideInset(cellDiffViewModel: DiffElementViewModelBase, cellViewModel: IDiffNestedCellViewModel, output: ICellOutputViewModel): void;
    /**
     * Trigger the editor to scroll from scroll event programmatically
     */
    triggerScroll(event: IMouseWheelEvent): void;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    getCellByInfo(cellInfo: ICommonCellInfo): IGenericCellViewModel;
    focusNotebookCell(cell: IGenericCellViewModel, focus: 'editor' | 'container' | 'output'): Promise<void>;
    focusNextNotebookCell(cell: IGenericCellViewModel, focus: 'editor' | 'container' | 'output'): Promise<void>;
    updateOutputHeight(cellInfo: ICommonCellInfo, output: ICellOutputViewModel, height: number, isInit: boolean): void;
    deltaCellOutputContainerClassNames(diffSide: DiffSide, cellId: string, added: string[], removed: string[]): void;
}
export interface IDiffNestedCellViewModel {
}
export interface CellDiffCommonRenderTemplate {
    readonly leftBorder: HTMLElement;
    readonly rightBorder: HTMLElement;
    readonly topBorder: HTMLElement;
    readonly bottomBorder: HTMLElement;
}
export interface CellDiffSingleSideRenderTemplate extends CellDiffCommonRenderTemplate {
    readonly container: HTMLElement;
    readonly body: HTMLElement;
    readonly diffEditorContainer: HTMLElement;
    readonly diagonalFill: HTMLElement;
    readonly elementDisposables: DisposableStore;
    readonly sourceEditor: CodeEditorWidget;
    readonly metadataHeaderContainer: HTMLElement;
    readonly metadataInfoContainer: HTMLElement;
    readonly outputHeaderContainer: HTMLElement;
    readonly outputInfoContainer: HTMLElement;
}
export interface CellDiffSideBySideRenderTemplate extends CellDiffCommonRenderTemplate {
    readonly container: HTMLElement;
    readonly body: HTMLElement;
    readonly diffEditorContainer: HTMLElement;
    readonly elementDisposables: DisposableStore;
    readonly sourceEditor: DiffEditorWidget;
    readonly editorContainer: HTMLElement;
    readonly inputToolbarContainer: HTMLElement;
    readonly toolbar: WorkbenchToolBar;
    readonly metadataHeaderContainer: HTMLElement;
    readonly metadataInfoContainer: HTMLElement;
    readonly outputHeaderContainer: HTMLElement;
    readonly outputInfoContainer: HTMLElement;
}
export interface IDiffElementLayoutInfo {
    totalHeight: number;
    width: number;
    editorHeight: number;
    editorMargin: number;
    metadataHeight: number;
    metadataStatusHeight: number;
    rawOutputHeight: number;
    outputMetadataHeight: number;
    outputTotalHeight: number;
    outputStatusHeight: number;
    bodyMargin: number;
    layoutState: CellLayoutState;
}
declare type IDiffElementSelfLayoutChangeEvent = {
    [K in keyof IDiffElementLayoutInfo]?: boolean;
};
export interface CellDiffViewModelLayoutChangeEvent extends IDiffElementSelfLayoutChangeEvent {
    font?: BareFontInfo;
    outerWidth?: boolean;
    metadataEditor?: boolean;
    outputEditor?: boolean;
    outputView?: boolean;
}
export declare const DIFF_CELL_MARGIN = 16;
export declare const NOTEBOOK_DIFF_CELL_INPUT: RawContextKey<boolean>;
export declare const NOTEBOOK_DIFF_CELL_PROPERTY: RawContextKey<boolean>;
export declare const NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED: RawContextKey<boolean>;
export {};
