/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { delta as arrayDelta, mapArrayOrNot } from 'vs/base/common/arrays';
import { Barrier } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Emitter } from 'vs/base/common/event';
import { toDisposable } from 'vs/base/common/lifecycle';
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { Schemas } from 'vs/base/common/network';
import { Counter } from 'vs/base/common/numbers';
import { basename, basenameOrAuthority, dirname, ExtUri, relativePath } from 'vs/base/common/resources';
import { compare } from 'vs/base/common/strings';
import { withUndefinedAsNull } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { Severity } from 'vs/platform/notification/common/notification';
import { Workspace, WorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { IExtHostFileSystemInfo } from 'vs/workbench/api/common/extHostFileSystemInfo';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { GlobPattern } from 'vs/workbench/api/common/extHostTypeConverters';
import { Range } from 'vs/workbench/api/common/extHostTypes';
import { IURITransformerService } from 'vs/workbench/api/common/extHostUriTransformerService';
import { resultIsMatch } from 'vs/workbench/services/search/common/search';
import { MainContext } from './extHost.protocol';
function isFolderEqual(folderA, folderB, extHostFileSystemInfo) {
    return new ExtUri(uri => ignorePathCasing(uri, extHostFileSystemInfo)).isEqual(folderA, folderB);
}
function compareWorkspaceFolderByUri(a, b, extHostFileSystemInfo) {
    return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? 0 : compare(a.uri.toString(), b.uri.toString());
}
function compareWorkspaceFolderByUriAndNameAndIndex(a, b, extHostFileSystemInfo) {
    if (a.index !== b.index) {
        return a.index < b.index ? -1 : 1;
    }
    return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? compare(a.name, b.name) : compare(a.uri.toString(), b.uri.toString());
}
function delta(oldFolders, newFolders, compare, extHostFileSystemInfo) {
    const oldSortedFolders = oldFolders.slice(0).sort((a, b) => compare(a, b, extHostFileSystemInfo));
    const newSortedFolders = newFolders.slice(0).sort((a, b) => compare(a, b, extHostFileSystemInfo));
    return arrayDelta(oldSortedFolders, newSortedFolders, (a, b) => compare(a, b, extHostFileSystemInfo));
}
function ignorePathCasing(uri, extHostFileSystemInfo) {
    const capabilities = extHostFileSystemInfo.getCapabilities(uri.scheme);
    return !(capabilities && (capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */));
}
class ExtHostWorkspaceImpl extends Workspace {
    _name;
    _isUntitled;
    static toExtHostWorkspace(data, previousConfirmedWorkspace, previousUnconfirmedWorkspace, extHostFileSystemInfo) {
        if (!data) {
            return { workspace: null, added: [], removed: [] };
        }
        const { id, name, folders, configuration, transient, isUntitled } = data;
        const newWorkspaceFolders = [];
        // If we have an existing workspace, we try to find the folders that match our
        // data and update their properties. It could be that an extension stored them
        // for later use and we want to keep them "live" if they are still present.
        const oldWorkspace = previousConfirmedWorkspace;
        if (previousConfirmedWorkspace) {
            folders.forEach((folderData, index) => {
                const folderUri = URI.revive(folderData.uri);
                const existingFolder = ExtHostWorkspaceImpl._findFolder(previousUnconfirmedWorkspace || previousConfirmedWorkspace, folderUri, extHostFileSystemInfo);
                if (existingFolder) {
                    existingFolder.name = folderData.name;
                    existingFolder.index = folderData.index;
                    newWorkspaceFolders.push(existingFolder);
                }
                else {
                    newWorkspaceFolders.push({ uri: folderUri, name: folderData.name, index });
                }
            });
        }
        else {
            newWorkspaceFolders.push(...folders.map(({ uri, name, index }) => ({ uri: URI.revive(uri), name, index })));
        }
        // make sure to restore sort order based on index
        newWorkspaceFolders.sort((f1, f2) => f1.index < f2.index ? -1 : 1);
        const workspace = new ExtHostWorkspaceImpl(id, name, newWorkspaceFolders, !!transient, configuration ? URI.revive(configuration) : null, !!isUntitled, uri => ignorePathCasing(uri, extHostFileSystemInfo));
        const { added, removed } = delta(oldWorkspace ? oldWorkspace.workspaceFolders : [], workspace.workspaceFolders, compareWorkspaceFolderByUri, extHostFileSystemInfo);
        return { workspace, added, removed };
    }
    static _findFolder(workspace, folderUriToFind, extHostFileSystemInfo) {
        for (let i = 0; i < workspace.folders.length; i++) {
            const folder = workspace.workspaceFolders[i];
            if (isFolderEqual(folder.uri, folderUriToFind, extHostFileSystemInfo)) {
                return folder;
            }
        }
        return undefined;
    }
    _workspaceFolders = [];
    _structure;
    constructor(id, _name, folders, transient, configuration, _isUntitled, ignorePathCasing) {
        super(id, folders.map(f => new WorkspaceFolder(f)), transient, configuration, ignorePathCasing);
        this._name = _name;
        this._isUntitled = _isUntitled;
        this._structure = TernarySearchTree.forUris(ignorePathCasing);
        // setup the workspace folder data structure
        folders.forEach(folder => {
            this._workspaceFolders.push(folder);
            this._structure.set(folder.uri, folder);
        });
    }
    get name() {
        return this._name;
    }
    get isUntitled() {
        return this._isUntitled;
    }
    get workspaceFolders() {
        return this._workspaceFolders.slice(0);
    }
    getWorkspaceFolder(uri, resolveParent) {
        if (resolveParent && this._structure.get(uri)) {
            // `uri` is a workspace folder so we check for its parent
            uri = dirname(uri);
        }
        return this._structure.findSubstr(uri);
    }
    resolveWorkspaceFolder(uri) {
        return this._structure.get(uri);
    }
}
let ExtHostWorkspace = class ExtHostWorkspace {
    _serviceBrand;
    _onDidChangeWorkspace = new Emitter();
    onDidChangeWorkspace = this._onDidChangeWorkspace.event;
    _onDidGrantWorkspaceTrust = new Emitter();
    onDidGrantWorkspaceTrust = this._onDidGrantWorkspaceTrust.event;
    _logService;
    _requestIdProvider;
    _barrier;
    _confirmedWorkspace;
    _unconfirmedWorkspace;
    _proxy;
    _messageService;
    _extHostFileSystemInfo;
    _uriTransformerService;
    _activeSearchCallbacks = [];
    _trusted = false;
    _editSessionIdentityProviders = new Map();
    constructor(extHostRpc, initData, extHostFileSystemInfo, logService, uriTransformerService) {
        this._logService = logService;
        this._extHostFileSystemInfo = extHostFileSystemInfo;
        this._uriTransformerService = uriTransformerService;
        this._requestIdProvider = new Counter();
        this._barrier = new Barrier();
        this._proxy = extHostRpc.getProxy(MainContext.MainThreadWorkspace);
        this._messageService = extHostRpc.getProxy(MainContext.MainThreadMessageService);
        const data = initData.workspace;
        this._confirmedWorkspace = data ? new ExtHostWorkspaceImpl(data.id, data.name, [], !!data.transient, data.configuration ? URI.revive(data.configuration) : null, !!data.isUntitled, uri => ignorePathCasing(uri, extHostFileSystemInfo)) : undefined;
    }
    $initializeWorkspace(data, trusted) {
        this._trusted = trusted;
        this.$acceptWorkspaceData(data);
        this._barrier.open();
    }
    waitForInitializeCall() {
        return this._barrier.wait();
    }
    // --- workspace ---
    get workspace() {
        return this._actualWorkspace;
    }
    get name() {
        return this._actualWorkspace ? this._actualWorkspace.name : undefined;
    }
    get workspaceFile() {
        if (this._actualWorkspace) {
            if (this._actualWorkspace.configuration) {
                if (this._actualWorkspace.isUntitled) {
                    return URI.from({ scheme: Schemas.untitled, path: basename(dirname(this._actualWorkspace.configuration)) }); // Untitled Workspace: return untitled URI
                }
                return this._actualWorkspace.configuration; // Workspace: return the configuration location
            }
        }
        return undefined;
    }
    get _actualWorkspace() {
        return this._unconfirmedWorkspace || this._confirmedWorkspace;
    }
    getWorkspaceFolders() {
        if (!this._actualWorkspace) {
            return undefined;
        }
        return this._actualWorkspace.workspaceFolders.slice(0);
    }
    async getWorkspaceFolders2() {
        await this._barrier.wait();
        if (!this._actualWorkspace) {
            return undefined;
        }
        return this._actualWorkspace.workspaceFolders.slice(0);
    }
    updateWorkspaceFolders(extension, index, deleteCount, ...workspaceFoldersToAdd) {
        const validatedDistinctWorkspaceFoldersToAdd = [];
        if (Array.isArray(workspaceFoldersToAdd)) {
            workspaceFoldersToAdd.forEach(folderToAdd => {
                if (URI.isUri(folderToAdd.uri) && !validatedDistinctWorkspaceFoldersToAdd.some(f => isFolderEqual(f.uri, folderToAdd.uri, this._extHostFileSystemInfo))) {
                    validatedDistinctWorkspaceFoldersToAdd.push({ uri: folderToAdd.uri, name: folderToAdd.name || basenameOrAuthority(folderToAdd.uri) });
                }
            });
        }
        if (!!this._unconfirmedWorkspace) {
            return false; // prevent accumulated calls without a confirmed workspace
        }
        if ([index, deleteCount].some(i => typeof i !== 'number' || i < 0)) {
            return false; // validate numbers
        }
        if (deleteCount === 0 && validatedDistinctWorkspaceFoldersToAdd.length === 0) {
            return false; // nothing to delete or add
        }
        const currentWorkspaceFolders = this._actualWorkspace ? this._actualWorkspace.workspaceFolders : [];
        if (index + deleteCount > currentWorkspaceFolders.length) {
            return false; // cannot delete more than we have
        }
        // Simulate the updateWorkspaceFolders method on our data to do more validation
        const newWorkspaceFolders = currentWorkspaceFolders.slice(0);
        newWorkspaceFolders.splice(index, deleteCount, ...validatedDistinctWorkspaceFoldersToAdd.map(f => ({ uri: f.uri, name: f.name || basenameOrAuthority(f.uri), index: undefined /* fixed later */ })));
        for (let i = 0; i < newWorkspaceFolders.length; i++) {
            const folder = newWorkspaceFolders[i];
            if (newWorkspaceFolders.some((otherFolder, index) => index !== i && isFolderEqual(folder.uri, otherFolder.uri, this._extHostFileSystemInfo))) {
                return false; // cannot add the same folder multiple times
            }
        }
        newWorkspaceFolders.forEach((f, index) => f.index = index); // fix index
        const { added, removed } = delta(currentWorkspaceFolders, newWorkspaceFolders, compareWorkspaceFolderByUriAndNameAndIndex, this._extHostFileSystemInfo);
        if (added.length === 0 && removed.length === 0) {
            return false; // nothing actually changed
        }
        // Trigger on main side
        if (this._proxy) {
            const extName = extension.displayName || extension.name;
            this._proxy.$updateWorkspaceFolders(extName, index, deleteCount, validatedDistinctWorkspaceFoldersToAdd).then(undefined, error => {
                // in case of an error, make sure to clear out the unconfirmed workspace
                // because we cannot expect the acknowledgement from the main side for this
                this._unconfirmedWorkspace = undefined;
                // show error to user
                const options = { source: { identifier: extension.identifier, label: extension.displayName || extension.name } };
                this._messageService.$showMessage(Severity.Error, localize('updateerror', "Extension '{0}' failed to update workspace folders: {1}", extName, error.toString()), options, []);
            });
        }
        // Try to accept directly
        this.trySetWorkspaceFolders(newWorkspaceFolders);
        return true;
    }
    getWorkspaceFolder(uri, resolveParent) {
        if (!this._actualWorkspace) {
            return undefined;
        }
        return this._actualWorkspace.getWorkspaceFolder(uri, resolveParent);
    }
    async getWorkspaceFolder2(uri, resolveParent) {
        await this._barrier.wait();
        if (!this._actualWorkspace) {
            return undefined;
        }
        return this._actualWorkspace.getWorkspaceFolder(uri, resolveParent);
    }
    async resolveWorkspaceFolder(uri) {
        await this._barrier.wait();
        if (!this._actualWorkspace) {
            return undefined;
        }
        return this._actualWorkspace.resolveWorkspaceFolder(uri);
    }
    getPath() {
        // this is legacy from the days before having
        // multi-root and we keep it only alive if there
        // is just one workspace folder.
        if (!this._actualWorkspace) {
            return undefined;
        }
        const { folders } = this._actualWorkspace;
        if (folders.length === 0) {
            return undefined;
        }
        // #54483 @Joh Why are we still using fsPath?
        return folders[0].uri.fsPath;
    }
    getRelativePath(pathOrUri, includeWorkspace) {
        let resource;
        let path = '';
        if (typeof pathOrUri === 'string') {
            resource = URI.file(pathOrUri);
            path = pathOrUri;
        }
        else if (typeof pathOrUri !== 'undefined') {
            resource = pathOrUri;
            path = pathOrUri.fsPath;
        }
        if (!resource) {
            return path;
        }
        const folder = this.getWorkspaceFolder(resource, true);
        if (!folder) {
            return path;
        }
        if (typeof includeWorkspace === 'undefined' && this._actualWorkspace) {
            includeWorkspace = this._actualWorkspace.folders.length > 1;
        }
        let result = relativePath(folder.uri, resource);
        if (includeWorkspace && folder.name) {
            result = `${folder.name}/${result}`;
        }
        return result;
    }
    trySetWorkspaceFolders(folders) {
        // Update directly here. The workspace is unconfirmed as long as we did not get an
        // acknowledgement from the main side (via $acceptWorkspaceData)
        if (this._actualWorkspace) {
            this._unconfirmedWorkspace = ExtHostWorkspaceImpl.toExtHostWorkspace({
                id: this._actualWorkspace.id,
                name: this._actualWorkspace.name,
                configuration: this._actualWorkspace.configuration,
                folders,
                isUntitled: this._actualWorkspace.isUntitled
            }, this._actualWorkspace, undefined, this._extHostFileSystemInfo).workspace || undefined;
        }
    }
    $acceptWorkspaceData(data) {
        const { workspace, added, removed } = ExtHostWorkspaceImpl.toExtHostWorkspace(data, this._confirmedWorkspace, this._unconfirmedWorkspace, this._extHostFileSystemInfo);
        // Update our workspace object. We have a confirmed workspace, so we drop our
        // unconfirmed workspace.
        this._confirmedWorkspace = workspace || undefined;
        this._unconfirmedWorkspace = undefined;
        // Events
        this._onDidChangeWorkspace.fire(Object.freeze({
            added,
            removed,
        }));
    }
    // --- search ---
    /**
     * Note, null/undefined have different and important meanings for "exclude"
     */
    findFiles(include, exclude, maxResults, extensionId, token = CancellationToken.None) {
        this._logService.trace(`extHostWorkspace#findFiles: fileSearch, extension: ${extensionId.value}, entryPoint: findFiles`);
        let excludePatternOrDisregardExcludes = undefined;
        if (exclude === null) {
            excludePatternOrDisregardExcludes = false;
        }
        else if (exclude) {
            if (typeof exclude === 'string') {
                excludePatternOrDisregardExcludes = exclude;
            }
            else {
                excludePatternOrDisregardExcludes = exclude.pattern;
            }
        }
        if (token && token.isCancellationRequested) {
            return Promise.resolve([]);
        }
        const { includePattern, folder } = parseSearchInclude(GlobPattern.from(include));
        return this._proxy.$startFileSearch(withUndefinedAsNull(includePattern), withUndefinedAsNull(folder), withUndefinedAsNull(excludePatternOrDisregardExcludes), withUndefinedAsNull(maxResults), token)
            .then(data => Array.isArray(data) ? data.map(d => URI.revive(d)) : []);
    }
    async findTextInFiles(query, options, callback, extensionId, token = CancellationToken.None) {
        this._logService.trace(`extHostWorkspace#findTextInFiles: textSearch, extension: ${extensionId.value}, entryPoint: findTextInFiles`);
        const requestId = this._requestIdProvider.getNext();
        const previewOptions = typeof options.previewOptions === 'undefined' ?
            {
                matchLines: 100,
                charsPerLine: 10000
            } :
            options.previewOptions;
        const { includePattern, folder } = parseSearchInclude(GlobPattern.from(options.include));
        const excludePattern = (typeof options.exclude === 'string') ? options.exclude :
            options.exclude ? options.exclude.pattern : undefined;
        const queryOptions = {
            ignoreSymlinks: typeof options.followSymlinks === 'boolean' ? !options.followSymlinks : undefined,
            disregardIgnoreFiles: typeof options.useIgnoreFiles === 'boolean' ? !options.useIgnoreFiles : undefined,
            disregardGlobalIgnoreFiles: typeof options.useGlobalIgnoreFiles === 'boolean' ? !options.useGlobalIgnoreFiles : undefined,
            disregardParentIgnoreFiles: typeof options.useParentIgnoreFiles === 'boolean' ? !options.useParentIgnoreFiles : undefined,
            disregardExcludeSettings: typeof options.useDefaultExcludes === 'boolean' ? !options.useDefaultExcludes : true,
            fileEncoding: options.encoding,
            maxResults: options.maxResults,
            previewOptions,
            afterContext: options.afterContext,
            beforeContext: options.beforeContext,
            includePattern: includePattern,
            excludePattern: excludePattern
        };
        const isCanceled = false;
        this._activeSearchCallbacks[requestId] = p => {
            if (isCanceled) {
                return;
            }
            const uri = URI.revive(p.resource);
            p.results.forEach(result => {
                if (resultIsMatch(result)) {
                    callback({
                        uri,
                        preview: {
                            text: result.preview.text,
                            matches: mapArrayOrNot(result.preview.matches, m => new Range(m.startLineNumber, m.startColumn, m.endLineNumber, m.endColumn))
                        },
                        ranges: mapArrayOrNot(result.ranges, r => new Range(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn))
                    });
                }
                else {
                    callback({
                        uri,
                        text: result.text,
                        lineNumber: result.lineNumber
                    });
                }
            });
        };
        if (token.isCancellationRequested) {
            return {};
        }
        try {
            const result = await this._proxy.$startTextSearch(query, withUndefinedAsNull(folder), queryOptions, requestId, token);
            delete this._activeSearchCallbacks[requestId];
            return result || {};
        }
        catch (err) {
            delete this._activeSearchCallbacks[requestId];
            throw err;
        }
    }
    $handleTextSearchResult(result, requestId) {
        this._activeSearchCallbacks[requestId]?.(result);
    }
    saveAll(includeUntitled) {
        return this._proxy.$saveAll(includeUntitled);
    }
    resolveProxy(url) {
        return this._proxy.$resolveProxy(url);
    }
    // --- trust ---
    get trusted() {
        return this._trusted;
    }
    requestWorkspaceTrust(options) {
        return this._proxy.$requestWorkspaceTrust(options);
    }
    $onDidGrantWorkspaceTrust() {
        if (!this._trusted) {
            this._trusted = true;
            this._onDidGrantWorkspaceTrust.fire();
        }
    }
    // --- edit sessions ---
    _providerHandlePool = 0;
    // called by ext host
    registerEditSessionIdentityProvider(scheme, provider) {
        if (this._editSessionIdentityProviders.has(scheme)) {
            throw new Error(`A provider has already been registered for scheme ${scheme}`);
        }
        this._editSessionIdentityProviders.set(scheme, provider);
        const outgoingScheme = this._uriTransformerService.transformOutgoingScheme(scheme);
        const handle = this._providerHandlePool++;
        this._proxy.$registerEditSessionIdentityProvider(handle, outgoingScheme);
        return toDisposable(() => {
            this._editSessionIdentityProviders.delete(scheme);
            this._proxy.$unregisterEditSessionIdentityProvider(handle);
        });
    }
    // called by main thread
    async $getEditSessionIdentifier(workspaceFolder, cancellationToken) {
        this._logService.info('Getting edit session identifier for workspaceFolder', workspaceFolder);
        const folder = await this.resolveWorkspaceFolder(URI.revive(workspaceFolder));
        if (!folder) {
            this._logService.warn('Unable to resolve workspace folder');
            return undefined;
        }
        this._logService.info('Invoking #provideEditSessionIdentity for workspaceFolder', folder);
        const provider = this._editSessionIdentityProviders.get(folder.uri.scheme);
        this._logService.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
        if (!provider) {
            return undefined;
        }
        const result = await provider.provideEditSessionIdentity(folder, cancellationToken);
        this._logService.info('Provider returned edit session identifier: ', result);
        if (!result) {
            return undefined;
        }
        return result;
    }
    async $provideEditSessionIdentityMatch(workspaceFolder, identity1, identity2, cancellationToken) {
        this._logService.info('Getting edit session identifier for workspaceFolder', workspaceFolder);
        const folder = await this.resolveWorkspaceFolder(URI.revive(workspaceFolder));
        if (!folder) {
            this._logService.warn('Unable to resolve workspace folder');
            return undefined;
        }
        this._logService.info('Invoking #provideEditSessionIdentity for workspaceFolder', folder);
        const provider = this._editSessionIdentityProviders.get(folder.uri.scheme);
        this._logService.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
        if (!provider) {
            return undefined;
        }
        const result = await provider.provideEditSessionIdentityMatch?.(identity1, identity2, cancellationToken);
        this._logService.info('Provider returned edit session identifier match result: ', result);
        if (!result) {
            return undefined;
        }
        return result;
    }
};
ExtHostWorkspace = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IExtHostInitDataService),
    __param(2, IExtHostFileSystemInfo),
    __param(3, ILogService),
    __param(4, IURITransformerService)
], ExtHostWorkspace);
export { ExtHostWorkspace };
export const IExtHostWorkspace = createDecorator('IExtHostWorkspace');
function parseSearchInclude(include) {
    let includePattern;
    let includeFolder;
    if (include) {
        if (typeof include === 'string') {
            includePattern = include;
        }
        else {
            includePattern = include.pattern;
            includeFolder = URI.revive(include.baseUri);
        }
    }
    return {
        includePattern,
        folder: includeFolder
    };
}
