import { IRequestOptions, IRequestContext } from 'vs/base/parts/request/common/request';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { RequestService } from 'vs/platform/request/browser/requestService';
export declare class BrowserRequestService extends RequestService {
    private readonly remoteAgentService;
    constructor(remoteAgentService: IRemoteAgentService, configurationService: IConfigurationService, logService: ILogService);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    private _makeRemoteRequest;
}
