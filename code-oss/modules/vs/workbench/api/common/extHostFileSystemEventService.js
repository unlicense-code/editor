/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter, AsyncEmitter } from 'vs/base/common/event';
import { GLOBSTAR, GLOB_SPLIT, parse } from 'vs/base/common/glob';
import { URI } from 'vs/base/common/uri';
import { MainContext } from './extHost.protocol';
import * as typeConverter from './extHostTypeConverters';
import { Disposable, WorkspaceEdit } from './extHostTypes';
class FileSystemWatcher {
    _onDidCreate = new Emitter();
    _onDidChange = new Emitter();
    _onDidDelete = new Emitter();
    _disposable;
    _config;
    get ignoreCreateEvents() {
        return Boolean(this._config & 0b001);
    }
    get ignoreChangeEvents() {
        return Boolean(this._config & 0b010);
    }
    get ignoreDeleteEvents() {
        return Boolean(this._config & 0b100);
    }
    constructor(mainContext, workspace, extension, dispatcher, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
        const watcherDisposable = this.ensureWatching(mainContext, extension, globPattern);
        this._config = 0;
        if (ignoreCreateEvents) {
            this._config += 0b001;
        }
        if (ignoreChangeEvents) {
            this._config += 0b010;
        }
        if (ignoreDeleteEvents) {
            this._config += 0b100;
        }
        const parsedPattern = parse(globPattern);
        // 1.64.x behaviour change: given the new support to watch any folder
        // we start to ignore events outside the workspace when only a string
        // pattern is provided to avoid sending events to extensions that are
        // unexpected.
        // https://github.com/microsoft/vscode/issues/3025
        const excludeOutOfWorkspaceEvents = typeof globPattern === 'string';
        const subscription = dispatcher(events => {
            if (!ignoreCreateEvents) {
                for (const created of events.created) {
                    const uri = URI.revive(created);
                    if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                        this._onDidCreate.fire(uri);
                    }
                }
            }
            if (!ignoreChangeEvents) {
                for (const changed of events.changed) {
                    const uri = URI.revive(changed);
                    if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                        this._onDidChange.fire(uri);
                    }
                }
            }
            if (!ignoreDeleteEvents) {
                for (const deleted of events.deleted) {
                    const uri = URI.revive(deleted);
                    if (parsedPattern(uri.fsPath) && (!excludeOutOfWorkspaceEvents || workspace.getWorkspaceFolder(uri))) {
                        this._onDidDelete.fire(uri);
                    }
                }
            }
        });
        this._disposable = Disposable.from(watcherDisposable, this._onDidCreate, this._onDidChange, this._onDidDelete, subscription);
    }
    ensureWatching(mainContext, extension, globPattern) {
        const disposable = Disposable.from();
        if (typeof globPattern === 'string') {
            return disposable; // a pattern alone does not carry sufficient information to start watching anything
        }
        const proxy = mainContext.getProxy(MainContext.MainThreadFileSystem);
        let recursive = false;
        if (globPattern.pattern.includes(GLOBSTAR) || globPattern.pattern.includes(GLOB_SPLIT)) {
            recursive = true; // only watch recursively if pattern indicates the need for it
        }
        const session = Math.random();
        proxy.$watch(extension.identifier.value, session, globPattern.baseUri, { recursive, excludes: [] /* excludes are not yet surfaced in the API */ });
        return Disposable.from({ dispose: () => proxy.$unwatch(session) });
    }
    dispose() {
        this._disposable.dispose();
    }
    get onDidCreate() {
        return this._onDidCreate.event;
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    get onDidDelete() {
        return this._onDidDelete.event;
    }
}
export class ExtHostFileSystemEventService {
    _mainContext;
    _logService;
    _extHostDocumentsAndEditors;
    _onFileSystemEvent = new Emitter();
    _onDidRenameFile = new Emitter();
    _onDidCreateFile = new Emitter();
    _onDidDeleteFile = new Emitter();
    _onWillRenameFile = new AsyncEmitter();
    _onWillCreateFile = new AsyncEmitter();
    _onWillDeleteFile = new AsyncEmitter();
    onDidRenameFile = this._onDidRenameFile.event;
    onDidCreateFile = this._onDidCreateFile.event;
    onDidDeleteFile = this._onDidDeleteFile.event;
    constructor(_mainContext, _logService, _extHostDocumentsAndEditors) {
        this._mainContext = _mainContext;
        this._logService = _logService;
        this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
        //
    }
    //--- file events
    createFileSystemWatcher(workspace, extension, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
        return new FileSystemWatcher(this._mainContext, workspace, extension, this._onFileSystemEvent.event, typeConverter.GlobPattern.from(globPattern), ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
    }
    $onFileEvent(events) {
        this._onFileSystemEvent.fire(events);
    }
    //--- file operations
    $onDidRunFileOperation(operation, files) {
        switch (operation) {
            case 2 /* FileOperation.MOVE */:
                this._onDidRenameFile.fire(Object.freeze({ files: files.map(f => ({ oldUri: URI.revive(f.source), newUri: URI.revive(f.target) })) }));
                break;
            case 1 /* FileOperation.DELETE */:
                this._onDidDeleteFile.fire(Object.freeze({ files: files.map(f => URI.revive(f.target)) }));
                break;
            case 0 /* FileOperation.CREATE */:
            case 3 /* FileOperation.COPY */:
                this._onDidCreateFile.fire(Object.freeze({ files: files.map(f => URI.revive(f.target)) }));
                break;
            default:
            //ignore, dont send
        }
    }
    getOnWillRenameFileEvent(extension) {
        return this._createWillExecuteEvent(extension, this._onWillRenameFile);
    }
    getOnWillCreateFileEvent(extension) {
        return this._createWillExecuteEvent(extension, this._onWillCreateFile);
    }
    getOnWillDeleteFileEvent(extension) {
        return this._createWillExecuteEvent(extension, this._onWillDeleteFile);
    }
    _createWillExecuteEvent(extension, emitter) {
        return (listener, thisArg, disposables) => {
            const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
            wrappedListener.extension = extension;
            return emitter.event(wrappedListener, undefined, disposables);
        };
    }
    async $onWillRunFileOperation(operation, files, timeout, token) {
        switch (operation) {
            case 2 /* FileOperation.MOVE */:
                return await this._fireWillEvent(this._onWillRenameFile, { files: files.map(f => ({ oldUri: URI.revive(f.source), newUri: URI.revive(f.target) })) }, timeout, token);
            case 1 /* FileOperation.DELETE */:
                return await this._fireWillEvent(this._onWillDeleteFile, { files: files.map(f => URI.revive(f.target)) }, timeout, token);
            case 0 /* FileOperation.CREATE */:
            case 3 /* FileOperation.COPY */:
                return await this._fireWillEvent(this._onWillCreateFile, { files: files.map(f => URI.revive(f.target)) }, timeout, token);
        }
        return undefined;
    }
    async _fireWillEvent(emitter, data, timeout, token) {
        const extensionNames = new Set();
        const edits = [];
        await emitter.fireAsync(data, token, async (thenable, listener) => {
            // ignore all results except for WorkspaceEdits. Those are stored in an array.
            const now = Date.now();
            const result = await Promise.resolve(thenable);
            if (result instanceof WorkspaceEdit) {
                edits.push([listener.extension, result]);
                extensionNames.add(listener.extension.displayName ?? listener.extension.identifier.value);
            }
            if (Date.now() - now > timeout) {
                this._logService.warn('SLOW file-participant', listener.extension.identifier);
            }
        });
        if (token.isCancellationRequested) {
            return undefined;
        }
        if (edits.length === 0) {
            return undefined;
        }
        // concat all WorkspaceEdits collected via waitUntil-call and send them over to the renderer
        const dto = { edits: [] };
        for (const [, edit] of edits) {
            const { edits } = typeConverter.WorkspaceEdit.from(edit, {
                getTextDocumentVersion: uri => this._extHostDocumentsAndEditors.getDocument(uri)?.version,
                getNotebookDocumentVersion: () => undefined,
            });
            dto.edits = dto.edits.concat(edits);
        }
        return { edit: dto, extensionNames: Array.from(extensionNames) };
    }
}
