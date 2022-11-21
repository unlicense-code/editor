import { IDisposable } from 'vs/base/common/lifecycle';
import type * as vscode from 'vscode';
import { ExtHostSearchShape, MainThreadSearchShape } from '../common/extHost.protocol';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IURITransformerService } from 'vs/workbench/api/common/extHostUriTransformerService';
import { ILogService } from 'vs/platform/log/common/log';
import { IRawFileQuery, ISearchCompleteStats, IFileQuery, IRawTextQuery, IRawQuery, ITextQuery } from 'vs/workbench/services/search/common/search';
import { TextSearchManager } from 'vs/workbench/services/search/common/textSearchManager';
export interface IExtHostSearch extends ExtHostSearchShape {
    registerTextSearchProvider(scheme: string, provider: vscode.TextSearchProvider): IDisposable;
    registerFileSearchProvider(scheme: string, provider: vscode.FileSearchProvider): IDisposable;
}
export declare const IExtHostSearch: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostSearch>;
export declare class ExtHostSearch implements ExtHostSearchShape {
    private extHostRpc;
    protected _uriTransformer: IURITransformerService;
    protected _logService: ILogService;
    protected readonly _proxy: MainThreadSearchShape;
    protected _handlePool: number;
    private readonly _textSearchProvider;
    private readonly _textSearchUsedSchemes;
    private readonly _fileSearchProvider;
    private readonly _fileSearchUsedSchemes;
    private readonly _fileSearchManager;
    constructor(extHostRpc: IExtHostRpcService, _uriTransformer: IURITransformerService, _logService: ILogService);
    protected _transformScheme(scheme: string): string;
    registerTextSearchProvider(scheme: string, provider: vscode.TextSearchProvider): IDisposable;
    registerFileSearchProvider(scheme: string, provider: vscode.FileSearchProvider): IDisposable;
    $provideFileSearchResults(handle: number, session: number, rawQuery: IRawFileQuery, token: vscode.CancellationToken): Promise<ISearchCompleteStats>;
    $clearCache(cacheKey: string): Promise<void>;
    $provideTextSearchResults(handle: number, session: number, rawQuery: IRawTextQuery, token: vscode.CancellationToken): Promise<ISearchCompleteStats>;
    $enableExtensionHostSearch(): void;
    protected createTextSearchManager(query: ITextQuery, provider: vscode.TextSearchProvider): TextSearchManager;
}
export declare function reviveQuery<U extends IRawQuery>(rawQuery: U): U extends IRawTextQuery ? ITextQuery : IFileQuery;
