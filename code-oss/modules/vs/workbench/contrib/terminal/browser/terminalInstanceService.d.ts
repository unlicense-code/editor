import { ITerminalInstance, ITerminalInstanceService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { Disposable } from 'vs/base/common/lifecycle';
import { IShellLaunchConfig, ITerminalProfile, TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ITerminalBackend } from 'vs/workbench/contrib/terminal/common/terminal';
import { URI } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
export declare class TerminalInstanceService extends Disposable implements ITerminalInstanceService {
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _lifecycleService;
    _serviceBrand: undefined;
    private _terminalShellTypeContextKey;
    private _terminalInRunCommandPicker;
    private _configHelper;
    private readonly _onDidCreateInstance;
    get onDidCreateInstance(): Event<ITerminalInstance>;
    constructor(_instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _lifecycleService: ILifecycleService);
    createInstance(profile: ITerminalProfile, target?: TerminalLocation, resource?: URI): ITerminalInstance;
    createInstance(shellLaunchConfig: IShellLaunchConfig, target?: TerminalLocation, resource?: URI): ITerminalInstance;
    convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile?: IShellLaunchConfig | ITerminalProfile, cwd?: string | URI): IShellLaunchConfig;
    getBackend(remoteAuthority?: string): Promise<ITerminalBackend | undefined>;
}
