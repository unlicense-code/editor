/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { timeout } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
export class TestService {
    _onMarco = new Emitter();
    onMarco = this._onMarco.event;
    marco() {
        this._onMarco.fire({ answer: 'polo' });
        return Promise.resolve('polo');
    }
    pong(ping) {
        return Promise.resolve({ incoming: ping, outgoing: 'pong' });
    }
    cancelMe() {
        return Promise.resolve(timeout(100)).then(() => true);
    }
}
export class TestChannel {
    testService;
    constructor(testService) {
        this.testService = testService;
    }
    listen(_, event) {
        switch (event) {
            case 'marco': return this.testService.onMarco;
        }
        throw new Error('Event not found');
    }
    call(_, command, ...args) {
        switch (command) {
            case 'pong': return this.testService.pong(args[0]);
            case 'cancelMe': return this.testService.cancelMe();
            case 'marco': return this.testService.marco();
            default: return Promise.reject(new Error(`command not found: ${command}`));
        }
    }
}
export class TestServiceClient {
    channel;
    get onMarco() { return this.channel.listen('marco'); }
    constructor(channel) {
        this.channel = channel;
    }
    marco() {
        return this.channel.call('marco');
    }
    pong(ping) {
        return this.channel.call('pong', ping);
    }
    cancelMe() {
        return this.channel.call('cancelMe');
    }
}
