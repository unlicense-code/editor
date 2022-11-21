import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class RenameProfileAction extends Action2 {
    static readonly ID = "workbench.profiles.actions.renameProfile";
    constructor();
    run(accessor: ServicesAccessor, profile?: IUserDataProfile): Promise<void>;
    private pickProfile;
}
