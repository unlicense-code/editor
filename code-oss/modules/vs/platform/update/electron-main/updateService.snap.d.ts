import { Event } from 'vs/base/common/event';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { AvailableForDownload, IUpdateService, State, UpdateType } from 'vs/platform/update/common/update';
declare abstract class AbstractUpdateService implements IUpdateService {
    private readonly lifecycleMainService;
    protected logService: ILogService;
    readonly _serviceBrand: undefined;
    private _state;
    private readonly _onStateChange;
    readonly onStateChange: Event<State>;
    get state(): State;
    protected setState(state: State): void;
    constructor(lifecycleMainService: ILifecycleMainService, environmentMainService: IEnvironmentMainService, logService: ILogService);
    private scheduleCheckForUpdates;
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(): Promise<void>;
    protected doDownloadUpdate(state: AvailableForDownload): Promise<void>;
    applyUpdate(): Promise<void>;
    protected doApplyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    protected getUpdateType(): UpdateType;
    protected doQuitAndInstall(): void;
    abstract isLatestVersion(): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
    protected abstract doCheckForUpdates(context: any): void;
}
export declare class SnapUpdateService extends AbstractUpdateService {
    private snap;
    private snapRevision;
    private readonly telemetryService;
    constructor(snap: string, snapRevision: string, lifecycleMainService: ILifecycleMainService, environmentMainService: IEnvironmentMainService, logService: ILogService, telemetryService: ITelemetryService);
    protected doCheckForUpdates(): void;
    protected doQuitAndInstall(): void;
    private isUpdateAvailable;
    isLatestVersion(): Promise<boolean | undefined>;
}
export {};
