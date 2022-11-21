import { URI } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IFileService, IFileStatWithMetadata } from 'vs/platform/files/common/files';
import { ISaveOptions, IRevertOptions } from 'vs/workbench/common/editor';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IWorkingCopyBackup, IWorkingCopySaveEvent, WorkingCopyCapabilities } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { VSBufferReadableStream } from 'vs/base/common/buffer';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
import { IResourceWorkingCopy, ResourceWorkingCopy } from 'vs/workbench/services/workingCopy/common/resourceWorkingCopy';
import { IFileWorkingCopy, IFileWorkingCopyModel, IFileWorkingCopyModelFactory } from 'vs/workbench/services/workingCopy/common/fileWorkingCopy';
/**
 * Stored file specific working copy model factory.
 */
export interface IStoredFileWorkingCopyModelFactory<M extends IStoredFileWorkingCopyModel> extends IFileWorkingCopyModelFactory<M> {
}
/**
 * The underlying model of a stored file working copy provides some
 * methods for the stored file working copy to function. The model is
 * typically only available after the working copy has been
 * resolved via it's `resolve()` method.
 */
export interface IStoredFileWorkingCopyModel extends IFileWorkingCopyModel {
    readonly onDidChangeContent: Event<IStoredFileWorkingCopyModelContentChangedEvent>;
    /**
     * A version ID of the model. If a `onDidChangeContent` is fired
     * from the model and the last known saved `versionId` matches
     * with the `model.versionId`, the stored file working copy will
     * discard any dirty state.
     *
     * A use case is the following:
     * - a stored file working copy gets edited and thus dirty
     * - the user triggers undo to revert the changes
     * - at this point the `versionId` should match the one we had saved
     *
     * This requires the model to be aware of undo/redo operations.
     */
    readonly versionId: unknown;
    /**
     * Close the current undo-redo element. This offers a way
     * to create an undo/redo stop point.
     *
     * This method may for example be called right before the
     * save is triggered so that the user can always undo back
     * to the state before saving.
     */
    pushStackElement(): void;
}
export interface IStoredFileWorkingCopyModelContentChangedEvent {
    /**
     * Flag that indicates that this event was generated while undoing.
     */
    readonly isUndoing: boolean;
    /**
     * Flag that indicates that this event was generated while redoing.
     */
    readonly isRedoing: boolean;
}
/**
 * A stored file based `IWorkingCopy` is backed by a `URI` from a
 * known file system provider. Given this assumption, a lot
 * of functionality can be built on top, such as saving in
 * a secure way to prevent data loss.
 */
export interface IStoredFileWorkingCopy<M extends IStoredFileWorkingCopyModel> extends IResourceWorkingCopy, IFileWorkingCopy<M> {
    /**
     * An event for when a stored file working copy was resolved.
     */
    readonly onDidResolve: Event<void>;
    /**
     * An event for when a stored file working copy was saved successfully.
     */
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent>;
    /**
     * An event indicating that a stored file working copy save operation failed.
     */
    readonly onDidSaveError: Event<void>;
    /**
     * An event for when the readonly state of the stored file working copy changes.
     */
    readonly onDidChangeReadonly: Event<void>;
    /**
     * Resolves a stored file working copy.
     */
    resolve(options?: IStoredFileWorkingCopyResolveOptions): Promise<void>;
    /**
     * Explicitly sets the working copy to be dirty.
     */
    markDirty(): void;
    /**
     * Whether the stored file working copy is in the provided `state`
     * or not.
     *
     * @param state the `FileWorkingCopyState` to check on.
     */
    hasState(state: StoredFileWorkingCopyState): boolean;
    /**
     * Allows to join a state change away from the provided `state`.
     *
     * @param state currently only `FileWorkingCopyState.PENDING_SAVE`
     * can be awaited on to resolve.
     */
    joinState(state: StoredFileWorkingCopyState.PENDING_SAVE): Promise<void>;
    /**
     * Whether we have a resolved model or not.
     */
    isResolved(): this is IResolvedStoredFileWorkingCopy<M>;
    /**
     * Whether the stored file working copy is readonly or not.
     */
    isReadonly(): boolean;
}
export interface IResolvedStoredFileWorkingCopy<M extends IStoredFileWorkingCopyModel> extends IStoredFileWorkingCopy<M> {
    /**
     * A resolved stored file working copy has a resolved model.
     */
    readonly model: M;
}
/**
 * States the stored file working copy can be in.
 */
