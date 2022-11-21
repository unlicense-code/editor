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
import { CancellationToken } from 'vs/base/common/cancellation';
import { FuzzyScore } from 'vs/base/common/filters';
import { Iterable } from 'vs/base/common/iterator';
import { RefCountedDisposable } from 'vs/base/common/lifecycle';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { Range } from 'vs/editor/common/core/range';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { CompletionItemInsertTextRule } from 'vs/editor/common/standalone/standaloneEnums';
import { CompletionModel, LineContext } from 'vs/editor/contrib/suggest/browser/completionModel';
import { CompletionOptions, provideSuggestionItems, QuickSuggestionsOptions } from 'vs/editor/contrib/suggest/browser/suggest';
import { ISuggestMemoryService } from 'vs/editor/contrib/suggest/browser/suggestMemory';
import { WordDistance } from 'vs/editor/contrib/suggest/browser/wordDistance';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
class SuggestInlineCompletion {
    range;
    insertText;
    filterText;
    additionalTextEdits;
    command;
    completion;
    constructor(range, insertText, filterText, additionalTextEdits, command, completion) {
        this.range = range;
        this.insertText = insertText;
        this.filterText = filterText;
        this.additionalTextEdits = additionalTextEdits;
        this.command = command;
        this.completion = completion;
    }
}
let InlineCompletionResults = class InlineCompletionResults extends RefCountedDisposable {
    model;
    line;
    word;
    completionModel;
    _suggestMemoryService;
    constructor(model, line, word, completionModel, completions, _suggestMemoryService) {
        super(completions.disposable);
        this.model = model;
        this.line = line;
        this.word = word;
        this.completionModel = completionModel;
        this._suggestMemoryService = _suggestMemoryService;
    }
    canBeReused(model, line, word) {
        return this.model === model // same model
            && this.line === line
            && this.word.word.length > 0
            && this.word.startColumn === word.startColumn && this.word.endColumn < word.endColumn // same word
            && this.completionModel.incomplete.size === 0; // no incomplete results
    }
    get items() {
        const result = [];
        // Split items by preselected index. This ensures the memory-selected item shows first and that better/worst
        // ranked items are before/after
        const { items } = this.completionModel;
        const selectedIndex = this._suggestMemoryService.select(this.model, { lineNumber: this.line, column: this.word.endColumn + this.completionModel.lineContext.characterCountDelta }, items);
        const first = Iterable.slice(items, selectedIndex);
        const second = Iterable.slice(items, 0, selectedIndex);
        let resolveCount = 5;
        for (const item of Iterable.concat(first, second)) {
            if (item.score === FuzzyScore.Default) {
                // skip items that have no overlap
                continue;
            }
            const range = new Range(item.editStart.lineNumber, item.editStart.column, item.editInsertEnd.lineNumber, item.editInsertEnd.column + this.completionModel.lineContext.characterCountDelta // end PLUS character delta
            );
            const insertText = item.completion.insertTextRules && (item.completion.insertTextRules & CompletionItemInsertTextRule.InsertAsSnippet)
                ? { snippet: item.completion.insertText }
                : item.completion.insertText;
            result.push(new SuggestInlineCompletion(range, insertText, item.filterTextLow ?? item.labelLow, item.completion.additionalTextEdits, item.completion.command, item));
            // resolve the first N suggestions eagerly
            if (resolveCount-- >= 0) {
                item.resolve(CancellationToken.None);
            }
        }
        return result;
    }
};
InlineCompletionResults = __decorate([
    __param(5, ISuggestMemoryService)
], InlineCompletionResults);
let SuggestInlineCompletions = class SuggestInlineCompletions {
    _getEditorOption;
    _languageFeatureService;
    _clipboardService;
    _suggestMemoryService;
    _lastResult;
    constructor(_getEditorOption, _languageFeatureService, _clipboardService, _suggestMemoryService) {
        this._getEditorOption = _getEditorOption;
        this._languageFeatureService = _languageFeatureService;
        this._clipboardService = _clipboardService;
        this._suggestMemoryService = _suggestMemoryService;
    }
    async provideInlineCompletions(model, position, context, token) {
        if (context.selectedSuggestionInfo) {
            return;
        }
        const config = this._getEditorOption(80 /* EditorOption.quickSuggestions */, model);
        if (QuickSuggestionsOptions.isAllOff(config)) {
            // quick suggest is off (for this model/language)
            return;
        }
        model.tokenization.tokenizeIfCheap(position.lineNumber);
        const lineTokens = model.tokenization.getLineTokens(position.lineNumber);
        const tokenType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(Math.max(position.column - 1 - 1, 0)));
        if (QuickSuggestionsOptions.valueFor(config, tokenType) !== 'inline') {
            // quick suggest is off (for this token)
            return undefined;
        }
        // We consider non-empty leading words and trigger characters. The latter only
        // when no word is being typed (word characters superseed trigger characters)
        let wordInfo = model.getWordAtPosition(position);
        let triggerCharacterInfo;
        if (!wordInfo?.word) {
            triggerCharacterInfo = this._getTriggerCharacterInfo(model, position);
        }
        if (!wordInfo?.word && !triggerCharacterInfo) {
            // not at word, not a trigger character
            return;
        }
        // ensure that we have word information and that we are at the end of a word
        // otherwise we stop because we don't want to do quick suggestions inside words
        if (!wordInfo) {
            wordInfo = model.getWordUntilPosition(position);
        }
        if (wordInfo.endColumn !== position.column) {
            return;
        }
        let result;
        const leadingLineContents = model.getValueInRange(new Range(position.lineNumber, 1, position.lineNumber, position.column));
        if (!triggerCharacterInfo && this._lastResult?.canBeReused(model, position.lineNumber, wordInfo)) {
            // reuse a previous result iff possible, only a refilter is needed
            // TODO@jrieken this can be improved further and only incomplete results can be updated
            // console.log(`REUSE with ${wordInfo.word}`);
            const newLineContext = new LineContext(leadingLineContents, position.column - this._lastResult.word.endColumn);
            this._lastResult.completionModel.lineContext = newLineContext;
            this._lastResult.acquire();
            result = this._lastResult;
        }
        else {
            // refesh model is required
            const completions = await provideSuggestionItems(this._languageFeatureService.completionProvider, model, position, new CompletionOptions(undefined, undefined, triggerCharacterInfo?.providers), triggerCharacterInfo && { triggerKind: 1 /* CompletionTriggerKind.TriggerCharacter */, triggerCharacter: triggerCharacterInfo.ch }, token);
            let clipboardText;
            if (completions.needsClipboard) {
                clipboardText = await this._clipboardService.readText();
            }
            const completionModel = new CompletionModel(completions.items, position.column, new LineContext(leadingLineContents, 0), WordDistance.None, this._getEditorOption(108 /* EditorOption.suggest */, model), this._getEditorOption(102 /* EditorOption.snippetSuggestions */, model), { boostFullMatch: false, firstMatchCanBeWeak: false }, clipboardText);
            result = new InlineCompletionResults(model, position.lineNumber, wordInfo, completionModel, completions, this._suggestMemoryService);
        }
        this._lastResult = result;
        return result;
    }
    handleItemDidShow(_completions, item) {
        item.completion.resolve(CancellationToken.None);
    }
    freeInlineCompletions(result) {
        result.release();
    }
    _getTriggerCharacterInfo(model, position) {
        const ch = model.getValueInRange(Range.fromPositions({ lineNumber: position.lineNumber, column: position.column - 1 }, position));
        const providers = new Set();
        for (const provider of this._languageFeatureService.completionProvider.all(model)) {
            if (provider.triggerCharacters?.includes(ch)) {
                providers.add(provider);
            }
        }
        if (providers.size === 0) {
            return undefined;
        }
        return { providers, ch };
    }
};
SuggestInlineCompletions = __decorate([
    __param(1, ILanguageFeaturesService),
    __param(2, IClipboardService),
    __param(3, ISuggestMemoryService)
], SuggestInlineCompletions);
export { SuggestInlineCompletions };
let EditorContribution = class EditorContribution {
    static _counter = 0;
    static _disposable;
    constructor(_editor, languageFeatureService, editorService, instaService) {
        // HACK - way to contribute something only once
        if (++EditorContribution._counter === 1) {
            const provider = instaService.createInstance(SuggestInlineCompletions, (id, model) => {
                // HACK - reuse the editor options world outside from a "normal" contribution
                const editor = editorService.listCodeEditors().find(editor => editor.getModel() === model) ?? _editor;
                return editor.getOption(id);
            });
            EditorContribution._disposable = languageFeatureService.inlineCompletionsProvider.register('*', provider);
        }
    }
    dispose() {
        if (--EditorContribution._counter === 0) {
            EditorContribution._disposable?.dispose();
            EditorContribution._disposable = undefined;
        }
    }
};
EditorContribution = __decorate([
    __param(1, ILanguageFeaturesService),
    __param(2, ICodeEditorService),
    __param(3, IInstantiationService)
], EditorContribution);
registerEditorContribution('suggest.inlineCompletionsProvider', EditorContribution);
