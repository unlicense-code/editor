/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { CancellationToken } from 'vs/base/common/cancellation';
import { canceled } from 'vs/base/common/errors';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { getDocumentSemanticTokens } from 'vs/editor/common/services/getSemanticTokens';
import { createTextModel } from 'vs/editor/test/common/testTextModel';
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry';
suite('getSemanticTokens', () => {
    test('issue #136540: semantic highlighting flickers', async () => {
        const disposables = new DisposableStore();
        const registry = new LanguageFeatureRegistry();
        const provider = new class {
            getLegend() {
                return { tokenTypes: ['test'], tokenModifiers: [] };
            }
            provideDocumentSemanticTokens(model, lastResultId, token) {
                throw canceled();
            }
            releaseDocumentSemanticTokens(resultId) {
            }
        };
        disposables.add(registry.register('testLang', provider));
        const textModel = disposables.add(createTextModel('example', 'testLang'));
        await getDocumentSemanticTokens(registry, textModel, null, null, CancellationToken.None).then((res) => {
            assert.fail();
        }, (err) => {
            assert.ok(!!err);
        });
        disposables.dispose();
    });
});
