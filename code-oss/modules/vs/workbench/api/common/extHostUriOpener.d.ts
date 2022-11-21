import { CancellationToken } from 'vs/base/common/cancellation';
import { UriComponents } from 'vs/base/common/uri';
import * as languages from 'vs/editor/common/languages';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import type * as vscode from 'vscode';
import { ExtHostUriOpenersShape, IMainContext } from './extHost.protocol';
export declare class ExtHostUriOpeners implements ExtHostUriOpenersShape {
    private static readonly supportedSchemes;
    private readonly _proxy;
    private readonly _openers;
    constructor(mainContext: IMainContext);
    registerExternalUriOpener(extensionId: ExtensionIdentifier, id: string, opener: vscode.ExternalUriOpener, metadata: vscode.ExternalUriOpenerMetadata): vscode.Disposable;
    $canOpenUri(id: string, uriComponents: UriComponents, token: CancellationToken): Promise<languages.ExternalUriOpenerPriority>;
    $openUri(id: string, context: {
        resolvedUri: UriComponents;
        sourceUri: UriComponents;
    }, token: CancellationToken): Promise<void>;
}
