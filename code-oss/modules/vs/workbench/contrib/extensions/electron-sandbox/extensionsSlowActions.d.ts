import { Action } from 'vs/base/common/actions';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IExtensionHostProfile } from 'vs/workbench/services/extensions/common/extensions';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class SlowExtensionAction extends Action {
    readonly extension: IExtensionDescription;
    readonly profile: IExtensionHostProfile;
    private readonly _instantiationService;
    constructor(extension: IExtensionDescription, profile: IExtensionHostProfile, _instantiationService: IInstantiationService);
    run(): Promise<void>;
}
export declare function createSlowExtensionAction(accessor: ServicesAccessor, extension: IExtensionDescription, profile: IExtensionHostProfile): Promise<Action | undefined>;
