import { URI } from 'vs/base/common/uri';
import { IUntitledFileWorkingCopy, IUntitledFileWorkingCopyInitialContents, IUntitledFileWorkingCopyModel, IUntitledFileWorkingCopyModelFactory, IUntitledFileWorkingCopySaveDelegate } from 'vs/workbench/services/workingCopy/common/untitledFileWorkingCopy';
import { Event } from 'vs/base/common/event';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { IFileService } from 'vs/platform/files/common/files';
import { BaseFileWorkingCopyManager, IBaseFileWorkingCopyManager } from 'vs/workbench/services/workingCopy/common/abstractFileWorkingCopyManager';
/**
 * The only one that should be dealing with `IUntitledFileWorkingCopy` and
 * handle all operations that are working copy related, such as save/revert,
 * backup and resolving.
 */
export interface IUntitledFileWorkingCopyManager<M extends IUntitledFileWorkingCopyModel> extends IBaseFileWorkingCopyManager<M, IUntitledFileWorkingCopy<M>> {
    /**
     * An event for when a untitled file working copy changed it's dirty state.
     */
    readonly onDidChangeDirty: Event<IUntitledFileWorkingCopy<M>>;
    /**
     * An event for when a untitled file working copy is about to be disposed.
     */
    readonly onWillDispose: Event<IUntitledFileWorkingCopy<M>>;
    /**
     * Create a new untitled file working copy with optional initial contents.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     */
    resolve(options?: INewUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<M>>;
    /**
     * Create a new untitled file working copy with optional initial contents
     * and associated resource. The associated resource will be used when
     * saving and will not require to ask the user for a file path.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     */
    resolve(options?: INewUntitledFileWorkingCopyWithAssociatedResourceOptions): Promise<IUntitledFileWorkingCopy<M>>;
    /**
     * Creates a new untitled file working copy with optional initial contents
     * with the provided resource or return an existing untitled file working
     * copy otherwise.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     */
    resolve(options?: INewOrExistingUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<M>>;
}
export interface INewUntitledFileWorkingCopyOptions {
    /**
     * Initial value of the untitled file working copy
     * with support to indicate whether this should turn
     * the working copy dirty or not.
     */
    contents?: IUntitledFileWorkingCopyInitialContents;
}
export interface INewUntitledFileWorkingCopyWithAssociatedResourceOptions extends INewUntitledFileWorkingCopyOptions {
    /**
     * Resource components to associate with the untitled file working copy.
     * When saving, the associated components will be used and the user
     * is not being asked to provide a file path.
     *
     * Note: currently it is not possible to specify the `scheme` to use. The
     * untitled file working copy will saved to the default local or remote resource.
     */
    associatedResource: {
        authority?: string;
        path?: string;
        query?: string;
        fragment?: string;
    };
}
export interface INewOrExistingUntitledFileWorkingCopyOptions extends INewUntitledFileWorkingCopyOptions {
    /**
     * A resource to identify the untitled file working copy
     * to create or return if already existing.
     *
     * Note: the resource will not be used unless the scheme is `untitled`.
     */
    untitledResource: URI;
}
export declare class UntitledFileWorkingCopyManager<M extends IUntitledFileWorkingCopyModel> extends BaseFileWorkingCopyManager<M, IUntitledFileWorkingCopy<M>> implements IUntitledFileWorkingCopyManager<M> {
    private readonly workingCopyTypeId;
    private readonly modelFactory;
    private readonly saveDelegate;
    private readonly labelService;
    private readonly workingCopyService;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<IUntitledFileWorkingCopy<M>>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<IUntitledFileWorkingCopy<M>>;
    private readonly mapResourceToWorkingCopyListeners;
    constructor(workingCopyTypeId: string, modelFactory: IUntitledFileWorkingCopyModelFactory<M>, saveDelegate: IUntitledFileWorkingCopySaveDelegate<M>, fileService: IFileService, labelService: ILabelService, logService: ILogService, workingCopyBackupService: IWorkingCopyBackupService, workingCopyService: IWorkingCopyService);
    resolve(options?: INewUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<M>>;
    resolve(options?: INewUntitledFileWorkingCopyWithAssociatedResourceOptions): Promise<IUntitledFileWorkingCopy<M>>;
    resolve(options?: INewOrExistingUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<M>>;
    private doCreateOrGet;
    private massageOptions;
    private doCreate;
    private registerWorkingCopy;
    protected remove(resource: URI): boolean;
    dispose(): void;
}
