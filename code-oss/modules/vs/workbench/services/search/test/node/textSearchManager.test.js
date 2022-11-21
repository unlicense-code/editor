/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { NativeTextSearchManager } from 'vs/workbench/services/search/node/textSearchManager';
suite('NativeTextSearchManager', () => {
    test('fixes encoding', async () => {
        let correctEncoding = false;
        const provider = {
            provideTextSearchResults(query, options, progress, token) {
                correctEncoding = options.encoding === 'windows-1252';
                return null;
            }
        };
        const query = {
            type: 2 /* QueryType.Text */,
            contentPattern: {
                pattern: 'a'
            },
            folderQueries: [{
                    folder: URI.file('/some/folder'),
                    fileEncoding: 'windows1252'
                }]
        };
        const m = new NativeTextSearchManager(query, provider);
        await m.search(() => { }, new CancellationTokenSource().token);
        assert.ok(correctEncoding);
    });
});
