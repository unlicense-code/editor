import { IMainContext } from 'vs/workbench/api/common/extHost.protocol';
import type * as vscode from 'vscode';
export declare class ExtHostClipboard {
    readonly value: vscode.Clipboard;
    constructor(mainContext: IMainContext);
}
