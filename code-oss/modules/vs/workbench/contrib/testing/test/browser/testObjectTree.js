/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ObjectTree } from 'vs/base/browser/ui/tree/objectTree';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { TestItemTreeElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import { MainThreadTestCollection } from 'vs/workbench/contrib/testing/common/mainThreadTestCollection';
import { testStubs } from 'vs/workbench/contrib/testing/test/common/testStubs';
const element = document.createElement('div');
element.style.height = '1000px';
element.style.width = '200px';
export class TestObjectTree extends ObjectTree {
    constructor(serializer) {
        super('test', element, {
            getHeight: () => 20,
            getTemplateId: () => 'default'
        }, [
            {
                disposeTemplate: () => undefined,
                renderElement: (node, _index, container) => {
                    Object.assign(container.dataset, node.element);
                    container.textContent = `${node.depth}:${serializer(node.element)}`;
                },
                renderTemplate: c => c,
                templateId: 'default'
            }
        ], {
            sorter: {
                compare: (a, b) => serializer(a).localeCompare(serializer(b))
            }
        });
        this.layout(1000, 200);
    }
    getModel() {
        return this.model;
    }
    getRendered(getProperty) {
        const elements = element.querySelectorAll('.monaco-tl-contents');
        const sorted = [...elements].sort((a, b) => pos(a) - pos(b));
        const chain = [{ e: '', children: [] }];
        for (const element of sorted) {
            const [depthStr, label] = element.textContent.split(':');
            const depth = Number(depthStr);
            const parent = chain[depth - 1];
            const child = { e: label };
            if (getProperty) {
                child.data = element.dataset[getProperty];
            }
            parent.children = parent.children?.concat(child) ?? [child];
            chain[depth] = child;
        }
        return chain[0].children;
    }
}
const pos = (element) => Number(element.parentElement.parentElement.getAttribute('aria-posinset'));
// names are hard
export class TestTreeTestHarness extends Disposable {
    c;
    onDiff = this._register(new Emitter());
    onFolderChange = this._register(new Emitter());
    isProcessingDiff = false;
    projection;
    tree;
    constructor(makeTree, c = testStubs.nested()) {
        super();
        this.c = c;
        this._register(c);
        this.c.onDidGenerateDiff(d => this.c.setDiff(d /* don't clear during testing */));
        const collection = new MainThreadTestCollection((testId, levels) => {
            this.c.expand(testId, levels);
            if (!this.isProcessingDiff) {
                this.onDiff.fire(this.c.collectDiff());
            }
            return Promise.resolve();
        });
        this._register(this.onDiff.event(diff => collection.apply(diff)));
        this.projection = this._register(makeTree({
            collection,
            onDidProcessDiff: this.onDiff.event,
        }));
        this.tree = this._register(new TestObjectTree(t => 'label' in t ? t.label : t.message.toString()));
        this._register(this.tree.onDidChangeCollapseState(evt => {
            if (evt.node.element instanceof TestItemTreeElement) {
                this.projection.expandElement(evt.node.element, evt.deep ? Infinity : 0);
            }
        }));
    }
    pushDiff(...diff) {
        this.onDiff.fire(diff);
    }
    flush() {
        this.isProcessingDiff = true;
        while (this.c.currentDiff.length) {
            this.onDiff.fire(this.c.collectDiff());
        }
        this.isProcessingDiff = false;
        this.projection.applyTo(this.tree);
        return this.tree.getRendered();
    }
}
