import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IModelService } from 'vs/editor/common/services/model';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IFileQuery, ISearchComplete, ISearchProgressItem, ISearchResultProvider, ISearchService, ITextQuery, SearchProviderType } from 'vs/workbench/services/search/common/search';
export declare class SearchService extends Disposable implements ISearchService {
    private readonly modelService;
    private readonly editorService;
    private readonly telemetryService;
    private readonly logService;
    private readonly extensionService;
    private readonly fileService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private readonly fileSearchProviders;
    private readonly textSearchProviders;
    private deferredFileSearchesByScheme;
    private deferredTextSearchesByScheme;
    private loggedSchemesMissingProviders;
    constructor(modelService: IModelService, editorService: IEditorService, telemetryService: ITelemetryService, logService: ILogService, extensionService: IExtensionService, fileService: IFileService, uriIdentityService: IUriIdentityService);
    registerSearchResultProvider(scheme: string, type: SearchProviderType, provider: ISearchResultProvider): IDisposable;
    textSearch(query: ITextQuery, token?: CancellationToken, onProgress?: (item: ISearchProgressItem) => void): Promise<ISearchComplete>;
    fileSearch(query: IFileQuery, token?: CancellationToken): Promise<ISearchComplete>;
    private doSearch;
    private getSchemesInQuery;
    private waitForProvider;
    private searchWithProviders;
    private groupFolderQueriesByScheme;
    private sendTelemetry;
    private getLocalResults;
    private matches;
    clearCache(cacheKey: string): Promise<void>;
}