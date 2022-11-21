import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { MainThreadConsoleShape } from 'vs/workbench/api/common/extHost.protocol';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IRemoteConsoleLog } from 'vs/base/common/console';
import { ILogService } from 'vs/platform/log/common/log';
export declare class MainThreadConsole implements MainThreadConsoleShape {
    private readonly _environmentService;
    private readonly _logService;
    private readonly _isExtensionDevTestFromCli;
    constructor(_extHostContext: IExtHostContext, _environmentService: IEnvironmentService, _logService: ILogService);
    dispose(): void;
    $logExtensionHostMessage(entry: IRemoteConsoleLog): void;
}
