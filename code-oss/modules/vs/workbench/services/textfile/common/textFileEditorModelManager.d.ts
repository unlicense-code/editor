import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { TextFileEditorModel } from 'vs/workbench/services/textfile/common/textFileEditorModel';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { ITextFileEditorModel, ITextFileEditorModelManager, ITextFileEditorModelResolveOrCreateOptions, ITextFileResolveEvent, ITextFileSaveEvent, ITextFileSaveParticipant } from 'vs/workbench/services/textfile/common/textfiles';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileService } from 'vs/platform/files/common/files';
import { SaveReason } from 'vs/workbench/common/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
export declare class TextFileEditorModelManager extends Disposable implements ITextFileEditorModelManager {
    private readonly instantiationService;
    private readonly fileService;
    private readonly notificationService;
    private readonly workingCopyFileService;
    private readonly uriIdentityService;
    private readonly _onDidCreate;
    readonly onDidCreate: Event<TextFileEditorModel>;
    private readonly _onDidResolve;
    readonly onDidResolve: Event<ITextFileResolveEvent>;
    private readonly _onDidRemove;
    readonly onDidRemove: Event<URI>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<TextFileEditorModel>;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeReadonly: Event<TextFileEditorModel>;
    private readonly _onDidChangeOrphaned;
    readonly onDidChangeOrphaned: Event<TextFileEditorModel>;
    private readonly _onDidSaveError;
    readonly onDidSaveError: Event<TextFileEditorModel>;
    private readonly _onDidSave;
    readonly onDidSave: Event<ITextFileSaveEvent>;
    private readonly _onDidRevert;
    readonly onDidRevert: Event<TextFileEditorModel>;
    private readonly _onDidChangeEncoding;
    readonly onDidChangeEncoding: Event<TextFileEditorModel>;
    private readonly mapResourceToModel;
    private readonly mapResourceToModelListeners;
    private readonly mapResourceToDisposeListener;
    private readonly mapResourceToPendingModelResolvers;
    private readonly modelResolveQueue;
    saveErrorHandler: {
        onSaveError(error: Error, model: ITextFileEditorModel): void;
    };
    get models(): TextFileEditorModel[];
    constructor(instantiationService: IInstantiationService, fileService: IFileService, notificationService: INotificationService, workingCopyFileService: IWorkingCopyFileService, uriIdentityService: IUriIdentityService);
    private registerListeners;
    private onDidFilesChange;
    private onDidChangeFileSystemProviderCapabilities;
    private onDidChangeFileSystemProviderRegistrations;
    private queueModelReloads;
    private queueModelReload;
    private readonly mapCorrelationIdToModelsToRestore;
    private onWillRunWorkingCopyFileOperation;
    private onDidFailWorkingCopyFileOperation;
    private onDidRunWorkingCopyFileOperation;
    get(resource: URI): TextFileEditorModel | undefined;
    private has;
    private reload;
    resolve(resource: URI, options?: ITextFileEditorModelResolveOrCreateOptions): Promise<TextFileEditorModel>;
    private doResolve;
    private joinPendingResolves;
    private doJoinPendingResolves;
    private registerModel;
    protected add(resource: URI, model: TextFileEditorModel): void;
    protected remove(resource: URI): void;
    private readonly saveParticipants;
    addSaveParticipant(participant: ITextFileSaveParticipant): IDisposable;
    runSaveParticipants(model: ITextFileEditorModel, context: {
        reason: SaveReason;
    }, token: CancellationToken): Promise<void>;
    canDispose(model: TextFileEditorModel): true | Promise<true>;
    private doCanDispose;
    dispose(): void;
}
