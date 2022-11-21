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
import { SimpleFindWidget } from 'vs/workbench/contrib/codeEditor/browser/find/simpleFindWidget';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { Event } from 'vs/base/common/event';
let TerminalFindWidget = class TerminalFindWidget extends SimpleFindWidget {
    findState;
    _instance;
    _contextKeyService;
    _themeService;
    _configurationService;
    _findInputFocused;
    _findWidgetFocused;
    _findWidgetVisible;
    constructor(findState, _instance, _contextViewService, keybindingService, _contextKeyService, _themeService, _configurationService) {
        super(findState, { showCommonFindToggles: true, showResultCount: true, type: 'Terminal' }, _contextViewService, _contextKeyService, keybindingService);
        this.findState = findState;
        this._instance = _instance;
        this._contextKeyService = _contextKeyService;
        this._themeService = _themeService;
        this._configurationService = _configurationService;
        this._register(findState.onFindReplaceStateChange(() => {
            this.show();
        }));
        this._findInputFocused = TerminalContextKeys.findInputFocus.bindTo(this._contextKeyService);
        this._findWidgetFocused = TerminalContextKeys.findFocus.bindTo(this._contextKeyService);
        this._findWidgetVisible = TerminalContextKeys.findVisible.bindTo(this._contextKeyService);
        this.updateTheme(this._themeService.getColorTheme());
        this._register(this._themeService.onDidColorThemeChange((theme) => {
            this.updateTheme(theme ?? this._themeService.getColorTheme());
            if (this.isVisible()) {
                this.find(true, true);
            }
        }));
        this._register(this._configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('workbench.colorCustomizations') && this.isVisible()) {
                this.find(true, true);
            }
        }));
    }
    find(previous, update) {
        const xterm = this._instance.xterm;
        if (!xterm) {
            return;
        }
        if (previous) {
            this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue(), incremental: update });
        }
        else {
            this._findNextWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
        }
    }
    reveal() {
        const initialInput = this._instance.hasSelection() && this._instance.selection.indexOf('\n') === -1 ? this._instance.selection : undefined;
        const xterm = this._instance.xterm;
        if (xterm && this.inputValue && this.inputValue !== '') {
            // trigger highlight all matches
            this._findPreviousWithEvent(xterm, this.inputValue, { incremental: true, regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() }).then(foundMatch => {
                this.updateButtons(foundMatch);
                this._register(Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
            });
        }
        this.updateButtons(false);
        super.reveal(initialInput);
        this._findWidgetVisible.set(true);
    }
    show() {
        const initialInput = this._instance.hasSelection() && this._instance.selection.indexOf('\n') === -1 ? this._instance.selection : undefined;
        super.show(initialInput);
        this._findWidgetVisible.set(true);
    }
    hide() {
        super.hide();
        this._findWidgetVisible.reset();
        this._instance.focus();
        this._instance.xterm?.clearSearchDecorations();
    }
    async _getResultCount() {
        return this._instance.xterm?.findResult;
    }
    _onInputChanged() {
        // Ignore input changes for now
        const xterm = this._instance.xterm;
        if (xterm) {
            this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue(), incremental: true }).then(foundMatch => {
                this.updateButtons(foundMatch);
            });
        }
        return false;
    }
    _onFocusTrackerFocus() {
        this._findWidgetFocused.set(true);
    }
    _onFocusTrackerBlur() {
        this._instance.xterm?.clearActiveSearchDecoration();
        this._findWidgetFocused.reset();
    }
    _onFindInputFocusTrackerFocus() {
        this._findInputFocused.set(true);
    }
    _onFindInputFocusTrackerBlur() {
        this._findInputFocused.reset();
    }
    findFirst() {
        const instance = this._instance;
        if (instance.hasSelection()) {
            instance.clearSelection();
        }
        const xterm = instance.xterm;
        if (xterm) {
            this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
        }
    }
    async _findNextWithEvent(xterm, term, options) {
        return xterm.findNext(term, options).then(foundMatch => {
            this._register(Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
            return foundMatch;
        });
    }
    async _findPreviousWithEvent(xterm, term, options) {
        return xterm.findPrevious(term, options).then(foundMatch => {
            this._register(Event.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
            return foundMatch;
        });
    }
};
TerminalFindWidget = __decorate([
    __param(2, IContextViewService),
    __param(3, IKeybindingService),
    __param(4, IContextKeyService),
    __param(5, IThemeService),
    __param(6, IConfigurationService)
], TerminalFindWidget);
export { TerminalFindWidget };
