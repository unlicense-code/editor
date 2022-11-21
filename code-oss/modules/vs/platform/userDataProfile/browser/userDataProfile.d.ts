import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfile, IUserDataProfilesService, StoredProfileAssociations, StoredUserDataProfile, UserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class BrowserUserDataProfilesService extends UserDataProfilesService implements IUserDataProfilesService {
    private readonly changesBroadcastChannel;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService);
    private updateTransientProfiles;
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected triggerProfilesChanges(added: IUserDataProfile[], removed: IUserDataProfile[], updated: IUserDataProfile[]): void;
    protected saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void;
    protected getStoredProfileAssociations(): StoredProfileAssociations;
    protected saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void;
}
