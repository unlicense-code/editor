import { URI } from 'vs/base/common/uri';
import { ITextFileService, ISaveErrorHandler, ITextFileEditorModel } from 'vs/workbench/services/textfile/common/textfiles';
import { ServicesAccessor, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare const CONFLICT_RESOLUTION_CONTEXT = "saveConflictResolutionContext";
export declare const CONFLICT_RESOLUTION_SCHEME = "conflictResolution";
export declare class TextFileSaveErrorHandler extends Disposable implements ISaveErrorHandler, IWorkbenchContribution {
    private readonly notificationService;
    private readonly textFileService;
    private contextKeyService;
    private readonly editorService;
    private readonly instantiationService;
    private readonly storageService;
    private readonly messages;
    private readonly conflictResolutionContext;
    private activeConflictResolutionResource;
    constructor(notificationService: INotificationService, textFileService: ITextFileService, contextKeyService: IContextKeyService, editorService: IEditorService, textModelService: ITextModelService, instantiationService: IInstantiationService, storageService: IStorageService);
    private registerListeners;
    private onActiveEditorChanged;
    private onFileSavedOrReverted;
    onSaveError(error: unknown, model: ITextFileEditorModel): void;
    dispose(): void;
}
export declare const acceptLocalChangesCommand: (accessor: ServicesAccessor, resource: URI) => Promise<boolean | undefined>;
export declare const revertLocalChangesCommand: (accessor: ServicesAccessor, resource: URI) => Promise<boolean | undefined>;