export declare const enum StoredFileWorkingCopyState {
    /**
     * A stored file working copy is saved.
     */
    SAVED = 0,
    /**
     * A stored file working copy is dirty.
     */
    DIRTY = 1,
    /**
     * A stored file working copy is currently being saved but
     * this operation has not completed yet.
     */
    PENDING_SAVE = 2,
    /**
     * A stored file working copy is in conflict mode when changes
     * cannot be saved because the underlying file has changed.
     * Stored file working copies in conflict mode are always dirty.
     */
    CONFLICT = 3,
    /**
     * A stored file working copy is in orphan state when the underlying
     * file has been deleted.
     */
    ORPHAN = 4,
    /**
     * Any error that happens during a save that is not causing
     * the `StoredFileWorkingCopyState.CONFLICT` state.
     * Stored file working copies in error mode are always dirty.
     */
    ERROR = 5
}
export interface IStoredFileWorkingCopySaveOptions extends ISaveOptions {
    /**
     * Save the stored file working copy with an attempt to unlock it.
     */
    readonly writeUnlock?: boolean;
    /**
     * Save the stored file working copy with elevated privileges.
     *
     * Note: This may not be supported in all environments.
     */
    readonly writeElevated?: boolean;
    /**
     * Allows to write to a stored file working copy even if it has been
     * modified on disk. This should only be triggered from an
     * explicit user action.
     */
    readonly ignoreModifiedSince?: boolean;
    /**
     * If set, will bubble up the stored file working copy save error to
     * the caller instead of handling it.
     */
    readonly ignoreErrorHandler?: boolean;
}
export interface IStoredFileWorkingCopyResolver {
    /**
     * Resolves the working copy in a safe way from an external
     * working copy manager that can make sure multiple parallel
     * resolves execute properly.
     */
    (options?: IStoredFileWorkingCopyResolveOptions): Promise<void>;
}
export interface IStoredFileWorkingCopyResolveOptions {
    /**
     * The contents to use for the stored file working copy if known. If not
     * provided, the contents will be retrieved from the underlying
     * resource or backup if present.
     *
     * If contents are provided, the stored file working copy will be marked
     * as dirty right from the beginning.
     */
    readonly contents?: VSBufferReadableStream;
    /**
     * Go to disk bypassing any cache of the stored file working copy if any.
     */
    readonly forceReadFromFile?: boolean;
}
export interface IStoredFileWorkingCopySaveEvent extends IWorkingCopySaveEvent {
    /**
     * The resolved stat from the save operation.
     */
    readonly stat: IFileStatWithMetadata;
}
export declare function isStoredFileWorkingCopySaveEvent(e: IWorkingCopySaveEvent): e is IStoredFileWorkingCopySaveEvent;
export declare class StoredFileWorkingCopy<M extends IStoredFileWorkingCopyModel> extends ResourceWorkingCopy implements IStoredFileWorkingCopy<M> {
    readonly typeId: string;
    readonly name: string;
    private readonly modelFactory;
    private readonly externalResolver;
    private readonly logService;
    private readonly workingCopyFileService;
    private readonly filesConfigurationService;
    private readonly workingCopyBackupService;
    private readonly notificationService;
    private readonly workingCopyEditorService;
    private readonly editorService;
    private readonly elevatedFileService;
    readonly capabilities: WorkingCopyCapabilities;
    private _model;
    get model(): M | undefined;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    private readonly _onDidResolve;
    readonly onDidResolve: Event<void>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<void>;
    private readonly _onDidSaveError;
    readonly onDidSaveError: Event<void>;
    private readonly _onDidSave;
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent>;
    private readonly _onDidRevert;
    readonly onDidRevert: Event<void>;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeReadonly: Event<void>;
    constructor(typeId: string, resource: URI, name: string, modelFactory: IStoredFileWorkingCopyModelFactory<M>, externalResolver: IStoredFileWorkingCopyResolver, fileService: IFileService, logService: ILogService, workingCopyFileService: IWorkingCopyFileService, filesConfigurationService: IFilesConfigurationService, workingCopyBackupService: IWorkingCopyBackupService, workingCopyService: IWorkingCopyService, notificationService: INotificationService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, elevatedFileService: IElevatedFileService);
    private dirty;
    private savedVersionId;
    isDirty(): this is IResolvedStoredFileWorkingCopy<M>;
    markDirty(): void;
    private setDirty;
    private doSetDirty;
    private lastResolvedFileStat;
    isResolved(): this is IResolvedStoredFileWorkingCopy<M>;
    resolve(options?: IStoredFileWorkingCopyResolveOptions): Promise<void>;
    private doResolve;
    private resolveFromBuffer;
    private resolveFromBackup;
    private doResolveFromBackup;
    private resolveFromFile;
    private resolveFromContent;
    private doCreateModel;
    private ignoreDirtyOnModelContentChange;
    private doUpdateModel;
    private installModelListeners;
    private onModelContentChanged;
    private forceResolveFromFile;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    private versionId;
    private static readonly UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD;
    private lastContentChangeFromUndoRedo;
    private readonly saveSequentializer;
    private ignoreSaveFromSaveParticipants;
    save(options?: IStoredFileWorkingCopySaveOptions): Promise<boolean>;
    private doSave;
    private handleSaveSuccess;
    private handleSaveError;
    private doHandleSaveError;
    private updateLastResolvedFileStat;
    revert(options?: IRevertOptions): Promise<void>;
    private inConflictMode;
    private inErrorMode;
    hasState(state: StoredFileWorkingCopyState): boolean;
    joinState(state: StoredFileWorkingCopyState.PENDING_SAVE): Promise<void>;
    isReadonly(): boolean;
    private trace;
    dispose(): void;
}
