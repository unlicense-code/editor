/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event, Emitter } from 'vs/base/common/event';
import { patternsEquals } from 'vs/base/common/glob';
import { Disposable } from 'vs/base/common/lifecycle';
import { isLinux } from 'vs/base/common/platform';
import { NodeJSFileWatcherLibrary } from 'vs/platform/files/node/watcher/nodejs/nodejsWatcherLib';
export class NodeJSWatcher extends Disposable {
    _onDidChangeFile = this._register(new Emitter());
    onDidChangeFile = this._onDidChangeFile.event;
    _onDidLogMessage = this._register(new Emitter());
    onDidLogMessage = this._onDidLogMessage.event;
    onDidError = Event.None;
    watchers = new Map();
    verboseLogging = false;
    async watch(requests) {
        // Figure out duplicates to remove from the requests
        const normalizedRequests = this.normalizeRequests(requests);
        // Gather paths that we should start watching
        const requestsToStartWatching = normalizedRequests.filter(request => {
            const watcher = this.watchers.get(request.path);
            if (!watcher) {
                return true; // not yet watching that path
            }
            // Re-watch path if excludes or includes have changed
            return !patternsEquals(watcher.request.excludes, request.excludes) || !patternsEquals(watcher.request.includes, request.includes);
        });
        // Gather paths that we should stop watching
        const pathsToStopWatching = Array.from(this.watchers.values()).filter(({ request }) => {
            return !normalizedRequests.find(normalizedRequest => normalizedRequest.path === request.path && patternsEquals(normalizedRequest.excludes, request.excludes) && patternsEquals(normalizedRequest.includes, request.includes));
        }).map(({ request }) => request.path);
        // Logging
        if (requestsToStartWatching.length) {
            this.trace(`Request to start watching: ${requestsToStartWatching.map(request => `${request.path} (excludes: ${request.excludes.length > 0 ? request.excludes : '<none>'}, includes: ${request.includes && request.includes.length > 0 ? JSON.stringify(request.includes) : '<all>'})`).join(',')}`);
        }
        if (pathsToStopWatching.length) {
            this.trace(`Request to stop watching: ${pathsToStopWatching.join(',')}`);
        }
        // Stop watching as instructed
        for (const pathToStopWatching of pathsToStopWatching) {
            this.stopWatching(pathToStopWatching);
        }
        // Start watching as instructed
        for (const request of requestsToStartWatching) {
            this.startWatching(request);
        }
    }
    startWatching(request) {
        // Start via node.js lib
        const instance = new NodeJSFileWatcherLibrary(request, changes => this._onDidChangeFile.fire(changes), msg => this._onDidLogMessage.fire(msg), this.verboseLogging);
        // Remember as watcher instance
        const watcher = { request, instance };
        this.watchers.set(request.path, watcher);
    }
    async stop() {
        for (const [path] of this.watchers) {
            this.stopWatching(path);
        }
        this.watchers.clear();
    }
    stopWatching(path) {
        const watcher = this.watchers.get(path);
        if (watcher) {
            this.watchers.delete(path);
            watcher.instance.dispose();
        }
    }
    normalizeRequests(requests) {
        const requestsMap = new Map();
        // Ignore requests for the same paths
        for (const request of requests) {
            const path = isLinux ? request.path : request.path.toLowerCase(); // adjust for case sensitivity
            requestsMap.set(path, request);
        }
        return Array.from(requestsMap.values());
    }
    async setVerboseLogging(enabled) {
        this.verboseLogging = enabled;
        for (const [, watcher] of this.watchers) {
            watcher.instance.setVerboseLogging(enabled);
        }
    }
    trace(message) {
        if (this.verboseLogging) {
            this._onDidLogMessage.fire({ type: 'trace', message: this.toMessage(message) });
        }
    }
    toMessage(message, watcher) {
        return watcher ? `[File Watcher (node.js)] ${message} (path: ${watcher.request.path})` : `[File Watcher (node.js)] ${message}`;
    }
}
