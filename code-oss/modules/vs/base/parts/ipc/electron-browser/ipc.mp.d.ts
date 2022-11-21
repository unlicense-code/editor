import { IPCServer } from 'vs/base/parts/ipc/common/ipc';
/**
 * An implementation of a `IPCServer` on top of MessagePort style IPC communication.
 * The clients register themselves via Electron IPC transfer.
 */
export declare class Server extends IPCServer {
    private static getOnDidClientConnect;
    constructor();
}
