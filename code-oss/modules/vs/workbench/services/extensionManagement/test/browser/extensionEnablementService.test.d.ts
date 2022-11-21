import { IExtensionManagementServerService, IExtensionManagementServer } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { ExtensionEnablementService } from 'vs/workbench/services/extensionManagement/browser/extensionEnablementService';
import { TestInstantiationService } from 'vs/platform/instantiation/test/common/instantiationServiceMock';
export declare class TestExtensionEnablementService extends ExtensionEnablementService {
    constructor(instantiationService: TestInstantiationService);
    waitUntilInitialized(): Promise<void>;
    reset(): void;
}
export declare function anExtensionManagementServerService(localExtensionManagementServer: IExtensionManagementServer | null, remoteExtensionManagementServer: IExtensionManagementServer | null, webExtensionManagementServer: IExtensionManagementServer | null): IExtensionManagementServerService;
