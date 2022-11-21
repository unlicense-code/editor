import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IResourceRefHandle, IUserDataSyncBackupStoreService, IUserDataSyncLogService, SyncResource } from 'vs/platform/userDataSync/common/userDataSync';
export declare class UserDataSyncBackupStoreService extends Disposable implements IUserDataSyncBackupStoreService {
    private readonly environmentService;
    private readonly fileService;
    private readonly configurationService;
    private readonly logService;
    private readonly userDataProfilesService;
    _serviceBrand: any;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, configurationService: IConfigurationService, logService: IUserDataSyncLogService, userDataProfilesService: IUserDataProfilesService);
    getAllRefs(profile: IUserDataProfile, resource: SyncResource): Promise<IResourceRefHandle[]>;
    resolveContent(profile: IUserDataProfile, resourceKey: SyncResource, ref: string): Promise<string | null>;
    backup(profile: IUserDataProfile, resourceKey: SyncResource, content: string): Promise<void>;
    private getResourceBackupHome;
    private cleanUpBackup;
    private getCreationTime;
}
