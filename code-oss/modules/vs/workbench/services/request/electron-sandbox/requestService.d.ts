import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { RequestService } from 'vs/platform/request/browser/requestService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
export declare class NativeRequestService extends RequestService {
    private nativeHostService;
    constructor(configurationService: IConfigurationService, logService: ILogService, nativeHostService: INativeHostService);
    resolveProxy(url: string): Promise<string | undefined>;
}
