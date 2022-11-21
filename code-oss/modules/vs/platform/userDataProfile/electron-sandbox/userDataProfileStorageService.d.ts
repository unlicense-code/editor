import { Event } from 'vs/base/common/event';
import { IStorageDatabase } from 'vs/base/parts/storage/common/storage';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { ILogService } from 'vs/platform/log/common/log';
import { AbstractUserDataProfileStorageService, IProfileStorageChanges, IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class UserDataProfileStorageService extends AbstractUserDataProfileStorageService implements IUserDataProfileStorageService {
    private readonly mainProcessService;
    private readonly _onDidChange;
    readonly onDidChange: Event<IProfileStorageChanges>;
    constructor(mainProcessService: IMainProcessService, userDataProfilesService: IUserDataProfilesService, storageService: IStorageService, logService: ILogService);
    protected createStorageDatabase(profile: IUserDataProfile): Promise<IStorageDatabase>;
}
