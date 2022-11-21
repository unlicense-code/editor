/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { addDisposableListener } from 'vs/base/browser/dom';
export class NavigationModeAddon {
    _navigationModeContextKey;
    _navigationModeActiveContextKey;
    _terminal;
    constructor(_navigationModeContextKey, _navigationModeActiveContextKey) {
        this._navigationModeContextKey = _navigationModeContextKey;
        this._navigationModeActiveContextKey = _navigationModeActiveContextKey;
    }
    activate(terminal) {
        this._terminal = terminal;
    }
    dispose() { }
    exitNavigationMode() {
        if (!this._terminal) {
            return;
        }
        this._terminal.scrollToBottom();
        this._terminal.focus();
        this._navigationModeActiveContextKey.set(false);
    }
    focusPreviousPage() {
        if (!this._terminal?.buffer.active) {
            return;
        }
        this._navigationModeActiveContextKey.set(true);
        if (this._terminal?.buffer.active.viewportY < this._terminal.rows) {
            this._terminal.scrollToTop();
            this._focusRow(0);
        }
        else {
            this._terminal.scrollLines(-this._terminal.rows);
            this._focusLine('current');
        }
    }
    focusNextPage() {
        if (!this._terminal?.buffer.active) {
            return;
        }
        this._navigationModeActiveContextKey.set(true);
        if (this._terminal.buffer.active.viewportY === this._terminal.buffer.active.baseY) {
            this._focusRow(this._terminal.rows - 1);
        }
        else {
            this._terminal.scrollLines(this._terminal.rows);
            this._focusLine('current');
        }
    }
    focusPreviousLine() {
        this._navigationModeActiveContextKey.set(true);
        this._focusLine('previous');
    }
    focusNextLine() {
        this._navigationModeActiveContextKey.set(true);
        this._focusLine('next');
    }
    _focusLine(type) {
        if (!this._terminal?.element) {
            return;
        }
        // Focus row if a row is already focused
        if (document.activeElement && document.activeElement.parentElement && document.activeElement.parentElement.classList.contains('xterm-accessibility-tree')) {
            let element = document.activeElement;
            if (type !== 'current') {
                element = type === 'previous' ? document.activeElement.previousElementSibling : document.activeElement.nextElementSibling;
            }
            if (element) {
                element.focus();
                const disposable = addDisposableListener(element, 'blur', () => {
                    this._navigationModeContextKey.set(false);
                    disposable.dispose();
                });
                this._navigationModeContextKey.set(true);
            }
            return;
        }
        let targetRow;
        if (type === 'previous') {
            targetRow = Math.max(this._terminal.buffer.active.cursorY - 1, 0);
        }
        else {
            targetRow = this._terminal.buffer.active.cursorY;
        }
        this._focusRow(targetRow);
    }
    _focusRow(targetRow) {
        if (!this._terminal) {
            return;
        }
        if (!this._terminal?.element) {
            return;
        }
        // Ensure a11y tree exists
        const treeContainer = this._terminal.element.querySelector('.xterm-accessibility-tree');
        if (!treeContainer) {
            return;
        }
        // Check bounds
        if (treeContainer.childElementCount < targetRow || targetRow < 0) {
            return;
        }
        const element = treeContainer.childNodes.item(targetRow);
        element.focus();
        const disposable = addDisposableListener(element, 'blur', () => {
            this._navigationModeContextKey.set(false);
            disposable.dispose();
        });
        this._navigationModeContextKey.set(true);
    }
}
