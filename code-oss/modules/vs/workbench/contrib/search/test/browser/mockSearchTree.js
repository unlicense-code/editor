/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
const someEvent = new Emitter().event;
/**
 * Add stub methods as needed
 */
export class MockObjectTree {
    elements;
    get onDidChangeFocus() { return someEvent; }
    get onDidChangeSelection() { return someEvent; }
    get onDidOpen() { return someEvent; }
    get onMouseClick() { return someEvent; }
    get onMouseDblClick() { return someEvent; }
    get onContextMenu() { return someEvent; }
    get onKeyDown() { return someEvent; }
    get onKeyUp() { return someEvent; }
    get onKeyPress() { return someEvent; }
    get onDidFocus() { return someEvent; }
    get onDidBlur() { return someEvent; }
    get onDidChangeCollapseState() { return someEvent; }
    get onDidChangeRenderNodeCount() { return someEvent; }
    get onDidDispose() { return someEvent; }
    get lastVisibleElement() { return this.elements[this.elements.length - 1]; }
    constructor(elements) {
        this.elements = elements;
    }
    domFocus() { }
    collapse(location, recursive = false) {
        return true;
    }
    expand(location, recursive = false) {
        return true;
    }
    navigate(start) {
        const startIdx = start ? this.elements.indexOf(start) :
            undefined;
        return new ArrayNavigator(this.elements, startIdx);
    }
    getParentElement(elem) {
        return elem.parent();
    }
    dispose() {
    }
}
class ArrayNavigator {
    elements;
    index;
    constructor(elements, index = 0) {
        this.elements = elements;
        this.index = index;
    }
    current() {
        return this.elements[this.index];
    }
    previous() {
        return this.elements[--this.index];
    }
    first() {
        this.index = 0;
        return this.elements[this.index];
    }
    last() {
        this.index = this.elements.length - 1;
        return this.elements[this.index];
    }
    next() {
        return this.elements[++this.index];
    }
}
