import { Disposable } from 'vs/base/common/lifecycle';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IUserDataProfile, IUserDataProfileOptions, IUserDataProfilesService, IUserDataProfileUpdateOptions } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IUserDataProfileManagementService, IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class UserDataProfileManagementService extends Disposable implements IUserDataProfileManagementService {
    private readonly userDataProfilesService;
    private readonly userDataProfileService;
    private readonly hostService;
    private readonly dialogService;
    private readonly workspaceContextService;
    private readonly extensionService;
    private readonly environmentService;
    readonly _serviceBrand: undefined;
    constructor(userDataProfilesService: IUserDataProfilesService, userDataProfileService: IUserDataProfileService, hostService: IHostService, dialogService: IDialogService, workspaceContextService: IWorkspaceContextService, extensionService: IExtensionService, environmentService: IWorkbenchEnvironmentService);
    private onDidChangeProfiles;
    private onDidResetWorkspaces;
    private onDidChangeCurrentProfile;
    createAndEnterProfile(name: string, options?: IUserDataProfileOptions, fromExisting?: boolean): Promise<IUserDataProfile>;
    createAndEnterTransientProfile(): Promise<IUserDataProfile>;
    updateProfile(profile: IUserDataProfile, updateOptions: IUserDataProfileUpdateOptions): Promise<void>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    switchProfile(profile: IUserDataProfile): Promise<void>;
    private getWorkspaceIdentifier;
    private enterProfile;
}
