import { IExtHostCommands } from 'vs/workbench/api/common/extHostCommands';
import { Disposable } from 'vs/base/common/lifecycle';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
export declare class ExtHostDownloadService extends Disposable {
    constructor(extHostRpc: IExtHostRpcService, commands: IExtHostCommands);
}
