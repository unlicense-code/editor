import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { CellDiffViewModelLayoutChangeEvent, DiffSide, IDiffElementLayoutInfo } from 'vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser';
import { IGenericCellViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { ICellOutput, INotebookTextModel, IOutputDto, IOutputItemDto, NotebookCellMetadata } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { DiffNestedCellViewModel } from 'vs/workbench/contrib/notebook/browser/diff/diffNestedCellViewModel';
import { URI } from 'vs/base/common/uri';
import { NotebookDiffEditorEventDispatcher } from 'vs/workbench/contrib/notebook/browser/diff/eventDispatcher';
import * as editorCommon from 'vs/editor/common/editorCommon';
import { NotebookLayoutInfo } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
export declare enum PropertyFoldingState {
    Expanded = 0,
    Collapsed = 1
}
export declare const OUTPUT_EDITOR_HEIGHT_MAGIC = 1440;
declare type ILayoutInfoDelta0 = {
    [K in keyof IDiffElementLayoutInfo]?: number;
};
interface ILayoutInfoDelta extends ILayoutInfoDelta0 {
    rawOutputHeight?: number;
    recomputeOutput?: boolean;
}
export declare abstract class DiffElementViewModelBase extends Disposable {
    readonly mainDocumentTextModel: INotebookTextModel;
    readonly original: DiffNestedCellViewModel | undefined;
    readonly modified: DiffNestedCellViewModel | undefined;
    readonly type: 'unchanged' | 'insert' | 'delete' | 'modified';
    readonly editorEventDispatcher: NotebookDiffEditorEventDispatcher;
    readonly initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
    };
    metadataFoldingState: PropertyFoldingState;
    outputFoldingState: PropertyFoldingState;
    protected _layoutInfoEmitter: Emitter<CellDiffViewModelLayoutChangeEvent>;
    onDidLayoutChange: import("vs/base/common/event").Event<CellDiffViewModelLayoutChangeEvent>;
    protected _stateChangeEmitter: Emitter<{
        renderOutput: boolean;
    }>;
    onDidStateChange: import("vs/base/common/event").Event<{
        renderOutput: boolean;
    }>;
    protected _layoutInfo: IDiffElementLayoutInfo;
    set rawOutputHeight(height: number);
    get rawOutputHeight(): number;
    set outputStatusHeight(height: number);
    get outputStatusHeight(): number;
    set outputMetadataHeight(height: number);
    get outputMetadataHeight(): number;
    set editorHeight(height: number);
    get editorHeight(): number;
    set editorMargin(margin: number);
    get editorMargin(): number;
    set metadataStatusHeight(height: number);
    get metadataStatusHeight(): number;
    set metadataHeight(height: number);
    get metadataHeight(): number;
    private _renderOutput;
    set renderOutput(value: boolean);
    get renderOutput(): boolean;
    get layoutInfo(): IDiffElementLayoutInfo;
    private _sourceEditorViewState;
    private _outputEditorViewState;
    private _metadataEditorViewState;
    constructor(mainDocumentTextModel: INotebookTextModel, original: DiffNestedCellViewModel | undefined, modified: DiffNestedCellViewModel | undefined, type: 'unchanged' | 'insert' | 'delete' | 'modified', editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
    });
    layoutChange(): void;
    protected _layout(delta: ILayoutInfoDelta): void;
    getHeight(lineHeight: number): number;
    private _computeTotalHeight;
    private estimateEditorHeight;
    private _getOutputTotalHeight;
    private _fireLayoutChangeEvent;
    abstract checkIfOutputsModified(): false | {
        reason: string | undefined;
    };
    abstract checkMetadataIfModified(): false | {
        reason: string | undefined;
    };
    abstract isOutputEmpty(): boolean;
    abstract getRichOutputTotalHeight(): number;
    abstract getCellByUri(cellUri: URI): IGenericCellViewModel;
    abstract getOutputOffsetInCell(diffSide: DiffSide, index: number): number;
    abstract getOutputOffsetInContainer(diffSide: DiffSide, index: number): number;
    abstract updateOutputHeight(diffSide: DiffSide, index: number, height: number): void;
    abstract getNestedCellViewModel(diffSide: DiffSide): DiffNestedCellViewModel;
    getComputedCellContainerWidth(layoutInfo: NotebookLayoutInfo, diffEditor: boolean, fullWidth: boolean): number;
    getOutputEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveOutputEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
    getMetadataEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveMetadataEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
    getSourceEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveSpirceEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
}
export declare class SideBySideDiffElementViewModel extends DiffElementViewModelBase {
    readonly otherDocumentTextModel: NotebookTextModel;
    get originalDocument(): NotebookTextModel;
    get modifiedDocument(): INotebookTextModel;
    readonly original: DiffNestedCellViewModel;
    readonly modified: DiffNestedCellViewModel;
    readonly type: 'unchanged' | 'modified';
    constructor(mainDocumentTextModel: NotebookTextModel, otherDocumentTextModel: NotebookTextModel, original: DiffNestedCellViewModel, modified: DiffNestedCellViewModel, type: 'unchanged' | 'modified', editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
    });
    checkIfOutputsModified(): false | {
        reason: string | undefined;
        kind: OutputComparison;
    };
    checkMetadataIfModified(): false | {
        reason: undefined;
    };
    updateOutputHeight(diffSide: DiffSide, index: number, height: number): void;
    getOutputOffsetInContainer(diffSide: DiffSide, index: number): number;
    getOutputOffsetInCell(diffSide: DiffSide, index: number): number;
    isOutputEmpty(): boolean;
    getRichOutputTotalHeight(): number;
    getNestedCellViewModel(diffSide: DiffSide): DiffNestedCellViewModel;
    getCellByUri(cellUri: URI): IGenericCellViewModel;
}
export declare class SingleSideDiffElementViewModel extends DiffElementViewModelBase {
    readonly otherDocumentTextModel: NotebookTextModel;
    get cellViewModel(): DiffNestedCellViewModel;
    get originalDocument(): NotebookTextModel | INotebookTextModel;
    get modifiedDocument(): NotebookTextModel | INotebookTextModel;
    readonly type: 'insert' | 'delete';
    constructor(mainDocumentTextModel: NotebookTextModel, otherDocumentTextModel: NotebookTextModel, original: DiffNestedCellViewModel | undefined, modified: DiffNestedCellViewModel | undefined, type: 'insert' | 'delete', editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
    });
    getNestedCellViewModel(diffSide: DiffSide): DiffNestedCellViewModel;
    checkIfOutputsModified(): false | {
        reason: string | undefined;
    };
    checkMetadataIfModified(): false | {
        reason: string | undefined;
    };
    updateOutputHeight(diffSide: DiffSide, index: number, height: number): void;
    getOutputOffsetInContainer(diffSide: DiffSide, index: number): number;
    getOutputOffsetInCell(diffSide: DiffSide, index: number): number;
    isOutputEmpty(): boolean;
    getRichOutputTotalHeight(): number;
    getCellByUri(cellUri: URI): IGenericCellViewModel;
}
export declare const enum OutputComparison {
    Unchanged = 0,
    Metadata = 1,
    Other = 2
}
export declare function outputEqual(a: ICellOutput, b: ICellOutput): OutputComparison;
export declare function getFormattedMetadataJSON(documentTextModel: INotebookTextModel, metadata: NotebookCellMetadata, language?: string): string;
export declare function getStreamOutputData(outputs: IOutputItemDto[]): string | null;
export declare function getFormattedOutputJSON(outputs: IOutputDto[]): string;
export {};
