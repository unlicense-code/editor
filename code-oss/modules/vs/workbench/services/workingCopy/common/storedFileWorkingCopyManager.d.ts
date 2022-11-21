import { Event } from 'vs/base/common/event';
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel, IStoredFileWorkingCopyModelFactory, IStoredFileWorkingCopyResolveOptions, IStoredFileWorkingCopySaveEvent as IBaseStoredFileWorkingCopySaveEvent } from 'vs/workbench/services/workingCopy/common/storedFileWorkingCopy';
import { IFileService } from 'vs/platform/files/common/files';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { BaseFileWorkingCopyManager, IBaseFileWorkingCopyManager } from 'vs/workbench/services/workingCopy/common/abstractFileWorkingCopyManager';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
/**
 * The only one that should be dealing with `IStoredFileWorkingCopy` and handle all
 * operations that are working copy related, such as save/revert, backup
 * and resolving.
 */
export interface IStoredFileWorkingCopyManager<M extends IStoredFileWorkingCopyModel> extends IBaseFileWorkingCopyManager<M, IStoredFileWorkingCopy<M>> {
    /**
     * An event for when a stored file working copy was resolved.
     */
    readonly onDidResolve: Event<IStoredFileWorkingCopy<M>>;
    /**
     * An event for when a stored file working copy changed it's dirty state.
     */
    readonly onDidChangeDirty: Event<IStoredFileWorkingCopy<M>>;
    /**
     * An event for when a stored file working copy changed it's readonly state.
     */
    readonly onDidChangeReadonly: Event<IStoredFileWorkingCopy<M>>;
    /**
     * An event for when a stored file working copy changed it's orphaned state.
     */
    readonly onDidChangeOrphaned: Event<IStoredFileWorkingCopy<M>>;
    /**
     * An event for when a stored file working copy failed to save.
     */
    readonly onDidSaveError: Event<IStoredFileWorkingCopy<M>>;
    /**
     * An event for when a stored file working copy successfully saved.
     */
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent<M>>;
    /**
     * An event for when a stored file working copy was reverted.
     */
    readonly onDidRevert: Event<IStoredFileWorkingCopy<M>>;
    /**
     * An event for when a stored file working copy is removed from the manager.
     */
    readonly onDidRemove: Event<URI>;
    /**
     * Allows to resolve a stored file working copy. If the manager already knows
     * about a stored file working copy with the same `URI`, it will return that
     * existing stored file working copy. There will never be more than one
     * stored file working copy per `URI` until the stored file working copy is
     * disposed.
     *
     * Use the `IStoredFileWorkingCopyResolveOptions.reload` option to control the
     * behaviour for when a stored file working copy was previously already resolved
     * with regards to resolving it again from the underlying file resource
     * or not.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     *
     * @param resource used as unique identifier of the stored file working copy in
     * case one is already known for this `URI`.
     * @param options
     */
    resolve(resource: URI, options?: IStoredFileWorkingCopyManagerResolveOptions): Promise<IStoredFileWorkingCopy<M>>;
    /**
     * Waits for the stored file working copy to be ready to be disposed. There may be
     * conditions under which the stored file working copy cannot be disposed, e.g. when
     * it is dirty. Once the promise is settled, it is safe to dispose.
     */
    canDispose(workingCopy: IStoredFileWorkingCopy<M>): true | Promise<true>;
}
export interface IStoredFileWorkingCopySaveEvent<M extends IStoredFileWorkingCopyModel> extends IBaseStoredFileWorkingCopySaveEvent {
    /**
     * The stored file working copy that was successfully saved.
     */
    readonly workingCopy: IStoredFileWorkingCopy<M>;
}
export interface IStoredFileWorkingCopyManagerResolveOptions extends IStoredFileWorkingCopyResolveOptions {
    /**
     * If the stored file working copy was already resolved before,
     * allows to trigger a reload of it to fetch the latest contents.
     */
    readonly reload?: {
        /**
         * Controls whether the reload happens in the background
         * or whether `resolve` will await the reload to happen.
         */
        readonly async: boolean;
        /**
         * Controls whether to force reading the contents from the
         * underlying resource even if the resource did not change.
         */
        readonly force?: boolean;
    };
}
export declare class StoredFileWorkingCopyManager<M extends IStoredFileWorkingCopyModel> extends BaseFileWorkingCopyManager<M, IStoredFileWorkingCopy<M>> implements IStoredFileWorkingCopyManager<M> {
    private readonly workingCopyTypeId;
    private readonly modelFactory;
    private readonly lifecycleService;
    private readonly labelService;
    private readonly workingCopyFileService;
    private readonly uriIdentityService;
    private readonly filesConfigurationService;
    private readonly workingCopyService;
    private readonly notificationService;
    private readonly workingCopyEditorService;
    private readonly editorService;
    private readonly elevatedFileService;
    private readonly _onDidResolve;
    readonly onDidResolve: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeReadonly: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidChangeOrphaned;
    readonly onDidChangeOrphaned: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidSaveError;
    readonly onDidSaveError: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidSave;
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent<M>>;
    private readonly _onDidRevert;
    readonly onDidRevert: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidRemove;
    readonly onDidRemove: Event<URI>;
    private readonly mapResourceToWorkingCopyListeners;
    private readonly mapResourceToPendingWorkingCopyResolve;
    private readonly workingCopyResolveQueue;
    constructor(workingCopyTypeId: string, modelFactory: IStoredFileWorkingCopyModelFactory<M>, fileService: IFileService, lifecycleService: ILifecycleService, labelService: ILabelService, logService: ILogService, workingCopyFileService: IWorkingCopyFileService, workingCopyBackupService: IWorkingCopyBackupService, uriIdentityService: IUriIdentityService, filesConfigurationService: IFilesConfigurationService, workingCopyService: IWorkingCopyService, notificationService: INotificationService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, elevatedFileService: IElevatedFileService);
    private registerListeners;
    private onBeforeShutdownWeb;
    private onWillShutdownDesktop;
    private onDidChangeFileSystemProviderCapabilities;
    private onDidChangeFileSystemProviderRegistrations;
    private onDidFilesChange;
    private queueWorkingCopyReloads;
    private queueWorkingCopyReload;
    private readonly mapCorrelationIdToWorkingCopiesToRestore;
    private onWillRunWorkingCopyFileOperation;
    private onDidFailWorkingCopyFileOperation;
    private onDidRunWorkingCopyFileOperation;
    private reload;
    resolve(resource: URI, options?: IStoredFileWorkingCopyManagerResolveOptions): Promise<IStoredFileWorkingCopy<M>>;
    private doResolve;
    private joinPendingResolves;
    private doJoinPendingResolves;
    private registerWorkingCopy;
    protected remove(resource: URI): boolean;
    canDispose(workingCopy: IStoredFileWorkingCopy<M>): true | Promise<true>;
    private doCanDispose;
    dispose(): void;
}
