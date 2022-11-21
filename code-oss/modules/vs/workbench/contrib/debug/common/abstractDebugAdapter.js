/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { timeout } from 'vs/base/common/async';
import { localize } from 'vs/nls';
/**
 * Abstract implementation of the low level API for a debug adapter.
 * Missing is how this API communicates with the debug adapter.
 */
export class AbstractDebugAdapter {
    sequence;
    pendingRequests = new Map();
    requestCallback;
    eventCallback;
    messageCallback;
    queue = [];
    _onError = new Emitter();
    _onExit = new Emitter();
    constructor() {
        this.sequence = 1;
    }
    get onError() {
        return this._onError.event;
    }
    get onExit() {
        return this._onExit.event;
    }
    onMessage(callback) {
        if (this.messageCallback) {
            this._onError.fire(new Error(`attempt to set more than one 'Message' callback`));
        }
        this.messageCallback = callback;
    }
    onEvent(callback) {
        if (this.eventCallback) {
            this._onError.fire(new Error(`attempt to set more than one 'Event' callback`));
        }
        this.eventCallback = callback;
    }
    onRequest(callback) {
        if (this.requestCallback) {
            this._onError.fire(new Error(`attempt to set more than one 'Request' callback`));
        }
        this.requestCallback = callback;
    }
    sendResponse(response) {
        if (response.seq > 0) {
            this._onError.fire(new Error(`attempt to send more than one response for command ${response.command}`));
        }
        else {
            this.internalSend('response', response);
        }
    }
    sendRequest(command, args, clb, timeout) {
        const request = {
            command: command
        };
        if (args && Object.keys(args).length > 0) {
            request.arguments = args;
        }
        this.internalSend('request', request);
        if (typeof timeout === 'number') {
            const timer = setTimeout(() => {
                clearTimeout(timer);
                const clb = this.pendingRequests.get(request.seq);
                if (clb) {
                    this.pendingRequests.delete(request.seq);
                    const err = {
                        type: 'response',
                        seq: 0,
                        request_seq: request.seq,
                        success: false,
                        command,
                        message: localize('timeout', "Timeout after {0} ms for '{1}'", timeout, command)
                    };
                    clb(err);
                }
            }, timeout);
        }
        if (clb) {
            // store callback for this request
            this.pendingRequests.set(request.seq, clb);
        }
        return request.seq;
    }
    acceptMessage(message) {
        if (this.messageCallback) {
            this.messageCallback(message);
        }
        else {
            this.queue.push(message);
            if (this.queue.length === 1) {
                // first item = need to start processing loop
                this.processQueue();
            }
        }
    }
    /**
     * Returns whether we should insert a timeout between processing messageA
     * and messageB. Artificially queueing protocol messages guarantees that any
     * microtasks for previous message finish before next message is processed.
     * This is essential ordering when using promises anywhere along the call path.
     *
     * For example, take the following, where `chooseAndSendGreeting` returns
     * a person name and then emits a greeting event:
     *
     * ```
     * let person: string;
     * adapter.onGreeting(() => console.log('hello', person));
     * person = await adapter.chooseAndSendGreeting();
     * ```
     *
     * Because the event is dispatched synchronously, it may fire before person
     * is assigned if they're processed in the same task. Inserting a task
     * boundary avoids this issue.
     */
    needsTaskBoundaryBetween(messageA, messageB) {
        return messageA.type !== 'event' || messageB.type !== 'event';
    }
    /**
     * Reads and dispatches items from the queue until it is empty.
     */
    async processQueue() {
        let message;
        while (this.queue.length) {
            if (!message || this.needsTaskBoundaryBetween(this.queue[0], message)) {
                await timeout(0);
            }
            message = this.queue.shift();
            if (!message) {
                return; // may have been disposed of
            }
            switch (message.type) {
                case 'event':
                    this.eventCallback?.(message);
                    break;
                case 'request':
                    this.requestCallback?.(message);
                    break;
                case 'response': {
                    const response = message;
                    const clb = this.pendingRequests.get(response.request_seq);
                    if (clb) {
                        this.pendingRequests.delete(response.request_seq);
                        clb(response);
                    }
                    break;
                }
            }
        }
    }
    internalSend(typ, message) {
        message.type = typ;
        message.seq = this.sequence++;
        this.sendMessage(message);
    }
    async cancelPendingRequests() {
        if (this.pendingRequests.size === 0) {
            return Promise.resolve();
        }
        const pending = new Map();
        this.pendingRequests.forEach((value, key) => pending.set(key, value));
        await timeout(500);
        pending.forEach((callback, request_seq) => {
            const err = {
                type: 'response',
                seq: 0,
                request_seq,
                success: false,
                command: 'canceled',
                message: 'canceled'
            };
            callback(err);
            this.pendingRequests.delete(request_seq);
        });
    }
    getPendingRequestIds() {
        return Array.from(this.pendingRequests.keys());
    }
    dispose() {
        this.queue = [];
    }
}
