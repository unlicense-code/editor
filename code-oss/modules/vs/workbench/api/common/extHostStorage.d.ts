import { ExtHostStorageShape } from './extHost.protocol';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IExtensionIdWithVersion } from 'vs/platform/extensionManagement/common/extensionStorage';
import { ILogService } from 'vs/platform/log/common/log';
export interface IStorageChangeEvent {
    shared: boolean;
    key: string;
    value: object;
}
export declare class ExtHostStorage implements ExtHostStorageShape {
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _proxy;
    private readonly _onDidChangeStorage;
    readonly onDidChangeStorage: import("vs/base/common/event").Event<IStorageChangeEvent>;
    constructor(mainContext: IExtHostRpcService, _logService: ILogService);
    registerExtensionStorageKeysToSync(extension: IExtensionIdWithVersion, keys: string[]): void;
    initializeExtensionStorage(shared: boolean, key: string, defaultValue?: object): Promise<object | undefined>;
    setValue(shared: boolean, key: string, value: object): Promise<void>;
    $acceptValue(shared: boolean, key: string, value: string): void;
    private safeParseValue;
}
export interface IExtHostStorage extends ExtHostStorage {
}
export declare const IExtHostStorage: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostStorage>;
