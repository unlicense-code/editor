/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { timeout } from 'vs/base/common/async';
import { VSBuffer } from 'vs/base/common/buffer';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { canceled } from 'vs/base/common/errors';
import { Emitter, Event } from 'vs/base/common/event';
import { isEqual } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { IPCClient, IPCServer, ProxyChannel } from 'vs/base/parts/ipc/common/ipc';
class QueueProtocol {
    buffering = true;
    buffers = [];
    _onMessage = new Emitter({
        onDidAddFirstListener: () => {
            for (const buffer of this.buffers) {
                this._onMessage.fire(buffer);
            }
            this.buffers = [];
            this.buffering = false;
        },
        onDidRemoveLastListener: () => {
            this.buffering = true;
        }
    });
    onMessage = this._onMessage.event;
    other;
    send(buffer) {
        this.other.receive(buffer);
    }
    receive(buffer) {
        if (this.buffering) {
            this.buffers.push(buffer);
        }
        else {
            this._onMessage.fire(buffer);
        }
    }
}
function createProtocolPair() {
    const one = new QueueProtocol();
    const other = new QueueProtocol();
    one.other = other;
    other.other = one;
    return [one, other];
}
class TestIPCClient extends IPCClient {
    _onDidDisconnect = new Emitter();
    onDidDisconnect = this._onDidDisconnect.event;
    constructor(protocol, id) {
        super(protocol, id);
    }
    dispose() {
        this._onDidDisconnect.fire();
        super.dispose();
    }
}
class TestIPCServer extends IPCServer {
    onDidClientConnect;
    constructor() {
        const onDidClientConnect = new Emitter();
        super(onDidClientConnect.event);
        this.onDidClientConnect = onDidClientConnect;
    }
    createConnection(id) {
        const [pc, ps] = createProtocolPair();
        const client = new TestIPCClient(pc, id);
        this.onDidClientConnect.fire({
            protocol: ps,
            onDidClientDisconnect: client.onDidDisconnect
        });
        return client;
    }
}
const TestChannelId = 'testchannel';
class TestService {
    _onPong = new Emitter();
    onPong = this._onPong.event;
    marco() {
        return Promise.resolve('polo');
    }
    error(message) {
        return Promise.reject(new Error(message));
    }
    neverComplete() {
        return new Promise(_ => { });
    }
    neverCompleteCT(cancellationToken) {
        if (cancellationToken.isCancellationRequested) {
            return Promise.reject(canceled());
        }
        return new Promise((_, e) => cancellationToken.onCancellationRequested(() => e(canceled())));
    }
    buffersLength(buffers) {
        return Promise.resolve(buffers.reduce((r, b) => r + b.buffer.length, 0));
    }
    ping(msg) {
        this._onPong.fire(msg);
    }
    marshall(uri) {
        return Promise.resolve(uri);
    }
    context(context) {
        return Promise.resolve(context);
    }
}
class TestChannel {
    service;
    constructor(service) {
        this.service = service;
    }
    call(_, command, arg, cancellationToken) {
        switch (command) {
            case 'marco': return this.service.marco();
            case 'error': return this.service.error(arg);
            case 'neverComplete': return this.service.neverComplete();
            case 'neverCompleteCT': return this.service.neverCompleteCT(cancellationToken);
            case 'buffersLength': return this.service.buffersLength(arg);
            default: return Promise.reject(new Error('not implemented'));
        }
    }
    listen(_, event, arg) {
        switch (event) {
            case 'onPong': return this.service.onPong;
            default: throw new Error('not implemented');
        }
    }
}
class TestChannelClient {
    channel;
    get onPong() {
        return this.channel.listen('onPong');
    }
    constructor(channel) {
        this.channel = channel;
    }
    marco() {
        return this.channel.call('marco');
    }
    error(message) {
        return this.channel.call('error', message);
    }
    neverComplete() {
        return this.channel.call('neverComplete');
    }
    neverCompleteCT(cancellationToken) {
        return this.channel.call('neverCompleteCT', undefined, cancellationToken);
    }
    buffersLength(buffers) {
        return this.channel.call('buffersLength', buffers);
    }
    marshall(uri) {
        return this.channel.call('marshall', uri);
    }
    context() {
        return this.channel.call('context');
    }
}
suite('Base IPC', function () {
    test('createProtocolPair', async function () {
        const [clientProtocol, serverProtocol] = createProtocolPair();
        const b1 = VSBuffer.alloc(0);
        clientProtocol.send(b1);
        const b3 = VSBuffer.alloc(0);
        serverProtocol.send(b3);
        const b2 = await Event.toPromise(serverProtocol.onMessage);
        const b4 = await Event.toPromise(clientProtocol.onMessage);
        assert.strictEqual(b1, b2);
        assert.strictEqual(b3, b4);
    });
    suite('one to one', function () {
        let server;
        let client;
        let service;
        let ipcService;
        setup(function () {
            service = new TestService();
            const testServer = new TestIPCServer();
            server = testServer;
            server.registerChannel(TestChannelId, new TestChannel(service));
            client = testServer.createConnection('client1');
            ipcService = new TestChannelClient(client.getChannel(TestChannelId));
        });
        teardown(function () {
            client.dispose();
            server.dispose();
        });
        test('call success', async function () {
            const r = await ipcService.marco();
            return assert.strictEqual(r, 'polo');
        });
        test('call error', async function () {
            try {
                await ipcService.error('nice error');
                return assert.fail('should not reach here');
            }
            catch (err) {
                return assert.strictEqual(err.message, 'nice error');
            }
        });
        test('cancel call with cancelled cancellation token', async function () {
            try {
                await ipcService.neverCompleteCT(CancellationToken.Cancelled);
                return assert.fail('should not reach here');
            }
            catch (err) {
                return assert(err.message === 'Canceled');
            }
        });
        test('cancel call with cancellation token (sync)', function () {
            const cts = new CancellationTokenSource();
            const promise = ipcService.neverCompleteCT(cts.token).then(_ => assert.fail('should not reach here'), err => assert(err.message === 'Canceled'));
            cts.cancel();
            return promise;
        });
        test('cancel call with cancellation token (async)', function () {
            const cts = new CancellationTokenSource();
            const promise = ipcService.neverCompleteCT(cts.token).then(_ => assert.fail('should not reach here'), err => assert(err.message === 'Canceled'));
            setTimeout(() => cts.cancel());
            return promise;
        });
        test('listen to events', async function () {
            const messages = [];
            ipcService.onPong(msg => messages.push(msg));
            await timeout(0);
            assert.deepStrictEqual(messages, []);
            service.ping('hello');
            await timeout(0);
            assert.deepStrictEqual(messages, ['hello']);
            service.ping('world');
            await timeout(0);
            assert.deepStrictEqual(messages, ['hello', 'world']);
        });
        test('buffers in arrays', async function () {
            const r = await ipcService.buffersLength([VSBuffer.alloc(2), VSBuffer.alloc(3)]);
            return assert.strictEqual(r, 5);
        });
    });
    suite('one to one (proxy)', function () {
        let server;
        let client;
        let service;
        let ipcService;
        setup(function () {
            service = new TestService();
            const testServer = new TestIPCServer();
            server = testServer;
            server.registerChannel(TestChannelId, ProxyChannel.fromService(service));
            client = testServer.createConnection('client1');
            ipcService = ProxyChannel.toService(client.getChannel(TestChannelId));
        });
        teardown(function () {
            client.dispose();
            server.dispose();
        });
        test('call success', async function () {
            const r = await ipcService.marco();
            return assert.strictEqual(r, 'polo');
        });
        test('call error', async function () {
            try {
                await ipcService.error('nice error');
                return assert.fail('should not reach here');
            }
            catch (err) {
                return assert.strictEqual(err.message, 'nice error');
            }
        });
        test('listen to events', async function () {
            const messages = [];
            ipcService.onPong(msg => messages.push(msg));
            await timeout(0);
            assert.deepStrictEqual(messages, []);
            service.ping('hello');
            await timeout(0);
            assert.deepStrictEqual(messages, ['hello']);
            service.ping('world');
            await timeout(0);
            assert.deepStrictEqual(messages, ['hello', 'world']);
        });
        test('marshalling uri', async function () {
            const uri = URI.file('foobar');
            const r = await ipcService.marshall(uri);
            assert.ok(r instanceof URI);
            return assert.ok(isEqual(r, uri));
        });
        test('buffers in arrays', async function () {
            const r = await ipcService.buffersLength([VSBuffer.alloc(2), VSBuffer.alloc(3)]);
            return assert.strictEqual(r, 5);
        });
    });
    suite('one to one (proxy, extra context)', function () {
        let server;
        let client;
        let service;
        let ipcService;
        setup(function () {
            service = new TestService();
            const testServer = new TestIPCServer();
            server = testServer;
            server.registerChannel(TestChannelId, ProxyChannel.fromService(service));
            client = testServer.createConnection('client1');
            ipcService = ProxyChannel.toService(client.getChannel(TestChannelId), { context: 'Super Context' });
        });
        teardown(function () {
            client.dispose();
            server.dispose();
        });
        test('call extra context', async function () {
            const r = await ipcService.context();
            return assert.strictEqual(r, 'Super Context');
        });
    });
    suite('one to many', function () {
        test('all clients get pinged', async function () {
            const service = new TestService();
            const channel = new TestChannel(service);
            const server = new TestIPCServer();
            server.registerChannel('channel', channel);
            let client1GotPinged = false;
            const client1 = server.createConnection('client1');
            const ipcService1 = new TestChannelClient(client1.getChannel('channel'));
            ipcService1.onPong(() => client1GotPinged = true);
            let client2GotPinged = false;
            const client2 = server.createConnection('client2');
            const ipcService2 = new TestChannelClient(client2.getChannel('channel'));
            ipcService2.onPong(() => client2GotPinged = true);
            await timeout(1);
            service.ping('hello');
            await timeout(1);
            assert(client1GotPinged, 'client 1 got pinged');
            assert(client2GotPinged, 'client 2 got pinged');
            client1.dispose();
            client2.dispose();
            server.dispose();
        });
        test('server gets pings from all clients (broadcast channel)', async function () {
            const server = new TestIPCServer();
            const client1 = server.createConnection('client1');
            const clientService1 = new TestService();
            const clientChannel1 = new TestChannel(clientService1);
            client1.registerChannel('channel', clientChannel1);
            const pings = [];
            const channel = server.getChannel('channel', () => true);
            const service = new TestChannelClient(channel);
            service.onPong(msg => pings.push(msg));
            await timeout(1);
            clientService1.ping('hello 1');
            await timeout(1);
            assert.deepStrictEqual(pings, ['hello 1']);
            const client2 = server.createConnection('client2');
            const clientService2 = new TestService();
            const clientChannel2 = new TestChannel(clientService2);
            client2.registerChannel('channel', clientChannel2);
            await timeout(1);
            clientService2.ping('hello 2');
            await timeout(1);
            assert.deepStrictEqual(pings, ['hello 1', 'hello 2']);
            client1.dispose();
            clientService1.ping('hello 1');
            await timeout(1);
            assert.deepStrictEqual(pings, ['hello 1', 'hello 2']);
            await timeout(1);
            clientService2.ping('hello again 2');
            await timeout(1);
            assert.deepStrictEqual(pings, ['hello 1', 'hello 2', 'hello again 2']);
            client2.dispose();
            server.dispose();
        });
    });
});
