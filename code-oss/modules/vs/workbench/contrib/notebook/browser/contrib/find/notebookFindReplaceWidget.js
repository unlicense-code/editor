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
import { FindInput } from 'vs/base/browser/ui/findinput/findInput';
import { ProgressBar } from 'vs/base/browser/ui/progressbar/progressbar';
import { Widget } from 'vs/base/browser/ui/widget';
import { Delayer } from 'vs/base/common/async';
import 'vs/css!./notebookFindReplaceWidget';
import { FindReplaceState } from 'vs/editor/contrib/find/browser/findState';
import { findNextMatchIcon, findPreviousMatchIcon, findReplaceAllIcon, findReplaceIcon, SimpleButton } from 'vs/editor/contrib/find/browser/findWidget';
import * as nls from 'vs/nls';
import { ContextScopedReplaceInput, registerAndCreateHistoryNavigationContext } from 'vs/platform/history/browser/contextScopedHistoryWidget';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { inputActiveOptionBackground, inputActiveOptionBorder, inputActiveOptionForeground, inputBackground, inputBorder, inputForeground, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, inputValidationInfoBackground, inputValidationInfoBorder, inputValidationInfoForeground, inputValidationWarningBackground, inputValidationWarningBorder, inputValidationWarningForeground } from 'vs/platform/theme/common/colorRegistry';
import { registerIcon, widgetClose } from 'vs/platform/theme/common/iconRegistry';
import { registerThemingParticipant, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { parseReplaceString, ReplacePattern } from 'vs/editor/contrib/find/browser/replacePattern';
import { Codicon } from 'vs/base/common/codicons';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Action, ActionRunner, Separator } from 'vs/base/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { DropdownMenuActionViewItem } from 'vs/base/browser/ui/dropdown/dropdownActionViewItem';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { filterIcon } from 'vs/workbench/contrib/extensions/browser/extensionsIcons';
import { NotebookFindFilters } from 'vs/workbench/contrib/notebook/browser/contrib/find/findFilters';
import { isSafari } from 'vs/base/common/platform';
import { Sash } from 'vs/base/browser/ui/sash/sash';
import { getProgressBarStyles } from 'vs/platform/theme/browser/defaultStyles';
const NLS_FIND_INPUT_LABEL = nls.localize('label.find', "Find");
const NLS_FIND_INPUT_PLACEHOLDER = nls.localize('placeholder.find', "Find");
const NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize('label.previousMatchButton', "Previous Match");
// const NLS_FILTER_BTN_LABEL = nls.localize('label.findFilterButton', "Search in View");
const NLS_NEXT_MATCH_BTN_LABEL = nls.localize('label.nextMatchButton', "Next Match");
const NLS_CLOSE_BTN_LABEL = nls.localize('label.closeButton', "Close");
const NLS_TOGGLE_REPLACE_MODE_BTN_LABEL = nls.localize('label.toggleReplaceButton', "Toggle Replace");
const NLS_REPLACE_INPUT_LABEL = nls.localize('label.replace', "Replace");
const NLS_REPLACE_INPUT_PLACEHOLDER = nls.localize('placeholder.replace', "Replace");
const NLS_REPLACE_BTN_LABEL = nls.localize('label.replaceButton', "Replace");
const NLS_REPLACE_ALL_BTN_LABEL = nls.localize('label.replaceAllButton', "Replace All");
export const findFilterButton = registerIcon('find-filter', Codicon.filter, nls.localize('findFilterIcon', 'Icon for Find Filter in find widget.'));
const NOTEBOOK_FIND_FILTERS = nls.localize('notebook.find.filter.filterAction', "Find Filters");
const NOTEBOOK_FIND_IN_MARKUP_INPUT = nls.localize('notebook.find.filter.findInMarkupInput', "Markdown Source");
const NOTEBOOK_FIND_IN_MARKUP_PREVIEW = nls.localize('notebook.find.filter.findInMarkupPreview', "Rendered Markdown");
const NOTEBOOK_FIND_IN_CODE_INPUT = nls.localize('notebook.find.filter.findInCodeInput', "Code Cell Source");
const NOTEBOOK_FIND_IN_CODE_OUTPUT = nls.localize('notebook.find.filter.findInCodeOutput', "Cell Output");
const NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH = 318;
const NOTEBOOK_FIND_WIDGET_INITIAL_HORIZONTAL_PADDING = 4;
let NotebookFindFilterActionViewItem = class NotebookFindFilterActionViewItem extends DropdownMenuActionViewItem {
    filters;
    constructor(filters, action, actionRunner, contextMenuService) {
        super(action, { getActions: () => this.getActions() }, contextMenuService, {
            actionRunner,
            classNames: action.class,
            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */
        });
        this.filters = filters;
    }
    render(container) {
        super.render(container);
        this.updateChecked();
    }
    getActions() {
        const markdownInput = {
            checked: this.filters.markupInput,
            class: undefined,
            enabled: true,
            id: 'findInMarkdownInput',
            label: NOTEBOOK_FIND_IN_MARKUP_INPUT,
            run: async () => {
                this.filters.markupInput = !this.filters.markupInput;
            },
            tooltip: ''
        };
        const markdownPreview = {
            checked: this.filters.markupPreview,
            class: undefined,
            enabled: true,
            id: 'findInMarkdownInput',
            label: NOTEBOOK_FIND_IN_MARKUP_PREVIEW,
            run: async () => {
                this.filters.markupPreview = !this.filters.markupPreview;
            },
            tooltip: ''
        };
        const codeInput = {
            checked: this.filters.codeInput,
            class: undefined,
            enabled: true,
            id: 'findInCodeInput',
            label: NOTEBOOK_FIND_IN_CODE_INPUT,
            run: async () => {
                this.filters.codeInput = !this.filters.codeInput;
            },
            tooltip: ''
        };
        const codeOutput = {
            checked: this.filters.codeOutput,
            class: undefined,
            enabled: true,
            id: 'findInCodeOutput',
            label: NOTEBOOK_FIND_IN_CODE_OUTPUT,
            run: async () => {
                this.filters.codeOutput = !this.filters.codeOutput;
            },
            tooltip: '',
            dispose: () => null
        };
        if (isSafari) {
            return [
                markdownInput,
                codeInput
            ];
        }
        else {
            return [
                markdownInput,
                markdownPreview,
                new Separator(),
                codeInput,
                codeOutput,
            ];
        }
    }
    updateChecked() {
        this.element.classList.toggle('checked', this._action.checked);
    }
};
NotebookFindFilterActionViewItem = __decorate([
    __param(3, IContextMenuService)
], NotebookFindFilterActionViewItem);
class NotebookFindInput extends FindInput {
    filters;
    contextMenuService;
    instantiationService;
    _filterButtonContainer;
    _actionbar = null;
    _filterChecked = false;
    _filtersAction;
    constructor(filters, contextKeyService, contextMenuService, instantiationService, parent, contextViewProvider, options) {
        super(parent, contextViewProvider, options);
        this.filters = filters;
        this.contextMenuService = contextMenuService;
        this.instantiationService = instantiationService;
        this._register(registerAndCreateHistoryNavigationContext(contextKeyService, this.inputBox));
        this._filtersAction = new Action('notebookFindFilterAction', NOTEBOOK_FIND_FILTERS, 'notebook-filters ' + ThemeIcon.asClassName(filterIcon));
        this._filtersAction.checked = false;
        this._filterButtonContainer = dom.$('.find-filter-button');
        this.controls.appendChild(this._filterButtonContainer);
        this.createFilters(this._filterButtonContainer);
        this._register(this.filters.onDidChange(() => {
            if (this.filters.codeInput !== true || this.filters.codeOutput !== false || this.filters.markupInput !== true || this.filters.markupPreview !== false) {
                this._filtersAction.checked = true;
            }
            else {
                this._filtersAction.checked = false;
            }
        }));
        this.inputBox.paddingRight = (this.caseSensitive?.width() ?? 0) + (this.wholeWords?.width() ?? 0) + (this.regex?.width() ?? 0) + this.getFilterWidth();
    }
    getFilterWidth() {
        return 2 /*margin left*/ + 2 /*border*/ + 2 /*padding*/ + 16 /* icon width */;
    }
    createFilters(container) {
        this._actionbar = this._register(new ActionBar(container, {
            actionViewItemProvider: action => {
                if (action.id === this._filtersAction.id) {
                    return this.instantiationService.createInstance(NotebookFindFilterActionViewItem, this.filters, action, new ActionRunner());
                }
                return undefined;
            }
        }));
        this._actionbar.push(this._filtersAction, { icon: true, label: false });
    }
    setEnabled(enabled) {
        super.setEnabled(enabled);
        if (enabled && !this._filterChecked) {
            this.regex?.enable();
        }
        else {
            this.regex?.disable();
        }
    }
    updateFilterState(changed) {
        this._filterChecked = changed;
        if (this.regex) {
            if (this._filterChecked) {
                this.regex.disable();
                this.regex.domNode.tabIndex = -1;
                this.regex.domNode.classList.toggle('disabled', true);
            }
            else {
                this.regex.enable();
                this.regex.domNode.tabIndex = 0;
                this.regex.domNode.classList.toggle('disabled', false);
            }
        }
        this.applyStyles();
    }
    applyStyles() {
        super.applyStyles();
        this._filterButtonContainer.style.borderColor = this._filterChecked && this.inputActiveOptionBorder ? this.inputActiveOptionBorder.toString() : '';
        this._filterButtonContainer.style.color = this._filterChecked && this.inputActiveOptionForeground ? this.inputActiveOptionForeground.toString() : 'inherit';
        this._filterButtonContainer.style.backgroundColor = this._filterChecked && this.inputActiveOptionBackground ? this.inputActiveOptionBackground.toString() : '';
    }
    getCellToolbarActions(menu) {
        const primary = [];
        const secondary = [];
        const result = { primary, secondary };
        createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
        return result;
    }
}
let SimpleFindReplaceWidget = class SimpleFindReplaceWidget extends Widget {
    _contextViewService;
    _configurationService;
    menuService;
    contextMenuService;
    instantiationService;
    _state;
    _notebookEditor;
    _findInput;
    _domNode;
    _innerFindDomNode;
    _focusTracker;
    _findInputFocusTracker;
    _updateHistoryDelayer;
    _matchesCount;
    prevBtn;
    nextBtn;
    _replaceInput;
    _innerReplaceDomNode;
    _toggleReplaceBtn;
    _replaceInputFocusTracker;
    _replaceBtn;
    _replaceAllBtn;
    _resizeSash;
    _resizeOriginalWidth = NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH;
    _isVisible = false;
    _isReplaceVisible = false;
    foundMatch = false;
    _progressBar;
    _scopedContextKeyService;
    _filters;
    constructor(_contextViewService, contextKeyService, _configurationService, menuService, contextMenuService, instantiationService, _state = new FindReplaceState(), _notebookEditor) {
        super();
        this._contextViewService = _contextViewService;
        this._configurationService = _configurationService;
        this.menuService = menuService;
        this.contextMenuService = contextMenuService;
        this.instantiationService = instantiationService;
        this._state = _state;
        this._notebookEditor = _notebookEditor;
        this._filters = new NotebookFindFilters(true, false, true, false);
        this._state.change({ filters: this._filters }, false);
        this._filters.onDidChange(() => {
            this._state.change({ filters: this._filters }, false);
        });
        this._domNode = document.createElement('div');
        this._domNode.classList.add('simple-fr-find-part-wrapper');
        this._register(this._state.onFindReplaceStateChange((e) => this._onStateChanged(e)));
        this._scopedContextKeyService = contextKeyService.createScoped(this._domNode);
        const progressContainer = dom.$('.find-replace-progress');
        this._progressBar = new ProgressBar(progressContainer, getProgressBarStyles());
        this._domNode.appendChild(progressContainer);
        const isInteractiveWindow = contextKeyService.getContextKeyValue('notebookType') === 'interactive';
        // Toggle replace button
        this._toggleReplaceBtn = this._register(new SimpleButton({
            label: NLS_TOGGLE_REPLACE_MODE_BTN_LABEL,
            className: 'codicon toggle left',
            onTrigger: isInteractiveWindow ? () => { } :
                () => {
                    this._isReplaceVisible = !this._isReplaceVisible;
                    this._state.change({ isReplaceRevealed: this._isReplaceVisible }, false);
                    if (this._isReplaceVisible) {
                        this._innerReplaceDomNode.style.display = 'flex';
                    }
                    else {
                        this._innerReplaceDomNode.style.display = 'none';
                    }
                }
        }));
        this._toggleReplaceBtn.setEnabled(!isInteractiveWindow);
        this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
        this._domNode.appendChild(this._toggleReplaceBtn.domNode);
        this._innerFindDomNode = document.createElement('div');
        this._innerFindDomNode.classList.add('simple-fr-find-part');
        this._findInput = this._register(new NotebookFindInput(this._filters, this._scopedContextKeyService, this.contextMenuService, this.instantiationService, null, this._contextViewService, {
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
                    this.foundMatch = false;
                    this.updateButtons(this.foundMatch);
                    return { content: e.message };
                }
            },
            flexibleWidth: true,
            showCommonFindToggles: true
        }));
        // Find History with update delayer
        this._updateHistoryDelayer = new Delayer(500);
        this.oninput(this._findInput.domNode, (e) => {
            this.foundMatch = this.onInputChanged();
            this.updateButtons(this.foundMatch);
            this._delayedUpdateHistory();
        });
        this._register(this._findInput.inputBox.onDidChange(() => {
            this._state.change({ searchString: this._findInput.getValue() }, true);
        }));
        this._findInput.setRegex(!!this._state.isRegex);
        this._findInput.setCaseSensitive(!!this._state.matchCase);
        this._findInput.setWholeWords(!!this._state.wholeWord);
        this._register(this._findInput.onDidOptionChange(() => {
            this._state.change({
                isRegex: this._findInput.getRegex(),
                wholeWord: this._findInput.getWholeWords(),
                matchCase: this._findInput.getCaseSensitive()
            }, true);
        }));
        this._register(this._state.onFindReplaceStateChange(() => {
            this._findInput.setRegex(this._state.isRegex);
            this._findInput.setWholeWords(this._state.wholeWord);
            this._findInput.setCaseSensitive(this._state.matchCase);
            this._replaceInput.setPreserveCase(this._state.preserveCase);
            this.findFirst();
        }));
        this._matchesCount = document.createElement('div');
        this._matchesCount.className = 'matchesCount';
        this._updateMatchesCount();
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
        this._innerFindDomNode.appendChild(this._findInput.domNode);
        this._innerFindDomNode.appendChild(this._matchesCount);
        this._innerFindDomNode.appendChild(this.prevBtn.domNode);
        this._innerFindDomNode.appendChild(this.nextBtn.domNode);
        this._innerFindDomNode.appendChild(closeBtn.domNode);
        // _domNode wraps _innerDomNode, ensuring that
        this._domNode.appendChild(this._innerFindDomNode);
        this.onkeyup(this._innerFindDomNode, e => {
            if (e.equals(9 /* KeyCode.Escape */)) {
                this.hide();
                e.preventDefault();
                return;
            }
        });
        this._focusTracker = this._register(dom.trackFocus(this._innerFindDomNode));
        this._register(this._focusTracker.onDidFocus(this.onFocusTrackerFocus.bind(this)));
        this._register(this._focusTracker.onDidBlur(this.onFocusTrackerBlur.bind(this)));
        this._findInputFocusTracker = this._register(dom.trackFocus(this._findInput.domNode));
        this._register(this._findInputFocusTracker.onDidFocus(this.onFindInputFocusTrackerFocus.bind(this)));
        this._register(this._findInputFocusTracker.onDidBlur(this.onFindInputFocusTrackerBlur.bind(this)));
        this._register(dom.addDisposableListener(this._innerFindDomNode, 'click', (event) => {
            event.stopPropagation();
        }));
        // Replace
        this._innerReplaceDomNode = document.createElement('div');
        this._innerReplaceDomNode.classList.add('simple-fr-replace-part');
        this._replaceInput = this._register(new ContextScopedReplaceInput(null, undefined, {
            label: NLS_REPLACE_INPUT_LABEL,
            placeholder: NLS_REPLACE_INPUT_PLACEHOLDER,
            history: []
        }, contextKeyService, false));
        this._innerReplaceDomNode.appendChild(this._replaceInput.domNode);
        this._replaceInputFocusTracker = this._register(dom.trackFocus(this._replaceInput.domNode));
        this._register(this._replaceInputFocusTracker.onDidFocus(this.onReplaceInputFocusTrackerFocus.bind(this)));
        this._register(this._replaceInputFocusTracker.onDidBlur(this.onReplaceInputFocusTrackerBlur.bind(this)));
        this._domNode.appendChild(this._innerReplaceDomNode);
        if (this._isReplaceVisible) {
            this._innerReplaceDomNode.style.display = 'flex';
        }
        else {
            this._innerReplaceDomNode.style.display = 'none';
        }
        this._replaceBtn = this._register(new SimpleButton({
            label: NLS_REPLACE_BTN_LABEL,
            icon: findReplaceIcon,
            onTrigger: () => {
                this.replaceOne();
            }
        }));
        // Replace all button
        this._replaceAllBtn = this._register(new SimpleButton({
            label: NLS_REPLACE_ALL_BTN_LABEL,
            icon: findReplaceAllIcon,
            onTrigger: () => {
                this.replaceAll();
            }
        }));
        this._innerReplaceDomNode.appendChild(this._replaceBtn.domNode);
        this._innerReplaceDomNode.appendChild(this._replaceAllBtn.domNode);
        this._resizeSash = this._register(new Sash(this._domNode, { getVerticalSashLeft: () => 0 }, { orientation: 0 /* Orientation.VERTICAL */, size: 2 }));
        this._register(this._resizeSash.onDidStart(() => {
            this._resizeOriginalWidth = this._getDomWidth();
        }));
        this._register(this._resizeSash.onDidChange((evt) => {
            let width = this._resizeOriginalWidth + evt.startX - evt.currentX;
            if (width < NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH) {
                width = NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH;
            }
            const maxWidth = this._getMaxWidth();
            if (width > maxWidth) {
                width = maxWidth;
            }
            this._domNode.style.width = `${width}px`;
            if (this._isReplaceVisible) {
                this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
            }
            this._findInput.inputBox.layout();
        }));
        this._register(this._resizeSash.onDidReset(() => {
            // users double click on the sash
            // try to emulate what happens with editor findWidget
            const currentWidth = this._getDomWidth();
            let width = NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH;
            if (currentWidth <= NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH) {
                width = this._getMaxWidth();
            }
            this._domNode.style.width = `${width}px`;
            if (this._isReplaceVisible) {
                this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
            }
            this._findInput.inputBox.layout();
        }));
    }
    _getMaxWidth() {
        return this._notebookEditor.getLayoutInfo().width - 64;
    }
    _getDomWidth() {
        return dom.getTotalWidth(this._domNode) - (NOTEBOOK_FIND_WIDGET_INITIAL_HORIZONTAL_PADDING * 2);
    }
    getCellToolbarActions(menu) {
        const primary = [];
        const secondary = [];
        const result = { primary, secondary };
        createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
        return result;
    }
    get inputValue() {
        return this._findInput.getValue();
    }
    get replaceValue() {
        return this._replaceInput.getValue();
    }
    get replacePattern() {
        if (this._state.isRegex) {
            return parseReplaceString(this.replaceValue);
        }
        return ReplacePattern.fromStaticValue(this.replaceValue);
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
            inputValidationErrorBorder: theme.getColor(inputValidationErrorBorder),
        };
        this._findInput.style(inputStyles);
        const replaceStyles = {
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
            inputValidationErrorBorder: theme.getColor(inputValidationErrorBorder),
        };
        this._replaceInput.style(replaceStyles);
    }
    _onStateChanged(e) {
        this._updateButtons();
        this._updateMatchesCount();
    }
    _updateButtons() {
        this._findInput.setEnabled(this._isVisible);
        this._replaceInput.setEnabled(this._isVisible && this._isReplaceVisible);
        const findInputIsNonEmpty = (this._state.searchString.length > 0);
        this._replaceBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
        this._replaceAllBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
        this._domNode.classList.toggle('replaceToggled', this._isReplaceVisible);
        this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
        this.foundMatch = this._state.matchesCount > 0;
        this.updateButtons(this.foundMatch);
    }
    _updateMatchesCount() {
    }
    dispose() {
        super.dispose();
        if (this._domNode && this._domNode.parentElement) {
            this._domNode.parentElement.removeChild(this._domNode);
        }
    }
    getDomNode() {
        return this._domNode;
    }
    reveal(initialInput) {
        if (initialInput) {
            this._findInput.setValue(initialInput);
        }
        if (this._isVisible) {
            this._findInput.select();
            return;
        }
        this._isVisible = true;
        this.updateButtons(this.foundMatch);
        setTimeout(() => {
            this._domNode.classList.add('visible', 'visible-transition');
            this._domNode.setAttribute('aria-hidden', 'false');
            this._findInput.select();
        }, 0);
    }
    focus() {
        this._findInput.focus();
    }
    show(initialInput, options) {
        if (initialInput) {
            this._findInput.setValue(initialInput);
        }
        this._isVisible = true;
        setTimeout(() => {
            this._domNode.classList.add('visible', 'visible-transition');
            this._domNode.setAttribute('aria-hidden', 'false');
            if (options?.focus ?? true) {
                this.focus();
            }
        }, 0);
    }
    showWithReplace(initialInput, replaceInput) {
        if (initialInput) {
            this._findInput.setValue(initialInput);
        }
        if (replaceInput) {
            this._replaceInput.setValue(replaceInput);
        }
        this._isVisible = true;
        this._isReplaceVisible = true;
        this._state.change({ isReplaceRevealed: this._isReplaceVisible }, false);
        if (this._isReplaceVisible) {
            this._innerReplaceDomNode.style.display = 'flex';
        }
        else {
            this._innerReplaceDomNode.style.display = 'none';
        }
        setTimeout(() => {
            this._domNode.classList.add('visible', 'visible-transition');
            this._domNode.setAttribute('aria-hidden', 'false');
            this._updateButtons();
            this._replaceInput.focus();
        }, 0);
    }
    hide() {
        if (this._isVisible) {
            this._domNode.classList.remove('visible-transition');
            this._domNode.setAttribute('aria-hidden', 'true');
            // Need to delay toggling visibility until after Transition, then visibility hidden - removes from tabIndex list
            setTimeout(() => {
                this._isVisible = false;
                this.updateButtons(this.foundMatch);
                this._domNode.classList.remove('visible');
            }, 200);
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
};
SimpleFindReplaceWidget = __decorate([
    __param(0, IContextViewService),
    __param(1, IContextKeyService),
    __param(2, IConfigurationService),
    __param(3, IMenuService),
    __param(4, IContextMenuService),
    __param(5, IInstantiationService)
], SimpleFindReplaceWidget);
export { SimpleFindReplaceWidget };
// theming
registerThemingParticipant((theme, collector) => {
    collector.addRule(`
	.notebook-editor {
		--notebook-find-width: ${NOTEBOOK_FIND_WIDGET_INITIAL_WIDTH}px;
		--notebook-find-horizontal-padding: ${NOTEBOOK_FIND_WIDGET_INITIAL_HORIZONTAL_PADDING}px;
	}
	`);
});
