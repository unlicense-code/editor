import { Disposable } from 'vs/base/common/lifecycle';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class UserDataProfilesCleaner extends Disposable {
    constructor(userDataProfilesService: IUserDataProfilesService);
}
