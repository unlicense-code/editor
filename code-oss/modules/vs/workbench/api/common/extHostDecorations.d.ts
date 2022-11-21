import type * as vscode from 'vscode';
import { ExtHostDecorationsShape, DecorationRequest, DecorationReply } from 'vs/workbench/api/common/extHost.protocol';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ILogService } from 'vs/platform/log/common/log';
export declare class ExtHostDecorations implements ExtHostDecorationsShape {
    private readonly _logService;
    private static _handlePool;
    private static _maxEventSize;
    readonly _serviceBrand: undefined;
    private readonly _provider;
    private readonly _proxy;
    constructor(extHostRpc: IExtHostRpcService, _logService: ILogService);
    registerFileDecorationProvider(provider: vscode.FileDecorationProvider, extensionDescription: IExtensionDescription): vscode.Disposable;
    $provideDecorations(handle: number, requests: DecorationRequest[], token: CancellationToken): Promise<DecorationReply>;
}
export declare const IExtHostDecorations: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostDecorations>;
export interface IExtHostDecorations extends ExtHostDecorations {
}
