/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as dom from 'vs/base/browser/dom';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
import { FindInput } from 'vs/base/browser/ui/findinput/findInput';
import { Disposable } from 'vs/base/common/lifecycle';
import Severity from 'vs/base/common/severity';
import 'vs/css!./media/quickInput';
const $ = dom.$;
export class QuickInputBox extends Disposable {
    parent;
    container;
    findInput;
    constructor(parent) {
        super();
        this.parent = parent;
        this.container = dom.append(this.parent, $('.quick-input-box'));
        this.findInput = this._register(new FindInput(this.container, undefined, { label: '' }));
    }
    onKeyDown = (handler) => {
        return dom.addDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => {
            handler(new StandardKeyboardEvent(e));
        });
    };
    onMouseDown = (handler) => {
        return dom.addDisposableListener(this.findInput.inputBox.inputElement, dom.EventType.MOUSE_DOWN, (e) => {
            handler(new StandardMouseEvent(e));
        });
    };
    onDidChange = (handler) => {
        return this.findInput.onDidChange(handler);
    };
    get value() {
        return this.findInput.getValue();
    }
    set value(value) {
        this.findInput.setValue(value);
    }
    select(range = null) {
        this.findInput.inputBox.select(range);
    }
    isSelectionAtEnd() {
        return this.findInput.inputBox.isSelectionAtEnd();
    }
    setPlaceholder(placeholder) {
        this.findInput.inputBox.setPlaceHolder(placeholder);
    }
    get placeholder() {
        return this.findInput.inputBox.inputElement.getAttribute('placeholder') || '';
    }
    set placeholder(placeholder) {
        this.findInput.inputBox.setPlaceHolder(placeholder);
    }
    get ariaLabel() {
        return this.findInput.inputBox.getAriaLabel();
    }
    set ariaLabel(ariaLabel) {
        this.findInput.inputBox.setAriaLabel(ariaLabel);
    }
    get password() {
        return this.findInput.inputBox.inputElement.type === 'password';
    }
    set password(password) {
        this.findInput.inputBox.inputElement.type = password ? 'password' : 'text';
    }
    set enabled(enabled) {
        this.findInput.setEnabled(enabled);
    }
    set toggles(toggles) {
        this.findInput.setAdditionalToggles(toggles);
    }
    hasFocus() {
        return this.findInput.inputBox.hasFocus();
    }
    setAttribute(name, value) {
        this.findInput.inputBox.inputElement.setAttribute(name, value);
    }
    removeAttribute(name) {
        this.findInput.inputBox.inputElement.removeAttribute(name);
    }
    showDecoration(decoration) {
        if (decoration === Severity.Ignore) {
            this.findInput.clearMessage();
        }
        else {
            this.findInput.showMessage({ type: decoration === Severity.Info ? 1 /* MessageType.INFO */ : decoration === Severity.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */, content: '' });
        }
    }
    stylesForType(decoration) {
        return this.findInput.inputBox.stylesForType(decoration === Severity.Info ? 1 /* MessageType.INFO */ : decoration === Severity.Warning ? 2 /* MessageType.WARNING */ : 3 /* MessageType.ERROR */);
    }
    setFocus() {
        this.findInput.focus();
    }
    layout() {
        this.findInput.inputBox.layout();
    }
    style(styles) {
        this.findInput.style(styles);
    }
}
