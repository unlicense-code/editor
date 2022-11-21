import { IMainContext, ExtHostLanguagesShape } from './extHost.protocol';
import type * as vscode from 'vscode';
import { ExtHostDocuments } from 'vs/workbench/api/common/extHostDocuments';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { CommandsConverter } from 'vs/workbench/api/common/extHostCommands';
import { IURITransformer } from 'vs/base/common/uriIpc';
export declare class ExtHostLanguages implements ExtHostLanguagesShape {
    private readonly _documents;
    private readonly _commands;
    private readonly _uriTransformer;
    private readonly _proxy;
    private _languageIds;
    constructor(mainContext: IMainContext, _documents: ExtHostDocuments, _commands: CommandsConverter, _uriTransformer: IURITransformer | undefined);
    $acceptLanguageIds(ids: string[]): void;
    getLanguages(): Promise<string[]>;
    changeLanguage(uri: vscode.Uri, languageId: string): Promise<vscode.TextDocument>;
    tokenAtPosition(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.TokenInformation>;
    private _handlePool;
    private _ids;
    createLanguageStatusItem(extension: IExtensionDescription, id: string, selector: vscode.DocumentSelector): vscode.LanguageStatusItem;
}
