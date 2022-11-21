import { CancellationToken } from 'vs/base/common/cancellation';
import { IRequestContext, IRequestOptions } from 'vs/base/parts/request/common/request';
export declare function request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
