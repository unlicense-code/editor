import { Event } from 'vs/base/common/event';
import { IStorageDatabase } from 'vs/base/parts/storage/common/storage';
import { ILogService } from 'vs/platform/log/common/log';
import { AbstractUserDataProfileStorageService, IProfileStorageChanges, IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class UserDataProfileStorageService extends AbstractUserDataProfileStorageService implements IUserDataProfileStorageService {
    private readonly userDataProfileService;
    private readonly logService;
    private readonly _onDidChange;
    readonly onDidChange: Event<IProfileStorageChanges>;
    constructor(storageService: IStorageService, userDataProfileService: IUserDataProfileService, logService: ILogService);
    private onDidChangeStorageTargetInCurrentProfile;
    private onDidChangeStorageValueInCurrentProfile;
    protected createStorageDatabase(profile: IUserDataProfile): Promise<IStorageDatabase>;
}
