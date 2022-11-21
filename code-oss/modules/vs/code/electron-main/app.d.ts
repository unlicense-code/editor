import { Disposable } from 'vs/base/common/lifecycle';
import { IProcessEnvironment } from 'vs/base/common/platform';
import { Server as NodeIPCServer } from 'vs/base/parts/ipc/node/ipc.net';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { IUserDataProfilesMainService } from 'vs/platform/userDataProfile/electron-main/userDataProfile';
/**
 * The main VS Code application. There will only ever be one instance,
 * even if the user starts many instances (e.g. from the command line).
 */
export declare class CodeApplication extends Disposable {
    private readonly mainProcessNodeIpcServer;
    private readonly userEnv;
    private readonly mainInstantiationService;
    private readonly logService;
    private readonly environmentMainService;
    private readonly lifecycleMainService;
    private readonly configurationService;
    private readonly stateMainService;
    private readonly fileService;
    private readonly productService;
    private readonly userDataProfilesMainService;
    private windowsMainService;
    private nativeHostMainService;
    constructor(mainProcessNodeIpcServer: NodeIPCServer, userEnv: IProcessEnvironment, mainInstantiationService: IInstantiationService, logService: ILogService, environmentMainService: IEnvironmentMainService, lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, stateMainService: IStateMainService, fileService: IFileService, productService: IProductService, userDataProfilesMainService: IUserDataProfilesMainService);
    private configureSession;
    private registerListeners;
    private validateNlsPath;
    private onUnexpectedError;
    startup(): Promise<void>;
    private setUpHandlers;
    private resolveMachineId;
    private setupSharedProcess;
    private initServices;
    private initChannels;
    private openFirstWindow;
    private shouldBlockURI;
    private getWindowOpenableFromProtocolLink;
    private afterWindowOpen;
    private installMutex;
    private handleSharedProcessErrors;
    private resolveShellEnvironment;
    private updateCrashReporterEnablement;
}
