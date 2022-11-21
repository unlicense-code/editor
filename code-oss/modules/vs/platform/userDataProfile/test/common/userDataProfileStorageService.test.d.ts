import { Event } from 'vs/base/common/event';
import { InMemoryStorageDatabase } from 'vs/base/parts/storage/common/storage';
import { AbstractUserDataProfileStorageService, IUserDataProfileStorageService } from 'vs/platform/userDataProfile/common/userDataProfileStorageService';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class TestUserDataProfileStorageService extends AbstractUserDataProfileStorageService implements IUserDataProfileStorageService {
    readonly onDidChange: Event<any>;
    private databases;
    createStorageDatabase(profile: IUserDataProfile): Promise<InMemoryStorageDatabase>;
    protected closeAndDispose(): Promise<void>;
}
