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
import 'vs/css!./suggestEnabledInput';
import { $, append } from 'vs/base/browser/dom';
import { Widget } from 'vs/base/browser/ui/widget';
import { Emitter, Event } from 'vs/base/common/event';
import { mixin } from 'vs/base/common/objects';
import { isMacintosh } from 'vs/base/common/platform';
import { URI as uri } from 'vs/base/common/uri';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { IModelService } from 'vs/editor/common/services/model';
import { ContextMenuController } from 'vs/editor/contrib/contextmenu/browser/contextmenu';
import { SnippetController2 } from 'vs/editor/contrib/snippet/browser/snippetController2';
import { SuggestController } from 'vs/editor/contrib/suggest/browser/suggestController';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { editorSelectionBackground, inputBackground, inputBorder, inputForeground, inputPlaceholderForeground, selectionBackground } from 'vs/platform/theme/common/colorRegistry';
import { attachStyler } from 'vs/platform/theme/common/styler';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { MenuPreventer } from 'vs/workbench/contrib/codeEditor/browser/menuPreventer';
import { getSimpleEditorOptions } from 'vs/workbench/contrib/codeEditor/browser/simpleEditorOptions';
import { SelectionClipboardContributionID } from 'vs/workbench/contrib/codeEditor/browser/selectionClipboard';
import { EditorExtensionsRegistry } from 'vs/editor/browser/editorExtensions';
import { DEFAULT_FONT_FAMILY } from 'vs/workbench/browser/style';
import { HistoryNavigator } from 'vs/base/common/history';
import { registerAndCreateHistoryNavigationContext } from 'vs/platform/history/browser/contextScopedHistoryWidget';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export function attachSuggestEnabledInputBoxStyler(widget, themeService, style) {
    return attachStyler(themeService, {
        inputBackground: style?.inputBackground || inputBackground,
        inputForeground: style?.inputForeground || inputForeground,
        inputBorder: style?.inputBorder || inputBorder,
        inputPlaceholderForeground: style?.inputPlaceholderForeground || inputPlaceholderForeground,
    }, widget);
}
let SuggestEnabledInput = class SuggestEnabledInput extends Widget {
    _onShouldFocusResults = new Emitter();
    onShouldFocusResults = this._onShouldFocusResults.event;
    _onEnter = new Emitter();
    onEnter = this._onEnter.event;
    _onInputDidChange = new Emitter();
    onInputDidChange = this._onInputDidChange.event;
    _onDidFocus = this._register(new Emitter());
    onDidFocus = this._onDidFocus.event;
    _onDidBlur = this._register(new Emitter());
    onDidBlur = this._onDidBlur.event;
    inputWidget;
    inputModel;
    stylingContainer;
    element;
    placeholderText;
    constructor(id, parent, suggestionProvider, ariaLabel, resourceHandle, options, defaultInstantiationService, modelService, contextKeyService, languageFeaturesService) {
        super();
        this.stylingContainer = append(parent, $('.suggest-input-container'));
        this.element = parent;
        this.placeholderText = append(this.stylingContainer, $('.suggest-input-placeholder', undefined, options.placeholderText || ''));
        const editorOptions = mixin(getSimpleEditorOptions(), getSuggestEnabledInputOptions(ariaLabel));
        const scopedContextKeyService = this.getScopedContextKeyService(contextKeyService);
        const instantiationService = scopedContextKeyService
            ? defaultInstantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService]))
            : defaultInstantiationService;
        this.inputWidget = this._register(instantiationService.createInstance(CodeEditorWidget, this.stylingContainer, editorOptions, {
            contributions: EditorExtensionsRegistry.getSomeEditorContributions([
                SuggestController.ID,
                SnippetController2.ID,
                ContextMenuController.ID,
                MenuPreventer.ID,
                SelectionClipboardContributionID,
            ]),
            isSimpleWidget: true,
        }));
        this._register(this.inputWidget.onDidFocusEditorText(() => this._onDidFocus.fire()));
        this._register(this.inputWidget.onDidBlurEditorText(() => this._onDidBlur.fire()));
        const scopeHandle = uri.parse(resourceHandle);
        this.inputModel = modelService.createModel('', null, scopeHandle, true);
        this._register(this.inputModel);
        this.inputWidget.setModel(this.inputModel);
        this._register(this.inputWidget.onDidPaste(() => this.setValue(this.getValue()))); // setter cleanses
        this._register((this.inputWidget.onDidFocusEditorText(() => {
            if (options.focusContextKey) {
                options.focusContextKey.set(true);
            }
            this.stylingContainer.classList.add('synthetic-focus');
        })));
        this._register((this.inputWidget.onDidBlurEditorText(() => {
            if (options.focusContextKey) {
                options.focusContextKey.set(false);
            }
            this.stylingContainer.classList.remove('synthetic-focus');
        })));
        const onKeyDownMonaco = Event.chain(this.inputWidget.onKeyDown);
        this._register(onKeyDownMonaco.filter(e => e.keyCode === 3 /* KeyCode.Enter */).on(e => { e.preventDefault(); this._onEnter.fire(); }, this));
        this._register(onKeyDownMonaco.filter(e => e.keyCode === 18 /* KeyCode.DownArrow */ && (isMacintosh ? e.metaKey : e.ctrlKey)).on(() => this._onShouldFocusResults.fire(), this));
        let preexistingContent = this.getValue();
        const inputWidgetModel = this.inputWidget.getModel();
        if (inputWidgetModel) {
            this._register(inputWidgetModel.onDidChangeContent(() => {
                const content = this.getValue();
                this.placeholderText.style.visibility = content ? 'hidden' : 'visible';
                if (preexistingContent.trim() === content.trim()) {
                    return;
                }
                this._onInputDidChange.fire(undefined);
                preexistingContent = content;
            }));
        }
        const validatedSuggestProvider = {
            provideResults: suggestionProvider.provideResults,
            sortKey: suggestionProvider.sortKey || (a => a),
            triggerCharacters: suggestionProvider.triggerCharacters || []
        };
        this.setValue(options.value || '');
        this._register(languageFeaturesService.completionProvider.register({ scheme: scopeHandle.scheme, pattern: '**/' + scopeHandle.path, hasAccessToAllModels: true }, {
            triggerCharacters: validatedSuggestProvider.triggerCharacters,
            provideCompletionItems: (model, position, _context) => {
                const query = model.getValue();
                const zeroIndexedColumn = position.column - 1;
                const zeroIndexedWordStart = query.lastIndexOf(' ', zeroIndexedColumn - 1) + 1;
                const alreadyTypedCount = zeroIndexedColumn - zeroIndexedWordStart;
                // dont show suggestions if the user has typed something, but hasn't used the trigger character
                if (alreadyTypedCount > 0 && validatedSuggestProvider.triggerCharacters.indexOf(query[zeroIndexedWordStart]) === -1) {
                    return { suggestions: [] };
                }
                return {
                    suggestions: suggestionProvider.provideResults(query).map((result) => {
                        let label;
                        let rest;
                        if (typeof result === 'string') {
                            label = result;
                        }
                        else {
                            label = result.label;
                            rest = result;
                        }
                        return {
                            label,
                            insertText: label,
                            range: Range.fromPositions(position.delta(0, -alreadyTypedCount), position),
                            sortText: validatedSuggestProvider.sortKey(label),
                            kind: 17 /* languages.CompletionItemKind.Keyword */,
                            ...rest
                        };
                    })
                };
            }
        }));
    }
    getScopedContextKeyService(_contextKeyService) {
        return undefined;
    }
    updateAriaLabel(label) {
        this.inputWidget.updateOptions({ ariaLabel: label });
    }
    setValue(val) {
        val = val.replace(/\s/g, ' ');
        const fullRange = this.inputModel.getFullModelRange();
        this.inputWidget.executeEdits('suggestEnabledInput.setValue', [EditOperation.replace(fullRange, val)]);
        this.inputWidget.setScrollTop(0);
        this.inputWidget.setPosition(new Position(1, val.length + 1));
    }
    getValue() {
        return this.inputWidget.getValue();
    }
    style(colors) {
        this.stylingContainer.style.backgroundColor = colors.inputBackground ? colors.inputBackground.toString() : '';
        this.stylingContainer.style.color = colors.inputForeground ? colors.inputForeground.toString() : '';
        this.placeholderText.style.color = colors.inputPlaceholderForeground ? colors.inputPlaceholderForeground.toString() : '';
        this.stylingContainer.style.borderWidth = '1px';
        this.stylingContainer.style.borderStyle = 'solid';
        this.stylingContainer.style.borderColor = colors.inputBorder ?
            colors.inputBorder.toString() :
            'transparent';
        const cursor = this.stylingContainer.getElementsByClassName('cursor')[0];
        if (cursor) {
            cursor.style.backgroundColor = colors.inputForeground ? colors.inputForeground.toString() : '';
        }
    }
    focus(selectAll) {
        this.inputWidget.focus();
        if (selectAll && this.inputWidget.getValue()) {
            this.selectAll();
        }
    }
    onHide() {
        this.inputWidget.onHide();
    }
    layout(dimension) {
        this.inputWidget.layout(dimension);
        this.placeholderText.style.width = `${dimension.width - 2}px`;
    }
    selectAll() {
        this.inputWidget.setSelection(new Range(1, 1, 1, this.getValue().length + 1));
    }
};
SuggestEnabledInput = __decorate([
    __param(6, IInstantiationService),
    __param(7, IModelService),
    __param(8, IContextKeyService),
    __param(9, ILanguageFeaturesService)
], SuggestEnabledInput);
export { SuggestEnabledInput };
let SuggestEnabledInputWithHistory = class SuggestEnabledInputWithHistory extends SuggestEnabledInput {
    history;
    constructor({ id, parent, ariaLabel, suggestionProvider, resourceHandle, suggestOptions, history }, instantiationService, modelService, contextKeyService, languageFeaturesService) {
        super(id, parent, suggestionProvider, ariaLabel, resourceHandle, suggestOptions, instantiationService, modelService, contextKeyService, languageFeaturesService);
        this.history = new HistoryNavigator(history, 100);
    }
    addToHistory() {
        const value = this.getValue();
        if (value && value !== this.getCurrentValue()) {
            this.history.add(value);
        }
    }
    getHistory() {
        return this.history.getHistory();
    }
    showNextValue() {
        if (!this.history.has(this.getValue())) {
            this.addToHistory();
        }
        let next = this.getNextValue();
        if (next) {
            next = next === this.getValue() ? this.getNextValue() : next;
        }
        if (next) {
            this.setValue(next);
        }
    }
    showPreviousValue() {
        if (!this.history.has(this.getValue())) {
            this.addToHistory();
        }
        let previous = this.getPreviousValue();
        if (previous) {
            previous = previous === this.getValue() ? this.getPreviousValue() : previous;
        }
        if (previous) {
            this.setValue(previous);
            this.inputWidget.setPosition({ lineNumber: 0, column: 0 });
        }
    }
    clearHistory() {
        this.history.clear();
    }
    getCurrentValue() {
        let currentValue = this.history.current();
        if (!currentValue) {
            currentValue = this.history.last();
            this.history.next();
        }
        return currentValue;
    }
    getPreviousValue() {
        return this.history.previous() || this.history.first();
    }
    getNextValue() {
        return this.history.next() || this.history.last();
    }
};
SuggestEnabledInputWithHistory = __decorate([
    __param(1, IInstantiationService),
    __param(2, IModelService),
    __param(3, IContextKeyService),
    __param(4, ILanguageFeaturesService)
], SuggestEnabledInputWithHistory);
export { SuggestEnabledInputWithHistory };
let ContextScopedSuggestEnabledInputWithHistory = class ContextScopedSuggestEnabledInputWithHistory extends SuggestEnabledInputWithHistory {
    historyContext;
    constructor(options, instantiationService, modelService, contextKeyService, languageFeaturesService) {
        super(options, instantiationService, modelService, contextKeyService, languageFeaturesService);
        const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this.historyContext;
        this._register(this.inputWidget.onDidChangeCursorPosition(({ position }) => {
            const viewModel = this.inputWidget._getViewModel();
            const lastLineNumber = viewModel.getLineCount();
            const lastLineCol = viewModel.getLineContent(lastLineNumber).length + 1;
            const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
            historyNavigationBackwardsEnablement.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
            historyNavigationForwardsEnablement.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
        }));
    }
    getScopedContextKeyService(contextKeyService) {
        const scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
        this.historyContext = this._register(registerAndCreateHistoryNavigationContext(scopedContextKeyService, this));
        return scopedContextKeyService;
    }
};
ContextScopedSuggestEnabledInputWithHistory = __decorate([
    __param(1, IInstantiationService),
    __param(2, IModelService),
    __param(3, IContextKeyService),
    __param(4, ILanguageFeaturesService)
], ContextScopedSuggestEnabledInputWithHistory);
export { ContextScopedSuggestEnabledInputWithHistory };
// Override styles in selections.ts
registerThemingParticipant((theme, collector) => {
    const selectionBackgroundColor = theme.getColor(selectionBackground);
    if (selectionBackgroundColor) {
        // Override inactive selection bg
        const inputBackgroundColor = theme.getColor(inputBackground);
        if (inputBackgroundColor) {
            collector.addRule(`.suggest-input-container .monaco-editor .selected-text { background-color: ${inputBackgroundColor.transparent(0.4)}; }`);
        }
        // Override selected fg
        const inputForegroundColor = theme.getColor(inputForeground);
        if (inputForegroundColor) {
            collector.addRule(`.suggest-input-container .monaco-editor .view-line span.inline-selected-text { color: ${inputForegroundColor}; }`);
        }
        const backgroundColor = theme.getColor(inputBackground);
        if (backgroundColor) {
            collector.addRule(`.suggest-input-container .monaco-editor-background { background-color: ${backgroundColor}; } `);
        }
        collector.addRule(`.suggest-input-container .monaco-editor .focused .selected-text { background-color: ${selectionBackgroundColor}; }`);
    }
    else {
        // Use editor selection color if theme has not set a selection background color
        collector.addRule(`.suggest-input-container .monaco-editor .focused .selected-text { background-color: ${theme.getColor(editorSelectionBackground)}; }`);
    }
});
function getSuggestEnabledInputOptions(ariaLabel) {
    return {
        fontSize: 13,
        lineHeight: 20,
        wordWrap: 'off',
        scrollbar: { vertical: 'hidden', },
        roundedSelection: false,
        guides: {
            indentation: false
        },
        cursorWidth: 1,
        fontFamily: DEFAULT_FONT_FAMILY,
        ariaLabel: ariaLabel || '',
        snippetSuggestions: 'none',
        suggest: { filterGraceful: false, showIcons: false },
        autoClosingBrackets: 'never'
    };
}
