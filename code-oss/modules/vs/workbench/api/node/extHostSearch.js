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
import { Schemas } from 'vs/base/common/network';
import { URI } from 'vs/base/common/uri';
import * as pfs from 'vs/base/node/pfs';
import { ILogService } from 'vs/platform/log/common/log';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ExtHostSearch, reviveQuery } from 'vs/workbench/api/common/extHostSearch';
import { IURITransformerService } from 'vs/workbench/api/common/extHostUriTransformerService';
import { isSerializedFileMatch } from 'vs/workbench/services/search/common/search';
import { SearchService } from 'vs/workbench/services/search/node/rawSearchService';
import { RipgrepSearchProvider } from 'vs/workbench/services/search/node/ripgrepSearchProvider';
import { OutputChannel } from 'vs/workbench/services/search/node/ripgrepSearchUtils';
import { NativeTextSearchManager } from 'vs/workbench/services/search/node/textSearchManager';
let NativeExtHostSearch = class NativeExtHostSearch extends ExtHostSearch {
    _pfs = pfs; // allow extending for tests
    _internalFileSearchHandle = -1;
    _internalFileSearchProvider = null;
    _registeredEHSearchProvider = false;
    constructor(extHostRpc, initData, _uriTransformer, _logService) {
        super(extHostRpc, _uriTransformer, _logService);
        const outputChannel = new OutputChannel('RipgrepSearchUD', this._logService);
        this.registerTextSearchProvider(Schemas.vscodeUserData, new RipgrepSearchProvider(outputChannel));
        if (initData.remote.isRemote && initData.remote.authority) {
            this._registerEHSearchProviders();
        }
    }
    $enableExtensionHostSearch() {
        this._registerEHSearchProviders();
    }
    _registerEHSearchProviders() {
        if (this._registeredEHSearchProvider) {
            return;
        }
        this._registeredEHSearchProvider = true;
        const outputChannel = new OutputChannel('RipgrepSearchEH', this._logService);
        this.registerTextSearchProvider(Schemas.file, new RipgrepSearchProvider(outputChannel));
        this.registerInternalFileSearchProvider(Schemas.file, new SearchService('fileSearchProvider'));
    }
    registerInternalFileSearchProvider(scheme, provider) {
        const handle = this._handlePool++;
        this._internalFileSearchProvider = provider;
        this._internalFileSearchHandle = handle;
        this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._internalFileSearchProvider = null;
            this._proxy.$unregisterProvider(handle);
        });
    }
    $provideFileSearchResults(handle, session, rawQuery, token) {
        const query = reviveQuery(rawQuery);
        if (handle === this._internalFileSearchHandle) {
            return this.doInternalFileSearch(handle, session, query, token);
        }
        return super.$provideFileSearchResults(handle, session, rawQuery, token);
    }
    doInternalFileSearch(handle, session, rawQuery, token) {
        const onResult = (ev) => {
            if (isSerializedFileMatch(ev)) {
                ev = [ev];
            }
            if (Array.isArray(ev)) {
                this._proxy.$handleFileMatch(handle, session, ev.map(m => URI.file(m.path)));
                return;
            }
            if (ev.message) {
                this._logService.debug('ExtHostSearch', ev.message);
            }
        };
        if (!this._internalFileSearchProvider) {
            throw new Error('No internal file search handler');
        }
        return this._internalFileSearchProvider.doFileSearch(rawQuery, onResult, token);
    }
    $clearCache(cacheKey) {
        this._internalFileSearchProvider?.clearCache(cacheKey);
        return super.$clearCache(cacheKey);
    }
    createTextSearchManager(query, provider) {
        return new NativeTextSearchManager(query, provider, undefined, 'textSearchProvider');
    }
};
NativeExtHostSearch = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IExtHostInitDataService),
    __param(2, IURITransformerService),
    __param(3, ILogService)
], NativeExtHostSearch);
export { NativeExtHostSearch };
