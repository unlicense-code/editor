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
import * as arrays from 'vs/base/common/arrays';
import { DeferredPromise } from 'vs/base/common/async';
import { CancellationError } from 'vs/base/common/errors';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { Schemas } from 'vs/base/common/network';
import { StopWatch } from 'vs/base/common/stopwatch';
import { isNumber } from 'vs/base/common/types';
import { IModelService } from 'vs/editor/common/services/model';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { EditorResourceAccessor, SideBySideEditor } from 'vs/workbench/common/editor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { deserializeSearchError, FileMatch, isFileMatch, isProgressMessage, pathIncludedInQuery, SearchErrorCode } from 'vs/workbench/services/search/common/search';
import { addContextToEditorMatches, editorMatchesToTextSearchResults } from 'vs/workbench/services/search/common/searchHelpers';
let SearchService = class SearchService extends Disposable {
    modelService;
    editorService;
    telemetryService;
    logService;
    extensionService;
    fileService;
    uriIdentityService;
    fileSearchProviders = new Map();
    textSearchProviders = new Map();
    deferredFileSearchesByScheme = new Map();
    deferredTextSearchesByScheme = new Map();
    loggedSchemesMissingProviders = new Set();
    constructor(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService) {
        super();
        this.modelService = modelService;
        this.editorService = editorService;
        this.telemetryService = telemetryService;
        this.logService = logService;
        this.extensionService = extensionService;
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
    }
    registerSearchResultProvider(scheme, type, provider) {
        let list;
        let deferredMap;
        if (type === 0 /* SearchProviderType.file */) {
            list = this.fileSearchProviders;
            deferredMap = this.deferredFileSearchesByScheme;
        }
        else if (type === 1 /* SearchProviderType.text */) {
            list = this.textSearchProviders;
            deferredMap = this.deferredTextSearchesByScheme;
        }
        else {
            throw new Error('Unknown SearchProviderType');
        }
        list.set(scheme, provider);
        if (deferredMap.has(scheme)) {
            deferredMap.get(scheme).complete(provider);
            deferredMap.delete(scheme);
        }
        return toDisposable(() => {
            list.delete(scheme);
        });
    }
    async textSearch(query, token, onProgress) {
        // Get local results from dirty/untitled
        const localResults = this.getLocalResults(query);
        if (onProgress) {
            arrays.coalesce([...localResults.results.values()]).forEach(onProgress);
        }
        const onProviderProgress = (progress) => {
            if (isFileMatch(progress)) {
                // Match
                if (!localResults.results.has(progress.resource) && onProgress) { // don't override local results
                    onProgress(progress);
                }
            }
            else if (onProgress) {
                // Progress
                onProgress(progress);
            }
            if (isProgressMessage(progress)) {
                this.logService.debug('SearchService#search', progress.message);
            }
        };
        const otherResults = await this.doSearch(query, token, onProviderProgress);
        return {
            ...otherResults,
            ...{
                limitHit: otherResults.limitHit || localResults.limitHit
            },
            results: [...otherResults.results, ...arrays.coalesce([...localResults.results.values()])]
        };
    }
    fileSearch(query, token) {
        return this.doSearch(query, token);
    }
    doSearch(query, token, onProgress) {
        this.logService.trace('SearchService#search', JSON.stringify(query));
        const schemesInQuery = this.getSchemesInQuery(query);
        const providerActivations = [Promise.resolve(null)];
        schemesInQuery.forEach(scheme => providerActivations.push(this.extensionService.activateByEvent(`onSearch:${scheme}`)));
        providerActivations.push(this.extensionService.activateByEvent('onSearch:file'));
        const providerPromise = (async () => {
            await Promise.all(providerActivations);
            await this.extensionService.whenInstalledExtensionsRegistered();
            // Cancel faster if search was canceled while waiting for extensions
            if (token && token.isCancellationRequested) {
                return Promise.reject(new CancellationError());
            }
            const progressCallback = (item) => {
                if (token && token.isCancellationRequested) {
                    return;
                }
                onProgress?.(item);
            };
            const exists = await Promise.all(query.folderQueries.map(query => this.fileService.exists(query.folder)));
            query.folderQueries = query.folderQueries.filter((_, i) => exists[i]);
            let completes = await this.searchWithProviders(query, progressCallback, token);
            completes = arrays.coalesce(completes);
            if (!completes.length) {
                return {
                    limitHit: false,
                    results: [],
                    messages: [],
                };
            }
            return {
                limitHit: completes[0] && completes[0].limitHit,
                stats: completes[0].stats,
                messages: arrays.coalesce(arrays.flatten(completes.map(i => i.messages))).filter(arrays.uniqueFilter(message => message.type + message.text + message.trusted)),
                results: arrays.flatten(completes.map((c) => c.results))
            };
        })();
        return new Promise((resolve, reject) => {
            if (token) {
                token.onCancellationRequested(() => {
                    reject(new CancellationError());
                });
            }
            providerPromise.then(resolve, reject);
        });
    }
    getSchemesInQuery(query) {
        const schemes = new Set();
        query.folderQueries?.forEach(fq => schemes.add(fq.folder.scheme));
        query.extraFileResources?.forEach(extraFile => schemes.add(extraFile.scheme));
        return schemes;
    }
    async waitForProvider(queryType, scheme) {
        const deferredMap = queryType === 1 /* QueryType.File */ ?
            this.deferredFileSearchesByScheme :
            this.deferredTextSearchesByScheme;
        if (deferredMap.has(scheme)) {
            return deferredMap.get(scheme).p;
        }
        else {
            const deferred = new DeferredPromise();
            deferredMap.set(scheme, deferred);
            return deferred.p;
        }
    }
    async searchWithProviders(query, onProviderProgress, token) {
        const e2eSW = StopWatch.create(false);
        const searchPs = [];
        const fqs = this.groupFolderQueriesByScheme(query);
        const someSchemeHasProvider = [...fqs.keys()].some(scheme => {
            return query.type === 1 /* QueryType.File */ ?
                this.fileSearchProviders.has(scheme) :
                this.textSearchProviders.has(scheme);
        });
        await Promise.all([...fqs.keys()].map(async (scheme) => {
            const schemeFQs = fqs.get(scheme);
            let provider = query.type === 1 /* QueryType.File */ ?
                this.fileSearchProviders.get(scheme) :
                this.textSearchProviders.get(scheme);
            if (!provider) {
                if (someSchemeHasProvider) {
                    if (!this.loggedSchemesMissingProviders.has(scheme)) {
                        this.logService.warn(`No search provider registered for scheme: ${scheme}. Another scheme has a provider, not waiting for ${scheme}`);
                        this.loggedSchemesMissingProviders.add(scheme);
                    }
                    return;
                }
                else {
                    if (!this.loggedSchemesMissingProviders.has(scheme)) {
                        this.logService.warn(`No search provider registered for scheme: ${scheme}, waiting`);
                        this.loggedSchemesMissingProviders.add(scheme);
                    }
                    provider = await this.waitForProvider(query.type, scheme);
                }
            }
            const oneSchemeQuery = {
                ...query,
                ...{
                    folderQueries: schemeFQs
                }
            };
            searchPs.push(query.type === 1 /* QueryType.File */ ?
                provider.fileSearch(oneSchemeQuery, token) :
                provider.textSearch(oneSchemeQuery, onProviderProgress, token));
        }));
        return Promise.all(searchPs).then(completes => {
            const endToEndTime = e2eSW.elapsed();
            this.logService.trace(`SearchService#search: ${endToEndTime}ms`);
            completes.forEach(complete => {
                this.sendTelemetry(query, endToEndTime, complete);
            });
            return completes;
        }, err => {
            const endToEndTime = e2eSW.elapsed();
            this.logService.trace(`SearchService#search: ${endToEndTime}ms`);
            const searchError = deserializeSearchError(err);
            this.logService.trace(`SearchService#searchError: ${searchError.message}`);
            this.sendTelemetry(query, endToEndTime, undefined, searchError);
            throw searchError;
        });
    }
    groupFolderQueriesByScheme(query) {
        const queries = new Map();
        query.folderQueries.forEach(fq => {
            const schemeFQs = queries.get(fq.folder.scheme) || [];
            schemeFQs.push(fq);
            queries.set(fq.folder.scheme, schemeFQs);
        });
        return queries;
    }
    sendTelemetry(query, endToEndTime, complete, err) {
        const fileSchemeOnly = query.folderQueries.every(fq => fq.folder.scheme === Schemas.file);
        const otherSchemeOnly = query.folderQueries.every(fq => fq.folder.scheme !== Schemas.file);
        const scheme = fileSchemeOnly ? Schemas.file :
            otherSchemeOnly ? 'other' :
                'mixed';
        if (query.type === 1 /* QueryType.File */ && complete && complete.stats) {
            const fileSearchStats = complete.stats;
            if (fileSearchStats.fromCache) {
                const cacheStats = fileSearchStats.detailStats;
                this.telemetryService.publicLog2('cachedSearchComplete', {
                    reason: query._reason,
                    resultCount: fileSearchStats.resultCount,
                    workspaceFolderCount: query.folderQueries.length,
                    endToEndTime: endToEndTime,
                    sortingTime: fileSearchStats.sortingTime,
                    cacheWasResolved: cacheStats.cacheWasResolved,
                    cacheLookupTime: cacheStats.cacheLookupTime,
                    cacheFilterTime: cacheStats.cacheFilterTime,
                    cacheEntryCount: cacheStats.cacheEntryCount,
                    scheme
                });
            }
            else {
                const searchEngineStats = fileSearchStats.detailStats;
                this.telemetryService.publicLog2('searchComplete', {
                    reason: query._reason,
                    resultCount: fileSearchStats.resultCount,
                    workspaceFolderCount: query.folderQueries.length,
                    endToEndTime: endToEndTime,
                    sortingTime: fileSearchStats.sortingTime,
                    fileWalkTime: searchEngineStats.fileWalkTime,
                    directoriesWalked: searchEngineStats.directoriesWalked,
                    filesWalked: searchEngineStats.filesWalked,
                    cmdTime: searchEngineStats.cmdTime,
                    cmdResultCount: searchEngineStats.cmdResultCount,
                    scheme
                });
            }
        }
        else if (query.type === 2 /* QueryType.Text */) {
            let errorType;
            if (err) {
                errorType = err.code === SearchErrorCode.regexParseError ? 'regex' :
                    err.code === SearchErrorCode.unknownEncoding ? 'encoding' :
                        err.code === SearchErrorCode.globParseError ? 'glob' :
                            err.code === SearchErrorCode.invalidLiteral ? 'literal' :
                                err.code === SearchErrorCode.other ? 'other' :
                                    err.code === SearchErrorCode.canceled ? 'canceled' :
                                        'unknown';
            }
            this.telemetryService.publicLog2('textSearchComplete', {
                reason: query._reason,
                workspaceFolderCount: query.folderQueries.length,
                endToEndTime: endToEndTime,
                scheme,
                error: errorType,
            });
        }
    }
    getLocalResults(query) {
        const localResults = new ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
        let limitHit = false;
        if (query.type === 2 /* QueryType.Text */) {
            const canonicalToOriginalResources = new ResourceMap();
            for (const editorInput of this.editorService.editors) {
                const canonical = EditorResourceAccessor.getCanonicalUri(editorInput, { supportSideBySide: SideBySideEditor.PRIMARY });
                const original = EditorResourceAccessor.getOriginalUri(editorInput, { supportSideBySide: SideBySideEditor.PRIMARY });
                if (canonical) {
                    canonicalToOriginalResources.set(canonical, original ?? canonical);
                }
            }
            const models = this.modelService.getModels();
            models.forEach((model) => {
                const resource = model.uri;
                if (!resource) {
                    return;
                }
                if (limitHit) {
                    return;
                }
                const originalResource = canonicalToOriginalResources.get(resource);
                if (!originalResource) {
                    return;
                }
                // Skip search results
                if (model.getLanguageId() === 'search-result' && !(query.includePattern && query.includePattern['**/*.code-search'])) {
                    // TODO: untitled search editors will be excluded from search even when include *.code-search is specified
                    return;
                }
                // Block walkthrough, webview, etc.
                if (originalResource.scheme !== Schemas.untitled && !this.fileService.hasProvider(originalResource)) {
                    return;
                }
                // Exclude files from the git FileSystemProvider, e.g. to prevent open staged files from showing in search results
                if (originalResource.scheme === 'git') {
                    return;
                }
                if (!this.matches(originalResource, query)) {
                    return; // respect user filters
                }
                // Use editor API to find matches
                const askMax = isNumber(query.maxResults) ? query.maxResults + 1 : Number.MAX_SAFE_INTEGER;
                let matches = model.findMatches(query.contentPattern.pattern, false, !!query.contentPattern.isRegExp, !!query.contentPattern.isCaseSensitive, query.contentPattern.isWordMatch ? query.contentPattern.wordSeparators : null, false, askMax);
                if (matches.length) {
                    if (askMax && matches.length >= askMax) {
                        limitHit = true;
                        matches = matches.slice(0, askMax - 1);
                    }
                    const fileMatch = new FileMatch(originalResource);
                    localResults.set(originalResource, fileMatch);
                    const textSearchResults = editorMatchesToTextSearchResults(matches, model, query.previewOptions);
                    fileMatch.results = addContextToEditorMatches(textSearchResults, model, query);
                }
                else {
                    localResults.set(originalResource, null);
                }
            });
        }
        return {
            results: localResults,
            limitHit
        };
    }
    matches(resource, query) {
        return pathIncludedInQuery(query, resource.fsPath);
    }
    async clearCache(cacheKey) {
        const clearPs = Array.from(this.fileSearchProviders.values())
            .map(provider => provider && provider.clearCache(cacheKey));
        await Promise.all(clearPs);
    }
};
SearchService = __decorate([
    __param(0, IModelService),
    __param(1, IEditorService),
    __param(2, ITelemetryService),
    __param(3, ILogService),
    __param(4, IExtensionService),
    __param(5, IFileService),
    __param(6, IUriIdentityService)
], SearchService);
export { SearchService };
