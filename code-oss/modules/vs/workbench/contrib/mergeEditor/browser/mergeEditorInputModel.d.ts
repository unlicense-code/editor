import { IDisposable } from 'vs/base/common/lifecycle';
import { IObservable } from 'vs/base/common/observable';
import { URI } from 'vs/base/common/uri';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ConfirmResult } from 'vs/platform/dialogs/common/dialogs';
import { IEditorModel } from 'vs/platform/editor/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IRevertOptions } from 'vs/workbench/common/editor';
import { MergeEditorInputData } from 'vs/workbench/contrib/mergeEditor/browser/mergeEditorInput';
import { MergeEditorModel } from 'vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel';
import { MergeEditorTelemetry } from 'vs/workbench/contrib/mergeEditor/browser/telemetry';
import { ITextFileSaveOptions, ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
export interface MergeEditorArgs {
    base: URI;
    input1: MergeEditorInputData;
    input2: MergeEditorInputData;
    result: URI;
}
export interface IMergeEditorInputModelFactory {
    createInputModel(args: MergeEditorArgs): Promise<IMergeEditorInputModel>;
}
export interface IMergeEditorInputModel extends IDisposable, IEditorModel {
    readonly resultUri: URI;
    readonly model: MergeEditorModel;
    readonly isDirty: IObservable<boolean>;
    save(options?: ITextFileSaveOptions): Promise<void>;
    /**
     * If save resets the dirty state, revert must do so too.
    */
    revert(options?: IRevertOptions): Promise<void>;
    shouldConfirmClose(): boolean;
    confirmClose(inputModels: IMergeEditorInputModel[]): Promise<ConfirmResult>;
    /**
     * Marks the merge as done. The merge editor must be closed afterwards.
    */
    accept(): Promise<void>;
}
export declare class TempFileMergeEditorModeFactory implements IMergeEditorInputModelFactory {
    private readonly _mergeEditorTelemetry;
    private readonly _instantiationService;
    private readonly _textModelService;
    private readonly _modelService;
    constructor(_mergeEditorTelemetry: MergeEditorTelemetry, _instantiationService: IInstantiationService, _textModelService: ITextModelService, _modelService: IModelService);
    createInputModel(args: MergeEditorArgs): Promise<IMergeEditorInputModel>;
}
export declare class WorkspaceMergeEditorModeFactory implements IMergeEditorInputModelFactory {
    private readonly _mergeEditorTelemetry;
    private readonly _instantiationService;
    private readonly _textModelService;
    private readonly textFileService;
    constructor(_mergeEditorTelemetry: MergeEditorTelemetry, _instantiationService: IInstantiationService, _textModelService: ITextModelService, textFileService: ITextFileService);
    private static readonly FILE_SAVED_SOURCE;
    createInputModel(args: MergeEditorArgs): Promise<IMergeEditorInputModel>;
}
