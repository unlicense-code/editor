import { IEnvironmentService } from 'vs/platform/environment/common/environment';
export interface IExtensionDevOptions {
    readonly isExtensionDevHost: boolean;
    readonly isExtensionDevDebug: boolean;
    readonly isExtensionDevDebugBrk: boolean;
    readonly isExtensionDevTestFromCli: boolean;
}
export declare function parseExtensionDevOptions(environmentService: IEnvironmentService): IExtensionDevOptions;
