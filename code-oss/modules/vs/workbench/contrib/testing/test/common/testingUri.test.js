/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { buildTestUri, parseTestUri } from 'vs/workbench/contrib/testing/common/testingUri';
suite('Workbench - Testing URIs', () => {
    test('round trip', () => {
        const uris = [
            { type: 1 /* TestUriType.ResultActualOutput */, taskIndex: 1, messageIndex: 42, resultId: 'r', testExtId: 't' },
            { type: 2 /* TestUriType.ResultExpectedOutput */, taskIndex: 1, messageIndex: 42, resultId: 'r', testExtId: 't' },
            { type: 0 /* TestUriType.ResultMessage */, taskIndex: 1, messageIndex: 42, resultId: 'r', testExtId: 't' },
        ];
        for (const uri of uris) {
            const serialized = buildTestUri(uri);
            assert.deepStrictEqual(uri, parseTestUri(serialized));
        }
    });
});
