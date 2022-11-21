/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as arrays from 'vs/base/common/arrays';
import { createCancelablePromise } from 'vs/base/common/async';
import { canceled } from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import { compareItemsByFuzzyScore, prepareQuery } from 'vs/base/common/fuzzyScorer';
import { basename, dirname, join, sep } from 'vs/base/common/path';
import { StopWatch } from 'vs/base/common/stopwatch';
import { URI } from 'vs/base/common/uri';
import { getPlatformLimits } from 'vs/platform/files/common/files';
import { isFilePatternMatch } from 'vs/workbench/services/search/common/search';
import { Engine as FileSearchEngine } from 'vs/workbench/services/search/node/fileSearch';
import { TextSearchEngineAdapter } from 'vs/workbench/services/search/node/textSearchAdapter';
export class SearchService {
    processType;
    static BATCH_SIZE = 512;
    caches = Object.create(null);
    constructor(processType = 'searchProcess') {
        this.processType = processType;
    }
    fileSearch(config) {
        let promise;
        const query = reviveQuery(config);
        const emitter = new Emitter({
            onDidAddFirstListener: () => {
                promise = createCancelablePromise(token => {
                    return this.doFileSearchWithEngine(FileSearchEngine, query, p => emitter.fire(p), token);
                });
                promise.then(c => emitter.fire(c), err => emitter.fire({ type: 'error', error: { message: err.message, stack: err.stack } }));
            },
            onDidRemoveLastListener: () => {
                promise.cancel();
            }
        });
        return emitter.event;
    }
    textSearch(rawQuery) {
        let promise;
        const query = reviveQuery(rawQuery);
        const emitter = new Emitter({
            onDidAddFirstListener: () => {
                promise = createCancelablePromise(token => {
                    return this.ripgrepTextSearch(query, p => emitter.fire(p), token);
                });
                promise.then(c => emitter.fire(c), err => emitter.fire({ type: 'error', error: { message: err.message, stack: err.stack } }));
            },
            onDidRemoveLastListener: () => {
                promise.cancel();
            }
        });
        return emitter.event;
    }
    ripgrepTextSearch(config, progressCallback, token) {
        config.maxFileSize = getPlatformLimits(process.arch === 'ia32' ? 0 /* Arch.IA32 */ : 1 /* Arch.OTHER */).maxFileSize;
        const engine = new TextSearchEngineAdapter(config);
        return engine.search(token, progressCallback, progressCallback);
    }
    doFileSearch(config, progressCallback, token) {
        return this.doFileSearchWithEngine(FileSearchEngine, config, progressCallback, token);
    }
    doFileSearchWithEngine(EngineClass, config, progressCallback, token, batchSize = SearchService.BATCH_SIZE) {
        let resultCount = 0;
        const fileProgressCallback = progress => {
            if (Array.isArray(progress)) {
                resultCount += progress.length;
                progressCallback(progress.map(m => this.rawMatchToSearchItem(m)));
            }
            else if (progress.relativePath) {
                resultCount++;
                progressCallback(this.rawMatchToSearchItem(progress));
            }
            else {
                progressCallback(progress);
            }
        };
        if (config.sortByScore) {
            let sortedSearch = this.trySortedSearchFromCache(config, fileProgressCallback, token);
            if (!sortedSearch) {
                const walkerConfig = config.maxResults ? Object.assign({}, config, { maxResults: null }) : config;
                const engine = new EngineClass(walkerConfig);
                sortedSearch = this.doSortedSearch(engine, config, progressCallback, fileProgressCallback, token);
            }
            return new Promise((c, e) => {
                sortedSearch.then(([result, rawMatches]) => {
                    const serializedMatches = rawMatches.map(rawMatch => this.rawMatchToSearchItem(rawMatch));
                    this.sendProgress(serializedMatches, progressCallback, batchSize);
                    c(result);
                }, e);
            });
        }
        const engine = new EngineClass(config);
        return this.doSearch(engine, fileProgressCallback, batchSize, token).then(complete => {
            return {
                limitHit: complete.limitHit,
                type: 'success',
                stats: {
                    detailStats: complete.stats,
                    type: this.processType,
                    fromCache: false,
                    resultCount,
                    sortingTime: undefined
                }
            };
        });
    }
    rawMatchToSearchItem(match) {
        return { path: match.base ? join(match.base, match.relativePath) : match.relativePath };
    }
    doSortedSearch(engine, config, progressCallback, fileProgressCallback, token) {
        const emitter = new Emitter();
        let allResultsPromise = createCancelablePromise(token => {
            let results = [];
            const innerProgressCallback = progress => {
                if (Array.isArray(progress)) {
                    results = progress;
                }
                else {
                    fileProgressCallback(progress);
                    emitter.fire(progress);
                }
            };
            return this.doSearch(engine, innerProgressCallback, -1, token)
                .then(result => {
                return [result, results];
            });
        });
        let cache;
        if (config.cacheKey) {
            cache = this.getOrCreateCache(config.cacheKey);
            const cacheRow = {
                promise: allResultsPromise,
                event: emitter.event,
                resolved: false
            };
            cache.resultsToSearchCache[config.filePattern || ''] = cacheRow;
            allResultsPromise.then(() => {
                cacheRow.resolved = true;
            }, err => {
                delete cache.resultsToSearchCache[config.filePattern || ''];
            });
            allResultsPromise = this.preventCancellation(allResultsPromise);
        }
        return allResultsPromise.then(([result, results]) => {
            const scorerCache = cache ? cache.scorerCache : Object.create(null);
            const sortSW = (typeof config.maxResults !== 'number' || config.maxResults > 0) && StopWatch.create(false);
            return this.sortResults(config, results, scorerCache, token)
                .then(sortedResults => {
                // sortingTime: -1 indicates a "sorted" search that was not sorted, i.e. populating the cache when quickaccess is opened.
                // Contrasting with findFiles which is not sorted and will have sortingTime: undefined
                const sortingTime = sortSW ? sortSW.elapsed() : -1;
                return [{
                        type: 'success',
                        stats: {
                            detailStats: result.stats,
                            sortingTime,
                            fromCache: false,
                            type: this.processType,
                            workspaceFolderCount: config.folderQueries.length,
                            resultCount: sortedResults.length
                        },
                        messages: result.messages,
                        limitHit: result.limitHit || typeof config.maxResults === 'number' && results.length > config.maxResults
                    }, sortedResults];
            });
        });
    }
    getOrCreateCache(cacheKey) {
        const existing = this.caches[cacheKey];
        if (existing) {
            return existing;
        }
        return this.caches[cacheKey] = new Cache();
    }
    trySortedSearchFromCache(config, progressCallback, token) {
        const cache = config.cacheKey && this.caches[config.cacheKey];
        if (!cache) {
            return undefined;
        }
        const cached = this.getResultsFromCache(cache, config.filePattern || '', progressCallback, token);
        if (cached) {
            return cached.then(([result, results, cacheStats]) => {
                const sortSW = StopWatch.create(false);
                return this.sortResults(config, results, cache.scorerCache, token)
                    .then(sortedResults => {
                    const sortingTime = sortSW.elapsed();
                    const stats = {
                        fromCache: true,
                        detailStats: cacheStats,
                        type: this.processType,
                        resultCount: results.length,
                        sortingTime
                    };
                    return [
                        {
                            type: 'success',
                            limitHit: result.limitHit || typeof config.maxResults === 'number' && results.length > config.maxResults,
                            stats
                        },
                        sortedResults
                    ];
                });
            });
        }
        return undefined;
    }
    sortResults(config, results, scorerCache, token) {
        // we use the same compare function that is used later when showing the results using fuzzy scoring
        // this is very important because we are also limiting the number of results by config.maxResults
        // and as such we want the top items to be included in this result set if the number of items
        // exceeds config.maxResults.
        const query = prepareQuery(config.filePattern || '');
        const compare = (matchA, matchB) => compareItemsByFuzzyScore(matchA, matchB, query, true, FileMatchItemAccessor, scorerCache);
        const maxResults = typeof config.maxResults === 'number' ? config.maxResults : Number.MAX_VALUE;
        return arrays.topAsync(results, compare, maxResults, 10000, token);
    }
    sendProgress(results, progressCb, batchSize) {
        if (batchSize && batchSize > 0) {
            for (let i = 0; i < results.length; i += batchSize) {
                progressCb(results.slice(i, i + batchSize));
            }
        }
        else {
            progressCb(results);
        }
    }
    getResultsFromCache(cache, searchValue, progressCallback, token) {
        const cacheLookupSW = StopWatch.create(false);
        // Find cache entries by prefix of search value
        const hasPathSep = searchValue.indexOf(sep) >= 0;
        let cachedRow;
        for (const previousSearch in cache.resultsToSearchCache) {
            // If we narrow down, we might be able to reuse the cached results
            if (searchValue.startsWith(previousSearch)) {
                if (hasPathSep && previousSearch.indexOf(sep) < 0 && previousSearch !== '') {
                    continue; // since a path character widens the search for potential more matches, require it in previous search too
                }
                const row = cache.resultsToSearchCache[previousSearch];
                cachedRow = {
                    promise: this.preventCancellation(row.promise),
                    event: row.event,
                    resolved: row.resolved
                };
                break;
            }
        }
        if (!cachedRow) {
            return null;
        }
        const cacheLookupTime = cacheLookupSW.elapsed();
        const cacheFilterSW = StopWatch.create(false);
        const listener = cachedRow.event(progressCallback);
        if (token) {
            token.onCancellationRequested(() => {
                listener.dispose();
            });
        }
        return cachedRow.promise.then(([complete, cachedEntries]) => {
            if (token && token.isCancellationRequested) {
                throw canceled();
            }
            // Pattern match on results
            const results = [];
            const normalizedSearchValueLowercase = prepareQuery(searchValue).normalizedLowercase;
            for (const entry of cachedEntries) {
                // Check if this entry is a match for the search value
                if (!isFilePatternMatch(entry, normalizedSearchValueLowercase)) {
                    continue;
                }
                results.push(entry);
            }
            return [complete, results, {
                    cacheWasResolved: cachedRow.resolved,
                    cacheLookupTime,
                    cacheFilterTime: cacheFilterSW.elapsed(),
                    cacheEntryCount: cachedEntries.length
                }];
        });
    }
    doSearch(engine, progressCallback, batchSize, token) {
        return new Promise((c, e) => {
            let batch = [];
            token?.onCancellationRequested(() => engine.cancel());
            engine.search((match) => {
                if (match) {
                    if (batchSize) {
                        batch.push(match);
                        if (batchSize > 0 && batch.length >= batchSize) {
                            progressCallback(batch);
                            batch = [];
                        }
                    }
                    else {
                        progressCallback(match);
                    }
                }
            }, (progress) => {
                progressCallback(progress);
            }, (error, complete) => {
                if (batch.length) {
                    progressCallback(batch);
                }
                if (error) {
                    e(error);
                }
                else {
                    c(complete);
                }
            });
        });
    }
    clearCache(cacheKey) {
        delete this.caches[cacheKey];
        return Promise.resolve(undefined);
    }
    /**
     * Return a CancelablePromise which is not actually cancelable
     * TODO@rob - Is this really needed?
     */
    preventCancellation(promise) {
        return new class {
            get [Symbol.toStringTag]() { return this.toString(); }
            cancel() {
                // Do nothing
            }
            then(resolve, reject) {
                return promise.then(resolve, reject);
            }
            catch(reject) {
                return this.then(undefined, reject);
            }
            finally(onFinally) {
                return promise.finally(onFinally);
            }
        };
    }
}
class Cache {
    resultsToSearchCache = Object.create(null);
    scorerCache = Object.create(null);
}
const FileMatchItemAccessor = new class {
    getItemLabel(match) {
        return basename(match.relativePath); // e.g. myFile.txt
    }
    getItemDescription(match) {
        return dirname(match.relativePath); // e.g. some/path/to/file
    }
    getItemPath(match) {
        return match.relativePath; // e.g. some/path/to/file/myFile.txt
    }
};
function reviveQuery(rawQuery) {
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
