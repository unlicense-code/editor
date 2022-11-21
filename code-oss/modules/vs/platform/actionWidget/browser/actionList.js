var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as dom from 'vs/base/browser/dom';
import { KeybindingLabel } from 'vs/base/browser/ui/keybindingLabel/keybindingLabel';
import { List } from 'vs/base/browser/ui/list/listWidget';
import { Codicon } from 'vs/base/common/codicons';
import { Disposable } from 'vs/base/common/lifecycle';
import { OS } from 'vs/base/common/platform';
import 'vs/css!./actionWidget';
import { localize } from 'vs/nls';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
export const acceptSelectedActionCommand = 'acceptSelectedCodeAction';
export const previewSelectedActionCommand = 'previewSelectedCodeAction';
export var ActionListItemKind;
(function (ActionListItemKind) {
    ActionListItemKind["Action"] = "action";
    ActionListItemKind["Header"] = "header";
})(ActionListItemKind || (ActionListItemKind = {}));
class HeaderRenderer {
    get templateId() { return "header" /* ActionListItemKind.Header */; }
    renderTemplate(container) {
        container.classList.add('group-header');
        const text = document.createElement('span');
        container.append(text);
        return { container, text };
    }
    renderElement(element, _index, templateData) {
        if (!element.group) {
            return;
        }
        templateData.text.textContent = element.group?.title;
    }
    disposeTemplate(_templateData) {
        // noop
    }
}
let ActionItemRenderer = class ActionItemRenderer {
    _keybindingResolver;
    _keybindingService;
    get templateId() { return 'action'; }
    constructor(_keybindingResolver, _keybindingService) {
        this._keybindingResolver = _keybindingResolver;
        this._keybindingService = _keybindingService;
    }
    renderTemplate(container) {
        container.classList.add(this.templateId);
        const icon = document.createElement('div');
        icon.className = 'icon';
        container.append(icon);
        const text = document.createElement('span');
        text.className = 'title';
        container.append(text);
        const keybinding = new KeybindingLabel(container, OS);
        return { container, icon, text, keybinding };
    }
    renderElement(element, _index, data) {
        if (element.group?.icon) {
            data.icon.className = element.group.icon.codicon.classNames;
            data.icon.style.color = element.group.icon.color ?? '';
        }
        else {
            data.icon.className = Codicon.lightBulb.classNames;
            data.icon.style.color = 'var(--vscode-editorLightBulb-foreground)';
        }
        if (!element.item || !element.label) {
            return;
        }
        data.text.textContent = stripNewlines(element.label);
        const binding = this._keybindingResolver?.getResolver()(element.item);
        if (binding) {
            data.keybinding.set(binding);
        }
        if (!binding) {
            dom.hide(data.keybinding.element);
        }
        else {
            dom.show(data.keybinding.element);
        }
        const actionTitle = this._keybindingService.lookupKeybinding(acceptSelectedActionCommand)?.getLabel();
        const previewTitle = this._keybindingService.lookupKeybinding(previewSelectedActionCommand)?.getLabel();
        data.container.classList.toggle('option-disabled', element.disabled);
        if (element.disabled) {
            data.container.title = element.label;
        }
        else if (actionTitle && previewTitle) {
            data.container.title = localize({ key: 'label', comment: ['placeholders are keybindings, e.g "F2 to apply, Shift+F2 to preview"'] }, "{0} to apply, {1} to preview", actionTitle, previewTitle);
        }
        else {
            data.container.title = '';
        }
    }
    disposeTemplate(_templateData) {
        // noop
    }
};
ActionItemRenderer = __decorate([
    __param(1, IKeybindingService)
], ActionItemRenderer);
let ActionList = class ActionList extends Disposable {
    _delegate;
    _contextViewService;
    _keybindingService;
    domNode;
    _list;
    _actionLineHeight = 24;
    _headerLineHeight = 26;
    _allMenuItems;
    focusCondition(element) {
        return !element.disabled && element.kind === "action" /* ActionListItemKind.Action */;
    }
    constructor(user, items, showHeaders, _delegate, resolver, toMenuItems, _contextViewService, _keybindingService) {
        super();
        this._delegate = _delegate;
        this._contextViewService = _contextViewService;
        this._keybindingService = _keybindingService;
        this.domNode = document.createElement('div');
        this.domNode.classList.add('actionList');
        const virtualDelegate = {
            getHeight: element => element.kind === 'header' ? this._headerLineHeight : this._actionLineHeight,
            getTemplateId: element => element.kind
        };
        this._list = new List(user, this.domNode, virtualDelegate, [new ActionItemRenderer(resolver, this._keybindingService), new HeaderRenderer()], {
            keyboardSupport: true,
            accessibilityProvider: {
                getAriaLabel: element => {
                    if (element.kind === 'action') {
                        let label = element.label ? stripNewlines(element?.label) : '';
                        if (element.disabled) {
                            label = localize({ key: 'customQuickFixWidget.labels', comment: [`Action widget labels for accessibility.`] }, "{0}, Disabled Reason: {1}", label, element.disabled);
                        }
                        return label;
                    }
                    return null;
                },
                getWidgetAriaLabel: () => localize({ key: 'customQuickFixWidget', comment: [`An action widget option`] }, "Action Widget"),
                getRole: () => 'option',
                getWidgetRole: () => user
            },
        });
        this._register(this._list.onMouseClick(e => this.onListClick(e)));
        this._register(this._list.onMouseOver(e => this.onListHover(e)));
        this._register(this._list.onDidChangeFocus(() => this._list.domFocus()));
        this._register(this._list.onDidChangeSelection(e => this.onListSelection(e)));
        this._allMenuItems = toMenuItems(items, showHeaders);
        this._list.splice(0, this._list.length, this._allMenuItems);
        this.focusNext();
    }
    hide(didCancel) {
        this._delegate.onHide(didCancel);
        this._contextViewService.hideContextView();
    }
    layout(minWidth) {
        // Updating list height, depending on how many separators and headers there are.
        const numHeaders = this._allMenuItems.filter(item => item.kind === 'header').length;
        const height = this._allMenuItems.length * this._actionLineHeight;
        const heightWithHeaders = height + numHeaders * this._headerLineHeight - numHeaders * this._actionLineHeight;
        this._list.layout(heightWithHeaders);
        // For finding width dynamically (not using resize observer)
        const itemWidths = this._allMenuItems.map((_, index) => {
            const element = document.getElementById(this._list.getElementID(index));
            if (element) {
                element.style.width = 'auto';
                const width = element.getBoundingClientRect().width;
                element.style.width = '';
                return width;
            }
            return 0;
        });
        // resize observer - can be used in the future since list widget supports dynamic height but not width
        const width = Math.max(...itemWidths, minWidth);
        this._list.layout(heightWithHeaders, width);
        this.domNode.style.height = `${heightWithHeaders}px`;
        this._list.domFocus();
        return width;
    }
    focusPrevious() {
        this._list.focusPrevious(1, true, undefined, this.focusCondition);
    }
    focusNext() {
        this._list.focusNext(1, true, undefined, this.focusCondition);
    }
    acceptSelected(preview) {
        const focused = this._list.getFocus();
        if (focused.length === 0) {
            return;
        }
        const focusIndex = focused[0];
        const element = this._list.element(focusIndex);
        if (!this.focusCondition(element)) {
            return;
        }
        const event = new UIEvent(preview ? 'previewSelectedCodeAction' : 'acceptSelectedCodeAction');
        this._list.setSelection([focusIndex], event);
    }
    onListSelection(e) {
        if (!e.elements.length) {
            return;
        }
        const element = e.elements[0];
        if (element.item && this.focusCondition(element)) {
            this._delegate.onSelect(element.item, e.browserEvent?.type === 'previewSelectedEventType');
        }
        else {
            this._list.setSelection([]);
        }
    }
    onListHover(e) {
        this._list.setFocus(typeof e.index === 'number' ? [e.index] : []);
    }
    onListClick(e) {
        if (e.element && this.focusCondition(e.element)) {
            this._list.setFocus([]);
        }
    }
};
ActionList = __decorate([
    __param(6, IContextViewService),
    __param(7, IKeybindingService)
], ActionList);
export { ActionList };
function stripNewlines(str) {
    return str.replace(/\r\n|\r|\n/g, ' ');
}
