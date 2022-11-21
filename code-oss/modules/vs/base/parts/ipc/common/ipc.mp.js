/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { VSBuffer } from 'vs/base/common/buffer';
import { Event } from 'vs/base/common/event';
import { IPCClient } from 'vs/base/parts/ipc/common/ipc';
/**
 * The MessagePort `Protocol` leverages MessagePort style IPC communication
 * for the implementation of the `IMessagePassingProtocol`. That style of API
 * is a simple `onmessage` / `postMessage` pattern.
 */
export class Protocol {
    port;
    onMessage = Event.fromDOMEventEmitter(this.port, 'message', (e) => VSBuffer.wrap(e.data));
    constructor(port) {
        this.port = port;
        // we must call start() to ensure messages are flowing
        port.start();
    }
    send(message) {
        this.port.postMessage(message.buffer);
    }
    disconnect() {
        this.port.close();
    }
}
/**
 * An implementation of a `IPCClient` on top of MessagePort style IPC communication.
 */
export class Client extends IPCClient {
    protocol;
    constructor(port, clientId) {
        const protocol = new Protocol(port);
        super(protocol, clientId);
        this.protocol = protocol;
    }
    dispose() {
        this.protocol.disconnect();
    }
}
