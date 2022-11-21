/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { Part } from 'vs/workbench/browser/part';
import { isEmptyObject } from 'vs/base/common/types';
import { TestThemeService } from 'vs/platform/theme/test/common/testThemeService';
import { append, $, hide } from 'vs/base/browser/dom';
import { TestLayoutService } from 'vs/workbench/test/browser/workbenchTestServices';
import { TestStorageService } from 'vs/workbench/test/common/workbenchTestServices';
suite('Workbench parts', () => {
    class SimplePart extends Part {
        minimumWidth = 50;
        maximumWidth = 50;
        minimumHeight = 50;
        maximumHeight = 50;
        layout(width, height) {
            throw new Error('Method not implemented.');
        }
        toJSON() {
            throw new Error('Method not implemented.');
        }
    }
    class MyPart extends SimplePart {
        expectedParent;
        constructor(expectedParent) {
            super('myPart', { hasTitle: true }, new TestThemeService(), new TestStorageService(), new TestLayoutService());
            this.expectedParent = expectedParent;
        }
        createTitleArea(parent) {
            assert.strictEqual(parent, this.expectedParent);
            return super.createTitleArea(parent);
        }
        createContentArea(parent) {
            assert.strictEqual(parent, this.expectedParent);
            return super.createContentArea(parent);
        }
        getMemento(scope, target) {
            return super.getMemento(scope, target);
        }
        saveState() {
            return super.saveState();
        }
    }
    class MyPart2 extends SimplePart {
        constructor() {
            super('myPart2', { hasTitle: true }, new TestThemeService(), new TestStorageService(), new TestLayoutService());
        }
        createTitleArea(parent) {
            const titleContainer = append(parent, $('div'));
            const titleLabel = append(titleContainer, $('span'));
            titleLabel.id = 'myPart.title';
            titleLabel.innerText = 'Title';
            return titleContainer;
        }
        createContentArea(parent) {
            const contentContainer = append(parent, $('div'));
            const contentSpan = append(contentContainer, $('span'));
            contentSpan.id = 'myPart.content';
            contentSpan.innerText = 'Content';
            return contentContainer;
        }
    }
    class MyPart3 extends SimplePart {
        constructor() {
            super('myPart2', { hasTitle: false }, new TestThemeService(), new TestStorageService(), new TestLayoutService());
        }
        createTitleArea(parent) {
            return null;
        }
        createContentArea(parent) {
            const contentContainer = append(parent, $('div'));
            const contentSpan = append(contentContainer, $('span'));
            contentSpan.id = 'myPart.content';
            contentSpan.innerText = 'Content';
            return contentContainer;
        }
    }
    let fixture;
    const fixtureId = 'workbench-part-fixture';
    setup(() => {
        fixture = document.createElement('div');
        fixture.id = fixtureId;
        document.body.appendChild(fixture);
    });
    teardown(() => {
        document.body.removeChild(fixture);
    });
    test('Creation', () => {
        const b = document.createElement('div');
        document.getElementById(fixtureId).appendChild(b);
        hide(b);
        let part = new MyPart(b);
        part.create(b);
        assert.strictEqual(part.getId(), 'myPart');
        // Memento
        let memento = part.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        assert(memento);
        memento.foo = 'bar';
        memento.bar = [1, 2, 3];
        part.saveState();
        // Re-Create to assert memento contents
        part = new MyPart(b);
        memento = part.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        assert(memento);
        assert.strictEqual(memento.foo, 'bar');
        assert.strictEqual(memento.bar.length, 3);
        // Empty Memento stores empty object
        delete memento.foo;
        delete memento.bar;
        part.saveState();
        part = new MyPart(b);
        memento = part.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        assert(memento);
        assert.strictEqual(isEmptyObject(memento), true);
    });
    test('Part Layout with Title and Content', function () {
        const b = document.createElement('div');
        document.getElementById(fixtureId).appendChild(b);
        hide(b);
        const part = new MyPart2();
        part.create(b);
        assert(document.getElementById('myPart.title'));
        assert(document.getElementById('myPart.content'));
    });
    test('Part Layout with Content only', function () {
        const b = document.createElement('div');
        document.getElementById(fixtureId).appendChild(b);
        hide(b);
        const part = new MyPart3();
        part.create(b);
        assert(!document.getElementById('myPart.title'));
        assert(document.getElementById('myPart.content'));
    });
});
