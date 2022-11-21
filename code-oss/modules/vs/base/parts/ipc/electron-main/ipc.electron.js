/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { validatedIpcMain } from 'vs/base/parts/ipc/electron-main/ipcMain';
import { VSBuffer } from 'vs/base/common/buffer';
import { Emitter, Event } from 'vs/base/common/event';
import { toDisposable } from 'vs/base/common/lifecycle';
import { IPCServer } from 'vs/base/parts/ipc/common/ipc';
import { Protocol as ElectronProtocol } from 'vs/base/parts/ipc/common/ipc.electron';
function createScopedOnMessageEvent(senderId, eventName) {
    const onMessage = Event.fromNodeEventEmitter(validatedIpcMain, eventName, (event, message) => ({ event, message }));
    const onMessageFromSender = Event.filter(onMessage, ({ event }) => event.sender.id === senderId);
    return Event.map(onMessageFromSender, ({ message }) => message ? VSBuffer.wrap(message) : message);
}
/**
 * An implementation of `IPCServer` on top of Electron `ipcMain` API.
 */
export class Server extends IPCServer {
    static Clients = new Map();
    static getOnDidClientConnect() {
        const onHello = Event.fromNodeEventEmitter(validatedIpcMain, 'vscode:hello', ({ sender }) => sender);
        return Event.map(onHello, webContents => {
            const id = webContents.id;
            const client = Server.Clients.get(id);
            client?.dispose();
            const onDidClientReconnect = new Emitter();
            Server.Clients.set(id, toDisposable(() => onDidClientReconnect.fire()));
            const onMessage = createScopedOnMessageEvent(id, 'vscode:message');
            const onDidClientDisconnect = Event.any(Event.signal(createScopedOnMessageEvent(id, 'vscode:disconnect')), onDidClientReconnect.event);
            const protocol = new ElectronProtocol(webContents, onMessage);
            return { protocol, onDidClientDisconnect };
        });
    }
    constructor() {
        super(Server.getOnDidClientConnect());
    }
}
