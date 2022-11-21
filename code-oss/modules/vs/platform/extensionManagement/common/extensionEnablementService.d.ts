import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IExtensionIdentifier, IExtensionManagementService, IGlobalExtensionEnablementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
export declare class GlobalExtensionEnablementService extends Disposable implements IGlobalExtensionEnablementService {
    readonly _serviceBrand: undefined;
    private _onDidChangeEnablement;
    readonly onDidChangeEnablement: Event<{
        readonly extensions: IExtensionIdentifier[];
        readonly source?: string;
    }>;
    private readonly storageManger;
    constructor(storageService: IStorageService, extensionManagementService: IExtensionManagementService);
    enableExtension(extension: IExtensionIdentifier, source?: string): Promise<boolean>;
    disableExtension(extension: IExtensionIdentifier, source?: string): Promise<boolean>;
    getDisabledExtensions(): IExtensionIdentifier[];
    getDisabledExtensionsAsync(): Promise<IExtensionIdentifier[]>;
    private _addToDisabledExtensions;
    private _removeFromDisabledExtensions;
    private _setDisabledExtensions;
    private _getExtensions;
    private _setExtensions;
}
export declare class StorageManager extends Disposable {
    private storageService;
    private storage;
    private _onDidChange;
    readonly onDidChange: Event<IExtensionIdentifier[]>;
    constructor(storageService: IStorageService);
    get(key: string, scope: StorageScope): IExtensionIdentifier[];
    set(key: string, value: IExtensionIdentifier[], scope: StorageScope): void;
    private onDidStorageChange;
    private _get;
    private _set;
}
