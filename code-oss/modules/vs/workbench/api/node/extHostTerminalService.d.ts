import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { BaseExtHostTerminalService, ITerminalInternalOptions } from 'vs/workbench/api/common/extHostTerminalService';
import type * as vscode from 'vscode';
export declare class ExtHostTerminalService extends BaseExtHostTerminalService {
    constructor(extHostRpc: IExtHostRpcService);
    createTerminal(name?: string, shellPath?: string, shellArgs?: string[] | string): vscode.Terminal;
    createTerminalFromOptions(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
}
