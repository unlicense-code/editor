import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { AbstractUpdateService } from 'vs/platform/update/electron-main/abstractUpdateService';
export declare class DarwinUpdateService extends AbstractUpdateService {
    private readonly telemetryService;
    private readonly disposables;
    private get onRawError();
    private get onRawUpdateNotAvailable();
    private get onRawUpdateAvailable();
    private get onRawUpdateDownloaded();
    constructor(lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, telemetryService: ITelemetryService, environmentMainService: IEnvironmentMainService, requestService: IRequestService, logService: ILogService, productService: IProductService);
    initialize(): Promise<void>;
    private onError;
    protected buildUpdateFeedUrl(quality: string): string | undefined;
    protected doCheckForUpdates(context: any): void;
    private onUpdateAvailable;
    private onUpdateDownloaded;
    private onUpdateNotAvailable;
    protected doQuitAndInstall(): void;
    dispose(): void;
}
