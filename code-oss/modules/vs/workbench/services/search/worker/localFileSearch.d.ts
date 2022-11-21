import { UriComponents } from 'vs/base/common/uri';
import { IRequestHandler } from 'vs/base/common/worker/simpleWorker';
import { ILocalFileSearchSimpleWorker, ILocalFileSearchSimpleWorkerHost, IWorkerFileSearchComplete, IWorkerFileSystemDirectoryHandle, IWorkerTextSearchComplete } from 'vs/workbench/services/search/common/localFileSearchWorkerTypes';
import { IFileQueryProps, IFolderQuery, ITextQueryProps } from 'vs/workbench/services/search/common/search';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
/**
 * Called on the worker side
 * @internal
 */
export declare function create(host: ILocalFileSearchSimpleWorkerHost): IRequestHandler;
export declare class LocalFileSearchSimpleWorker implements ILocalFileSearchSimpleWorker, IRequestHandler {
    private host;
    _requestHandlerBrand: any;
    cancellationTokens: Map<number, CancellationTokenSource>;
    constructor(host: ILocalFileSearchSimpleWorkerHost);
    cancelQuery(queryId: number): void;
    private registerCancellationToken;
    listDirectory(handle: IWorkerFileSystemDirectoryHandle, query: IFileQueryProps<UriComponents>, folderQuery: IFolderQuery<UriComponents>, ignorePathCasing: boolean, queryId: number): Promise<IWorkerFileSearchComplete>;
    searchDirectory(handle: IWorkerFileSystemDirectoryHandle, query: ITextQueryProps<UriComponents>, folderQuery: IFolderQuery<UriComponents>, ignorePathCasing: boolean, queryId: number): Promise<IWorkerTextSearchComplete>;
    private walkFolderQuery;
}
