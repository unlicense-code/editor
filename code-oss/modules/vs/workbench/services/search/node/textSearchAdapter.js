/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as pfs from 'vs/base/node/pfs';
import { RipgrepTextSearchEngine } from 'vs/workbench/services/search/node/ripgrepTextSearchEngine';
import { NativeTextSearchManager } from 'vs/workbench/services/search/node/textSearchManager';
export class TextSearchEngineAdapter {
    query;
    constructor(query) {
        this.query = query;
    }
    search(token, onResult, onMessage) {
        if ((!this.query.folderQueries || !this.query.folderQueries.length) && (!this.query.extraFileResources || !this.query.extraFileResources.length)) {
            return Promise.resolve({
                type: 'success',
                limitHit: false,
                stats: {
                    type: 'searchProcess'
                }
            });
        }
        const pretendOutputChannel = {
            appendLine(msg) {
                onMessage({ message: msg });
            }
        };
        const textSearchManager = new NativeTextSearchManager(this.query, new RipgrepTextSearchEngine(pretendOutputChannel), pfs);
        return new Promise((resolve, reject) => {
            return textSearchManager
                .search(matches => {
                onResult(matches.map(fileMatchToSerialized));
            }, token)
                .then(c => resolve({ limitHit: c.limitHit, type: 'success', stats: c.stats }), reject);
        });
    }
}
function fileMatchToSerialized(match) {
    return {
        path: match.resource && match.resource.fsPath,
        results: match.results,
        numMatches: (match.results || []).reduce((sum, r) => {
            if (!!r.ranges) {
                const m = r;
                return sum + (Array.isArray(m.ranges) ? m.ranges.length : 1);
            }
            else {
                return sum + 1;
            }
        }, 0)
    };
}
