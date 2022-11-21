/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { GLOBSTAR, parse } from 'vs/base/common/glob';
import { Disposable, DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { isAbsolute } from 'vs/base/common/path';
import { isLinux } from 'vs/base/common/platform';
import { URI as uri } from 'vs/base/common/uri';
import { isParent } from 'vs/platform/files/common/files';
export function isRecursiveWatchRequest(request) {
    return request.recursive === true;
}
export class AbstractWatcherClient extends Disposable {
    onFileChanges;
    onLogMessage;
    verboseLogging;
    options;
    static MAX_RESTARTS = 5;
    watcher;
    watcherDisposables = this._register(new MutableDisposable());
    requests = undefined;
    restartCounter = 0;
    constructor(onFileChanges, onLogMessage, verboseLogging, options) {
        super();
        this.onFileChanges = onFileChanges;
        this.onLogMessage = onLogMessage;
        this.verboseLogging = verboseLogging;
        this.options = options;
    }
    init() {
        // Associate disposables to the watcher
        const disposables = new DisposableStore();
        this.watcherDisposables.value = disposables;
        // Ask implementors to create the watcher
        this.watcher = this.createWatcher(disposables);
        this.watcher.setVerboseLogging(this.verboseLogging);
        // Wire in event handlers
        disposables.add(this.watcher.onDidChangeFile(changes => this.onFileChanges(changes)));
        disposables.add(this.watcher.onDidLogMessage(msg => this.onLogMessage(msg)));
        disposables.add(this.watcher.onDidError(error => this.onError(error)));
    }
    onError(error) {
        // Restart on error (up to N times, if enabled)
        if (this.options.restartOnError) {
            if (this.restartCounter < AbstractWatcherClient.MAX_RESTARTS && this.requests) {
                this.error(`restarting watcher after error: ${error}`);
                this.restart(this.requests);
            }
            else {
                this.error(`gave up attempting to restart watcher after error: ${error}`);
            }
        }
        // Do not attempt to restart if not enabled
        else {
            this.error(error);
        }
    }
    restart(requests) {
        this.restartCounter++;
        this.init();
        this.watch(requests);
    }
    async watch(requests) {
        this.requests = requests;
        await this.watcher?.watch(requests);
    }
    async setVerboseLogging(verboseLogging) {
        this.verboseLogging = verboseLogging;
        await this.watcher?.setVerboseLogging(verboseLogging);
    }
    error(message) {
        this.onLogMessage({ type: 'error', message: `[File Watcher (${this.options.type})] ${message}` });
    }
    dispose() {
        // Render the watcher invalid from here
        this.watcher = undefined;
        return super.dispose();
    }
}
export class AbstractNonRecursiveWatcherClient extends AbstractWatcherClient {
    constructor(onFileChanges, onLogMessage, verboseLogging) {
        super(onFileChanges, onLogMessage, verboseLogging, { type: 'node.js', restartOnError: false });
    }
}
export class AbstractUniversalWatcherClient extends AbstractWatcherClient {
    constructor(onFileChanges, onLogMessage, verboseLogging) {
        super(onFileChanges, onLogMessage, verboseLogging, { type: 'universal', restartOnError: true });
    }
}
export function toFileChanges(changes) {
    return changes.map(change => ({
        type: change.type,
        resource: uri.file(change.path)
    }));
}
export function coalesceEvents(changes) {
    // Build deltas
    const coalescer = new EventCoalescer();
    for (const event of changes) {
        coalescer.processEvent(event);
    }
    return coalescer.coalesce();
}
export function normalizeWatcherPattern(path, pattern) {
    // Patterns are always matched on the full absolute path
    // of the event. As such, if the pattern is not absolute
    // and is a string and does not start with a leading
    // `**`, we have to convert it to a relative pattern with
    // the given `base`
    if (typeof pattern === 'string' && !pattern.startsWith(GLOBSTAR) && !isAbsolute(pattern)) {
        return { base: path, pattern };
    }
    return pattern;
}
export function parseWatcherPatterns(path, patterns) {
    const parsedPatterns = [];
    for (const pattern of patterns) {
        parsedPatterns.push(parse(normalizeWatcherPattern(path, pattern)));
    }
    return parsedPatterns;
}
class EventCoalescer {
    coalesced = new Set();
    mapPathToChange = new Map();
    toKey(event) {
        if (isLinux) {
            return event.path;
        }
        return event.path.toLowerCase(); // normalise to file system case sensitivity
    }
    processEvent(event) {
        const existingEvent = this.mapPathToChange.get(this.toKey(event));
        let keepEvent = false;
        // Event path already exists
        if (existingEvent) {
            const currentChangeType = existingEvent.type;
            const newChangeType = event.type;
            // macOS/Windows: track renames to different case
            // by keeping both CREATE and DELETE events
            if (existingEvent.path !== event.path && (event.type === 2 /* FileChangeType.DELETED */ || event.type === 1 /* FileChangeType.ADDED */)) {
                keepEvent = true;
            }
            // Ignore CREATE followed by DELETE in one go
            else if (currentChangeType === 1 /* FileChangeType.ADDED */ && newChangeType === 2 /* FileChangeType.DELETED */) {
                this.mapPathToChange.delete(this.toKey(event));
                this.coalesced.delete(existingEvent);
            }
            // Flatten DELETE followed by CREATE into CHANGE
            else if (currentChangeType === 2 /* FileChangeType.DELETED */ && newChangeType === 1 /* FileChangeType.ADDED */) {
                existingEvent.type = 0 /* FileChangeType.UPDATED */;
            }
            // Do nothing. Keep the created event
            else if (currentChangeType === 1 /* FileChangeType.ADDED */ && newChangeType === 0 /* FileChangeType.UPDATED */) { }
            // Otherwise apply change type
            else {
                existingEvent.type = newChangeType;
            }
        }
        // Otherwise keep
        else {
            keepEvent = true;
        }
        if (keepEvent) {
            this.coalesced.add(event);
            this.mapPathToChange.set(this.toKey(event), event);
        }
    }
    coalesce() {
        const addOrChangeEvents = [];
        const deletedPaths = [];
        // This algorithm will remove all DELETE events up to the root folder
        // that got deleted if any. This ensures that we are not producing
        // DELETE events for each file inside a folder that gets deleted.
        //
        // 1.) split ADD/CHANGE and DELETED events
        // 2.) sort short deleted paths to the top
        // 3.) for each DELETE, check if there is a deleted parent and ignore the event in that case
        return Array.from(this.coalesced).filter(e => {
            if (e.type !== 2 /* FileChangeType.DELETED */) {
                addOrChangeEvents.push(e);
                return false; // remove ADD / CHANGE
            }
            return true; // keep DELETE
        }).sort((e1, e2) => {
            return e1.path.length - e2.path.length; // shortest path first
        }).filter(e => {
            if (deletedPaths.some(deletedPath => isParent(e.path, deletedPath, !isLinux /* ignorecase */))) {
                return false; // DELETE is ignored if parent is deleted already
            }
            // otherwise mark as deleted
            deletedPaths.push(e.path);
            return true;
        }).concat(addOrChangeEvents);
    }
}
