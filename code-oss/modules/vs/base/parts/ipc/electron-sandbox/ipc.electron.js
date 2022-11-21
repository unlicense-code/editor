/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { VSBuffer } from 'vs/base/common/buffer';
import { Event } from 'vs/base/common/event';
import { IPCClient } from 'vs/base/parts/ipc/common/ipc';
import { Protocol as ElectronProtocol } from 'vs/base/parts/ipc/common/ipc.electron';
import { ipcRenderer } from 'vs/base/parts/sandbox/electron-sandbox/globals';
/**
 * An implementation of `IPCClient` on top of Electron `ipcRenderer` IPC communication
 * provided from sandbox globals (via preload script).
 */
export class Client extends IPCClient {
    protocol;
    static createProtocol() {
        const onMessage = Event.fromNodeEventEmitter(ipcRenderer, 'vscode:message', (_, message) => VSBuffer.wrap(message));
        ipcRenderer.send('vscode:hello');
        return new ElectronProtocol(ipcRenderer, onMessage);
    }
    constructor(id) {
        const protocol = Client.createProtocol();
        super(protocol, id);
        this.protocol = protocol;
    }
    dispose() {
        this.protocol.disconnect();
    }
}
