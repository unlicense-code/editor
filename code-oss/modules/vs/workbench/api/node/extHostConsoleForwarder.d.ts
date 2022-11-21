import { AbstractExtHostConsoleForwarder } from 'vs/workbench/api/common/extHostConsoleForwarder';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
export declare class ExtHostConsoleForwarder extends AbstractExtHostConsoleForwarder {
    private _isMakingConsoleCall;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService);
    protected _nativeConsoleLogMessage(method: 'log' | 'info' | 'warn' | 'error', original: (...args: any[]) => void, args: IArguments): void;
    /**
     * Wraps process.stderr/stdout.write() so that it is transmitted to the
     * renderer or CLI. It both calls through to the original method as well
     * as to console.log with complete lines so that they're made available
     * to the debugger/CLI.
     */
    private _wrapStream;
}
