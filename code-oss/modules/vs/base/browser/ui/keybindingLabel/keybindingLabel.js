/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as dom from 'vs/base/browser/dom';
import { UILabelProvider } from 'vs/base/common/keybindingLabels';
import { equals } from 'vs/base/common/objects';
import 'vs/css!./keybindingLabel';
import { localize } from 'vs/nls';
const $ = dom.$;
export class KeybindingLabel {
    os;
    domNode;
    options;
    keyElements = new Set();
    keybinding;
    matches;
    didEverRender;
    labelBackground;
    labelBorder;
    labelBottomBorder;
    labelShadow;
    constructor(container, os, options) {
        this.os = os;
        this.options = options || Object.create(null);
        this.labelBackground = this.options.keybindingLabelBackground;
        this.labelBorder = this.options.keybindingLabelBorder;
        this.labelBottomBorder = this.options.keybindingLabelBottomBorder;
        this.labelShadow = this.options.keybindingLabelShadow;
        const labelForeground = this.options.keybindingLabelForeground;
        this.domNode = dom.append(container, $('.monaco-keybinding'));
        if (labelForeground) {
            this.domNode.style.color = labelForeground;
        }
        this.didEverRender = false;
        container.appendChild(this.domNode);
    }
    get element() {
        return this.domNode;
    }
    set(keybinding, matches) {
        if (this.didEverRender && this.keybinding === keybinding && KeybindingLabel.areSame(this.matches, matches)) {
            return;
        }
        this.keybinding = keybinding;
        this.matches = matches;
        this.render();
    }
    render() {
        this.clear();
        if (this.keybinding) {
            const [firstPart, chordPart] = this.keybinding.getParts();
            if (firstPart) {
                this.renderPart(this.domNode, firstPart, this.matches ? this.matches.firstPart : null);
            }
            if (chordPart) {
                dom.append(this.domNode, $('span.monaco-keybinding-key-chord-separator', undefined, ' '));
                this.renderPart(this.domNode, chordPart, this.matches ? this.matches.chordPart : null);
            }
            this.domNode.title = this.keybinding.getAriaLabel() || '';
        }
        else if (this.options && this.options.renderUnboundKeybindings) {
            this.renderUnbound(this.domNode);
        }
        this.didEverRender = true;
    }
    clear() {
        dom.clearNode(this.domNode);
        this.keyElements.clear();
    }
    renderPart(parent, part, match) {
        const modifierLabels = UILabelProvider.modifierLabels[this.os];
        if (part.ctrlKey) {
            this.renderKey(parent, modifierLabels.ctrlKey, Boolean(match?.ctrlKey), modifierLabels.separator);
        }
        if (part.shiftKey) {
            this.renderKey(parent, modifierLabels.shiftKey, Boolean(match?.shiftKey), modifierLabels.separator);
        }
        if (part.altKey) {
            this.renderKey(parent, modifierLabels.altKey, Boolean(match?.altKey), modifierLabels.separator);
        }
        if (part.metaKey) {
            this.renderKey(parent, modifierLabels.metaKey, Boolean(match?.metaKey), modifierLabels.separator);
        }
        const keyLabel = part.keyLabel;
        if (keyLabel) {
            this.renderKey(parent, keyLabel, Boolean(match?.keyCode), '');
        }
    }
    renderKey(parent, label, highlight, separator) {
        dom.append(parent, this.createKeyElement(label, highlight ? '.highlight' : ''));
        if (separator) {
            dom.append(parent, $('span.monaco-keybinding-key-separator', undefined, separator));
        }
    }
    renderUnbound(parent) {
        dom.append(parent, this.createKeyElement(localize('unbound', "Unbound")));
    }
    createKeyElement(label, extraClass = '') {
        const keyElement = $('span.monaco-keybinding-key' + extraClass, undefined, label);
        this.keyElements.add(keyElement);
        if (this.labelBackground) {
            keyElement.style.backgroundColor = this.labelBackground;
        }
        if (this.labelBorder) {
            keyElement.style.borderColor = this.labelBorder;
        }
        if (this.labelBottomBorder) {
            keyElement.style.borderBottomColor = this.labelBottomBorder;
        }
        if (this.labelShadow) {
            keyElement.style.boxShadow = `inset 0 -1px 0 ${this.labelShadow}`;
        }
        return keyElement;
    }
    static areSame(a, b) {
        if (a === b || (!a && !b)) {
            return true;
        }
        return !!a && !!b && equals(a.firstPart, b.firstPart) && equals(a.chordPart, b.chordPart);
    }
}
