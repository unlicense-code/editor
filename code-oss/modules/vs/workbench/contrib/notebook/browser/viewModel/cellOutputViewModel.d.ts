import { Disposable } from 'vs/base/common/lifecycle';
import { ICellOutputViewModel, IGenericCellViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { ICellOutput, IOrderedMimeType } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
export declare class CellOutputViewModel extends Disposable implements ICellOutputViewModel {
    readonly cellViewModel: IGenericCellViewModel;
    private readonly _outputRawData;
    private readonly _notebookService;
    private _onDidResetRendererEmitter;
    readonly onDidResetRenderer: import("vs/base/common/event").Event<void>;
    outputHandle: number;
    get model(): ICellOutput;
    private _pickedMimeType;
    get pickedMimeType(): IOrderedMimeType | undefined;
    set pickedMimeType(value: IOrderedMimeType | undefined);
    constructor(cellViewModel: IGenericCellViewModel, _outputRawData: ICellOutput, _notebookService: INotebookService);
    hasMultiMimeType(): boolean;
    resolveMimeTypes(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined): [readonly IOrderedMimeType[], number];
    resetRenderer(): void;
    toRawJSON(): {
        outputs: import("vs/workbench/contrib/notebook/common/notebookCommon").IOutputItemDto[];
    };
}
