import { URI } from 'vs/base/common/uri';
import { IURITransformer } from 'vs/base/common/uriIpc';
import { IMessagePassingProtocol } from 'vs/base/parts/ipc/common/ipc';
import { MainThreadConsoleShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtensionHostInitData } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
import { IHostUtils } from 'vs/workbench/api/common/extHostExtensionService';
export interface IExitFn {
    (code?: number): any;
}
export interface IConsolePatchFn {
    (mainThreadConsole: MainThreadConsoleShape): any;
}
export declare class ExtensionHostMain {
    private readonly _hostUtils;
    private readonly _rpcProtocol;
    private readonly _extensionService;
    private readonly _logService;
    constructor(protocol: IMessagePassingProtocol, initData: IExtensionHostInitData, hostUtils: IHostUtils, uriTransformer: IURITransformer | null, messagePorts?: ReadonlyMap<string, MessagePort>);
    asBrowserUri(uri: URI): Promise<URI>;
    terminate(reason: string): void;
    private static _transform;
}
