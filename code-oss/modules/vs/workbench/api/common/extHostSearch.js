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
import { toDisposable } from 'vs/base/common/lifecycle';
import { MainContext } from '../common/extHost.protocol';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { FileSearchManager } from 'vs/workbench/services/search/common/fileSearchManager';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IURITransformerService } from 'vs/workbench/api/common/extHostUriTransformerService';
import { ILogService } from 'vs/platform/log/common/log';
import { URI } from 'vs/base/common/uri';
import { TextSearchManager } from 'vs/workbench/services/search/common/textSearchManager';
export const IExtHostSearch = createDecorator('IExtHostSearch');
let ExtHostSearch = class ExtHostSearch {
    extHostRpc;
    _uriTransformer;
    _logService;
    _proxy = this.extHostRpc.getProxy(MainContext.MainThreadSearch);
    _handlePool = 0;
    _textSearchProvider = new Map();
    _textSearchUsedSchemes = new Set();
    _fileSearchProvider = new Map();
    _fileSearchUsedSchemes = new Set();
    _fileSearchManager = new FileSearchManager();
    constructor(extHostRpc, _uriTransformer, _logService) {
        this.extHostRpc = extHostRpc;
        this._uriTransformer = _uriTransformer;
        this._logService = _logService;
    }
    _transformScheme(scheme) {
        return this._uriTransformer.transformOutgoingScheme(scheme);
    }
    registerTextSearchProvider(scheme, provider) {
        if (this._textSearchUsedSchemes.has(scheme)) {
            throw new Error(`a text search provider for the scheme '${scheme}' is already registered`);
        }
        this._textSearchUsedSchemes.add(scheme);
        const handle = this._handlePool++;
        this._textSearchProvider.set(handle, provider);
        this._proxy.$registerTextSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._textSearchUsedSchemes.delete(scheme);
            this._textSearchProvider.delete(handle);
            this._proxy.$unregisterProvider(handle);
        });
    }
    registerFileSearchProvider(scheme, provider) {
        if (this._fileSearchUsedSchemes.has(scheme)) {
            throw new Error(`a file search provider for the scheme '${scheme}' is already registered`);
        }
        this._fileSearchUsedSchemes.add(scheme);
        const handle = this._handlePool++;
        this._fileSearchProvider.set(handle, provider);
        this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._fileSearchUsedSchemes.delete(scheme);
            this._fileSearchProvider.delete(handle);
            this._proxy.$unregisterProvider(handle);
        });
    }
    $provideFileSearchResults(handle, session, rawQuery, token) {
        const query = reviveQuery(rawQuery);
        const provider = this._fileSearchProvider.get(handle);
        if (provider) {
            return this._fileSearchManager.fileSearch(query, provider, batch => {
                this._proxy.$handleFileMatch(handle, session, batch.map(p => p.resource));
            }, token);
        }
        else {
            throw new Error('unknown provider: ' + handle);
        }
    }
    $clearCache(cacheKey) {
        this._fileSearchManager.clearCache(cacheKey);
        return Promise.resolve(undefined);
    }
    $provideTextSearchResults(handle, session, rawQuery, token) {
        const provider = this._textSearchProvider.get(handle);
        if (!provider || !provider.provideTextSearchResults) {
            throw new Error(`Unknown provider ${handle}`);
        }
        const query = reviveQuery(rawQuery);
        const engine = this.createTextSearchManager(query, provider);
        return engine.search(progress => this._proxy.$handleTextMatch(handle, session, progress), token);
    }
    $enableExtensionHostSearch() { }
    createTextSearchManager(query, provider) {
        return new TextSearchManager(query, provider, {
            readdir: resource => Promise.resolve([]),
            toCanonicalName: encoding => encoding
        }, 'textSearchProvider');
    }
};
ExtHostSearch = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IURITransformerService),
    __param(2, ILogService)
], ExtHostSearch);
export { ExtHostSearch };
export function reviveQuery(rawQuery) {
    return {
        ...rawQuery,
        ...{
            folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery),
            extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map(components => URI.revive(components))
        }
    };
}
function reviveFolderQuery(rawFolderQuery) {
    return {
        ...rawFolderQuery,
        folder: URI.revive(rawFolderQuery.folder)
    };
}
