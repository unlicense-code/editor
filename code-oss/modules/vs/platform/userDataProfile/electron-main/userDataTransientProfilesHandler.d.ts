import { Disposable } from 'vs/base/common/lifecycle';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { IUserDataProfilesMainService } from 'vs/platform/userDataProfile/electron-main/userDataProfile';
export declare class UserDataTransientProfilesHandler extends Disposable {
    private readonly userDataProfilesService;
    constructor(lifecycleMainService: ILifecycleMainService, userDataProfilesService: IUserDataProfilesMainService);
    private unsetTransientProfileForWorkspace;
}
