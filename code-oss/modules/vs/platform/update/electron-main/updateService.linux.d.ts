import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostMainService } from 'vs/platform/native/electron-main/nativeHostMainService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { AvailableForDownload } from 'vs/platform/update/common/update';
import { AbstractUpdateService } from 'vs/platform/update/electron-main/abstractUpdateService';
export declare class LinuxUpdateService extends AbstractUpdateService {
    private readonly telemetryService;
    private readonly nativeHostMainService;
    constructor(lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, telemetryService: ITelemetryService, environmentMainService: IEnvironmentMainService, requestService: IRequestService, logService: ILogService, nativeHostMainService: INativeHostMainService, productService: IProductService);
    protected buildUpdateFeedUrl(quality: string): string;
    protected doCheckForUpdates(context: any): void;
    protected doDownloadUpdate(state: AvailableForDownload): Promise<void>;
}
