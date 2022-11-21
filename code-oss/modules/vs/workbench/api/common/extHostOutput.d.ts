import { ExtHostOutputServiceShape } from './extHost.protocol';
import type * as vscode from 'vscode';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ILoggerService, ILogService } from 'vs/platform/log/common/log';
import { IExtHostConsumerFileSystem } from 'vs/workbench/api/common/extHostFileSystemConsumer';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostFileSystemInfo } from 'vs/workbench/api/common/extHostFileSystemInfo';
export declare class ExtHostOutputService implements ExtHostOutputServiceShape {
    private readonly initData;
    private readonly extHostFileSystem;
    private readonly extHostFileSystemInfo;
    private readonly loggerService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly proxy;
    private readonly outputsLocation;
    private outputDirectoryPromise;
    private readonly extensionLogDirectoryPromise;
    private namePool;
    private readonly channels;
    private visibleChannelId;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, extHostFileSystem: IExtHostConsumerFileSystem, extHostFileSystemInfo: IExtHostFileSystemInfo, loggerService: ILoggerService, logService: ILogService);
    $setVisibleChannel(visibleChannelId: string | null): void;
    createOutputChannel(name: string, options: string | {
        log: true;
    } | undefined, extension: IExtensionDescription): vscode.OutputChannel | vscode.LogOutputChannel;
    private doCreateOutputChannel;
    private doCreateLogOutputChannel;
    private createExtensionLogDirectory;
    private createExtHostOutputChannel;
    private createExtHostLogOutputChannel;
}
export interface IExtHostOutputService extends ExtHostOutputService {
}
export declare const IExtHostOutputService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostOutputService>;
