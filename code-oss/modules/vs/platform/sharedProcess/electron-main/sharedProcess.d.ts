import { MessagePortMain } from 'electron';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IProcessEnvironment } from 'vs/base/common/platform';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProtocolMainService } from 'vs/platform/protocol/electron-main/protocol';
import { ISharedProcess } from 'vs/platform/sharedProcess/node/sharedProcess';
import { IThemeMainService } from 'vs/platform/theme/electron-main/themeMainService';
import { WindowError } from 'vs/platform/window/electron-main/window';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IPolicyService } from 'vs/platform/policy/common/policy';
export declare class SharedProcess extends Disposable implements ISharedProcess {
    private readonly machineId;
    private userEnv;
    private readonly environmentMainService;
    private readonly userDataProfilesService;
    private readonly lifecycleMainService;
    private readonly logService;
    private readonly policyService;
    private readonly themeMainService;
    private readonly protocolMainService;
    private readonly firstWindowConnectionBarrier;
    private window;
    private windowCloseListener;
    private readonly _onDidError;
    readonly onDidError: Event<{
        type: WindowError;
        details?: {
            reason: string;
            exitCode: number;
        } | undefined;
    }>;
    constructor(machineId: string, userEnv: IProcessEnvironment, environmentMainService: IEnvironmentMainService, userDataProfilesService: IUserDataProfilesService, lifecycleMainService: ILifecycleMainService, logService: ILogService, policyService: IPolicyService, themeMainService: IThemeMainService, protocolMainService: IProtocolMainService);
    private registerListeners;
    private onWindowConnection;
    private onWorkerConnection;
    private onWillShutdown;
    private send;
    private _whenReady;
    whenReady(): Promise<void>;
    private _whenIpcReady;
    private get whenIpcReady();
    private createWindow;
    private registerWindowListeners;
    connect(): Promise<MessagePortMain>;
    toggle(): Promise<void>;
    isVisible(): boolean;
    private isAlive;
}
