import type * as vscode from 'vscode';
import { URI } from 'vs/base/common/uri';
import { IMainContext } from 'vs/workbench/api/common/extHost.protocol';
export declare class ExtHostDialogs {
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    showOpenDialog(options?: vscode.OpenDialogOptions): Promise<URI[] | undefined>;
    showSaveDialog(options?: vscode.SaveDialogOptions): Promise<URI | undefined>;
}
