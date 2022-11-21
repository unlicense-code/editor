import { Event } from 'vs/base/common/event';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService, WorkspaceIdentifier, StoredUserDataProfile, StoredProfileAssociations, WillCreateProfileEvent, WillRemoveProfileEvent, IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { UserDataProfilesService } from 'vs/platform/userDataProfile/node/userDataProfile';
export declare const IUserDataProfilesMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IUserDataProfilesMainService>;
export interface IUserDataProfilesMainService extends IUserDataProfilesService {
    getOrSetProfileForWorkspace(workspaceIdentifier: WorkspaceIdentifier, profileToSet?: IUserDataProfile): IUserDataProfile;
    setProfileForWorkspaceSync(workspaceIdentifier: WorkspaceIdentifier, profileToSet: IUserDataProfile): void;
    unsetWorkspace(workspaceIdentifier: WorkspaceIdentifier, transient?: boolean): void;
    readonly onWillCreateProfile: Event<WillCreateProfileEvent>;
    readonly onWillRemoveProfile: Event<WillRemoveProfileEvent>;
}
export declare class UserDataProfilesMainService extends UserDataProfilesService implements IUserDataProfilesMainService {
    private readonly stateMainService;
    constructor(stateMainService: IStateMainService, uriIdentityService: IUriIdentityService, environmentService: IEnvironmentService, fileService: IFileService, logService: ILogService);
    setEnablement(enabled: boolean): void;
    protected saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void;
    protected saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void;
    protected getStoredProfileAssociations(): StoredProfileAssociations;
}
