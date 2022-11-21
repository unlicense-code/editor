import { Disposable } from 'vs/base/common/lifecycle';
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { DidChangeUserDataProfileEvent, IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class UserDataProfileService extends Disposable implements IUserDataProfileService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeCurrentProfile;
    readonly onDidChangeCurrentProfile: import("vs/base/common/event").Event<DidChangeUserDataProfileEvent>;
    private readonly _onDidUpdateCurrentProfile;
    readonly onDidUpdateCurrentProfile: import("vs/base/common/event").Event<void>;
    private _currentProfile;
    get currentProfile(): IUserDataProfile;
    constructor(currentProfile: IUserDataProfile, userDataProfilesService: IUserDataProfilesService);
    updateCurrentProfile(userDataProfile: IUserDataProfile, preserveData: boolean): Promise<void>;
    getShortName(profile: IUserDataProfile): string;
}
