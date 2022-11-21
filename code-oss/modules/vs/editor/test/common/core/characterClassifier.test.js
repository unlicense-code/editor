/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { CharacterClassifier } from 'vs/editor/common/core/characterClassifier';
suite('CharacterClassifier', () => {
    test('works', () => {
        const classifier = new CharacterClassifier(0);
        assert.strictEqual(classifier.get(-1), 0);
        assert.strictEqual(classifier.get(0), 0);
        assert.strictEqual(classifier.get(97 /* CharCode.a */), 0);
        assert.strictEqual(classifier.get(98 /* CharCode.b */), 0);
        assert.strictEqual(classifier.get(122 /* CharCode.z */), 0);
        assert.strictEqual(classifier.get(255), 0);
        assert.strictEqual(classifier.get(1000), 0);
        assert.strictEqual(classifier.get(2000), 0);
        classifier.set(97 /* CharCode.a */, 1);
        classifier.set(122 /* CharCode.z */, 2);
        classifier.set(1000, 3);
        assert.strictEqual(classifier.get(-1), 0);
        assert.strictEqual(classifier.get(0), 0);
        assert.strictEqual(classifier.get(97 /* CharCode.a */), 1);
        assert.strictEqual(classifier.get(98 /* CharCode.b */), 0);
        assert.strictEqual(classifier.get(122 /* CharCode.z */), 2);
        assert.strictEqual(classifier.get(255), 0);
        assert.strictEqual(classifier.get(1000), 3);
        assert.strictEqual(classifier.get(2000), 0);
    });
});
