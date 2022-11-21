import { UriComponents } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorSerializer } from 'vs/workbench/common/editor';
import { WebviewContentOptions, WebviewExtensionDescription, WebviewOptions } from 'vs/workbench/contrib/webview/browser/webview';
import { WebviewIcons } from 'vs/workbench/contrib/webviewPanel/browser/webviewIconManager';
import { WebviewInput } from './webviewEditorInput';
import { IWebviewWorkbenchService } from './webviewWorkbenchService';
export declare type SerializedWebviewOptions = WebviewOptions & WebviewContentOptions;
interface SerializedIconPath {
    light: string | UriComponents;
    dark: string | UriComponents;
}
export interface SerializedWebview {
    readonly id: string;
    readonly origin: string | undefined;
    readonly viewType: string;
    readonly providedId: string | undefined;
    readonly title: string;
    readonly options: SerializedWebviewOptions;
    readonly extensionLocation: UriComponents | undefined;
    readonly extensionId: string | undefined;
    readonly state: any;
    readonly iconPath: SerializedIconPath | undefined;
    readonly group?: number;
}
export interface DeserializedWebview {
    readonly id: string;
    readonly origin: string | undefined;
    readonly viewType: string;
    readonly providedId: string | undefined;
    readonly title: string;
    readonly webviewOptions: WebviewOptions;
    readonly contentOptions: WebviewContentOptions;
    readonly extension: WebviewExtensionDescription | undefined;
    readonly state: any;
    readonly iconPath: WebviewIcons | undefined;
    readonly group?: number;
}
export declare class WebviewEditorInputSerializer implements IEditorSerializer {
    private readonly _webviewWorkbenchService;
    static readonly ID: string;
    constructor(_webviewWorkbenchService: IWebviewWorkbenchService);
    canSerialize(input: WebviewInput): boolean;
    serialize(input: WebviewInput): string | undefined;
    deserialize(_instantiationService: IInstantiationService, serializedEditorInput: string): WebviewInput;
    protected fromJson(data: SerializedWebview): DeserializedWebview;
    protected toJson(input: WebviewInput): SerializedWebview;
}
export declare function reviveWebviewExtensionDescription(extensionId: string | undefined, extensionLocation: UriComponents | undefined): WebviewExtensionDescription | undefined;
export declare function restoreWebviewOptions(options: SerializedWebviewOptions): WebviewOptions;
export declare function restoreWebviewContentOptions(options: SerializedWebviewOptions): WebviewContentOptions;
export {};
