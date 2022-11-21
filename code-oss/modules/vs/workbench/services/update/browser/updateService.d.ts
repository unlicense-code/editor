import { Event } from 'vs/base/common/event';
import { IUpdateService, State } from 'vs/platform/update/common/update';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { Disposable } from 'vs/base/common/lifecycle';
export interface IUpdate {
    version: string;
}
export interface IUpdateProvider {
    /**
     * Should return with the `IUpdate` object if an update is
     * available or `null` otherwise to signal that there are
     * no updates.
     */
    checkForUpdate(): Promise<IUpdate | null>;
}
export declare class BrowserUpdateService extends Disposable implements IUpdateService {
    private readonly environmentService;
    private readonly hostService;
    readonly _serviceBrand: undefined;
    private _onStateChange;
    readonly onStateChange: Event<State>;
    private _state;
    get state(): State;
    set state(state: State);
    constructor(environmentService: IBrowserWorkbenchEnvironmentService, hostService: IHostService);
    isLatestVersion(): Promise<boolean>;
    checkForUpdates(explicit: boolean): Promise<void>;
    private doCheckForUpdates;
    downloadUpdate(): Promise<void>;
    applyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
}
