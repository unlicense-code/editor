import { Event } from 'vs/base/common/event';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { AvailableForDownload, IUpdateService, State, UpdateType } from 'vs/platform/update/common/update';
export declare function createUpdateURL(platform: string, quality: string, productService: IProductService): string;
export declare type UpdateNotAvailableClassification = {
    owner: 'joaomoreno';
    explicit: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        isMeasurement: true;
        comment: 'Whether the user has manually checked for updates, or this was an automatic check.';
    };
    comment: 'This is used to understand how often VS Code pings the update server for an update and there\'s none available.';
};
export declare abstract class AbstractUpdateService implements IUpdateService {
    private readonly lifecycleMainService;
    protected configurationService: IConfigurationService;
    private readonly environmentMainService;
    protected requestService: IRequestService;
    protected logService: ILogService;
    protected readonly productService: IProductService;
    readonly _serviceBrand: undefined;
    protected url: string | undefined;
    private _state;
    private readonly _onStateChange;
    readonly onStateChange: Event<State>;
    get state(): State;
    protected setState(state: State): void;
    constructor(lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, environmentMainService: IEnvironmentMainService, requestService: IRequestService, logService: ILogService, productService: IProductService);
    /**
     * This must be called before any other call. This is a performance
     * optimization, to avoid using extra CPU cycles before first window open.
     * https://github.com/microsoft/vscode/issues/89784
     */
    initialize(): Promise<void>;
    protected getUpdateMode(): 'none' | 'manual' | 'start' | 'default';
    private getProductQuality;
    private scheduleCheckForUpdates;
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(): Promise<void>;
    protected doDownloadUpdate(state: AvailableForDownload): Promise<void>;
    applyUpdate(): Promise<void>;
    protected doApplyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    isLatestVersion(): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
    protected getUpdateType(): UpdateType;
    protected doQuitAndInstall(): void;
    protected abstract buildUpdateFeedUrl(quality: string): string | undefined;
    protected abstract doCheckForUpdates(context: any): void;
}
