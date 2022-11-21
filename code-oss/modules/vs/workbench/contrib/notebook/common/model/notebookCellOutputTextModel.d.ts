import { Disposable } from 'vs/base/common/lifecycle';
import { ICellOutput, IOutputDto, IOutputItemDto } from 'vs/workbench/contrib/notebook/common/notebookCommon';
export declare class NotebookCellOutputTextModel extends Disposable implements ICellOutput {
    readonly _rawOutput: IOutputDto;
    private _onDidChangeData;
    onDidChangeData: import("vs/base/common/event").Event<void>;
    get outputs(): IOutputItemDto[];
    get metadata(): Record<string, any> | undefined;
    get outputId(): string;
    constructor(_rawOutput: IOutputDto);
    replaceData(items: IOutputItemDto[]): void;
    appendData(items: IOutputItemDto[]): void;
    toJSON(): IOutputDto;
}
