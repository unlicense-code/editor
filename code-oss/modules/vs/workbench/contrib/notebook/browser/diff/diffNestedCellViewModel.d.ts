import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { PrefixSumComputer } from 'vs/editor/common/model/prefixSumComputer';
import { IDiffNestedCellViewModel } from 'vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser';
import { ICellOutputViewModel, IGenericCellViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellViewModelStateChangeEvent } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
import { NotebookCellTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookCellTextModel';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
export declare class DiffNestedCellViewModel extends Disposable implements IDiffNestedCellViewModel, IGenericCellViewModel {
    readonly textModel: NotebookCellTextModel;
    private _notebookService;
    private _id;
    get id(): string;
    get outputs(): import("../../common/notebookCommon").ICellOutput[];
    get language(): string;
    get metadata(): import("../../common/notebookCommon").NotebookCellMetadata;
    get uri(): import("../../../../workbench.web.main").URI;
    get handle(): number;
    protected readonly _onDidChangeState: Emitter<CellViewModelStateChangeEvent>;
    private _hoveringOutput;
    get outputIsHovered(): boolean;
    set outputIsHovered(v: boolean);
    private _focusOnOutput;
    get outputIsFocused(): boolean;
    set outputIsFocused(v: boolean);
    private _outputViewModels;
    get outputsViewModels(): ICellOutputViewModel[];
    protected _outputCollection: number[];
    protected _outputsTop: PrefixSumComputer | null;
    protected readonly _onDidChangeOutputLayout: Emitter<void>;
    readonly onDidChangeOutputLayout: import("vs/base/common/event").Event<void>;
    constructor(textModel: NotebookCellTextModel, _notebookService: INotebookService);
    private _ensureOutputsTop;
    getOutputOffset(index: number): number;
    updateOutputHeight(index: number, height: number): void;
    getOutputTotalHeight(): number;
}