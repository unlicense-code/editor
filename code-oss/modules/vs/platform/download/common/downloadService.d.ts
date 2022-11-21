import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IDownloadService } from 'vs/platform/download/common/download';
import { IFileService } from 'vs/platform/files/common/files';
import { IRequestService } from 'vs/platform/request/common/request';
export declare class DownloadService implements IDownloadService {
    private readonly requestService;
    private readonly fileService;
    readonly _serviceBrand: undefined;
    constructor(requestService: IRequestService, fileService: IFileService);
    download(resource: URI, target: URI, cancellationToken?: CancellationToken): Promise<void>;
}
