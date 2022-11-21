/// <reference types="node" />
/// <reference types="node" />
import * as http from 'http';
import * as net from 'net';
import { ServerParsedArgs } from 'vs/server/node/serverEnvironmentService';
export interface IServerAPI {
    /**
     * Do not remove!!. Called from server-main.js
     */
    handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
    /**
     * Do not remove!!. Called from server-main.js
     */
    handleUpgrade(req: http.IncomingMessage, socket: net.Socket): void;
    /**
     * Do not remove!!. Called from server-main.js
     */
    handleServerError(err: Error): void;
    /**
     * Do not remove!!. Called from server-main.js
     */
    dispose(): void;
}
export declare function createServer(address: string | net.AddressInfo | null, args: ServerParsedArgs, REMOTE_DATA_FOLDER: string): Promise<IServerAPI>;
