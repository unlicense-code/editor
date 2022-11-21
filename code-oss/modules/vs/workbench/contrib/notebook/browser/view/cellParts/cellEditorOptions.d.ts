import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IBaseCellEditorOptions, ICellViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { NotebookCellInternalMetadata } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
import { CellViewModelStateChangeEvent } from 'vs/workbench/contrib/notebook/browser/notebookViewEvents';
export declare class CellEditorOptions extends CellContentPart {
    private readonly base;
    readonly notebookOptions: NotebookOptions;
    readonly configurationService: IConfigurationService;
    private _lineNumbers;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private _value;
    constructor(base: IBaseCellEditorOptions, notebookOptions: NotebookOptions, configurationService: IConfigurationService);
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    private _recomputeOptions;
    private _computeEditorOptions;
    getUpdatedValue(internalMetadata: NotebookCellInternalMetadata, cellUri: URI): IEditorOptions;
    getValue(internalMetadata: NotebookCellInternalMetadata, cellUri: URI): IEditorOptions;
    getDefaultValue(): IEditorOptions;
    setLineNumbers(lineNumbers: 'on' | 'off' | 'inherit'): void;
}
