import { CancellationToken } from 'vs/base/common/cancellation';
import { IRequestContext, IRequestOptions } from 'vs/base/parts/request/common/request';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { ILogService } from 'vs/platform/log/common/log';
import { IRequestService } from 'vs/platform/request/common/request';
export declare class SharedProcessRequestService implements IRequestService {
    private readonly configurationService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly browserRequestService;
    private readonly mainRequestService;
    constructor(mainProcessService: IMainProcessService, configurationService: IConfigurationService, logService: ILogService);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    private getRequestService;
}
