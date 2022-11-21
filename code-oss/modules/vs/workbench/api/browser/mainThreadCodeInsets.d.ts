import { UriComponents } from 'vs/base/common/uri';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IWebviewContentOptions, MainThreadEditorInsetsShape } from 'vs/workbench/api/common/extHost.protocol';
import { IWebviewService } from 'vs/workbench/contrib/webview/browser/webview';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
export declare class MainThreadEditorInsets implements MainThreadEditorInsetsShape {
    private readonly _editorService;
    private readonly _webviewService;
    private readonly _proxy;
    private readonly _disposables;
    private readonly _insets;
    constructor(context: IExtHostContext, _editorService: ICodeEditorService, _webviewService: IWebviewService);
    dispose(): void;
    $createEditorInset(handle: number, id: string, uri: UriComponents, line: number, height: number, options: IWebviewContentOptions, extensionId: ExtensionIdentifier, extensionLocation: UriComponents): Promise<void>;
    $disposeEditorInset(handle: number): void;
    $setHtml(handle: number, value: string): void;
    $setOptions(handle: number, options: IWebviewContentOptions): void;
    $postMessage(handle: number, value: any): Promise<boolean>;
    private getInset;
}
