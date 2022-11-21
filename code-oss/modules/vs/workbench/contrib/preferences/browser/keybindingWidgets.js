/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import 'vs/css!./media/keybindings';
import * as nls from 'vs/nls';
import { OS } from 'vs/base/common/platform';
import { Disposable, toDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { KeybindingLabel } from 'vs/base/browser/ui/keybindingLabel/keybindingLabel';
import { Widget } from 'vs/base/browser/ui/widget';
import * as dom from 'vs/base/browser/dom';
import * as aria from 'vs/base/browser/ui/aria/aria';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { createFastDomNode } from 'vs/base/browser/fastDomNode';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { attachInputBoxStyler, attachStylerCallback } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { editorWidgetBackground, editorWidgetForeground, widgetShadow } from 'vs/platform/theme/common/colorRegistry';
import { SearchWidget } from 'vs/workbench/contrib/preferences/browser/preferencesWidgets';
import { withNullAsUndefined } from 'vs/base/common/types';
import { Promises, timeout } from 'vs/base/common/async';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { getKeybindingLabelStyles } from 'vs/platform/theme/browser/defaultStyles';
let KeybindingsSearchWidget = class KeybindingsSearchWidget extends SearchWidget {
    _firstPart;
    _chordPart;
    _inputValue;
    recordDisposables = this._register(new DisposableStore());
    _onKeybinding = this._register(new Emitter());
    onKeybinding = this._onKeybinding.event;
    _onEnter = this._register(new Emitter());
    onEnter = this._onEnter.event;
    _onEscape = this._register(new Emitter());
    onEscape = this._onEscape.event;
    _onBlur = this._register(new Emitter());
    onBlur = this._onBlur.event;
    constructor(parent, options, contextViewService, instantiationService, themeService, contextKeyService, keybindingService) {
        super(parent, options, contextViewService, instantiationService, themeService, contextKeyService, keybindingService);
        this._register(attachInputBoxStyler(this.inputBox, themeService));
        this._register(toDisposable(() => this.stopRecordingKeys()));
        this._firstPart = null;
        this._chordPart = null;
        this._inputValue = '';
        this._reset();
    }
    clear() {
        this._reset();
        super.clear();
    }
    startRecordingKeys() {
        this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.KEY_DOWN, (e) => this._onKeyDown(new StandardKeyboardEvent(e))));
        this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.BLUR, () => this._onBlur.fire()));
        this.recordDisposables.add(dom.addDisposableListener(this.inputBox.inputElement, dom.EventType.INPUT, () => {
            // Prevent other characters from showing up
            this.setInputValue(this._inputValue);
        }));
    }
    stopRecordingKeys() {
        this._reset();
        this.recordDisposables.clear();
    }
    setInputValue(value) {
        this._inputValue = value;
        this.inputBox.value = this._inputValue;
    }
    _reset() {
        this._firstPart = null;
        this._chordPart = null;
    }
    _onKeyDown(keyboardEvent) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        const options = this.options;
        if (!options.recordEnter && keyboardEvent.equals(3 /* KeyCode.Enter */)) {
            this._onEnter.fire();
            return;
        }
        if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
            this._onEscape.fire();
            return;
        }
        this.printKeybinding(keyboardEvent);
    }
    printKeybinding(keyboardEvent) {
        const keybinding = this.keybindingService.resolveKeyboardEvent(keyboardEvent);
        const info = `code: ${keyboardEvent.browserEvent.code}, keyCode: ${keyboardEvent.browserEvent.keyCode}, key: ${keyboardEvent.browserEvent.key} => UI: ${keybinding.getAriaLabel()}, user settings: ${keybinding.getUserSettingsLabel()}, dispatch: ${keybinding.getDispatchParts()[0]}`;
        const options = this.options;
        const hasFirstPart = (this._firstPart && this._firstPart.getDispatchParts()[0] !== null);
        const hasChordPart = (this._chordPart && this._chordPart.getDispatchParts()[0] !== null);
        if (hasFirstPart && hasChordPart) {
            // Reset
            this._firstPart = keybinding;
            this._chordPart = null;
        }
        else if (!hasFirstPart) {
            this._firstPart = keybinding;
        }
        else {
            this._chordPart = keybinding;
        }
        let value = '';
        if (this._firstPart) {
            value = (this._firstPart.getUserSettingsLabel() || '');
        }
        if (this._chordPart) {
            value = value + ' ' + this._chordPart.getUserSettingsLabel();
        }
        this.setInputValue(options.quoteRecordedKeys ? `"${value}"` : value);
        this.inputBox.inputElement.title = info;
        this._onKeybinding.fire([this._firstPart, this._chordPart]);
    }
};
KeybindingsSearchWidget = __decorate([
    __param(2, IContextViewService),
    __param(3, IInstantiationService),
    __param(4, IThemeService),
    __param(5, IContextKeyService),
    __param(6, IKeybindingService)
], KeybindingsSearchWidget);
export { KeybindingsSearchWidget };
let DefineKeybindingWidget = class DefineKeybindingWidget extends Widget {
    instantiationService;
    themeService;
    static WIDTH = 400;
    static HEIGHT = 110;
    _domNode;
    _keybindingInputWidget;
    _outputNode;
    _showExistingKeybindingsNode;
    _firstPart = null;
    _chordPart = null;
    _isVisible = false;
    _onHide = this._register(new Emitter());
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    _onShowExistingKeybindings = this._register(new Emitter());
    onShowExistingKeybidings = this._onShowExistingKeybindings.event;
    constructor(parent, instantiationService, themeService) {
        super();
        this.instantiationService = instantiationService;
        this.themeService = themeService;
        this._domNode = createFastDomNode(document.createElement('div'));
        this._domNode.setDisplay('none');
        this._domNode.setClassName('defineKeybindingWidget');
        this._domNode.setWidth(DefineKeybindingWidget.WIDTH);
        this._domNode.setHeight(DefineKeybindingWidget.HEIGHT);
        const message = nls.localize('defineKeybinding.initial', "Press desired key combination and then press ENTER.");
        dom.append(this._domNode.domNode, dom.$('.message', undefined, message));
        this._register(attachStylerCallback(this.themeService, { editorWidgetBackground, editorWidgetForeground, widgetShadow }, colors => {
            if (colors.editorWidgetBackground) {
                this._domNode.domNode.style.backgroundColor = colors.editorWidgetBackground.toString();
            }
            else {
                this._domNode.domNode.style.backgroundColor = '';
            }
            if (colors.editorWidgetForeground) {
                this._domNode.domNode.style.color = colors.editorWidgetForeground.toString();
            }
            else {
                this._domNode.domNode.style.color = '';
            }
            if (colors.widgetShadow) {
                this._domNode.domNode.style.boxShadow = `0 2px 8px ${colors.widgetShadow}`;
            }
            else {
                this._domNode.domNode.style.boxShadow = '';
            }
        }));
        this._keybindingInputWidget = this._register(this.instantiationService.createInstance(KeybindingsSearchWidget, this._domNode.domNode, { ariaLabel: message, history: [] }));
        this._keybindingInputWidget.startRecordingKeys();
        this._register(this._keybindingInputWidget.onKeybinding(keybinding => this.onKeybinding(keybinding)));
        this._register(this._keybindingInputWidget.onEnter(() => this.hide()));
        this._register(this._keybindingInputWidget.onEscape(() => this.onCancel()));
        this._register(this._keybindingInputWidget.onBlur(() => this.onCancel()));
        this._outputNode = dom.append(this._domNode.domNode, dom.$('.output'));
        this._showExistingKeybindingsNode = dom.append(this._domNode.domNode, dom.$('.existing'));
        if (parent) {
            dom.append(parent, this._domNode.domNode);
        }
    }
    get domNode() {
        return this._domNode.domNode;
    }
    define() {
        this._keybindingInputWidget.clear();
        return Promises.withAsyncBody(async (c) => {
            if (!this._isVisible) {
                this._isVisible = true;
                this._domNode.setDisplay('block');
                this._firstPart = null;
                this._chordPart = null;
                this._keybindingInputWidget.setInputValue('');
                dom.clearNode(this._outputNode);
                dom.clearNode(this._showExistingKeybindingsNode);
                // Input is not getting focus without timeout in safari
                // https://github.com/microsoft/vscode/issues/108817
                await timeout(0);
                this._keybindingInputWidget.focus();
            }
            const disposable = this._onHide.event(() => {
                c(this.getUserSettingsLabel());
                disposable.dispose();
            });
        });
    }
    layout(layout) {
        const top = Math.round((layout.height - DefineKeybindingWidget.HEIGHT) / 2);
        this._domNode.setTop(top);
        const left = Math.round((layout.width - DefineKeybindingWidget.WIDTH) / 2);
        this._domNode.setLeft(left);
    }
    printExisting(numberOfExisting) {
        if (numberOfExisting > 0) {
            const existingElement = dom.$('span.existingText');
            const text = numberOfExisting === 1 ? nls.localize('defineKeybinding.oneExists', "1 existing command has this keybinding", numberOfExisting) : nls.localize('defineKeybinding.existing', "{0} existing commands have this keybinding", numberOfExisting);
            dom.append(existingElement, document.createTextNode(text));
            aria.alert(text);
            this._showExistingKeybindingsNode.appendChild(existingElement);
            existingElement.onmousedown = (e) => { e.preventDefault(); };
            existingElement.onmouseup = (e) => { e.preventDefault(); };
            existingElement.onclick = () => { this._onShowExistingKeybindings.fire(this.getUserSettingsLabel()); };
        }
    }
    onKeybinding(keybinding) {
        const [firstPart, chordPart] = keybinding;
        this._firstPart = firstPart;
        this._chordPart = chordPart;
        dom.clearNode(this._outputNode);
        dom.clearNode(this._showExistingKeybindingsNode);
        const firstLabel = new KeybindingLabel(this._outputNode, OS, getKeybindingLabelStyles());
        firstLabel.set(withNullAsUndefined(this._firstPart));
        if (this._chordPart) {
            this._outputNode.appendChild(document.createTextNode(nls.localize('defineKeybinding.chordsTo', "chord to")));
            const chordLabel = new KeybindingLabel(this._outputNode, OS, getKeybindingLabelStyles());
            chordLabel.set(this._chordPart);
        }
        const label = this.getUserSettingsLabel();
        if (label) {
            this._onDidChange.fire(label);
        }
    }
    getUserSettingsLabel() {
        let label = null;
        if (this._firstPart) {
            label = this._firstPart.getUserSettingsLabel();
            if (this._chordPart) {
                label = label + ' ' + this._chordPart.getUserSettingsLabel();
            }
        }
        return label;
    }
    onCancel() {
        this._firstPart = null;
        this._chordPart = null;
        this.hide();
    }
    hide() {
        this._domNode.setDisplay('none');
        this._isVisible = false;
        this._onHide.fire();
    }
};
DefineKeybindingWidget = __decorate([
    __param(1, IInstantiationService),
    __param(2, IThemeService)
], DefineKeybindingWidget);
export { DefineKeybindingWidget };
let DefineKeybindingOverlayWidget = class DefineKeybindingOverlayWidget extends Disposable {
    _editor;
    static ID = 'editor.contrib.defineKeybindingWidget';
    _widget;
    constructor(_editor, instantiationService) {
        super();
        this._editor = _editor;
        this._widget = instantiationService.createInstance(DefineKeybindingWidget, null);
        this._editor.addOverlayWidget(this);
    }
    getId() {
        return DefineKeybindingOverlayWidget.ID;
    }
    getDomNode() {
        return this._widget.domNode;
    }
    getPosition() {
        return {
            preference: null
        };
    }
    dispose() {
        this._editor.removeOverlayWidget(this);
        super.dispose();
    }
    start() {
        if (this._editor.hasModel()) {
            this._editor.revealPositionInCenterIfOutsideViewport(this._editor.getPosition(), 0 /* ScrollType.Smooth */);
        }
        const layoutInfo = this._editor.getLayoutInfo();
        this._widget.layout(new dom.Dimension(layoutInfo.width, layoutInfo.height));
        return this._widget.define();
    }
};
DefineKeybindingOverlayWidget = __decorate([
    __param(1, IInstantiationService)
], DefineKeybindingOverlayWidget);
export { DefineKeybindingOverlayWidget };
