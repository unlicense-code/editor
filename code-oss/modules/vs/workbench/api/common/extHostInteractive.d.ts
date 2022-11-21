import { UriComponents } from 'vs/base/common/uri';
import { ILogService } from 'vs/platform/log/common/log';
import { ExtHostInteractiveShape, IMainContext } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostCommands } from 'vs/workbench/api/common/extHostCommands';
import { ExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
import { ExtHostNotebookController } from 'vs/workbench/api/common/extHostNotebook';
export declare class ExtHostInteractive implements ExtHostInteractiveShape {
    private _extHostNotebooks;
    private _textDocumentsAndEditors;
    private _commands;
    constructor(mainContext: IMainContext, _extHostNotebooks: ExtHostNotebookController, _textDocumentsAndEditors: ExtHostDocumentsAndEditors, _commands: ExtHostCommands, _logService: ILogService);
    $willAddInteractiveDocument(uri: UriComponents, eol: string, languageId: string, notebookUri: UriComponents): void;
    $willRemoveInteractiveDocument(uri: UriComponents, notebookUri: UriComponents): void;
}
