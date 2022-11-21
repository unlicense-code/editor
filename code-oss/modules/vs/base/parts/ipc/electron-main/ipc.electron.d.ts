import { IPCServer } from 'vs/base/parts/ipc/common/ipc';
/**
 * An implementation of `IPCServer` on top of Electron `ipcMain` API.
 */
export declare class Server extends IPCServer {
    private static readonly Clients;
    private static getOnDidClientConnect;
    constructor();
}
