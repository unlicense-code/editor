import { IDisposable } from 'vs/base/common/lifecycle';
import { IPCClient } from 'vs/base/parts/ipc/common/ipc';
/**
 * An implementation of `IPCClient` on top of Electron `ipcRenderer` IPC communication
 * provided from sandbox globals (via preload script).
 */
export declare class Client extends IPCClient implements IDisposable {
    private protocol;
    private static createProtocol;
    constructor(id: string);
    dispose(): void;
}
