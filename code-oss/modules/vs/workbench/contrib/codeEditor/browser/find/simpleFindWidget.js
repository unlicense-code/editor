/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./simpleFindWidget';
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import { Widget } from 'vs/base/browser/ui/widget';
import { Delayer } from 'vs/base/common/async';
import { FindReplaceState } from 'vs/editor/contrib/find/browser/findState';
import { SimpleButton, findPreviousMatchIcon, findNextMatchIcon, NLS_NO_RESULTS, NLS_MATCHES_LOCATION } from 'vs/editor/contrib/find/browser/findWidget';
import { inputActiveOptionBorder, inputActiveOptionBackground, inputActiveOptionForeground, inputBackground, inputBorder, inputForeground, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, inputValidationInfoBackground, inputValidationInfoBorder, inputValidationInfoForeground, inputValidationWarningBackground, inputValidationWarningBorder, inputValidationWarningForeground } from 'vs/platform/theme/common/colorRegistry';
import { ContextScopedFindInput } from 'vs/platform/history/browser/contextScopedHistoryWidget';
import { widgetClose } from 'vs/platform/theme/common/iconRegistry';
import * as strings from 'vs/base/common/strings';
import { showHistoryKeybindingHint } from 'vs/platform/history/browser/historyWidgetKeybindingHint';
import { alert as alertFn } from 'vs/base/browser/ui/aria/aria';
const NLS_FIND_INPUT_LABEL = nls.localize('label.find', "Find");
const NLS_FIND_INPUT_PLACEHOLDER = nls.localize('placeholder.find', "Find (\u21C5 for history)");
const NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize('label.previousMatchButton', "Previous Match");
const NLS_NEXT_MATCH_BTN_LABEL = nls.localize('label.nextMatchButton', "Next Match");
const NLS_CLOSE_BTN_LABEL = nls.localize('label.closeButton', "Close");
const SIMPLE_FIND_WIDGET_INITIAL_WIDTH = 310;
const MATCHES_COUNT_WIDTH = 68;
export class SimpleFindWidget extends Widget {
    _keybindingService;
    _findInput;
    _domNode;
    _innerDomNode;
    _focusTracker;
    _findInputFocusTracker;
    _updateHistoryDelayer;
    prevBtn;
    nextBtn;
    _matchesCount;
    _isVisible = false;
    _foundMatch = false;
    _width = 0;
    constructor(state = new FindReplaceState(), options, contextViewService, contextKeyService, _keybindingService) {
        super();
        this._keybindingService = _keybindingService;
        this._findInput = this._register(new ContextScopedFindInput(null, contextViewService, {
            label: NLS_FIND_INPUT_LABEL,
            placeholder: NLS_FIND_INPUT_PLACEHOLDER,
            validation: (value) => {
                if (value.length === 0 || !this._findInput.getRegex()) {
                    return null;
                }
                try {
                    new RegExp(value);
                    return null;
                }
                catch (e) {
                    this._foundMatch = false;
                    this.updateButtons(this._foundMatch);
                    return { content: e.message };
                }
            },
            showCommonFindToggles: options.showCommonFindToggles,
            appendCaseSensitiveLabel: options.appendCaseSensitiveLabel && options.type === 'Terminal' ? this._getKeybinding("workbench.action.terminal.toggleFindCaseSensitive" /* TerminalCommandId.ToggleFindCaseSensitive */) : undefined,
            appendRegexLabel: options.appendRegexLabel && options.type === 'Terminal' ? this._getKeybinding("workbench.action.terminal.toggleFindRegex" /* TerminalCommandId.ToggleFindRegex */) : undefined,
            appendWholeWordsLabel: options.appendWholeWordsLabel && options.type === 'Terminal' ? this._getKeybinding("workbench.action.terminal.toggleFindWholeWord" /* TerminalCommandId.ToggleFindWholeWord */) : undefined,
            showHistoryHint: () => showHistoryKeybindingHint(_keybindingService)
        }, contextKeyService));
        // Find History with update delayer
        this._updateHistoryDelayer = new Delayer(500);
        this._register(this._findInput.onInput(async (e) => {
            if (!options.checkImeCompletionState || !this._findInput.isImeSessionInProgress) {
                this._foundMatch = this._onInputChanged();
                if (options.showResultCount) {
                    await this.updateResultCount();
                }
                this.updateButtons(this._foundMatch);
                this.focusFindBox();
                this._delayedUpdateHistory();
            }
        }));
        this._findInput.setRegex(!!state.isRegex);
        this._findInput.setCaseSensitive(!!state.matchCase);
        this._findInput.setWholeWords(!!state.wholeWord);
        this._register(this._findInput.onDidOptionChange(() => {
            state.change({
                isRegex: this._findInput.getRegex(),
                wholeWord: this._findInput.getWholeWords(),
                matchCase: this._findInput.getCaseSensitive()
            }, true);
        }));
        this._register(state.onFindReplaceStateChange(() => {
            this._findInput.setRegex(state.isRegex);
            this._findInput.setWholeWords(state.wholeWord);
            this._findInput.setCaseSensitive(state.matchCase);
            this.findFirst();
        }));
        this.prevBtn = this._register(new SimpleButton({
            label: NLS_PREVIOUS_MATCH_BTN_LABEL,
            icon: findPreviousMatchIcon,
            onTrigger: () => {
                this.find(true);
            }
        }));
        this.nextBtn = this._register(new SimpleButton({
            label: NLS_NEXT_MATCH_BTN_LABEL,
            icon: findNextMatchIcon,
            onTrigger: () => {
                this.find(false);
            }
        }));
        const closeBtn = this._register(new SimpleButton({
            label: NLS_CLOSE_BTN_LABEL,
            icon: widgetClose,
            onTrigger: () => {
                this.hide();
            }
        }));
        this._innerDomNode = document.createElement('div');
        this._innerDomNode.classList.add('simple-find-part');
        this._innerDomNode.appendChild(this._findInput.domNode);
        this._innerDomNode.appendChild(this.prevBtn.domNode);
        this._innerDomNode.appendChild(this.nextBtn.domNode);
        this._innerDomNode.appendChild(closeBtn.domNode);
        // _domNode wraps _innerDomNode, ensuring that
        this._domNode = document.createElement('div');
        this._domNode.classList.add('simple-find-part-wrapper');
        this._domNode.appendChild(this._innerDomNode);
        this.onkeyup(this._innerDomNode, e => {
            if (e.equals(9 /* KeyCode.Escape */)) {
                this.hide();
                e.preventDefault();
                return;
            }
        });
        this._focusTracker = this._register(dom.trackFocus(this._innerDomNode));
        this._register(this._focusTracker.onDidFocus(this._onFocusTrackerFocus.bind(this)));
        this._register(this._focusTracker.onDidBlur(this._onFocusTrackerBlur.bind(this)));
        this._findInputFocusTracker = this._register(dom.trackFocus(this._findInput.domNode));
        this._register(this._findInputFocusTracker.onDidFocus(this._onFindInputFocusTrackerFocus.bind(this)));
        this._register(this._findInputFocusTracker.onDidBlur(this._onFindInputFocusTrackerBlur.bind(this)));
        this._register(dom.addDisposableListener(this._innerDomNode, 'click', (event) => {
            event.stopPropagation();
        }));
        if (options?.showResultCount) {
            this._domNode.classList.add('result-count');
            this._matchesCount = document.createElement('div');
            this._matchesCount.className = 'matchesCount';
            this._findInput.domNode.insertAdjacentElement('afterend', this._matchesCount);
            this._register(this._findInput.onDidChange(() => {
                this.updateResultCount();
                this.updateButtons(this._foundMatch);
            }));
        }
    }
    get inputValue() {
        return this._findInput.getValue();
    }
    get focusTracker() {
        return this._focusTracker;
    }
    updateTheme(theme) {
        const inputStyles = {
            inputActiveOptionBorder: theme.getColor(inputActiveOptionBorder),
            inputActiveOptionForeground: theme.getColor(inputActiveOptionForeground),
            inputActiveOptionBackground: theme.getColor(inputActiveOptionBackground),
            inputBackground: theme.getColor(inputBackground),
            inputForeground: theme.getColor(inputForeground),
            inputBorder: theme.getColor(inputBorder),
            inputValidationInfoBackground: theme.getColor(inputValidationInfoBackground),
            inputValidationInfoForeground: theme.getColor(inputValidationInfoForeground),
            inputValidationInfoBorder: theme.getColor(inputValidationInfoBorder),
            inputValidationWarningBackground: theme.getColor(inputValidationWarningBackground),
            inputValidationWarningForeground: theme.getColor(inputValidationWarningForeground),
            inputValidationWarningBorder: theme.getColor(inputValidationWarningBorder),
            inputValidationErrorBackground: theme.getColor(inputValidationErrorBackground),
            inputValidationErrorForeground: theme.getColor(inputValidationErrorForeground),
            inputValidationErrorBorder: theme.getColor(inputValidationErrorBorder)
        };
        this._findInput.style(inputStyles);
    }
    _getKeybinding(actionId) {
        const kb = this._keybindingService?.lookupKeybinding(actionId);
        if (!kb) {
            return '';
        }
        return ` (${kb.getLabel()})`;
    }
    dispose() {
        super.dispose();
        if (this._domNode && this._domNode.parentElement) {
            this._domNode.parentElement.removeChild(this._domNode);
        }
    }
    isVisible() {
        return this._isVisible;
    }
    getDomNode() {
        return this._domNode;
    }
    reveal(initialInput, animated = true) {
        if (initialInput) {
            this._findInput.setValue(initialInput);
        }
        if (this._isVisible) {
            this._findInput.select();
            return;
        }
        this._isVisible = true;
        this.updateButtons(this._foundMatch);
        this.layout();
        setTimeout(() => {
            this._innerDomNode.classList.toggle('suppress-transition', !animated);
            this._innerDomNode.classList.add('visible', 'visible-transition');
            this._innerDomNode.setAttribute('aria-hidden', 'false');
            this._findInput.select();
            if (!animated) {
                setTimeout(() => {
                    this._innerDomNode.classList.remove('suppress-transition');
                }, 0);
            }
        }, 0);
    }
    show(initialInput) {
        if (initialInput && !this._isVisible) {
            this._findInput.setValue(initialInput);
        }
        this._isVisible = true;
        this.layout();
        setTimeout(() => {
            this._innerDomNode.classList.add('visible', 'visible-transition');
            this._innerDomNode.setAttribute('aria-hidden', 'false');
        }, 0);
    }
    hide(animated = true) {
        if (this._isVisible) {
            this._innerDomNode.classList.toggle('suppress-transition', !animated);
            this._innerDomNode.classList.remove('visible-transition');
            this._innerDomNode.setAttribute('aria-hidden', 'true');
            // Need to delay toggling visibility until after Transition, then visibility hidden - removes from tabIndex list
            setTimeout(() => {
                this._isVisible = false;
                this.updateButtons(this._foundMatch);
                this._innerDomNode.classList.remove('visible', 'suppress-transition');
            }, animated ? 200 : 0);
        }
    }
    layout(width = this._width) {
        this._width = width;
        if (!this._isVisible) {
            return;
        }
        if (this._matchesCount) {
            let reducedFindWidget = false;
            if (SIMPLE_FIND_WIDGET_INITIAL_WIDTH + MATCHES_COUNT_WIDTH + 28 >= width) {
                reducedFindWidget = true;
            }
            this._innerDomNode.classList.toggle('reduced-find-widget', reducedFindWidget);
        }
    }
    _delayedUpdateHistory() {
        this._updateHistoryDelayer.trigger(this._updateHistory.bind(this));
    }
    _updateHistory() {
        this._findInput.inputBox.addToHistory();
    }
    _getRegexValue() {
        return this._findInput.getRegex();
    }
    _getWholeWordValue() {
        return this._findInput.getWholeWords();
    }
    _getCaseSensitiveValue() {
        return this._findInput.getCaseSensitive();
    }
    updateButtons(foundMatch) {
        const hasInput = this.inputValue.length > 0;
        this.prevBtn.setEnabled(this._isVisible && hasInput && foundMatch);
        this.nextBtn.setEnabled(this._isVisible && hasInput && foundMatch);
    }
    focusFindBox() {
        // Focus back onto the find box, which
        // requires focusing onto the next button first
        this.nextBtn.focus();
        this._findInput.inputBox.focus();
    }
    async updateResultCount() {
        if (!this._matchesCount) {
            return;
        }
        const count = await this._getResultCount();
        this._matchesCount.innerText = '';
        let label = '';
        this._matchesCount.classList.toggle('no-results', false);
        if (count?.resultCount !== undefined && count?.resultCount === 0) {
            label = NLS_NO_RESULTS;
            if (!!this.inputValue) {
                this._matchesCount.classList.toggle('no-results', true);
            }
        }
        else if (count?.resultCount) {
            label = strings.format(NLS_MATCHES_LOCATION, count.resultIndex + 1, count?.resultCount);
        }
        alertFn(this._announceSearchResults(label, this.inputValue));
        this._matchesCount.appendChild(document.createTextNode(label));
        this._foundMatch = !!count && count.resultCount > 0;
    }
    _announceSearchResults(label, searchString) {
        if (!searchString) {
            return nls.localize('ariaSearchNoInput', "Enter search input");
        }
        if (label === NLS_NO_RESULTS) {
            return searchString === ''
                ? nls.localize('ariaSearchNoResultEmpty', "{0} found", label)
                : nls.localize('ariaSearchNoResult', "{0} found for '{1}'", label, searchString);
        }
        return nls.localize('ariaSearchNoResultWithLineNumNoCurrentMatch', "{0} found for '{1}'", label, searchString);
    }
}
