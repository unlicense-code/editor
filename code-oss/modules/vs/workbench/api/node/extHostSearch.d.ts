import * as pfs from 'vs/base/node/pfs';
import { ILogService } from 'vs/platform/log/common/log';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ExtHostSearch } from 'vs/workbench/api/common/extHostSearch';
import { IURITransformerService } from 'vs/workbench/api/common/extHostUriTransformerService';
import { IRawFileQuery, ISearchCompleteStats, ITextQuery } from 'vs/workbench/services/search/common/search';
import { TextSearchManager } from 'vs/workbench/services/search/common/textSearchManager';
import type * as vscode from 'vscode';
export declare class NativeExtHostSearch extends ExtHostSearch {
    protected _pfs: typeof pfs;
    private _internalFileSearchHandle;
    private _internalFileSearchProvider;
    private _registeredEHSearchProvider;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, _uriTransformer: IURITransformerService, _logService: ILogService);
    $enableExtensionHostSearch(): void;
    private _registerEHSearchProviders;
    private registerInternalFileSearchProvider;
    $provideFileSearchResults(handle: number, session: number, rawQuery: IRawFileQuery, token: vscode.CancellationToken): Promise<ISearchCompleteStats>;
    private doInternalFileSearch;
    $clearCache(cacheKey: string): Promise<void>;
    protected createTextSearchManager(query: ITextQuery, provider: vscode.TextSearchProvider): TextSearchManager;
}
