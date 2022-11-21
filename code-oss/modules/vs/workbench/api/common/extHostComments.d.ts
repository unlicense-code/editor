import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ExtHostDocuments } from 'vs/workbench/api/common/extHostDocuments';
import type * as vscode from 'vscode';
import { ExtHostCommentsShape, IMainContext } from './extHost.protocol';
import { ExtHostCommands } from './extHostCommands';
interface ExtHostComments {
    createCommentController(extension: IExtensionDescription, id: string, label: string): vscode.CommentController;
}
export declare function createExtHostComments(mainContext: IMainContext, commands: ExtHostCommands, documents: ExtHostDocuments): ExtHostCommentsShape & ExtHostComments;
export {};
