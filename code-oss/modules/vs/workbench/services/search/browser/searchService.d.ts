import { CancellationToken } from 'vs/base/common/cancellation';
import { IModelService } from 'vs/editor/common/services/model';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IFileMatch, IFileQuery, ISearchComplete, ISearchProgressItem, ISearchResultProvider, ITextQuery } from 'vs/workbench/services/search/common/search';
import { SearchService } from 'vs/workbench/services/search/common/searchService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkerClient } from 'vs/base/common/worker/simpleWorker';
import { Disposable } from 'vs/base/common/lifecycle';
import { DefaultWorkerFactory } from 'vs/base/browser/defaultWorkerFactory';
import { ILocalFileSearchSimpleWorker, ILocalFileSearchSimpleWorkerHost } from 'vs/workbench/services/search/common/localFileSearchWorkerTypes';
import { UriComponents } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
export declare class RemoteSearchService extends SearchService {
    readonly instantiationService: IInstantiationService;
    constructor(modelService: IModelService, editorService: IEditorService, telemetryService: ITelemetryService, logService: ILogService, extensionService: IExtensionService, fileService: IFileService, instantiationService: IInstantiationService, uriIdentityService: IUriIdentityService);
}
export declare class LocalFileSearchWorkerClient extends Disposable implements ISearchResultProvider, ILocalFileSearchSimpleWorkerHost {
    private fileService;
    private uriIdentityService;
    protected _worker: IWorkerClient<ILocalFileSearchSimpleWorker> | null;
    protected readonly _workerFactory: DefaultWorkerFactory;
    private readonly _onDidReceiveTextSearchMatch;
    readonly onDidReceiveTextSearchMatch: Event<{
        match: IFileMatch<UriComponents>;
        queryId: number;
    }>;
    private cache;
    private queryId;
    constructor(fileService: IFileService, uriIdentityService: IUriIdentityService);
    sendTextSearchMatch(match: IFileMatch<UriComponents>, queryId: number): void;
    private get fileSystemProvider();
    private cancelQuery;
    textSearch(query: ITextQuery, onProgress?: (p: ISearchProgressItem) => void, token?: CancellationToken): Promise<ISearchComplete>;
    fileSearch(query: IFileQuery, token?: CancellationToken): Promise<ISearchComplete>;
    clearCache(cacheKey: string): Promise<void>;
    private _getOrCreateWorker;
}
