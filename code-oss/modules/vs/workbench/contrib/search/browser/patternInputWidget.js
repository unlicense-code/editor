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
import * as dom from 'vs/base/browser/dom';
import { Toggle } from 'vs/base/browser/ui/toggle/toggle';
import { Widget } from 'vs/base/browser/ui/widget';
import { Codicon } from 'vs/base/common/codicons';
import { Emitter } from 'vs/base/common/event';
import * as nls from 'vs/nls';
import { ContextScopedHistoryInputBox } from 'vs/platform/history/browser/contextScopedHistoryWidget';
import { showHistoryKeybindingHint } from 'vs/platform/history/browser/historyWidgetKeybindingHint';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { attachToggleStyler, attachInputBoxStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
let PatternInputWidget = class PatternInputWidget extends Widget {
    contextViewProvider;
    themeService;
    contextKeyService;
    configurationService;
    keybindingService;
    static OPTION_CHANGE = 'optionChange';
    inputFocusTracker;
    width;
    domNode;
    inputBox;
    _onSubmit = this._register(new Emitter());
    onSubmit = this._onSubmit.event;
    _onCancel = this._register(new Emitter());
    onCancel = this._onCancel.event;
    constructor(parent, contextViewProvider, options = Object.create(null), themeService, contextKeyService, configurationService, keybindingService) {
        super();
        this.contextViewProvider = contextViewProvider;
        this.themeService = themeService;
        this.contextKeyService = contextKeyService;
        this.configurationService = configurationService;
        this.keybindingService = keybindingService;
        options = {
            ...{
                ariaLabel: nls.localize('defaultLabel', "input")
            },
            ...options,
        };
        this.width = options.width ?? 100;
        this.render(options);
        parent.appendChild(this.domNode);
    }
    dispose() {
        super.dispose();
        this.inputFocusTracker?.dispose();
    }
    setWidth(newWidth) {
        this.width = newWidth;
        this.domNode.style.width = this.width + 'px';
        this.contextViewProvider.layout();
        this.setInputWidth();
    }
    getValue() {
        return this.inputBox.value;
    }
    setValue(value) {
        if (this.inputBox.value !== value) {
            this.inputBox.value = value;
        }
    }
    select() {
        this.inputBox.select();
    }
    focus() {
        this.inputBox.focus();
    }
    inputHasFocus() {
        return this.inputBox.hasFocus();
    }
    setInputWidth() {
        this.inputBox.width = this.width - this.getSubcontrolsWidth() - 2; // 2 for input box border
    }
    getSubcontrolsWidth() {
        return 0;
    }
    getHistory() {
        return this.inputBox.getHistory();
    }
    clearHistory() {
        this.inputBox.clearHistory();
    }
    clear() {
        this.setValue('');
    }
    onSearchSubmit() {
        this.inputBox.addToHistory();
    }
    showNextTerm() {
        this.inputBox.showNextValue();
    }
    showPreviousTerm() {
        this.inputBox.showPreviousValue();
    }
    style(styles) {
        this.inputBox.style(styles);
    }
    render(options) {
        this.domNode = document.createElement('div');
        this.domNode.style.width = this.width + 'px';
        this.domNode.classList.add('monaco-findInput');
        this.inputBox = new ContextScopedHistoryInputBox(this.domNode, this.contextViewProvider, {
            placeholder: options.placeholder,
            showPlaceholderOnFocus: options.showPlaceholderOnFocus,
            tooltip: options.tooltip,
            ariaLabel: options.ariaLabel,
            validationOptions: {
                validation: undefined
            },
            history: options.history || [],
            showHistoryHint: () => showHistoryKeybindingHint(this.keybindingService)
        }, this.contextKeyService);
        this._register(attachInputBoxStyler(this.inputBox, this.themeService));
        this._register(this.inputBox.onDidChange(() => this._onSubmit.fire(true)));
        this.inputFocusTracker = dom.trackFocus(this.inputBox.inputElement);
        this.onkeyup(this.inputBox.inputElement, (keyboardEvent) => this.onInputKeyUp(keyboardEvent));
        const controls = document.createElement('div');
        controls.className = 'controls';
        this.renderSubcontrols(controls);
        this.domNode.appendChild(controls);
        this.setInputWidth();
    }
    renderSubcontrols(_controlsDiv) {
    }
    onInputKeyUp(keyboardEvent) {
        switch (keyboardEvent.keyCode) {
            case 3 /* KeyCode.Enter */:
                this.onSearchSubmit();
                this._onSubmit.fire(false);
                return;
            case 9 /* KeyCode.Escape */:
                this._onCancel.fire();
                return;
        }
    }
};
PatternInputWidget = __decorate([
    __param(3, IThemeService),
    __param(4, IContextKeyService),
    __param(5, IConfigurationService),
    __param(6, IKeybindingService)
], PatternInputWidget);
export { PatternInputWidget };
let IncludePatternInputWidget = class IncludePatternInputWidget extends PatternInputWidget {
    _onChangeSearchInEditorsBoxEmitter = this._register(new Emitter());
    onChangeSearchInEditorsBox = this._onChangeSearchInEditorsBoxEmitter.event;
    constructor(parent, contextViewProvider, options = Object.create(null), themeService, contextKeyService, configurationService, keybindingService) {
        super(parent, contextViewProvider, options, themeService, contextKeyService, configurationService, keybindingService);
    }
    useSearchInEditorsBox;
    dispose() {
        super.dispose();
        this.useSearchInEditorsBox.dispose();
    }
    onlySearchInOpenEditors() {
        return this.useSearchInEditorsBox.checked;
    }
    setOnlySearchInOpenEditors(value) {
        this.useSearchInEditorsBox.checked = value;
        this._onChangeSearchInEditorsBoxEmitter.fire();
    }
    getSubcontrolsWidth() {
        return super.getSubcontrolsWidth() + this.useSearchInEditorsBox.width();
    }
    renderSubcontrols(controlsDiv) {
        this.useSearchInEditorsBox = this._register(new Toggle({
            icon: Codicon.book,
            title: nls.localize('onlySearchInOpenEditors', "Search only in Open Editors"),
            isChecked: false,
        }));
        this._register(this.useSearchInEditorsBox.onChange(viaKeyboard => {
            this._onChangeSearchInEditorsBoxEmitter.fire();
            if (!viaKeyboard) {
                this.inputBox.focus();
            }
        }));
        this._register(attachToggleStyler(this.useSearchInEditorsBox, this.themeService));
        controlsDiv.appendChild(this.useSearchInEditorsBox.domNode);
        super.renderSubcontrols(controlsDiv);
    }
};
IncludePatternInputWidget = __decorate([
    __param(3, IThemeService),
    __param(4, IContextKeyService),
    __param(5, IConfigurationService),
    __param(6, IKeybindingService)
], IncludePatternInputWidget);
export { IncludePatternInputWidget };
let ExcludePatternInputWidget = class ExcludePatternInputWidget extends PatternInputWidget {
    _onChangeIgnoreBoxEmitter = this._register(new Emitter());
    onChangeIgnoreBox = this._onChangeIgnoreBoxEmitter.event;
    constructor(parent, contextViewProvider, options = Object.create(null), themeService, contextKeyService, configurationService, keybindingService) {
        super(parent, contextViewProvider, options, themeService, contextKeyService, configurationService, keybindingService);
    }
    useExcludesAndIgnoreFilesBox;
    dispose() {
        super.dispose();
        this.useExcludesAndIgnoreFilesBox.dispose();
    }
    useExcludesAndIgnoreFiles() {
        return this.useExcludesAndIgnoreFilesBox.checked;
    }
    setUseExcludesAndIgnoreFiles(value) {
        this.useExcludesAndIgnoreFilesBox.checked = value;
        this._onChangeIgnoreBoxEmitter.fire();
    }
    getSubcontrolsWidth() {
        return super.getSubcontrolsWidth() + this.useExcludesAndIgnoreFilesBox.width();
    }
    renderSubcontrols(controlsDiv) {
        this.useExcludesAndIgnoreFilesBox = this._register(new Toggle({
            icon: Codicon.exclude,
            actionClassName: 'useExcludesAndIgnoreFiles',
            title: nls.localize('useExcludesAndIgnoreFilesDescription', "Use Exclude Settings and Ignore Files"),
            isChecked: true,
        }));
        this._register(this.useExcludesAndIgnoreFilesBox.onChange(viaKeyboard => {
            this._onChangeIgnoreBoxEmitter.fire();
            if (!viaKeyboard) {
                this.inputBox.focus();
            }
        }));
        this._register(attachToggleStyler(this.useExcludesAndIgnoreFilesBox, this.themeService));
        controlsDiv.appendChild(this.useExcludesAndIgnoreFilesBox.domNode);
        super.renderSubcontrols(controlsDiv);
    }
};
ExcludePatternInputWidget = __decorate([
    __param(3, IThemeService),
    __param(4, IContextKeyService),
    __param(5, IConfigurationService),
    __param(6, IKeybindingService)
], ExcludePatternInputWidget);
export { ExcludePatternInputWidget };
