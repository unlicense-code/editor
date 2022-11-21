import { CancellationToken } from 'vs/base/common/cancellation';
import { IRequestContext, IRequestOptions } from 'vs/base/parts/request/common/request';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IRequestService } from 'vs/platform/request/common/request';
/**
 * This service exposes the `request` API, while using the global
 * or configured proxy settings.
 */
export declare class RequestService implements IRequestService {
    private readonly configurationService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    constructor(configurationService: IConfigurationService, logService: ILogService);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
}
