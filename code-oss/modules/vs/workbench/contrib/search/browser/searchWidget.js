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
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { Button } from 'vs/base/browser/ui/button/button';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { Widget } from 'vs/base/browser/ui/widget';
import { Action } from 'vs/base/common/actions';
import { Delayer } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { CONTEXT_FIND_WIDGET_NOT_VISIBLE } from 'vs/editor/contrib/find/browser/findModel';
import * as nls from 'vs/nls';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { attachFindReplaceInputBoxStyler, attachInputBoxStyler } from 'vs/platform/theme/common/styler';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { ContextScopedFindInput, ContextScopedReplaceInput } from 'vs/platform/history/browser/contextScopedHistoryWidget';
import { appendKeyBindingLabel, isSearchViewFocused, getSearchView } from 'vs/workbench/contrib/search/browser/searchActionsBase';
import * as Constants from 'vs/workbench/contrib/search/common/constants';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { isMacintosh } from 'vs/base/common/platform';
import { Toggle } from 'vs/base/browser/ui/toggle/toggle';
import { IViewsService } from 'vs/workbench/common/views';
import { searchReplaceAllIcon, searchHideReplaceIcon, searchShowContextIcon, searchShowReplaceIcon } from 'vs/workbench/contrib/search/browser/searchIcons';
import { ToggleSearchEditorContextLinesCommandId } from 'vs/workbench/contrib/searchEditor/browser/constants';
import { showHistoryKeybindingHint } from 'vs/platform/history/browser/historyWidgetKeybindingHint';
/** Specified in searchview.css */
export const SingleLineInputHeight = 24;
class ReplaceAllAction extends Action {
    _searchWidget;
    static ID = 'search.action.replaceAll';
    constructor(_searchWidget) {
        super(ReplaceAllAction.ID, '', ThemeIcon.asClassName(searchReplaceAllIcon), false);
        this._searchWidget = _searchWidget;
    }
    set searchWidget(searchWidget) {
        this._searchWidget = searchWidget;
    }
    run() {
        if (this._searchWidget) {
            return this._searchWidget.triggerReplaceAll();
        }
        return Promise.resolve(null);
    }
}
const ctrlKeyMod = (isMacintosh ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */);
function stopPropagationForMultiLineUpwards(event, value, textarea) {
    const isMultiline = !!value.match(/\n/);
    if (textarea && (isMultiline || textarea.clientHeight > SingleLineInputHeight) && textarea.selectionStart > 0) {
        event.stopPropagation();
        return;
    }
}
function stopPropagationForMultiLineDownwards(event, value, textarea) {
    const isMultiline = !!value.match(/\n/);
    if (textarea && (isMultiline || textarea.clientHeight > SingleLineInputHeight) && textarea.selectionEnd < textarea.value.length) {
        event.stopPropagation();
        return;
    }
}
let SearchWidget = class SearchWidget extends Widget {
    contextViewService;
    themeService;
    contextKeyService;
    keybindingService;
    clipboardServce;
    configurationService;
    accessibilityService;
    static INPUT_MAX_HEIGHT = 134;
    static REPLACE_ALL_DISABLED_LABEL = nls.localize('search.action.replaceAll.disabled.label', "Replace All (Submit Search to Enable)");
    static REPLACE_ALL_ENABLED_LABEL = (keyBindingService2) => {
        const kb = keyBindingService2.lookupKeybinding(ReplaceAllAction.ID);
        return appendKeyBindingLabel(nls.localize('search.action.replaceAll.enabled.label', "Replace All"), kb, keyBindingService2);
    };
    domNode;
    searchInput;
    searchInputFocusTracker;
    searchInputBoxFocused;
    replaceContainer;
    replaceInput;
    replaceInputFocusTracker;
    replaceInputBoxFocused;
    toggleReplaceButton;
    replaceAllAction;
    replaceActive;
    replaceActionBar;
    _replaceHistoryDelayer;
    ignoreGlobalFindBufferOnNextFocus = false;
    previousGlobalFindBufferValue = null;
    _onSearchSubmit = this._register(new Emitter());
    onSearchSubmit = this._onSearchSubmit.event;
    _onSearchCancel = this._register(new Emitter());
    onSearchCancel = this._onSearchCancel.event;
    _onReplaceToggled = this._register(new Emitter());
    onReplaceToggled = this._onReplaceToggled.event;
    _onReplaceStateChange = this._register(new Emitter());
    onReplaceStateChange = this._onReplaceStateChange.event;
    _onPreserveCaseChange = this._register(new Emitter());
    onPreserveCaseChange = this._onPreserveCaseChange.event;
    _onReplaceValueChanged = this._register(new Emitter());
    onReplaceValueChanged = this._onReplaceValueChanged.event;
    _onReplaceAll = this._register(new Emitter());
    onReplaceAll = this._onReplaceAll.event;
    _onBlur = this._register(new Emitter());
    onBlur = this._onBlur.event;
    _onDidHeightChange = this._register(new Emitter());
    onDidHeightChange = this._onDidHeightChange.event;
    _onDidToggleContext = new Emitter();
    onDidToggleContext = this._onDidToggleContext.event;
    showContextToggle;
    contextLinesInput;
    constructor(container, options, contextViewService, themeService, contextKeyService, keybindingService, clipboardServce, configurationService, accessibilityService) {
        super();
        this.contextViewService = contextViewService;
        this.themeService = themeService;
        this.contextKeyService = contextKeyService;
        this.keybindingService = keybindingService;
        this.clipboardServce = clipboardServce;
        this.configurationService = configurationService;
        this.accessibilityService = accessibilityService;
        this.replaceActive = Constants.ReplaceActiveKey.bindTo(this.contextKeyService);
        this.searchInputBoxFocused = Constants.SearchInputBoxFocusedKey.bindTo(this.contextKeyService);
        this.replaceInputBoxFocused = Constants.ReplaceInputBoxFocusedKey.bindTo(this.contextKeyService);
        this._replaceHistoryDelayer = new Delayer(500);
        this.render(container, options);
        this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('editor.accessibilitySupport')) {
                this.updateAccessibilitySupport();
            }
        });
        this.accessibilityService.onDidChangeScreenReaderOptimized(() => this.updateAccessibilitySupport());
        this.updateAccessibilitySupport();
    }
    focus(select = true, focusReplace = false, suppressGlobalSearchBuffer = false) {
        this.ignoreGlobalFindBufferOnNextFocus = suppressGlobalSearchBuffer;
        if (focusReplace && this.isReplaceShown()) {
            this.replaceInput.focus();
            if (select) {
                this.replaceInput.select();
            }
        }
        else {
            this.searchInput.focus();
            if (select) {
                this.searchInput.select();
            }
        }
    }
    setWidth(width) {
        this.searchInput.inputBox.layout();
        this.replaceInput.width = width - 28;
        this.replaceInput.inputBox.layout();
    }
    clear() {
        this.searchInput.clear();
        this.replaceInput.setValue('');
        this.setReplaceAllActionState(false);
    }
    isReplaceShown() {
        return !this.replaceContainer.classList.contains('disabled');
    }
    isReplaceActive() {
        return !!this.replaceActive.get();
    }
    getReplaceValue() {
        return this.replaceInput.getValue();
    }
    toggleReplace(show) {
        if (show === undefined || show !== this.isReplaceShown()) {
            this.onToggleReplaceButton();
        }
    }
    getSearchHistory() {
        return this.searchInput.inputBox.getHistory();
    }
    getReplaceHistory() {
        return this.replaceInput.inputBox.getHistory();
    }
    clearHistory() {
        this.searchInput.inputBox.clearHistory();
        this.replaceInput.inputBox.clearHistory();
    }
    showNextSearchTerm() {
        this.searchInput.inputBox.showNextValue();
    }
    showPreviousSearchTerm() {
        this.searchInput.inputBox.showPreviousValue();
    }
    showNextReplaceTerm() {
        this.replaceInput.inputBox.showNextValue();
    }
    showPreviousReplaceTerm() {
        this.replaceInput.inputBox.showPreviousValue();
    }
    searchInputHasFocus() {
        return !!this.searchInputBoxFocused.get();
    }
    replaceInputHasFocus() {
        return this.replaceInput.inputBox.hasFocus();
    }
    focusReplaceAllAction() {
        this.replaceActionBar.focus(true);
    }
    focusRegexAction() {
        this.searchInput.focusOnRegex();
    }
    render(container, options) {
        this.domNode = dom.append(container, dom.$('.search-widget'));
        this.domNode.style.position = 'relative';
        if (!options._hideReplaceToggle) {
            this.renderToggleReplaceButton(this.domNode);
        }
        this.renderSearchInput(this.domNode, options);
        this.renderReplaceInput(this.domNode, options);
    }
    updateAccessibilitySupport() {
        this.searchInput.setFocusInputOnOptionClick(!this.accessibilityService.isScreenReaderOptimized());
    }
    renderToggleReplaceButton(parent) {
        const opts = {
            buttonBackground: undefined,
            buttonBorder: undefined,
            buttonForeground: undefined,
            buttonHoverBackground: undefined,
            buttonSecondaryBackground: undefined,
            buttonSecondaryForeground: undefined,
            buttonSecondaryHoverBackground: undefined,
            buttonSeparator: undefined
        };
        this.toggleReplaceButton = this._register(new Button(parent, opts));
        this.toggleReplaceButton.element.setAttribute('aria-expanded', 'false');
        this.toggleReplaceButton.element.classList.add('toggle-replace-button');
        this.toggleReplaceButton.icon = searchHideReplaceIcon;
        // TODO@joao need to dispose this listener eventually
        this.toggleReplaceButton.onDidClick(() => this.onToggleReplaceButton());
        this.toggleReplaceButton.element.title = nls.localize('search.replace.toggle.button.title', "Toggle Replace");
    }
    renderSearchInput(parent, options) {
        const inputOptions = {
            label: nls.localize('label.Search', 'Search: Type Search Term and press Enter to search'),
            validation: (value) => this.validateSearchInput(value),
            placeholder: nls.localize('search.placeHolder', "Search"),
            appendCaseSensitiveLabel: appendKeyBindingLabel('', this.keybindingService.lookupKeybinding(Constants.ToggleCaseSensitiveCommandId), this.keybindingService),
            appendWholeWordsLabel: appendKeyBindingLabel('', this.keybindingService.lookupKeybinding(Constants.ToggleWholeWordCommandId), this.keybindingService),
            appendRegexLabel: appendKeyBindingLabel('', this.keybindingService.lookupKeybinding(Constants.ToggleRegexCommandId), this.keybindingService),
            history: options.searchHistory,
            showHistoryHint: () => showHistoryKeybindingHint(this.keybindingService),
            flexibleHeight: true,
            flexibleMaxHeight: SearchWidget.INPUT_MAX_HEIGHT,
            showCommonFindToggles: true
        };
        const searchInputContainer = dom.append(parent, dom.$('.search-container.input-box'));
        this.searchInput = this._register(new ContextScopedFindInput(searchInputContainer, this.contextViewService, inputOptions, this.contextKeyService));
        this._register(attachFindReplaceInputBoxStyler(this.searchInput, this.themeService));
        this.searchInput.onKeyDown((keyboardEvent) => this.onSearchInputKeyDown(keyboardEvent));
        this.searchInput.setValue(options.value || '');
        this.searchInput.setRegex(!!options.isRegex);
        this.searchInput.setCaseSensitive(!!options.isCaseSensitive);
        this.searchInput.setWholeWords(!!options.isWholeWords);
        this._register(this.searchInput.onCaseSensitiveKeyDown((keyboardEvent) => this.onCaseSensitiveKeyDown(keyboardEvent)));
        this._register(this.searchInput.onRegexKeyDown((keyboardEvent) => this.onRegexKeyDown(keyboardEvent)));
        this._register(this.searchInput.inputBox.onDidChange(() => this.onSearchInputChanged()));
        this._register(this.searchInput.inputBox.onDidHeightChange(() => this._onDidHeightChange.fire()));
        this._register(this.onReplaceValueChanged(() => {
            this._replaceHistoryDelayer.trigger(() => this.replaceInput.inputBox.addToHistory());
        }));
        this.searchInputFocusTracker = this._register(dom.trackFocus(this.searchInput.inputBox.inputElement));
        this._register(this.searchInputFocusTracker.onDidFocus(async () => {
            this.searchInputBoxFocused.set(true);
            const useGlobalFindBuffer = this.searchConfiguration.globalFindClipboard;
            if (!this.ignoreGlobalFindBufferOnNextFocus && useGlobalFindBuffer) {
                const globalBufferText = await this.clipboardServce.readFindText();
                if (globalBufferText && this.previousGlobalFindBufferValue !== globalBufferText) {
                    this.searchInput.inputBox.addToHistory();
                    this.searchInput.setValue(globalBufferText);
                    this.searchInput.select();
                }
                this.previousGlobalFindBufferValue = globalBufferText;
            }
            this.ignoreGlobalFindBufferOnNextFocus = false;
        }));
        this._register(this.searchInputFocusTracker.onDidBlur(() => this.searchInputBoxFocused.set(false)));
        this.showContextToggle = new Toggle({
            isChecked: false,
            title: appendKeyBindingLabel(nls.localize('showContext', "Toggle Context Lines"), this.keybindingService.lookupKeybinding(ToggleSearchEditorContextLinesCommandId), this.keybindingService),
            icon: searchShowContextIcon
        });
        this._register(this.showContextToggle.onChange(() => this.onContextLinesChanged()));
        if (options.showContextToggle) {
            this.contextLinesInput = new InputBox(searchInputContainer, this.contextViewService, { type: 'number' });
            this.contextLinesInput.element.classList.add('context-lines-input');
            this.contextLinesInput.value = '' + (this.configurationService.getValue('search').searchEditor.defaultNumberOfContextLines ?? 1);
            this._register(this.contextLinesInput.onDidChange((value) => {
                if (value !== '0') {
                    this.showContextToggle.checked = true;
                }
                this.onContextLinesChanged();
            }));
            this._register(attachInputBoxStyler(this.contextLinesInput, this.themeService));
            dom.append(searchInputContainer, this.showContextToggle.domNode);
        }
    }
    onContextLinesChanged() {
        this._onDidToggleContext.fire();
        if (this.contextLinesInput.value.includes('-')) {
            this.contextLinesInput.value = '0';
        }
        this._onDidToggleContext.fire();
    }
    setContextLines(lines) {
        if (!this.contextLinesInput) {
            return;
        }
        if (lines === 0) {
            this.showContextToggle.checked = false;
        }
        else {
            this.showContextToggle.checked = true;
            this.contextLinesInput.value = '' + lines;
        }
    }
    renderReplaceInput(parent, options) {
        this.replaceContainer = dom.append(parent, dom.$('.replace-container.disabled'));
        const replaceBox = dom.append(this.replaceContainer, dom.$('.replace-input'));
        this.replaceInput = this._register(new ContextScopedReplaceInput(replaceBox, this.contextViewService, {
            label: nls.localize('label.Replace', 'Replace: Type replace term and press Enter to preview'),
            placeholder: nls.localize('search.replace.placeHolder', "Replace"),
            appendPreserveCaseLabel: appendKeyBindingLabel('', this.keybindingService.lookupKeybinding(Constants.TogglePreserveCaseId), this.keybindingService),
            history: options.replaceHistory,
            showHistoryHint: () => showHistoryKeybindingHint(this.keybindingService),
            flexibleHeight: true,
            flexibleMaxHeight: SearchWidget.INPUT_MAX_HEIGHT
        }, this.contextKeyService, true));
        this._register(this.replaceInput.onDidOptionChange(viaKeyboard => {
            if (!viaKeyboard) {
                this._onPreserveCaseChange.fire(this.replaceInput.getPreserveCase());
            }
        }));
        this._register(attachFindReplaceInputBoxStyler(this.replaceInput, this.themeService));
        this.replaceInput.onKeyDown((keyboardEvent) => this.onReplaceInputKeyDown(keyboardEvent));
        this.replaceInput.setValue(options.replaceValue || '');
        this._register(this.replaceInput.inputBox.onDidChange(() => this._onReplaceValueChanged.fire()));
        this._register(this.replaceInput.inputBox.onDidHeightChange(() => this._onDidHeightChange.fire()));
        this.replaceAllAction = new ReplaceAllAction(this);
        this.replaceAllAction.label = SearchWidget.REPLACE_ALL_DISABLED_LABEL;
        this.replaceActionBar = this._register(new ActionBar(this.replaceContainer));
        this.replaceActionBar.push([this.replaceAllAction], { icon: true, label: false });
        this.onkeydown(this.replaceActionBar.domNode, (keyboardEvent) => this.onReplaceActionbarKeyDown(keyboardEvent));
        this.replaceInputFocusTracker = this._register(dom.trackFocus(this.replaceInput.inputBox.inputElement));
        this._register(this.replaceInputFocusTracker.onDidFocus(() => this.replaceInputBoxFocused.set(true)));
        this._register(this.replaceInputFocusTracker.onDidBlur(() => this.replaceInputBoxFocused.set(false)));
        this._register(this.replaceInput.onPreserveCaseKeyDown((keyboardEvent) => this.onPreserveCaseKeyDown(keyboardEvent)));
    }
    triggerReplaceAll() {
        this._onReplaceAll.fire();
        return Promise.resolve(null);
    }
    onToggleReplaceButton() {
        this.replaceContainer.classList.toggle('disabled');
        if (this.isReplaceShown()) {
            this.toggleReplaceButton.element.classList.remove(...ThemeIcon.asClassNameArray(searchHideReplaceIcon));
            this.toggleReplaceButton.element.classList.add(...ThemeIcon.asClassNameArray(searchShowReplaceIcon));
        }
        else {
            this.toggleReplaceButton.element.classList.remove(...ThemeIcon.asClassNameArray(searchShowReplaceIcon));
            this.toggleReplaceButton.element.classList.add(...ThemeIcon.asClassNameArray(searchHideReplaceIcon));
        }
        this.toggleReplaceButton.element.setAttribute('aria-expanded', this.isReplaceShown() ? 'true' : 'false');
        this.updateReplaceActiveState();
        this._onReplaceToggled.fire();
    }
    setValue(value) {
        this.searchInput.setValue(value);
    }
    setReplaceAllActionState(enabled) {
        if (this.replaceAllAction.enabled !== enabled) {
            this.replaceAllAction.enabled = enabled;
            this.replaceAllAction.label = enabled ? SearchWidget.REPLACE_ALL_ENABLED_LABEL(this.keybindingService) : SearchWidget.REPLACE_ALL_DISABLED_LABEL;
            this.updateReplaceActiveState();
        }
    }
    updateReplaceActiveState() {
        const currentState = this.isReplaceActive();
        const newState = this.isReplaceShown() && this.replaceAllAction.enabled;
        if (currentState !== newState) {
            this.replaceActive.set(newState);
            this._onReplaceStateChange.fire(newState);
            this.replaceInput.inputBox.layout();
        }
    }
    validateSearchInput(value) {
        if (value.length === 0) {
            return null;
        }
        if (!this.searchInput.getRegex()) {
            return null;
        }
        try {
            new RegExp(value, 'u');
        }
        catch (e) {
            return { content: e.message };
        }
        return null;
    }
    onSearchInputChanged() {
        this.searchInput.clearMessage();
        this.setReplaceAllActionState(false);
        if (this.searchConfiguration.searchOnType) {
            if (this.searchInput.getRegex()) {
                try {
                    const regex = new RegExp(this.searchInput.getValue(), 'ug');
                    const matchienessHeuristic = `
								~!@#$%^&*()_+
								\`1234567890-=
								qwertyuiop[]\\
								QWERTYUIOP{}|
								asdfghjkl;'
								ASDFGHJKL:"
								zxcvbnm,./
								ZXCVBNM<>? `.match(regex)?.length ?? 0;
                    const delayMultiplier = matchienessHeuristic < 50 ? 1 :
                        matchienessHeuristic < 100 ? 5 : // expressions like `.` or `\w`
                            10; // only things matching empty string
                    this.submitSearch(true, this.searchConfiguration.searchOnTypeDebouncePeriod * delayMultiplier);
                }
                catch {
                    // pass
                }
            }
            else {
                this.submitSearch(true, this.searchConfiguration.searchOnTypeDebouncePeriod);
            }
        }
    }
    onSearchInputKeyDown(keyboardEvent) {
        if (keyboardEvent.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
            this.searchInput.inputBox.insertAtCursor('\n');
            keyboardEvent.preventDefault();
        }
        if (keyboardEvent.equals(3 /* KeyCode.Enter */)) {
            this.searchInput.onSearchSubmit();
            this.submitSearch();
            keyboardEvent.preventDefault();
        }
        else if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
            this._onSearchCancel.fire({ focus: true });
            keyboardEvent.preventDefault();
        }
        else if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
            if (this.isReplaceShown()) {
                this.replaceInput.focus();
            }
            else {
                this.searchInput.focusOnCaseSensitive();
            }
            keyboardEvent.preventDefault();
        }
        else if (keyboardEvent.equals(16 /* KeyCode.UpArrow */)) {
            stopPropagationForMultiLineUpwards(keyboardEvent, this.searchInput.getValue(), this.searchInput.domNode.querySelector('textarea'));
        }
        else if (keyboardEvent.equals(18 /* KeyCode.DownArrow */)) {
            stopPropagationForMultiLineDownwards(keyboardEvent, this.searchInput.getValue(), this.searchInput.domNode.querySelector('textarea'));
        }
    }
    onCaseSensitiveKeyDown(keyboardEvent) {
        if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
            if (this.isReplaceShown()) {
                this.replaceInput.focus();
                keyboardEvent.preventDefault();
            }
        }
    }
    onRegexKeyDown(keyboardEvent) {
        if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
            if (this.isReplaceShown()) {
                this.replaceInput.focusOnPreserve();
                keyboardEvent.preventDefault();
            }
        }
    }
    onPreserveCaseKeyDown(keyboardEvent) {
        if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
            if (this.isReplaceActive()) {
                this.focusReplaceAllAction();
            }
            else {
                this._onBlur.fire();
            }
            keyboardEvent.preventDefault();
        }
        else if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
            this.focusRegexAction();
            keyboardEvent.preventDefault();
        }
    }
    onReplaceInputKeyDown(keyboardEvent) {
        if (keyboardEvent.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
            this.replaceInput.inputBox.insertAtCursor('\n');
            keyboardEvent.preventDefault();
        }
        if (keyboardEvent.equals(3 /* KeyCode.Enter */)) {
            this.submitSearch();
            keyboardEvent.preventDefault();
        }
        else if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
            this.searchInput.focusOnCaseSensitive();
            keyboardEvent.preventDefault();
        }
        else if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
            this.searchInput.focus();
            keyboardEvent.preventDefault();
        }
        else if (keyboardEvent.equals(16 /* KeyCode.UpArrow */)) {
            stopPropagationForMultiLineUpwards(keyboardEvent, this.replaceInput.getValue(), this.replaceInput.domNode.querySelector('textarea'));
        }
        else if (keyboardEvent.equals(18 /* KeyCode.DownArrow */)) {
            stopPropagationForMultiLineDownwards(keyboardEvent, this.replaceInput.getValue(), this.replaceInput.domNode.querySelector('textarea'));
        }
    }
    onReplaceActionbarKeyDown(keyboardEvent) {
        if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
            this.focusRegexAction();
            keyboardEvent.preventDefault();
        }
    }
    async submitSearch(triggeredOnType = false, delay = 0) {
        this.searchInput.validate();
        if (!this.searchInput.inputBox.isInputValid()) {
            return;
        }
        const value = this.searchInput.getValue();
        const useGlobalFindBuffer = this.searchConfiguration.globalFindClipboard;
        if (value && useGlobalFindBuffer) {
            await this.clipboardServce.writeFindText(value);
        }
        this._onSearchSubmit.fire({ triggeredOnType, delay });
    }
    getContextLines() {
        return this.showContextToggle.checked ? +this.contextLinesInput.value : 0;
    }
    modifyContextLines(increase) {
        const current = +this.contextLinesInput.value;
        const modified = current + (increase ? 1 : -1);
        this.showContextToggle.checked = modified !== 0;
        this.contextLinesInput.value = '' + modified;
    }
    toggleContextLines() {
        this.showContextToggle.checked = !this.showContextToggle.checked;
        this.onContextLinesChanged();
    }
    dispose() {
        this.setReplaceAllActionState(false);
        super.dispose();
    }
    get searchConfiguration() {
        return this.configurationService.getValue('search');
    }
};
SearchWidget = __decorate([
    __param(2, IContextViewService),
    __param(3, IThemeService),
    __param(4, IContextKeyService),
    __param(5, IKeybindingService),
    __param(6, IClipboardService),
    __param(7, IConfigurationService),
    __param(8, IAccessibilityService)
], SearchWidget);
export { SearchWidget };
export function registerContributions() {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: ReplaceAllAction.ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, CONTEXT_FIND_WIDGET_NOT_VISIBLE),
        primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        handler: accessor => {
            const viewsService = accessor.get(IViewsService);
            if (isSearchViewFocused(viewsService)) {
                const searchView = getSearchView(viewsService);
                if (searchView) {
                    new ReplaceAllAction(searchView.searchAndReplaceWidget).run();
                }
            }
        }
    });
}
