import { Disposable } from 'vs/base/common/lifecycle';
import { MainThreadDownloadServiceShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IDownloadService } from 'vs/platform/download/common/download';
import { UriComponents } from 'vs/base/common/uri';
export declare class MainThreadDownloadService extends Disposable implements MainThreadDownloadServiceShape {
    private readonly downloadService;
    constructor(extHostContext: IExtHostContext, downloadService: IDownloadService);
    $download(uri: UriComponents, to: UriComponents): Promise<void>;
}
