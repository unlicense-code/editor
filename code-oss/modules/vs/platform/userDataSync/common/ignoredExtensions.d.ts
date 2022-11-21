import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILocalExtension } from 'vs/platform/extensionManagement/common/extensionManagement';
export declare const IIgnoredExtensionsManagementService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IIgnoredExtensionsManagementService>;
export interface IIgnoredExtensionsManagementService {
    readonly _serviceBrand: any;
    getIgnoredExtensions(installed: ILocalExtension[]): string[];
    hasToNeverSyncExtension(extensionId: string): boolean;
    hasToAlwaysSyncExtension(extensionId: string): boolean;
    updateIgnoredExtensions(ignoredExtensionId: string, ignore: boolean): Promise<void>;
    updateSynchronizedExtensions(ignoredExtensionId: string, sync: boolean): Promise<void>;
}
export declare class IgnoredExtensionsManagementService implements IIgnoredExtensionsManagementService {
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(configurationService: IConfigurationService);
    hasToNeverSyncExtension(extensionId: string): boolean;
    hasToAlwaysSyncExtension(extensionId: string): boolean;
    updateIgnoredExtensions(ignoredExtensionId: string, ignore: boolean): Promise<void>;
    updateSynchronizedExtensions(extensionId: string, sync: boolean): Promise<void>;
    getIgnoredExtensions(installed: ILocalExtension[]): string[];
    private getConfiguredIgnoredExtensions;
}
