import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IStateService } from 'vs/platform/state/node/state';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService, UserDataProfilesService as BaseUserDataProfilesService, StoredUserDataProfile, StoredProfileAssociations } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class UserDataProfilesService extends BaseUserDataProfilesService implements IUserDataProfilesService {
    private readonly stateService;
    constructor(stateService: IStateService, uriIdentityService: IUriIdentityService, environmentService: IEnvironmentService, fileService: IFileService, logService: ILogService);
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected getStoredProfileAssociations(): StoredProfileAssociations;
}
