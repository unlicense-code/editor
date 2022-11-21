/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { DataTree } from 'vs/base/browser/ui/tree/dataTree';
suite('DataTree', function () {
    let tree;
    const root = {
        value: -1,
        children: [
            { value: 0, children: [{ value: 10 }, { value: 11 }, { value: 12 }] },
            { value: 1 },
            { value: 2 },
        ]
    };
    const empty = {
        value: -1,
        children: []
    };
    setup(() => {
        const container = document.createElement('div');
        container.style.width = '200px';
        container.style.height = '200px';
        const delegate = new class {
            getHeight() { return 20; }
            getTemplateId() { return 'default'; }
        };
        const renderer = new class {
            templateId = 'default';
            renderTemplate(container) {
                return container;
            }
            renderElement(element, index, templateData) {
                templateData.textContent = `${element.element.value}`;
            }
            disposeTemplate() { }
        };
        const dataSource = new class {
            getChildren(element) {
                return element.children || [];
            }
        };
        const identityProvider = new class {
            getId(element) {
                return `${element.value}`;
            }
        };
        tree = new DataTree('test', container, delegate, [renderer], dataSource, {
            identityProvider
        });
        tree.layout(200);
    });
    teardown(() => {
        tree.dispose();
    });
    test('view state is lost implicitly', () => {
        tree.setInput(root);
        let navigator = tree.navigate();
        assert.strictEqual(navigator.next().value, 0);
        assert.strictEqual(navigator.next().value, 10);
        assert.strictEqual(navigator.next().value, 11);
        assert.strictEqual(navigator.next().value, 12);
        assert.strictEqual(navigator.next().value, 1);
        assert.strictEqual(navigator.next().value, 2);
        assert.strictEqual(navigator.next(), null);
        tree.collapse(root.children[0]);
        navigator = tree.navigate();
        assert.strictEqual(navigator.next().value, 0);
        assert.strictEqual(navigator.next().value, 1);
        assert.strictEqual(navigator.next().value, 2);
        assert.strictEqual(navigator.next(), null);
        tree.setSelection([root.children[1]]);
        tree.setFocus([root.children[2]]);
        tree.setInput(empty);
        tree.setInput(root);
        navigator = tree.navigate();
        assert.strictEqual(navigator.next().value, 0);
        assert.strictEqual(navigator.next().value, 10);
        assert.strictEqual(navigator.next().value, 11);
        assert.strictEqual(navigator.next().value, 12);
        assert.strictEqual(navigator.next().value, 1);
        assert.strictEqual(navigator.next().value, 2);
        assert.strictEqual(navigator.next(), null);
        assert.deepStrictEqual(tree.getSelection(), []);
        assert.deepStrictEqual(tree.getFocus(), []);
    });
    test('view state can be preserved', () => {
        tree.setInput(root);
        let navigator = tree.navigate();
        assert.strictEqual(navigator.next().value, 0);
        assert.strictEqual(navigator.next().value, 10);
        assert.strictEqual(navigator.next().value, 11);
        assert.strictEqual(navigator.next().value, 12);
        assert.strictEqual(navigator.next().value, 1);
        assert.strictEqual(navigator.next().value, 2);
        assert.strictEqual(navigator.next(), null);
        tree.collapse(root.children[0]);
        navigator = tree.navigate();
        assert.strictEqual(navigator.next().value, 0);
        assert.strictEqual(navigator.next().value, 1);
        assert.strictEqual(navigator.next().value, 2);
        assert.strictEqual(navigator.next(), null);
        tree.setSelection([root.children[1]]);
        tree.setFocus([root.children[2]]);
        const viewState = tree.getViewState();
        tree.setInput(empty);
        tree.setInput(root, viewState);
        navigator = tree.navigate();
        assert.strictEqual(navigator.next().value, 0);
        assert.strictEqual(navigator.next().value, 1);
        assert.strictEqual(navigator.next().value, 2);
        assert.strictEqual(navigator.next(), null);
        assert.deepStrictEqual(tree.getSelection(), [root.children[1]]);
        assert.deepStrictEqual(tree.getFocus(), [root.children[2]]);
    });
});
