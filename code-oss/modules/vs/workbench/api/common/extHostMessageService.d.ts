import Severity from 'vs/base/common/severity';
import type * as vscode from 'vscode';
import { IMainContext } from './extHost.protocol';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
export declare class ExtHostMessageService {
    private readonly _logService;
    private _proxy;
    constructor(mainContext: IMainContext, _logService: ILogService);
    showMessage(extension: IExtensionDescription, severity: Severity, message: string, optionsOrFirstItem: vscode.MessageOptions | string | undefined, rest: string[]): Promise<string | undefined>;
    showMessage(extension: IExtensionDescription, severity: Severity, message: string, optionsOrFirstItem: vscode.MessageOptions | vscode.MessageItem | undefined, rest: vscode.MessageItem[]): Promise<vscode.MessageItem | undefined>;
    showMessage(extension: IExtensionDescription, severity: Severity, message: string, optionsOrFirstItem: vscode.MessageOptions | vscode.MessageItem | string | undefined, rest: Array<vscode.MessageItem | string>): Promise<string | vscode.MessageItem | undefined>;
}
