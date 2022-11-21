import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IFileQuery, IFileSearchProgressItem, IFileSearchStats, IRawFileMatch, IRawFileQuery, IRawSearchService, IRawTextQuery, ISearchEngine, ISerializedSearchComplete, ISerializedSearchProgressItem, ISerializedSearchSuccess } from 'vs/workbench/services/search/common/search';
export declare type IProgressCallback = (p: ISerializedSearchProgressItem) => void;
export declare type IFileProgressCallback = (p: IFileSearchProgressItem) => void;
export declare class SearchService implements IRawSearchService {
    private readonly processType;
    private static readonly BATCH_SIZE;
    private caches;
    constructor(processType?: IFileSearchStats['type']);
    fileSearch(config: IRawFileQuery): Event<ISerializedSearchProgressItem | ISerializedSearchComplete>;
    textSearch(rawQuery: IRawTextQuery): Event<ISerializedSearchProgressItem | ISerializedSearchComplete>;
    private ripgrepTextSearch;
    doFileSearch(config: IFileQuery, progressCallback: IProgressCallback, token?: CancellationToken): Promise<ISerializedSearchSuccess>;
    doFileSearchWithEngine(EngineClass: {
        new (config: IFileQuery): ISearchEngine<IRawFileMatch>;
    }, config: IFileQuery, progressCallback: IProgressCallback, token?: CancellationToken, batchSize?: number): Promise<ISerializedSearchSuccess>;
    private rawMatchToSearchItem;
    private doSortedSearch;
    private getOrCreateCache;
    private trySortedSearchFromCache;
    private sortResults;
    private sendProgress;
    private getResultsFromCache;
    private doSearch;
    clearCache(cacheKey: string): Promise<void>;
    /**
     * Return a CancelablePromise which is not actually cancelable
     * TODO@rob - Is this really needed?
     */
    private preventCancellation;
}
