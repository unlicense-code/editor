import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { NativeStorageService } from 'vs/platform/storage/electron-sandbox/storageService';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IEmptyWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class NativeWorkbenchStorageService extends NativeStorageService {
    private readonly userDataProfileService;
    constructor(workspace: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier | undefined, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, mainProcessService: IMainProcessService, environmentService: IEnvironmentService);
    private registerListeners;
}
