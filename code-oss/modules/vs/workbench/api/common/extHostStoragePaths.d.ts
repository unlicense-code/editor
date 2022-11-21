import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { ILogService } from 'vs/platform/log/common/log';
import { IEnvironment } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
import { IExtHostConsumerFileSystem } from 'vs/workbench/api/common/extHostFileSystemConsumer';
import { URI } from 'vs/base/common/uri';
export declare const IExtensionStoragePaths: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionStoragePaths>;
export interface IExtensionStoragePaths {
    readonly _serviceBrand: undefined;
    whenReady: Promise<any>;
    workspaceValue(extension: IExtensionDescription): URI | undefined;
    globalValue(extension: IExtensionDescription): URI;
    onWillDeactivateAll(): void;
}
export declare class ExtensionStoragePaths implements IExtensionStoragePaths {
    protected readonly _logService: ILogService;
    private readonly _extHostFileSystem;
    readonly _serviceBrand: undefined;
    private readonly _workspace?;
    protected readonly _environment: IEnvironment;
    readonly whenReady: Promise<URI | undefined>;
    private _value?;
    constructor(initData: IExtHostInitDataService, _logService: ILogService, _extHostFileSystem: IExtHostConsumerFileSystem);
    protected _getWorkspaceStorageURI(storageName: string): Promise<URI>;
    private _getOrCreateWorkspaceStoragePath;
    workspaceValue(extension: IExtensionDescription): URI | undefined;
    globalValue(extension: IExtensionDescription): URI;
    onWillDeactivateAll(): void;
}
