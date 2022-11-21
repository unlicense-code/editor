import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IFileMatch, ISearchCompleteStats, IFileQuery } from 'vs/workbench/services/search/common/search';
import { FileSearchProvider } from 'vs/workbench/services/search/common/searchExtTypes';
export interface IInternalFileMatch {
    base: URI;
    original?: URI;
    relativePath?: string;
    basename: string;
    size?: number;
}
export interface IDirectoryEntry {
    base: URI;
    relativePath: string;
    basename: string;
}
export interface IDirectoryTree {
    rootEntries: IDirectoryEntry[];
    pathToEntries: {
        [relativePath: string]: IDirectoryEntry[];
    };
}
export declare class FileSearchManager {
    private static readonly BATCH_SIZE;
    private readonly sessions;
    fileSearch(config: IFileQuery, provider: FileSearchProvider, onBatch: (matches: IFileMatch[]) => void, token: CancellationToken): Promise<ISearchCompleteStats>;
    clearCache(cacheKey: string): void;
    private getSessionTokenSource;
    private rawMatchToSearchItem;
    private doSearch;
}
