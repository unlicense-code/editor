import { IStorageService } from 'vs/platform/storage/common/storage';
import { MainThreadStorageShape } from '../common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IExtensionIdWithVersion, IExtensionStorageService } from 'vs/platform/extensionManagement/common/extensionStorage';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
export declare class MainThreadStorage implements MainThreadStorageShape {
    private readonly _extensionStorageService;
    private readonly _storageService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _proxy;
    private readonly _storageListener;
    private readonly _sharedStorageKeysToWatch;
    constructor(extHostContext: IExtHostContext, _extensionStorageService: IExtensionStorageService, _storageService: IStorageService, _instantiationService: IInstantiationService, _logService: ILogService);
    dispose(): void;
    $initializeExtensionStorage(shared: boolean, extensionId: string): Promise<string | undefined>;
    $setValue(shared: boolean, key: string, value: object): Promise<void>;
    $registerExtensionStorageKeysToSync(extension: IExtensionIdWithVersion, keys: string[]): void;
    private checkAndMigrateExtensionStorage;
}
