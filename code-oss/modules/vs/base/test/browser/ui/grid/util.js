/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { isGridBranchNode } from 'vs/base/browser/ui/grid/gridview';
import { Emitter } from 'vs/base/common/event';
export class TestView {
    _minimumWidth;
    _maximumWidth;
    _minimumHeight;
    _maximumHeight;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    get minimumWidth() { return this._minimumWidth; }
    set minimumWidth(size) { this._minimumWidth = size; this._onDidChange.fire(undefined); }
    get maximumWidth() { return this._maximumWidth; }
    set maximumWidth(size) { this._maximumWidth = size; this._onDidChange.fire(undefined); }
    get minimumHeight() { return this._minimumHeight; }
    set minimumHeight(size) { this._minimumHeight = size; this._onDidChange.fire(undefined); }
    get maximumHeight() { return this._maximumHeight; }
    set maximumHeight(size) { this._maximumHeight = size; this._onDidChange.fire(undefined); }
    _element = document.createElement('div');
    get element() { this._onDidGetElement.fire(); return this._element; }
    _onDidGetElement = new Emitter();
    onDidGetElement = this._onDidGetElement.event;
    _width = 0;
    get width() { return this._width; }
    _height = 0;
    get height() { return this._height; }
    get size() { return [this.width, this.height]; }
    _onDidLayout = new Emitter();
    onDidLayout = this._onDidLayout.event;
    _onDidFocus = new Emitter();
    onDidFocus = this._onDidFocus.event;
    constructor(_minimumWidth, _maximumWidth, _minimumHeight, _maximumHeight) {
        this._minimumWidth = _minimumWidth;
        this._maximumWidth = _maximumWidth;
        this._minimumHeight = _minimumHeight;
        this._maximumHeight = _maximumHeight;
        assert(_minimumWidth <= _maximumWidth, 'gridview view minimum width must be <= maximum width');
        assert(_minimumHeight <= _maximumHeight, 'gridview view minimum height must be <= maximum height');
    }
    layout(width, height) {
        this._width = width;
        this._height = height;
        this._onDidLayout.fire({ width, height });
    }
    focus() {
        this._onDidFocus.fire();
    }
    dispose() {
        this._onDidChange.dispose();
        this._onDidGetElement.dispose();
        this._onDidLayout.dispose();
        this._onDidFocus.dispose();
    }
}
export function nodesToArrays(node) {
    if (isGridBranchNode(node)) {
        return node.children.map(nodesToArrays);
    }
    else {
        return node.view;
    }
}
