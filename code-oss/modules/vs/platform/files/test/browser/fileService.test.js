/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { DeferredPromise, timeout } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { toDisposable } from 'vs/base/common/lifecycle';
import { consumeStream, newWriteableStream } from 'vs/base/common/stream';
import { URI } from 'vs/base/common/uri';
import { FileType } from 'vs/platform/files/common/files';
import { FileService } from 'vs/platform/files/common/fileService';
import { NullFileSystemProvider } from 'vs/platform/files/test/common/nullFileSystemProvider';
import { NullLogService } from 'vs/platform/log/common/log';
suite('File Service', () => {
    test('provider registration', async () => {
        const service = new FileService(new NullLogService());
        const resource = URI.parse('test://foo/bar');
        const provider = new NullFileSystemProvider();
        assert.strictEqual(await service.canHandleResource(resource), false);
        assert.strictEqual(service.hasProvider(resource), false);
        assert.strictEqual(service.getProvider(resource.scheme), undefined);
        const registrations = [];
        service.onDidChangeFileSystemProviderRegistrations(e => {
            registrations.push(e);
        });
        const capabilityChanges = [];
        service.onDidChangeFileSystemProviderCapabilities(e => {
            capabilityChanges.push(e);
        });
        let registrationDisposable;
        let callCount = 0;
        service.onWillActivateFileSystemProvider(e => {
            callCount++;
            if (e.scheme === 'test' && callCount === 1) {
                e.join(new Promise(resolve => {
                    registrationDisposable = service.registerProvider('test', provider);
                    resolve();
                }));
            }
        });
        assert.strictEqual(await service.canHandleResource(resource), true);
        assert.strictEqual(service.hasProvider(resource), true);
        assert.strictEqual(service.getProvider(resource.scheme), provider);
        assert.strictEqual(registrations.length, 1);
        assert.strictEqual(registrations[0].scheme, 'test');
        assert.strictEqual(registrations[0].added, true);
        assert.ok(registrationDisposable);
        assert.strictEqual(capabilityChanges.length, 0);
        provider.setCapabilities(8 /* FileSystemProviderCapabilities.FileFolderCopy */);
        assert.strictEqual(capabilityChanges.length, 1);
        provider.setCapabilities(2048 /* FileSystemProviderCapabilities.Readonly */);
        assert.strictEqual(capabilityChanges.length, 2);
        await service.activateProvider('test');
        assert.strictEqual(callCount, 2); // activation is called again
        assert.strictEqual(service.hasCapability(resource, 2048 /* FileSystemProviderCapabilities.Readonly */), true);
        assert.strictEqual(service.hasCapability(resource, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */), false);
        registrationDisposable.dispose();
        assert.strictEqual(await service.canHandleResource(resource), false);
        assert.strictEqual(service.hasProvider(resource), false);
        assert.strictEqual(registrations.length, 2);
        assert.strictEqual(registrations[1].scheme, 'test');
        assert.strictEqual(registrations[1].added, false);
        service.dispose();
    });
    test('watch', async () => {
        const service = new FileService(new NullLogService());
        let disposeCounter = 0;
        service.registerProvider('test', new NullFileSystemProvider(() => {
            return toDisposable(() => {
                disposeCounter++;
            });
        }));
        await service.activateProvider('test');
        const resource1 = URI.parse('test://foo/bar1');
        const watcher1Disposable = service.watch(resource1);
        await timeout(0); // service.watch() is async
        assert.strictEqual(disposeCounter, 0);
        watcher1Disposable.dispose();
        assert.strictEqual(disposeCounter, 1);
        disposeCounter = 0;
        const resource2 = URI.parse('test://foo/bar2');
        const watcher2Disposable1 = service.watch(resource2);
        const watcher2Disposable2 = service.watch(resource2);
        const watcher2Disposable3 = service.watch(resource2);
        await timeout(0); // service.watch() is async
        assert.strictEqual(disposeCounter, 0);
        watcher2Disposable1.dispose();
        assert.strictEqual(disposeCounter, 0);
        watcher2Disposable2.dispose();
        assert.strictEqual(disposeCounter, 0);
        watcher2Disposable3.dispose();
        assert.strictEqual(disposeCounter, 1);
        disposeCounter = 0;
        const resource3 = URI.parse('test://foo/bar3');
        const watcher3Disposable1 = service.watch(resource3);
        const watcher3Disposable2 = service.watch(resource3, { recursive: true, excludes: [] });
        const watcher3Disposable3 = service.watch(resource3, { recursive: false, excludes: [], includes: [] });
        await timeout(0); // service.watch() is async
        assert.strictEqual(disposeCounter, 0);
        watcher3Disposable1.dispose();
        assert.strictEqual(disposeCounter, 1);
        watcher3Disposable2.dispose();
        assert.strictEqual(disposeCounter, 2);
        watcher3Disposable3.dispose();
        assert.strictEqual(disposeCounter, 3);
        service.dispose();
    });
    test('error from readFile bubbles through (https://github.com/microsoft/vscode/issues/118060) - async', async () => {
        testReadErrorBubbles(true);
    });
    test('error from readFile bubbles through (https://github.com/microsoft/vscode/issues/118060)', async () => {
        testReadErrorBubbles(false);
    });
    async function testReadErrorBubbles(async) {
        const service = new FileService(new NullLogService());
        const provider = new class extends NullFileSystemProvider {
            async stat(resource) {
                return {
                    mtime: Date.now(),
                    ctime: Date.now(),
                    size: 100,
                    type: FileType.File
                };
            }
            readFile(resource) {
                if (async) {
                    return timeout(5).then(() => { throw new Error('failed'); });
                }
                throw new Error('failed');
            }
            open(resource, opts) {
                if (async) {
                    return timeout(5).then(() => { throw new Error('failed'); });
                }
                throw new Error('failed');
            }
            readFileStream(resource, opts, token) {
                if (async) {
                    const stream = newWriteableStream(chunk => chunk[0]);
                    timeout(5).then(() => stream.error(new Error('failed')));
                    return stream;
                }
                throw new Error('failed');
            }
        };
        const disposable = service.registerProvider('test', provider);
        for (const capabilities of [2 /* FileSystemProviderCapabilities.FileReadWrite */, 16 /* FileSystemProviderCapabilities.FileReadStream */, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */]) {
            provider.setCapabilities(capabilities);
            let e1;
            try {
                await service.readFile(URI.parse('test://foo/bar'));
            }
            catch (error) {
                e1 = error;
            }
            assert.ok(e1);
            let e2;
            try {
                const stream = await service.readFileStream(URI.parse('test://foo/bar'));
                await consumeStream(stream.value, chunk => chunk[0]);
            }
            catch (error) {
                e2 = error;
            }
            assert.ok(e2);
        }
        disposable.dispose();
    }
    test('readFile/readFileStream supports cancellation (https://github.com/microsoft/vscode/issues/138805)', async () => {
        const service = new FileService(new NullLogService());
        let readFileStreamReady = undefined;
        const provider = new class extends NullFileSystemProvider {
            async stat(resource) {
                return {
                    mtime: Date.now(),
                    ctime: Date.now(),
                    size: 100,
                    type: FileType.File
                };
            }
            readFileStream(resource, opts, token) {
                const stream = newWriteableStream(chunk => chunk[0]);
                token.onCancellationRequested(() => {
                    stream.error(new Error('Expected cancellation'));
                    stream.end();
                });
                readFileStreamReady.complete();
                return stream;
            }
        };
        const disposable = service.registerProvider('test', provider);
        provider.setCapabilities(16 /* FileSystemProviderCapabilities.FileReadStream */);
        let e1;
        try {
            const cts = new CancellationTokenSource();
            readFileStreamReady = new DeferredPromise();
            const promise = service.readFile(URI.parse('test://foo/bar'), undefined, cts.token);
            await Promise.all([readFileStreamReady.p.then(() => cts.cancel()), promise]);
        }
        catch (error) {
            e1 = error;
        }
        assert.ok(e1);
        let e2;
        try {
            const cts = new CancellationTokenSource();
            readFileStreamReady = new DeferredPromise();
            const stream = await service.readFileStream(URI.parse('test://foo/bar'), undefined, cts.token);
            await Promise.all([readFileStreamReady.p.then(() => cts.cancel()), consumeStream(stream.value, chunk => chunk[0])]);
        }
        catch (error) {
            e2 = error;
        }
        assert.ok(e2);
        disposable.dispose();
    });
});
