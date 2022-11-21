import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { ILogService } from 'vs/platform/log/common/log';
import { RemoteAgentConnectionContext } from 'vs/platform/remote/common/remoteAgentEnvironment';
import { IPtyService } from 'vs/platform/terminal/common/terminal';
import { IServerEnvironmentService } from 'vs/server/node/serverEnvironmentService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
export declare class RemoteTerminalChannel extends Disposable implements IServerChannel<RemoteAgentConnectionContext> {
    private readonly _environmentService;
    private readonly _logService;
    private readonly _ptyService;
    private readonly _productService;
    private readonly _extensionManagementService;
    private _lastReqId;
    private readonly _pendingCommands;
    private readonly _onExecuteCommand;
    readonly onExecuteCommand: Event<{
        reqId: number;
        persistentProcessId: number;
        commandId: string;
        commandArgs: any[];
    }>;
    constructor(_environmentService: IServerEnvironmentService, _logService: ILogService, _ptyService: IPtyService, _productService: IProductService, _extensionManagementService: IExtensionManagementService);
    call(ctx: RemoteAgentConnectionContext, command: string, args?: any): Promise<any>;
    listen(_: any, event: string, arg: any): Event<any>;
    private _createProcess;
    private _executeCommand;
    private _sendCommandResult;
    private _getDefaultSystemShell;
    private _getProfiles;
    private _getEnvironment;
    private _getWslPath;
    private _reduceConnectionGraceTime;
}
