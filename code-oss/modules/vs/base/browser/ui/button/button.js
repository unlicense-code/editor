/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { addDisposableListener, EventHelper, EventType, reset, trackFocus } from 'vs/base/browser/dom';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { EventType as TouchEventType, Gesture } from 'vs/base/browser/touch';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { Action } from 'vs/base/common/actions';
import { Codicon, CSSIcon } from 'vs/base/common/codicons';
import { Color } from 'vs/base/common/color';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import 'vs/css!./button';
export const unthemedButtonStyles = {
    buttonBackground: '#0E639C',
    buttonHoverBackground: '#006BB3',
    buttonSeparator: Color.white.toString(),
    buttonForeground: Color.white.toString(),
    buttonBorder: undefined,
    buttonSecondaryBackground: undefined,
    buttonSecondaryForeground: undefined,
    buttonSecondaryHoverBackground: undefined
};
export class Button extends Disposable {
    _element;
    options;
    _onDidClick = this._register(new Emitter());
    get onDidClick() { return this._onDidClick.event; }
    focusTracker;
    constructor(container, options) {
        super();
        this.options = options;
        this._element = document.createElement('a');
        this._element.classList.add('monaco-button');
        this._element.tabIndex = 0;
        this._element.setAttribute('role', 'button');
        const background = options.secondary ? options.buttonSecondaryBackground : options.buttonBackground;
        const foreground = options.secondary ? options.buttonSecondaryForeground : options.buttonForeground;
        const border = options.buttonBorder;
        this._element.style.color = foreground || '';
        this._element.style.backgroundColor = background || '';
        if (border) {
            this._element.style.border = `1px solid ${border}`;
        }
        container.appendChild(this._element);
        this._register(Gesture.addTarget(this._element));
        [EventType.CLICK, TouchEventType.Tap].forEach(eventType => {
            this._register(addDisposableListener(this._element, eventType, e => {
                if (!this.enabled) {
                    EventHelper.stop(e);
                    return;
                }
                this._onDidClick.fire(e);
            }));
        });
        this._register(addDisposableListener(this._element, EventType.KEY_DOWN, e => {
            const event = new StandardKeyboardEvent(e);
            let eventHandled = false;
            if (this.enabled && (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */))) {
                this._onDidClick.fire(e);
                eventHandled = true;
            }
            else if (event.equals(9 /* KeyCode.Escape */)) {
                this._element.blur();
                eventHandled = true;
            }
            if (eventHandled) {
                EventHelper.stop(event, true);
            }
        }));
        this._register(addDisposableListener(this._element, EventType.MOUSE_OVER, e => {
            if (!this._element.classList.contains('disabled')) {
                this.updateBackground(true);
            }
        }));
        this._register(addDisposableListener(this._element, EventType.MOUSE_OUT, e => {
            this.updateBackground(false); // restore standard styles
        }));
        // Also set hover background when button is focused for feedback
        this.focusTracker = this._register(trackFocus(this._element));
        this._register(this.focusTracker.onDidFocus(() => { if (this.enabled) {
            this.updateBackground(true);
        } }));
        this._register(this.focusTracker.onDidBlur(() => { if (this.enabled) {
            this.updateBackground(false);
        } }));
    }
    updateBackground(hover) {
        let background;
        if (this.options.secondary) {
            background = hover ? this.options.buttonSecondaryHoverBackground : this.options.buttonSecondaryBackground;
        }
        else {
            background = hover ? this.options.buttonHoverBackground : this.options.buttonBackground;
        }
        if (background) {
            this._element.style.backgroundColor = background;
        }
    }
    get element() {
        return this._element;
    }
    set label(value) {
        this._element.classList.add('monaco-text-button');
        if (this.options.supportIcons) {
            const content = [];
            for (let segment of renderLabelWithIcons(value)) {
                if (typeof (segment) === 'string') {
                    segment = segment.trim();
                    // Ignore empty segment
                    if (segment === '') {
                        continue;
                    }
                    // Convert string segments to <span> nodes
                    const node = document.createElement('span');
                    node.textContent = segment;
                    content.push(node);
                }
                else {
                    content.push(segment);
                }
            }
            reset(this._element, ...content);
        }
        else {
            this._element.textContent = value;
        }
        if (typeof this.options.title === 'string') {
            this._element.title = this.options.title;
        }
        else if (this.options.title) {
            this._element.title = value;
        }
    }
    set icon(icon) {
        this._element.classList.add(...CSSIcon.asClassNameArray(icon));
    }
    set enabled(value) {
        if (value) {
            this._element.classList.remove('disabled');
            this._element.setAttribute('aria-disabled', String(false));
            this._element.tabIndex = 0;
        }
        else {
            this._element.classList.add('disabled');
            this._element.setAttribute('aria-disabled', String(true));
        }
    }
    get enabled() {
        return !this._element.classList.contains('disabled');
    }
    focus() {
        this._element.focus();
    }
    hasFocus() {
        return this._element === document.activeElement;
    }
}
export class ButtonWithDropdown extends Disposable {
    button;
    action;
    dropdownButton;
    separatorContainer;
    separator;
    element;
    _onDidClick = this._register(new Emitter());
    onDidClick = this._onDidClick.event;
    constructor(container, options) {
        super();
        this.element = document.createElement('div');
        this.element.classList.add('monaco-button-dropdown');
        container.appendChild(this.element);
        this.button = this._register(new Button(this.element, options));
        this._register(this.button.onDidClick(e => this._onDidClick.fire(e)));
        this.action = this._register(new Action('primaryAction', this.button.label, undefined, true, async () => this._onDidClick.fire(undefined)));
        this.separatorContainer = document.createElement('div');
        this.separatorContainer.classList.add('monaco-button-dropdown-separator');
        this.separator = document.createElement('div');
        this.separatorContainer.appendChild(this.separator);
        this.element.appendChild(this.separatorContainer);
        // Separator styles
        const border = options.buttonBorder;
        if (border) {
            this.separatorContainer.style.borderTop = '1px solid ' + border;
            this.separatorContainer.style.borderBottom = '1px solid ' + border;
        }
        this.separatorContainer.style.backgroundColor = options.buttonBackground ?? '';
        this.separator.style.backgroundColor = options.buttonSeparator ?? '';
        this.dropdownButton = this._register(new Button(this.element, { ...options, title: false, supportIcons: true }));
        this.dropdownButton.element.title = localize("button dropdown more actions", 'More Actions...');
        this.dropdownButton.element.setAttribute('aria-haspopup', 'true');
        this.dropdownButton.element.setAttribute('aria-expanded', 'false');
        this.dropdownButton.element.classList.add('monaco-dropdown-button');
        this.dropdownButton.icon = Codicon.dropDownButton;
        this._register(this.dropdownButton.onDidClick(e => {
            options.contextMenuProvider.showContextMenu({
                getAnchor: () => this.dropdownButton.element,
                getActions: () => options.addPrimaryActionToDropdown === false ? [...options.actions] : [this.action, ...options.actions],
                actionRunner: options.actionRunner,
                onHide: () => this.dropdownButton.element.setAttribute('aria-expanded', 'false')
            });
            this.dropdownButton.element.setAttribute('aria-expanded', 'true');
        }));
    }
    set label(value) {
        this.button.label = value;
        this.action.label = value;
    }
    set icon(icon) {
        this.button.icon = icon;
    }
    set enabled(enabled) {
        this.button.enabled = enabled;
        this.dropdownButton.enabled = enabled;
        this.element.classList.toggle('disabled', !enabled);
    }
    get enabled() {
        return this.button.enabled;
    }
    focus() {
        this.button.focus();
    }
    hasFocus() {
        return this.button.hasFocus() || this.dropdownButton.hasFocus();
    }
}
export class ButtonWithDescription extends Button {
    _labelElement;
    _descriptionElement;
    constructor(container, options) {
        super(container, options);
        this._element.classList.add('monaco-description-button');
        this._labelElement = document.createElement('div');
        this._labelElement.classList.add('monaco-button-label');
        this._element.appendChild(this._labelElement);
        this._descriptionElement = document.createElement('div');
        this._descriptionElement.classList.add('monaco-button-description');
        this._element.appendChild(this._descriptionElement);
    }
    set label(value) {
        this._element.classList.add('monaco-text-button');
        if (this.options.supportIcons) {
            reset(this._labelElement, ...renderLabelWithIcons(value));
        }
        else {
            this._labelElement.textContent = value;
        }
        if (typeof this.options.title === 'string') {
            this._element.title = this.options.title;
        }
        else if (this.options.title) {
            this._element.title = value;
        }
    }
    set description(value) {
        if (this.options.supportIcons) {
            reset(this._descriptionElement, ...renderLabelWithIcons(value));
        }
        else {
            this._descriptionElement.textContent = value;
        }
    }
}
export class ButtonBar extends Disposable {
    container;
    _buttons = [];
    constructor(container) {
        super();
        this.container = container;
    }
    get buttons() {
        return this._buttons;
    }
    addButton(options) {
        const button = this._register(new Button(this.container, options));
        this.pushButton(button);
        return button;
    }
    addButtonWithDescription(options) {
        const button = this._register(new ButtonWithDescription(this.container, options));
        this.pushButton(button);
        return button;
    }
    addButtonWithDropdown(options) {
        const button = this._register(new ButtonWithDropdown(this.container, options));
        this.pushButton(button);
        return button;
    }
    pushButton(button) {
        this._buttons.push(button);
        const index = this._buttons.length - 1;
        this._register(addDisposableListener(button.element, EventType.KEY_DOWN, e => {
            const event = new StandardKeyboardEvent(e);
            let eventHandled = true;
            // Next / Previous Button
            let buttonIndexToFocus;
            if (event.equals(15 /* KeyCode.LeftArrow */)) {
                buttonIndexToFocus = index > 0 ? index - 1 : this._buttons.length - 1;
            }
            else if (event.equals(17 /* KeyCode.RightArrow */)) {
                buttonIndexToFocus = index === this._buttons.length - 1 ? 0 : index + 1;
            }
            else {
                eventHandled = false;
            }
            if (eventHandled && typeof buttonIndexToFocus === 'number') {
                this._buttons[buttonIndexToFocus].focus();
                EventHelper.stop(e, true);
            }
        }));
    }
}
