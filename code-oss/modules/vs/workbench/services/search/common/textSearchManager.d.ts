import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IFileMatch, ISearchCompleteStats, ITextQuery, ITextSearchStats } from 'vs/workbench/services/search/common/search';
import { TextSearchMatch, TextSearchProvider, TextSearchResult } from 'vs/workbench/services/search/common/searchExtTypes';
export interface IFileUtils {
    readdir: (resource: URI) => Promise<string[]>;
    toCanonicalName: (encoding: string) => string;
}
export declare class TextSearchManager {
    private query;
    private provider;
    private fileUtils;
    private processType;
    private collector;
    private isLimitHit;
    private resultCount;
    constructor(query: ITextQuery, provider: TextSearchProvider, fileUtils: IFileUtils, processType: ITextSearchStats['type']);
    search(onProgress: (matches: IFileMatch[]) => void, token: CancellationToken): Promise<ISearchCompleteStats>;
    private resultSize;
    private trimResultToSize;
    private searchInFolder;
    private validateProviderResult;
    private getSearchOptionsForFolder;
}
export declare class TextSearchResultsCollector {
    private _onResult;
    private _batchedCollector;
    private _currentFolderIdx;
    private _currentUri;
    private _currentFileMatch;
    constructor(_onResult: (result: IFileMatch[]) => void);
    add(data: TextSearchResult, folderIdx: number): void;
    private pushToCollector;
    flush(): void;
    private sendItems;
}
export declare function extensionResultIsMatch(data: TextSearchResult): data is TextSearchMatch;
/**
 * Collects items that have a size - before the cumulative size of collected items reaches START_BATCH_AFTER_COUNT, the callback is called for every
 * set of items collected.
 * But after that point, the callback is called with batches of maxBatchSize.
 * If the batch isn't filled within some time, the callback is also called.
 */
export declare class BatchedCollector<T> {
    private maxBatchSize;
    private cb;
    private static readonly TIMEOUT;
    private static readonly START_BATCH_AFTER_COUNT;
    private totalNumberCompleted;
    private batch;
    private batchSize;
    private timeoutHandle;
    constructor(maxBatchSize: number, cb: (items: T[]) => void);
    addItem(item: T, size: number): void;
    addItems(items: T[], size: number): void;
    private addItemToBatch;
    private addItemsToBatch;
    private onUpdate;
    flush(): void;
}
