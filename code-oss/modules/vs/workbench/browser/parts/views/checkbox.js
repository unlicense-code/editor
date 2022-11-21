/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as DOM from 'vs/base/browser/dom';
import { Toggle } from 'vs/base/browser/ui/toggle/toggle';
import { Codicon } from 'vs/base/common/codicons';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { attachToggleStyler } from 'vs/platform/theme/common/styler';
export class CheckboxStateHandler extends Disposable {
    _onDidChangeCheckboxState = this._register(new Emitter());
    onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
    setCheckboxState(node) {
        this._onDidChangeCheckboxState.fire([node]);
    }
}
export class TreeItemCheckbox extends Disposable {
    checkboxStateHandler;
    themeService;
    toggle;
    checkboxContainer;
    isDisposed = false;
    static checkboxClass = 'custom-view-tree-node-item-checkbox';
    _onDidChangeState = new Emitter();
    onDidChangeState = this._onDidChangeState.event;
    constructor(container, checkboxStateHandler, themeService) {
        super();
        this.checkboxStateHandler = checkboxStateHandler;
        this.themeService = themeService;
        this.checkboxContainer = container;
    }
    render(node) {
        if (node.checkbox) {
            if (!this.toggle) {
                this.createCheckbox(node);
            }
            else {
                this.toggle.checked = node.checkbox.isChecked;
                this.toggle.setIcon(this.toggle.checked ? Codicon.check : undefined);
            }
        }
    }
    createCheckbox(node) {
        if (node.checkbox) {
            this.toggle = new Toggle({
                isChecked: node.checkbox.isChecked,
                title: this.createCheckboxTitle(node.checkbox),
                icon: node.checkbox.isChecked ? Codicon.check : undefined
            });
            this.toggle.domNode.classList.add(TreeItemCheckbox.checkboxClass);
            DOM.append(this.checkboxContainer, this.toggle.domNode);
            this.registerListener(node);
        }
    }
    registerListener(node) {
        if (this.toggle) {
            this._register({ dispose: () => this.removeCheckbox() });
            this._register(this.toggle);
            this._register(this.toggle.onChange(() => {
                this.setCheckbox(node);
            }));
            this._register(attachToggleStyler(this.toggle, this.themeService));
        }
    }
    setCheckbox(node) {
        if (this.toggle && node.checkbox) {
            node.checkbox.isChecked = this.toggle.checked;
            this.toggle.setIcon(this.toggle.checked ? Codicon.check : undefined);
            this.toggle.setTitle(this.createCheckboxTitle(node.checkbox));
            this.checkboxStateHandler.setCheckboxState(node);
        }
    }
    createCheckboxTitle(checkbox) {
        return checkbox.tooltip ? checkbox.tooltip :
            checkbox.isChecked ? localize('checked', 'Checked') : localize('unchecked', 'Unchecked');
    }
    removeCheckbox() {
        const children = this.checkboxContainer.children;
        for (const child of children) {
            this.checkboxContainer.removeChild(child);
        }
    }
}
