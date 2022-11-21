/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { BaseActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { Widget } from 'vs/base/browser/ui/widget';
import { Codicon, CSSIcon } from 'vs/base/common/codicons';
import { Color } from 'vs/base/common/color';
import { Emitter } from 'vs/base/common/event';
import 'vs/css!./toggle';
const defaultOpts = {
    inputActiveOptionBorder: Color.fromHex('#007ACC00'),
    inputActiveOptionForeground: Color.fromHex('#FFFFFF'),
    inputActiveOptionBackground: Color.fromHex('#0E639C50')
};
export class ToggleActionViewItem extends BaseActionViewItem {
    toggle;
    constructor(context, action, options) {
        super(context, action, options);
        this.toggle = this._register(new Toggle({
            actionClassName: this._action.class,
            isChecked: !!this._action.checked,
            title: this.options.keybinding ? `${this._action.label} (${this.options.keybinding})` : this._action.label,
            notFocusable: true
        }));
        this._register(this.toggle.onChange(() => this._action.checked = !!this.toggle && this.toggle.checked));
    }
    render(container) {
        this.element = container;
        this.element.appendChild(this.toggle.domNode);
    }
    updateEnabled() {
        if (this.toggle) {
            if (this.isEnabled()) {
                this.toggle.enable();
            }
            else {
                this.toggle.disable();
            }
        }
    }
    updateChecked() {
        this.toggle.checked = !!this._action.checked;
    }
    focus() {
        this.toggle.domNode.tabIndex = 0;
        this.toggle.focus();
    }
    blur() {
        this.toggle.domNode.tabIndex = -1;
        this.toggle.domNode.blur();
    }
    setFocusable(focusable) {
        this.toggle.domNode.tabIndex = focusable ? 0 : -1;
    }
}
export class Toggle extends Widget {
    _onChange = this._register(new Emitter());
    onChange = this._onChange.event;
    _onKeyDown = this._register(new Emitter());
    onKeyDown = this._onKeyDown.event;
    _opts;
    _icon;
    domNode;
    _checked;
    constructor(opts) {
        super();
        this._opts = { ...defaultOpts, ...opts };
        this._checked = this._opts.isChecked;
        const classes = ['monaco-custom-toggle'];
        if (this._opts.icon) {
            this._icon = this._opts.icon;
            classes.push(...CSSIcon.asClassNameArray(this._icon));
        }
        if (this._opts.actionClassName) {
            classes.push(...this._opts.actionClassName.split(' '));
        }
        if (this._checked) {
            classes.push('checked');
        }
        this.domNode = document.createElement('div');
        this.domNode.title = this._opts.title;
        this.domNode.classList.add(...classes);
        if (!this._opts.notFocusable) {
            this.domNode.tabIndex = 0;
        }
        this.domNode.setAttribute('role', 'checkbox');
        this.domNode.setAttribute('aria-checked', String(this._checked));
        this.domNode.setAttribute('aria-label', this._opts.title);
        this.applyStyles();
        this.onclick(this.domNode, (ev) => {
            if (this.enabled) {
                this.checked = !this._checked;
                this._onChange.fire(false);
                ev.preventDefault();
            }
        });
        this._register(this.ignoreGesture(this.domNode));
        this.onkeydown(this.domNode, (keyboardEvent) => {
            if (keyboardEvent.keyCode === 10 /* KeyCode.Space */ || keyboardEvent.keyCode === 3 /* KeyCode.Enter */) {
                this.checked = !this._checked;
                this._onChange.fire(true);
                keyboardEvent.preventDefault();
                keyboardEvent.stopPropagation();
                return;
            }
            this._onKeyDown.fire(keyboardEvent);
        });
    }
    get enabled() {
        return this.domNode.getAttribute('aria-disabled') !== 'true';
    }
    focus() {
        this.domNode.focus();
    }
    get checked() {
        return this._checked;
    }
    set checked(newIsChecked) {
        this._checked = newIsChecked;
        this.domNode.setAttribute('aria-checked', String(this._checked));
        this.domNode.classList.toggle('checked', this._checked);
        this.applyStyles();
    }
    setIcon(icon) {
        if (this._icon) {
            this.domNode.classList.remove(...CSSIcon.asClassNameArray(this._icon));
        }
        this._icon = icon;
        if (this._icon) {
            this.domNode.classList.add(...CSSIcon.asClassNameArray(this._icon));
        }
    }
    width() {
        return 2 /*margin left*/ + 2 /*border*/ + 2 /*padding*/ + 16 /* icon width */;
    }
    style(styles) {
        if (styles.inputActiveOptionBorder) {
            this._opts.inputActiveOptionBorder = styles.inputActiveOptionBorder;
        }
        if (styles.inputActiveOptionForeground) {
            this._opts.inputActiveOptionForeground = styles.inputActiveOptionForeground;
        }
        if (styles.inputActiveOptionBackground) {
            this._opts.inputActiveOptionBackground = styles.inputActiveOptionBackground;
        }
        this.applyStyles();
    }
    applyStyles() {
        if (this.domNode) {
            this.domNode.style.borderColor = this._checked && this._opts.inputActiveOptionBorder ? this._opts.inputActiveOptionBorder.toString() : '';
            this.domNode.style.color = this._checked && this._opts.inputActiveOptionForeground ? this._opts.inputActiveOptionForeground.toString() : 'inherit';
            this.domNode.style.backgroundColor = this._checked && this._opts.inputActiveOptionBackground ? this._opts.inputActiveOptionBackground.toString() : '';
        }
    }
    enable() {
        this.domNode.setAttribute('aria-disabled', String(false));
    }
    disable() {
        this.domNode.setAttribute('aria-disabled', String(true));
    }
    setTitle(newTitle) {
        this.domNode.title = newTitle;
        this.domNode.setAttribute('aria-label', newTitle);
    }
}
export class Checkbox extends Widget {
    title;
    isChecked;
    checkbox;
    styles;
    domNode;
    constructor(title, isChecked) {
        super();
        this.title = title;
        this.isChecked = isChecked;
        this.checkbox = new Toggle({ title: this.title, isChecked: this.isChecked, icon: Codicon.check, actionClassName: 'monaco-checkbox' });
        this.domNode = this.checkbox.domNode;
        this.styles = {};
        this.checkbox.onChange(() => {
            this.applyStyles();
        });
    }
    get checked() {
        return this.checkbox.checked;
    }
    set checked(newIsChecked) {
        this.checkbox.checked = newIsChecked;
        this.applyStyles();
    }
    focus() {
        this.domNode.focus();
    }
    hasFocus() {
        return this.domNode === document.activeElement;
    }
    style(styles) {
        this.styles = styles;
        this.applyStyles();
    }
    applyStyles() {
        this.domNode.style.color = this.styles.checkboxForeground ? this.styles.checkboxForeground.toString() : '';
        this.domNode.style.backgroundColor = this.styles.checkboxBackground ? this.styles.checkboxBackground.toString() : '';
        this.domNode.style.borderColor = this.styles.checkboxBorder ? this.styles.checkboxBorder.toString() : '';
    }
}
