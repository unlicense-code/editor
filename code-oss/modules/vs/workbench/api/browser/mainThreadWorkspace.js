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
import { isCancellationError } from 'vs/base/common/errors';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { isNative } from 'vs/base/common/platform';
import { withNullAsUndefined } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IRequestService } from 'vs/platform/request/common/request';
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { IWorkspaceContextService, isUntitledWorkspace } from 'vs/platform/workspace/common/workspace';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { checkGlobFileExists } from 'vs/workbench/services/extensions/common/workspaceContains';
import { QueryBuilder } from 'vs/workbench/services/search/common/queryBuilder';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ISearchService } from 'vs/workbench/services/search/common/search';
import { IWorkspaceEditingService } from 'vs/workbench/services/workspaces/common/workspaceEditing';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
import { IEditSessionIdentityService } from 'vs/platform/workspace/common/editSessions';
let MainThreadWorkspace = class MainThreadWorkspace {
    _searchService;
    _contextService;
    _editSessionIdentityService;
    _editorService;
    _workspaceEditingService;
    _notificationService;
    _requestService;
    _instantiationService;
    _labelService;
    _environmentService;
    _workspaceTrustManagementService;
    _workspaceTrustRequestService;
    _toDispose = new DisposableStore();
    _activeCancelTokens = Object.create(null);
    _proxy;
    _queryBuilder = this._instantiationService.createInstance(QueryBuilder);
    constructor(extHostContext, _searchService, _contextService, _editSessionIdentityService, _editorService, _workspaceEditingService, _notificationService, _requestService, _instantiationService, _labelService, _environmentService, fileService, _workspaceTrustManagementService, _workspaceTrustRequestService) {
        this._searchService = _searchService;
        this._contextService = _contextService;
        this._editSessionIdentityService = _editSessionIdentityService;
        this._editorService = _editorService;
        this._workspaceEditingService = _workspaceEditingService;
        this._notificationService = _notificationService;
        this._requestService = _requestService;
        this._instantiationService = _instantiationService;
        this._labelService = _labelService;
        this._environmentService = _environmentService;
        this._workspaceTrustManagementService = _workspaceTrustManagementService;
        this._workspaceTrustRequestService = _workspaceTrustRequestService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostWorkspace);
        const workspace = this._contextService.getWorkspace();
        // The workspace file is provided be a unknown file system provider. It might come
        // from the extension host. So initialize now knowing that `rootPath` is undefined.
        if (workspace.configuration && !isNative && !fileService.hasProvider(workspace.configuration)) {
            this._proxy.$initializeWorkspace(this.getWorkspaceData(workspace), this.isWorkspaceTrusted());
        }
        else {
            this._contextService.getCompleteWorkspace().then(workspace => this._proxy.$initializeWorkspace(this.getWorkspaceData(workspace), this.isWorkspaceTrusted()));
        }
        this._contextService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspace, this, this._toDispose);
        this._contextService.onDidChangeWorkbenchState(this._onDidChangeWorkspace, this, this._toDispose);
        this._workspaceTrustManagementService.onDidChangeTrust(this._onDidGrantWorkspaceTrust, this, this._toDispose);
    }
    dispose() {
        this._toDispose.dispose();
        for (const requestId in this._activeCancelTokens) {
            const tokenSource = this._activeCancelTokens[requestId];
            tokenSource.cancel();
        }
    }
    // --- workspace ---
    $updateWorkspaceFolders(extensionName, index, deleteCount, foldersToAdd) {
        const workspaceFoldersToAdd = foldersToAdd.map(f => ({ uri: URI.revive(f.uri), name: f.name }));
        // Indicate in status message
        this._notificationService.status(this.getStatusMessage(extensionName, workspaceFoldersToAdd.length, deleteCount), { hideAfter: 10 * 1000 /* 10s */ });
        return this._workspaceEditingService.updateFolders(index, deleteCount, workspaceFoldersToAdd, true);
    }
    getStatusMessage(extensionName, addCount, removeCount) {
        let message;
        const wantsToAdd = addCount > 0;
        const wantsToDelete = removeCount > 0;
        // Add Folders
        if (wantsToAdd && !wantsToDelete) {
            if (addCount === 1) {
                message = localize('folderStatusMessageAddSingleFolder', "Extension '{0}' added 1 folder to the workspace", extensionName);
            }
            else {
                message = localize('folderStatusMessageAddMultipleFolders', "Extension '{0}' added {1} folders to the workspace", extensionName, addCount);
            }
        }
        // Delete Folders
        else if (wantsToDelete && !wantsToAdd) {
            if (removeCount === 1) {
                message = localize('folderStatusMessageRemoveSingleFolder', "Extension '{0}' removed 1 folder from the workspace", extensionName);
            }
            else {
                message = localize('folderStatusMessageRemoveMultipleFolders', "Extension '{0}' removed {1} folders from the workspace", extensionName, removeCount);
            }
        }
        // Change Folders
        else {
            message = localize('folderStatusChangeFolder', "Extension '{0}' changed folders of the workspace", extensionName);
        }
        return message;
    }
    _onDidChangeWorkspace() {
        this._proxy.$acceptWorkspaceData(this.getWorkspaceData(this._contextService.getWorkspace()));
    }
    getWorkspaceData(workspace) {
        if (this._contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
            return null;
        }
        return {
            configuration: workspace.configuration || undefined,
            isUntitled: workspace.configuration ? isUntitledWorkspace(workspace.configuration, this._environmentService) : false,
            folders: workspace.folders,
            id: workspace.id,
            name: this._labelService.getWorkspaceLabel(workspace),
            transient: workspace.transient
        };
    }
    // --- search ---
    $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
        const includeFolder = URI.revive(_includeFolder);
        const workspace = this._contextService.getWorkspace();
        if (!workspace.folders.length) {
            return Promise.resolve(null);
        }
        const query = this._queryBuilder.file(includeFolder ? [includeFolder] : workspace.folders, {
            maxResults: withNullAsUndefined(maxResults),
            disregardExcludeSettings: (excludePatternOrDisregardExcludes === false) || undefined,
            disregardSearchExcludeSettings: true,
            disregardIgnoreFiles: true,
            includePattern: withNullAsUndefined(includePattern),
            excludePattern: typeof excludePatternOrDisregardExcludes === 'string' ? excludePatternOrDisregardExcludes : undefined,
            _reason: 'startFileSearch'
        });
        return this._searchService.fileSearch(query, token).then(result => {
            return result.results.map(m => m.resource);
        }, err => {
            if (!isCancellationError(err)) {
                return Promise.reject(err);
            }
            return null;
        });
    }
    $startTextSearch(pattern, _folder, options, requestId, token) {
        const folder = URI.revive(_folder);
        const workspace = this._contextService.getWorkspace();
        const folders = folder ? [folder] : workspace.folders.map(folder => folder.uri);
        const query = this._queryBuilder.text(pattern, folders, options);
        query._reason = 'startTextSearch';
        const onProgress = (p) => {
            if (p.results) {
                this._proxy.$handleTextSearchResult(p, requestId);
            }
        };
        const search = this._searchService.textSearch(query, token, onProgress).then(result => {
            return { limitHit: result.limitHit };
        }, err => {
            if (!isCancellationError(err)) {
                return Promise.reject(err);
            }
            return null;
        });
        return search;
    }
    $checkExists(folders, includes, token) {
        return this._instantiationService.invokeFunction((accessor) => checkGlobFileExists(accessor, folders, includes, token));
    }
    // --- save & edit resources ---
    $saveAll(includeUntitled) {
        return this._editorService.saveAll({ includeUntitled });
    }
    $resolveProxy(url) {
        return this._requestService.resolveProxy(url);
    }
    // --- trust ---
    $requestWorkspaceTrust(options) {
        return this._workspaceTrustRequestService.requestWorkspaceTrust(options);
    }
    isWorkspaceTrusted() {
        return this._workspaceTrustManagementService.isWorkspaceTrusted();
    }
    _onDidGrantWorkspaceTrust() {
        this._proxy.$onDidGrantWorkspaceTrust();
    }
    // --- edit sessions ---
    registeredEditSessionProviders = new Map();
    $registerEditSessionIdentityProvider(handle, scheme) {
        const disposable = this._editSessionIdentityService.registerEditSessionIdentityProvider({
            scheme: scheme,
            getEditSessionIdentifier: async (workspaceFolder, token) => {
                return this._proxy.$getEditSessionIdentifier(workspaceFolder.uri, token);
            },
            provideEditSessionIdentityMatch: async (workspaceFolder, identity1, identity2, token) => {
                return this._proxy.$provideEditSessionIdentityMatch(workspaceFolder.uri, identity1, identity2, token);
            }
        });
        this.registeredEditSessionProviders.set(handle, disposable);
        this._toDispose.add(disposable);
    }
    $unregisterEditSessionIdentityProvider(handle) {
        const disposable = this.registeredEditSessionProviders.get(handle);
        disposable?.dispose();
        this.registeredEditSessionProviders.delete(handle);
    }
};
MainThreadWorkspace = __decorate([
    extHostNamedCustomer(MainContext.MainThreadWorkspace),
    __param(1, ISearchService),
    __param(2, IWorkspaceContextService),
    __param(3, IEditSessionIdentityService),
    __param(4, IEditorService),
    __param(5, IWorkspaceEditingService),
    __param(6, INotificationService),
    __param(7, IRequestService),
    __param(8, IInstantiationService),
    __param(9, ILabelService),
    __param(10, IEnvironmentService),
    __param(11, IFileService),
    __param(12, IWorkspaceTrustManagementService),
    __param(13, IWorkspaceTrustRequestService)
], MainThreadWorkspace);
export { MainThreadWorkspace };
