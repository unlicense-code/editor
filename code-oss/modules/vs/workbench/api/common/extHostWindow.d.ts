import { Event } from 'vs/base/common/event';
import { ExtHostWindowShape, IOpenUriOptions } from './extHost.protocol';
import { WindowState } from 'vscode';
import { URI } from 'vs/base/common/uri';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
export declare class ExtHostWindow implements ExtHostWindowShape {
    private static InitialState;
    private _proxy;
    private readonly _onDidChangeWindowState;
    readonly onDidChangeWindowState: Event<WindowState>;
    private _state;
    get state(): WindowState;
    constructor(extHostRpc: IExtHostRpcService);
    $onDidChangeWindowFocus(focused: boolean): void;
    openUri(stringOrUri: string | URI, options: IOpenUriOptions): Promise<boolean>;
    asExternalUri(uri: URI, options: IOpenUriOptions): Promise<URI>;
}
export declare const IExtHostWindow: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostWindow>;
export interface IExtHostWindow extends ExtHostWindow, ExtHostWindowShape {
}
