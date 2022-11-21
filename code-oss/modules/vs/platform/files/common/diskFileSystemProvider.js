/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { insert } from 'vs/base/common/arrays';
import { ThrottledDelayer } from 'vs/base/common/async';
import { onUnexpectedError } from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { normalize } from 'vs/base/common/path';
import { isRecursiveWatchRequest, toFileChanges } from 'vs/platform/files/common/watcher';
import { LogLevel } from 'vs/platform/log/common/log';
export class AbstractDiskFileSystemProvider extends Disposable {
    logService;
    options;
    constructor(logService, options) {
        super();
        this.logService = logService;
        this.options = options;
    }
    _onDidChangeFile = this._register(new Emitter());
    onDidChangeFile = this._onDidChangeFile.event;
    _onDidWatchError = this._register(new Emitter());
    onDidWatchError = this._onDidWatchError.event;
    watch(resource, opts) {
        if (opts.recursive || this.options?.watcher?.forceUniversal) {
            return this.watchUniversal(resource, opts);
        }
        return this.watchNonRecursive(resource, opts);
    }
    //#region File Watching (universal)
    universalWatcher;
    universalPathsToWatch = [];
    universalWatchRequestDelayer = this._register(new ThrottledDelayer(0));
    watchUniversal(resource, opts) {
        // Add to list of paths to watch universally
        const pathToWatch = { path: this.toFilePath(resource), excludes: opts.excludes, includes: opts.includes, recursive: opts.recursive };
        const remove = insert(this.universalPathsToWatch, pathToWatch);
        // Trigger update
        this.refreshUniversalWatchers();
        return toDisposable(() => {
            // Remove from list of paths to watch universally
            remove();
            // Trigger update
            this.refreshUniversalWatchers();
        });
    }
    refreshUniversalWatchers() {
        // Buffer requests for universal watching to decide on right watcher
        // that supports potentially watching more than one path at once
        this.universalWatchRequestDelayer.trigger(() => {
            return this.doRefreshUniversalWatchers();
        }).catch(error => onUnexpectedError(error));
    }
    doRefreshUniversalWatchers() {
        // Create watcher if this is the first time
        if (!this.universalWatcher) {
            this.universalWatcher = this._register(this.createUniversalWatcher(changes => this._onDidChangeFile.fire(toFileChanges(changes)), msg => this.onWatcherLogMessage(msg), this.logService.getLevel() === LogLevel.Trace));
            // Apply log levels dynamically
            this._register(this.logService.onDidChangeLogLevel(() => {
                this.universalWatcher?.setVerboseLogging(this.logService.getLevel() === LogLevel.Trace);
            }));
        }
        // Adjust for polling
        const usePolling = this.options?.watcher?.recursive?.usePolling;
        if (usePolling === true) {
            for (const request of this.universalPathsToWatch) {
                if (isRecursiveWatchRequest(request)) {
                    request.pollingInterval = this.options?.watcher?.recursive?.pollingInterval ?? 5000;
                }
            }
        }
        else if (Array.isArray(usePolling)) {
            for (const request of this.universalPathsToWatch) {
                if (isRecursiveWatchRequest(request)) {
                    if (usePolling.includes(request.path)) {
                        request.pollingInterval = this.options?.watcher?.recursive?.pollingInterval ?? 5000;
                    }
                }
            }
        }
        // Ask to watch the provided paths
        return this.universalWatcher.watch(this.universalPathsToWatch);
    }
    //#endregion
    //#region File Watching (non-recursive)
    nonRecursiveWatcher;
    nonRecursivePathsToWatch = [];
    nonRecursiveWatchRequestDelayer = this._register(new ThrottledDelayer(0));
    watchNonRecursive(resource, opts) {
        // Add to list of paths to watch non-recursively
        const pathToWatch = { path: this.toFilePath(resource), excludes: opts.excludes, includes: opts.includes, recursive: false };
        const remove = insert(this.nonRecursivePathsToWatch, pathToWatch);
        // Trigger update
        this.refreshNonRecursiveWatchers();
        return toDisposable(() => {
            // Remove from list of paths to watch non-recursively
            remove();
            // Trigger update
            this.refreshNonRecursiveWatchers();
        });
    }
    refreshNonRecursiveWatchers() {
        // Buffer requests for nonrecursive watching to decide on right watcher
        // that supports potentially watching more than one path at once
        this.nonRecursiveWatchRequestDelayer.trigger(() => {
            return this.doRefreshNonRecursiveWatchers();
        }).catch(error => onUnexpectedError(error));
    }
    doRefreshNonRecursiveWatchers() {
        // Create watcher if this is the first time
        if (!this.nonRecursiveWatcher) {
            this.nonRecursiveWatcher = this._register(this.createNonRecursiveWatcher(changes => this._onDidChangeFile.fire(toFileChanges(changes)), msg => this.onWatcherLogMessage(msg), this.logService.getLevel() === LogLevel.Trace));
            // Apply log levels dynamically
            this._register(this.logService.onDidChangeLogLevel(() => {
                this.nonRecursiveWatcher?.setVerboseLogging(this.logService.getLevel() === LogLevel.Trace);
            }));
        }
        // Ask to watch the provided paths
        return this.nonRecursiveWatcher.watch(this.nonRecursivePathsToWatch);
    }
    //#endregion
    onWatcherLogMessage(msg) {
        if (msg.type === 'error') {
            this._onDidWatchError.fire(msg.message);
        }
        this.logService[msg.type](msg.message);
    }
    toFilePath(resource) {
        return normalize(resource.fsPath);
    }
}
