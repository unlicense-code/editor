import type * as vscode from 'vscode';
import { IMainContext, ExtHostUrlsShape } from './extHost.protocol';
import { URI, UriComponents } from 'vs/base/common/uri';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export declare class ExtHostUrls implements ExtHostUrlsShape {
    private static HandlePool;
    private readonly _proxy;
    private handles;
    private handlers;
    constructor(mainContext: IMainContext);
    registerUriHandler(extensionId: ExtensionIdentifier, handler: vscode.UriHandler): vscode.Disposable;
    $handleExternalUri(handle: number, uri: UriComponents): Promise<void>;
    createAppUri(uri: URI): Promise<vscode.Uri>;
}
