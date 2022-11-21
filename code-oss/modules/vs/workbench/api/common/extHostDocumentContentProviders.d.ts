import { UriComponents } from 'vs/base/common/uri';
import type * as vscode from 'vscode';
import { ExtHostDocumentContentProvidersShape, IMainContext } from './extHost.protocol';
import { ExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors';
import { ILogService } from 'vs/platform/log/common/log';
export declare class ExtHostDocumentContentProvider implements ExtHostDocumentContentProvidersShape {
    private readonly _documentsAndEditors;
    private readonly _logService;
    private static _handlePool;
    private readonly _documentContentProviders;
    private readonly _proxy;
    constructor(mainContext: IMainContext, _documentsAndEditors: ExtHostDocumentsAndEditors, _logService: ILogService);
    registerTextDocumentContentProvider(scheme: string, provider: vscode.TextDocumentContentProvider): vscode.Disposable;
    $provideTextDocumentContent(handle: number, uri: UriComponents): Promise<string | null | undefined>;
}
