import * as vscode from 'vscode';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IExtHostFileSystemInfo } from 'vs/workbench/api/common/extHostFileSystemInfo';
import { IDisposable } from 'vs/base/common/lifecycle';
export declare class ExtHostConsumerFileSystem {
    readonly _serviceBrand: undefined;
    readonly value: vscode.FileSystem;
    private readonly _proxy;
    private readonly _fileSystemProvider;
    constructor(extHostRpc: IExtHostRpcService, fileSystemInfo: IExtHostFileSystemInfo);
    private static _handleError;
    addFileSystemProvider(scheme: string, provider: vscode.FileSystemProvider): IDisposable;
}
export interface IExtHostConsumerFileSystem extends ExtHostConsumerFileSystem {
}
export declare const IExtHostConsumerFileSystem: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostConsumerFileSystem>;
