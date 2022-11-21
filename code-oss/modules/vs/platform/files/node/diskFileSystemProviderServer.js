/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { DiskFileSystemProvider } from 'vs/platform/files/node/diskFileSystemProvider';
import { Disposable, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { VSBuffer } from 'vs/base/common/buffer';
import { listenStream } from 'vs/base/common/stream';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
/**
 * A server implementation for a IPC based file system provider client.
 */
export class AbstractDiskFileSystemProviderChannel extends Disposable {
    provider;
    logService;
    constructor(provider, logService) {
        super();
        this.provider = provider;
        this.logService = logService;
    }
    call(ctx, command, arg) {
        const uriTransformer = this.getUriTransformer(ctx);
        switch (command) {
            case 'stat': return this.stat(uriTransformer, arg[0]);
            case 'readdir': return this.readdir(uriTransformer, arg[0]);
            case 'open': return this.open(uriTransformer, arg[0], arg[1]);
            case 'close': return this.close(arg[0]);
            case 'read': return this.read(arg[0], arg[1], arg[2]);
            case 'readFile': return this.readFile(uriTransformer, arg[0], arg[1]);
            case 'write': return this.write(arg[0], arg[1], arg[2], arg[3], arg[4]);
            case 'writeFile': return this.writeFile(uriTransformer, arg[0], arg[1], arg[2]);
            case 'rename': return this.rename(uriTransformer, arg[0], arg[1], arg[2]);
            case 'copy': return this.copy(uriTransformer, arg[0], arg[1], arg[2]);
            case 'cloneFile': return this.cloneFile(uriTransformer, arg[0], arg[1]);
            case 'mkdir': return this.mkdir(uriTransformer, arg[0]);
            case 'delete': return this.delete(uriTransformer, arg[0], arg[1]);
            case 'watch': return this.watch(uriTransformer, arg[0], arg[1], arg[2], arg[3]);
            case 'unwatch': return this.unwatch(arg[0], arg[1]);
        }
        throw new Error(`IPC Command ${command} not found`);
    }
    listen(ctx, event, arg) {
        const uriTransformer = this.getUriTransformer(ctx);
        switch (event) {
            case 'fileChange': return this.onFileChange(uriTransformer, arg[0]);
            case 'readFileStream': return this.onReadFileStream(uriTransformer, arg[0], arg[1]);
        }
        throw new Error(`Unknown event ${event}`);
    }
    //#region File Metadata Resolving
    stat(uriTransformer, _resource) {
        const resource = this.transformIncoming(uriTransformer, _resource, true);
        return this.provider.stat(resource);
    }
    readdir(uriTransformer, _resource) {
        const resource = this.transformIncoming(uriTransformer, _resource);
        return this.provider.readdir(resource);
    }
    //#endregion
    //#region File Reading/Writing
    async readFile(uriTransformer, _resource, opts) {
        const resource = this.transformIncoming(uriTransformer, _resource, true);
        const buffer = await this.provider.readFile(resource, opts);
        return VSBuffer.wrap(buffer);
    }
    onReadFileStream(uriTransformer, _resource, opts) {
        const resource = this.transformIncoming(uriTransformer, _resource, true);
        const cts = new CancellationTokenSource();
        const emitter = new Emitter({
            onDidRemoveLastListener: () => {
                // Ensure to cancel the read operation when there is no more
                // listener on the other side to prevent unneeded work.
                cts.cancel();
            }
        });
        const fileStream = this.provider.readFileStream(resource, opts, cts.token);
        listenStream(fileStream, {
            onData: chunk => emitter.fire(VSBuffer.wrap(chunk)),
            onError: error => emitter.fire(error),
            onEnd: () => {
                // Forward event
                emitter.fire('end');
                // Cleanup
                emitter.dispose();
                cts.dispose();
            }
        });
        return emitter.event;
    }
    writeFile(uriTransformer, _resource, content, opts) {
        const resource = this.transformIncoming(uriTransformer, _resource);
        return this.provider.writeFile(resource, content.buffer, opts);
    }
    open(uriTransformer, _resource, opts) {
        const resource = this.transformIncoming(uriTransformer, _resource, true);
        return this.provider.open(resource, opts);
    }
    close(fd) {
        return this.provider.close(fd);
    }
    async read(fd, pos, length) {
        const buffer = VSBuffer.alloc(length);
        const bufferOffset = 0; // offset is 0 because we create a buffer to read into for each call
        const bytesRead = await this.provider.read(fd, pos, buffer.buffer, bufferOffset, length);
        return [buffer, bytesRead];
    }
    write(fd, pos, data, offset, length) {
        return this.provider.write(fd, pos, data.buffer, offset, length);
    }
    //#endregion
    //#region Move/Copy/Delete/Create Folder
    mkdir(uriTransformer, _resource) {
        const resource = this.transformIncoming(uriTransformer, _resource);
        return this.provider.mkdir(resource);
    }
    delete(uriTransformer, _resource, opts) {
        const resource = this.transformIncoming(uriTransformer, _resource);
        return this.provider.delete(resource, opts);
    }
    rename(uriTransformer, _source, _target, opts) {
        const source = this.transformIncoming(uriTransformer, _source);
        const target = this.transformIncoming(uriTransformer, _target);
        return this.provider.rename(source, target, opts);
    }
    copy(uriTransformer, _source, _target, opts) {
        const source = this.transformIncoming(uriTransformer, _source);
        const target = this.transformIncoming(uriTransformer, _target);
        return this.provider.copy(source, target, opts);
    }
    //#endregion
    //#region Clone File
    cloneFile(uriTransformer, _source, _target) {
        const source = this.transformIncoming(uriTransformer, _source);
        const target = this.transformIncoming(uriTransformer, _target);
        return this.provider.cloneFile(source, target);
    }
    //#endregion
    //#region File Watching
    sessionToWatcher = new Map();
    watchRequests = new Map();
    onFileChange(uriTransformer, sessionId) {
        // We want a specific emitter for the given session so that events
        // from the one session do not end up on the other session. As such
        // we create a `SessionFileWatcher` and a `Emitter` for that session.
        const emitter = new Emitter({
            onWillAddFirstListener: () => {
                this.sessionToWatcher.set(sessionId, this.createSessionFileWatcher(uriTransformer, emitter));
            },
            onDidRemoveLastListener: () => {
                dispose(this.sessionToWatcher.get(sessionId));
                this.sessionToWatcher.delete(sessionId);
            }
        });
        return emitter.event;
    }
    async watch(uriTransformer, sessionId, req, _resource, opts) {
        const watcher = this.sessionToWatcher.get(sessionId);
        if (watcher) {
            const resource = this.transformIncoming(uriTransformer, _resource);
            const disposable = watcher.watch(req, resource, opts);
            this.watchRequests.set(sessionId + req, disposable);
        }
    }
    async unwatch(sessionId, req) {
        const id = sessionId + req;
        const disposable = this.watchRequests.get(id);
        if (disposable) {
            dispose(disposable);
            this.watchRequests.delete(id);
        }
    }
    //#endregion
    dispose() {
        super.dispose();
        for (const [, disposable] of this.watchRequests) {
            disposable.dispose();
        }
        this.watchRequests.clear();
        for (const [, disposable] of this.sessionToWatcher) {
            disposable.dispose();
        }
        this.sessionToWatcher.clear();
    }
}
export class AbstractSessionFileWatcher extends Disposable {
    uriTransformer;
    logService;
    environmentService;
    watcherRequests = new Map();
    // To ensure we use one file watcher per session, we keep a
    // disk file system provider instantiated for this session.
    // The provider is cheap and only stateful when file watching
    // starts.
    //
    // This is important because we want to ensure that we only
    // forward events from the watched paths for this session and
    // not other clients that asked to watch other paths.
    fileWatcher = this._register(new DiskFileSystemProvider(this.logService, { watcher: { recursive: this.getRecursiveWatcherOptions(this.environmentService) } }));
    constructor(uriTransformer, sessionEmitter, logService, environmentService) {
        super();
        this.uriTransformer = uriTransformer;
        this.logService = logService;
        this.environmentService = environmentService;
        this.registerListeners(sessionEmitter);
    }
    registerListeners(sessionEmitter) {
        const localChangeEmitter = this._register(new Emitter());
        this._register(localChangeEmitter.event((events) => {
            sessionEmitter.fire(events.map(e => ({
                resource: this.uriTransformer.transformOutgoingURI(e.resource),
                type: e.type
            })));
        }));
        this._register(this.fileWatcher.onDidChangeFile(events => localChangeEmitter.fire(events)));
        this._register(this.fileWatcher.onDidWatchError(error => sessionEmitter.fire(error)));
    }
    getRecursiveWatcherOptions(environmentService) {
        return undefined; // subclasses can override
    }
    getExtraExcludes(environmentService) {
        return undefined; // subclasses can override
    }
    watch(req, resource, opts) {
        const extraExcludes = this.getExtraExcludes(this.environmentService);
        if (Array.isArray(extraExcludes)) {
            opts.excludes = [...opts.excludes, ...extraExcludes];
        }
        this.watcherRequests.set(req, this.fileWatcher.watch(resource, opts));
        return toDisposable(() => {
            dispose(this.watcherRequests.get(req));
            this.watcherRequests.delete(req);
        });
    }
    dispose() {
        super.dispose();
        for (const [, disposable] of this.watcherRequests) {
            disposable.dispose();
        }
        this.watcherRequests.clear();
    }
}
