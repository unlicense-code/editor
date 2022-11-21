import { IDisposable } from 'vs/base/common/lifecycle';
import { IBulkEditOptions, IBulkEditPreviewHandler, IBulkEditResult, IBulkEditService, ResourceEdit } from 'vs/editor/browser/services/bulkEditService';
import { WorkspaceEdit } from 'vs/editor/common/languages';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
export declare class BulkEditService implements IBulkEditService {
    private readonly _instaService;
    private readonly _logService;
    private readonly _editorService;
    private readonly _lifecycleService;
    private readonly _dialogService;
    private readonly _workingCopyService;
    private readonly _configService;
    readonly _serviceBrand: undefined;
    private readonly _activeUndoRedoGroups;
    private _previewHandler?;
    constructor(_instaService: IInstantiationService, _logService: ILogService, _editorService: IEditorService, _lifecycleService: ILifecycleService, _dialogService: IDialogService, _workingCopyService: IWorkingCopyService, _configService: IConfigurationService);
    setPreviewHandler(handler: IBulkEditPreviewHandler): IDisposable;
    hasPreviewHandler(): boolean;
    apply(editsIn: ResourceEdit[] | WorkspaceEdit, options?: IBulkEditOptions): Promise<IBulkEditResult>;
    private _saveAll;
    private _shouldVeto;
}
