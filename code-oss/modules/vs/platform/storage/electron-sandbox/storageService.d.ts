import { IStorage } from 'vs/base/parts/storage/common/storage';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { AbstractStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IAnyWorkspaceIdentifier, IEmptyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export declare class NativeStorageService extends AbstractStorageService {
    private readonly initialWorkspace;
    private readonly initialProfiles;
    private readonly mainProcessService;
    private readonly environmentService;
    private readonly applicationStorageProfile;
    private readonly applicationStorage;
    private profileStorageProfile;
    private readonly profileStorageDisposables;
    private profileStorage;
    private workspaceStorageId;
    private readonly workspaceStorageDisposables;
    private workspaceStorage;
    constructor(initialWorkspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier | undefined, initialProfiles: {
        defaultProfile: IUserDataProfile;
        currentProfile: IUserDataProfile;
    }, mainProcessService: IMainProcessService, environmentService: IEnvironmentService);
    private createApplicationStorage;
    private createProfileStorage;
    private createWorkspaceStorage;
    protected doInitialize(): Promise<void>;
    protected getStorage(scope: StorageScope): IStorage | undefined;
    protected getLogDetails(scope: StorageScope): string | undefined;
    close(): Promise<void>;
    protected switchToProfile(toProfile: IUserDataProfile, preserveData: boolean): Promise<void>;
    protected switchToWorkspace(toWorkspace: IAnyWorkspaceIdentifier, preserveData: boolean): Promise<void>;
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
}
