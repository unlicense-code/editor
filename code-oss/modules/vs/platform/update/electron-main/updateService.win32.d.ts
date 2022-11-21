import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostMainService } from 'vs/platform/native/electron-main/nativeHostMainService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { AvailableForDownload, UpdateType } from 'vs/platform/update/common/update';
import { AbstractUpdateService } from 'vs/platform/update/electron-main/abstractUpdateService';
export declare class Win32UpdateService extends AbstractUpdateService {
    private readonly telemetryService;
    private readonly fileService;
    private readonly nativeHostMainService;
    private availableUpdate;
    get cachePath(): Promise<string>;
    constructor(lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, telemetryService: ITelemetryService, environmentMainService: IEnvironmentMainService, requestService: IRequestService, logService: ILogService, fileService: IFileService, nativeHostMainService: INativeHostMainService, productService: IProductService);
    initialize(): Promise<void>;
    protected buildUpdateFeedUrl(quality: string): string | undefined;
    protected doCheckForUpdates(context: any): void;
    protected doDownloadUpdate(state: AvailableForDownload): Promise<void>;
    private getUpdatePackagePath;
    private cleanup;
    protected doApplyUpdate(): Promise<void>;
    protected doQuitAndInstall(): void;
    protected getUpdateType(): UpdateType;
    _applySpecificUpdate(packagePath: string): Promise<void>;
}
