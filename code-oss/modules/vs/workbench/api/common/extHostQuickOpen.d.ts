import { CancellationToken } from 'vs/base/common/cancellation';
import { ExtHostCommands } from 'vs/workbench/api/common/extHostCommands';
import { IExtHostWorkspaceProvider } from 'vs/workbench/api/common/extHostWorkspace';
import { InputBox, InputBoxOptions, QuickPick, QuickPickItem, QuickPickOptions, WorkspaceFolder, WorkspaceFolderPickOptions } from 'vscode';
import { ExtHostQuickOpenShape, IMainContext } from './extHost.protocol';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare type Item = string | QuickPickItem;
export interface ExtHostQuickOpen {
    showQuickPick(itemsOrItemsPromise: QuickPickItem[] | Promise<QuickPickItem[]>, options: QuickPickOptions & {
        canPickMany: true;
    }, token?: CancellationToken): Promise<QuickPickItem[] | undefined>;
    showQuickPick(itemsOrItemsPromise: string[] | Promise<string[]>, options?: QuickPickOptions, token?: CancellationToken): Promise<string | undefined>;
    showQuickPick(itemsOrItemsPromise: QuickPickItem[] | Promise<QuickPickItem[]>, options?: QuickPickOptions, token?: CancellationToken): Promise<QuickPickItem | undefined>;
    showQuickPick(itemsOrItemsPromise: Item[] | Promise<Item[]>, options?: QuickPickOptions, token?: CancellationToken): Promise<Item | Item[] | undefined>;
    showInput(options?: InputBoxOptions, token?: CancellationToken): Promise<string | undefined>;
    showWorkspaceFolderPick(options?: WorkspaceFolderPickOptions, token?: CancellationToken): Promise<WorkspaceFolder | undefined>;
    createQuickPick<T extends QuickPickItem>(extension: IExtensionDescription): QuickPick<T>;
    createInputBox(extension: IExtensionDescription): InputBox;
}
export declare function createExtHostQuickOpen(mainContext: IMainContext, workspace: IExtHostWorkspaceProvider, commands: ExtHostCommands): ExtHostQuickOpenShape & ExtHostQuickOpen;
