import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IFileDialogService, IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFileService } from 'vs/platform/files/common/files';
import { ISaveOptions } from 'vs/workbench/common/editor';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel, IStoredFileWorkingCopyModelFactory, IStoredFileWorkingCopyResolveOptions } from 'vs/workbench/services/workingCopy/common/storedFileWorkingCopy';
import { IStoredFileWorkingCopyManager, IStoredFileWorkingCopyManagerResolveOptions } from 'vs/workbench/services/workingCopy/common/storedFileWorkingCopyManager';
import { IUntitledFileWorkingCopy, IUntitledFileWorkingCopyModel, IUntitledFileWorkingCopyModelFactory } from 'vs/workbench/services/workingCopy/common/untitledFileWorkingCopy';
import { INewOrExistingUntitledFileWorkingCopyOptions, INewUntitledFileWorkingCopyOptions, INewUntitledFileWorkingCopyWithAssociatedResourceOptions, IUntitledFileWorkingCopyManager } from 'vs/workbench/services/workingCopy/common/untitledFileWorkingCopyManager';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IBaseFileWorkingCopyManager } from 'vs/workbench/services/workingCopy/common/abstractFileWorkingCopyManager';
import { IFileWorkingCopy } from 'vs/workbench/services/workingCopy/common/fileWorkingCopy';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
export interface IFileWorkingCopyManager<S extends IStoredFileWorkingCopyModel, U extends IUntitledFileWorkingCopyModel> extends IBaseFileWorkingCopyManager<S | U, IFileWorkingCopy<S | U>> {
    /**
     * Provides access to the manager for stored file working copies.
     */
    readonly stored: IStoredFileWorkingCopyManager<S>;
    /**
     * Provides access to the manager for untitled file working copies.
     */
    readonly untitled: IUntitledFileWorkingCopyManager<U>;
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
    resolve(resource: URI, options?: IStoredFileWorkingCopyManagerResolveOptions): Promise<IStoredFileWorkingCopy<S>>;
    /**
     * Create a new untitled file working copy with optional initial contents.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     */
    resolve(options?: INewUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<U>>;
    /**
     * Create a new untitled file working copy with optional initial contents
     * and associated resource. The associated resource will be used when
     * saving and will not require to ask the user for a file path.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     */
    resolve(options?: INewUntitledFileWorkingCopyWithAssociatedResourceOptions): Promise<IUntitledFileWorkingCopy<U>>;
    /**
     * Creates a new untitled file working copy with optional initial contents
     * with the provided resource or return an existing untitled file working
     * copy otherwise.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     */
    resolve(options?: INewOrExistingUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<U>>;
    /**
     * Implements "Save As" for file based working copies. The API is `URI` based
     * because it works even without resolved file working copies. If a file working
     * copy exists for any given `URI`, the implementation will deal with them properly
     * (e.g. dirty contents of the source will be written to the target and the source
     * will be reverted).
     *
     * Note: it is possible that the returned file working copy has a different `URI`
     * than the `target` that was passed in. Based on URI identity, the file working
     * copy may chose to return an existing file working copy with different casing
     * to respect file systems that are case insensitive.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     *
     * Note: Untitled file working copies are being disposed when saved.
     *
     * @param source the source resource to save as
     * @param target the optional target resource to save to. if not defined, the user
     * will be asked for input
     * @returns the target stored working copy that was saved to or `undefined` in case of
     * cancellation
     */
    saveAs(source: URI, target: URI, options?: ISaveOptions): Promise<IStoredFileWorkingCopy<S> | undefined>;
    saveAs(source: URI, target: undefined, options?: IFileWorkingCopySaveAsOptions): Promise<IStoredFileWorkingCopy<S> | undefined>;
}
export interface IFileWorkingCopySaveAsOptions extends ISaveOptions {
    /**
     * Optional target resource to suggest to the user in case
     * no target resource is provided to save to.
     */
    suggestedTarget?: URI;
}
export declare class FileWorkingCopyManager<S extends IStoredFileWorkingCopyModel, U extends IUntitledFileWorkingCopyModel> extends Disposable implements IFileWorkingCopyManager<S, U> {
    private readonly workingCopyTypeId;
    private readonly storedWorkingCopyModelFactory;
    private readonly untitledWorkingCopyModelFactory;
    private readonly fileService;
    private readonly workingCopyFileService;
    private readonly uriIdentityService;
    private readonly fileDialogService;
    private readonly pathService;
    private readonly environmentService;
    private readonly dialogService;
    private readonly decorationsService;
    readonly onDidCreate: Event<IFileWorkingCopy<S | U>>;
    private static readonly FILE_WORKING_COPY_SAVE_CREATE_SOURCE;
    private static readonly FILE_WORKING_COPY_SAVE_REPLACE_SOURCE;
    readonly stored: IStoredFileWorkingCopyManager<S>;
    readonly untitled: IUntitledFileWorkingCopyManager<U>;
    constructor(workingCopyTypeId: string, storedWorkingCopyModelFactory: IStoredFileWorkingCopyModelFactory<S>, untitledWorkingCopyModelFactory: IUntitledFileWorkingCopyModelFactory<U>, fileService: IFileService, lifecycleService: ILifecycleService, labelService: ILabelService, logService: ILogService, workingCopyFileService: IWorkingCopyFileService, workingCopyBackupService: IWorkingCopyBackupService, uriIdentityService: IUriIdentityService, fileDialogService: IFileDialogService, filesConfigurationService: IFilesConfigurationService, workingCopyService: IWorkingCopyService, notificationService: INotificationService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, elevatedFileService: IElevatedFileService, pathService: IPathService, environmentService: IWorkbenchEnvironmentService, dialogService: IDialogService, decorationsService: IDecorationsService);
    private provideDecorations;
    get workingCopies(): (IUntitledFileWorkingCopy<U> | IStoredFileWorkingCopy<S>)[];
    get(resource: URI): IUntitledFileWorkingCopy<U> | IStoredFileWorkingCopy<S> | undefined;
    resolve(options?: INewUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<U>>;
    resolve(options?: INewUntitledFileWorkingCopyWithAssociatedResourceOptions): Promise<IUntitledFileWorkingCopy<U>>;
    resolve(options?: INewOrExistingUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<U>>;
    resolve(resource: URI, options?: IStoredFileWorkingCopyResolveOptions): Promise<IStoredFileWorkingCopy<S>>;
    saveAs(source: URI, target?: URI, options?: IFileWorkingCopySaveAsOptions): Promise<IStoredFileWorkingCopy<S> | undefined>;
    private doSave;
    private doSaveAs;
    private doResolveSaveTarget;
    private confirmOverwrite;
    private suggestSavePath;
    destroy(): Promise<void>;
}
