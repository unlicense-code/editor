import { CancellationToken } from 'vs/base/common/cancellation';
import { IRequestContext, IRequestOptions } from 'vs/base/parts/request/common/request';
import { RequestService as NodeRequestService } from 'vs/platform/request/node/requestService';
export declare class RequestMainService extends NodeRequestService {
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
}
