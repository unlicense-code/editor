import { ILocalExtension } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtension } from 'vs/platform/extensions/common/extensions';
export declare const IExtensionBisectService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionBisectService>;
export interface IExtensionBisectService {
    readonly _serviceBrand: undefined;
    isDisabledByBisect(extension: IExtension): boolean;
    isActive: boolean;
    disabledCount: number;
    start(extensions: ILocalExtension[]): Promise<void>;
    next(seeingBad: boolean): Promise<{
        id: string;
        bad: boolean;
    } | undefined>;
    reset(): Promise<void>;
}
