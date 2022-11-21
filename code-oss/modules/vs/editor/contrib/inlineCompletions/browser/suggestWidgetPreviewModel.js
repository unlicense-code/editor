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
import { createCancelablePromise, RunOnceScheduler } from 'vs/base/common/async';
import { onUnexpectedError } from 'vs/base/common/errors';
import { MutableDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { InlineCompletionTriggerKind } from 'vs/editor/common/languages';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { BaseGhostTextWidgetModel, GhostText } from './ghostText';
import { provideInlineCompletions, UpdateOperation } from './inlineCompletionsModel';
import { inlineCompletionToGhostText, minimizeInlineCompletion } from './inlineCompletionToGhostText';
import { SuggestWidgetInlineCompletionProvider } from './suggestWidgetInlineCompletionProvider';
let SuggestWidgetPreviewModel = class SuggestWidgetPreviewModel extends BaseGhostTextWidgetModel {
    cache;
    languageFeaturesService;
    suggestionInlineCompletionSource = this._register(new SuggestWidgetInlineCompletionProvider(this.editor, 
    // Use the first cache item (if any) as preselection.
    () => this.cache.value?.completions[0]?.toLiveInlineCompletion()));
    updateOperation = this._register(new MutableDisposable());
    updateCacheSoon = this._register(new RunOnceScheduler(() => this.updateCache(), 50));
    minReservedLineCount = 0;
    get isActive() {
        return this.suggestionInlineCompletionSource.state !== undefined;
    }
    constructor(editor, cache, languageFeaturesService) {
        super(editor);
        this.cache = cache;
        this.languageFeaturesService = languageFeaturesService;
        this._register(this.suggestionInlineCompletionSource.onDidChange(() => {
            if (!this.editor.hasModel()) {
                // onDidChange might be called when calling setModel on the editor, before we are disposed.
                return;
            }
            this.updateCacheSoon.schedule();
            const suggestWidgetState = this.suggestionInlineCompletionSource.state;
            if (!suggestWidgetState) {
                this.minReservedLineCount = 0;
            }
            const newGhostText = this.ghostText;
            if (newGhostText) {
                this.minReservedLineCount = Math.max(this.minReservedLineCount, sum(newGhostText.parts.map(p => p.lines.length - 1)));
            }
            if (this.minReservedLineCount >= 1) {
                this.suggestionInlineCompletionSource.forceRenderingAbove();
            }
            else {
                this.suggestionInlineCompletionSource.stopForceRenderingAbove();
            }
            this.onDidChangeEmitter.fire();
        }));
        this._register(this.cache.onDidChange(() => {
            this.onDidChangeEmitter.fire();
        }));
        this._register(this.editor.onDidChangeCursorPosition((e) => {
            this.minReservedLineCount = 0;
            this.updateCacheSoon.schedule();
            this.onDidChangeEmitter.fire();
        }));
        this._register(toDisposable(() => this.suggestionInlineCompletionSource.stopForceRenderingAbove()));
    }
    isSuggestionPreviewEnabled() {
        const suggestOptions = this.editor.getOption(108 /* EditorOption.suggest */);
        return suggestOptions.preview;
    }
    async updateCache() {
        const state = this.suggestionInlineCompletionSource.state;
        if (!state || !state.selectedItem) {
            return;
        }
        const info = {
            text: state.selectedItem.normalizedInlineCompletion.insertText,
            range: state.selectedItem.normalizedInlineCompletion.range,
            isSnippetText: state.selectedItem.isSnippetText,
            completionKind: state.selectedItem.completionItemKind,
        };
        const position = this.editor.getPosition();
        if (state.selectedItem.isSnippetText ||
            state.selectedItem.completionItemKind === 27 /* CompletionItemKind.Snippet */ ||
            state.selectedItem.completionItemKind === 20 /* CompletionItemKind.File */ ||
            state.selectedItem.completionItemKind === 23 /* CompletionItemKind.Folder */) {
            // Don't ask providers for these types of suggestions.
            this.cache.clear();
            return;
        }
        const promise = createCancelablePromise(async (token) => {
            let result;
            try {
                result = await provideInlineCompletions(this.languageFeaturesService.inlineCompletionsProvider, position, this.editor.getModel(), { triggerKind: InlineCompletionTriggerKind.Automatic, selectedSuggestionInfo: info }, token);
            }
            catch (e) {
                onUnexpectedError(e);
                return;
            }
            if (token.isCancellationRequested) {
                result.dispose();
                return;
            }
            this.cache.setValue(this.editor, result, InlineCompletionTriggerKind.Automatic);
            this.onDidChangeEmitter.fire();
        });
        const operation = new UpdateOperation(promise, InlineCompletionTriggerKind.Automatic);
        this.updateOperation.value = operation;
        await promise;
        if (this.updateOperation.value === operation) {
            this.updateOperation.clear();
        }
    }
    get ghostText() {
        const isSuggestionPreviewEnabled = this.isSuggestionPreviewEnabled();
        const model = this.editor.getModel();
        const augmentedCompletion = minimizeInlineCompletion(model, this.cache.value?.completions[0]?.toLiveInlineCompletion());
        const suggestWidgetState = this.suggestionInlineCompletionSource.state;
        const suggestInlineCompletion = minimizeInlineCompletion(model, suggestWidgetState?.selectedItem?.normalizedInlineCompletion);
        const isAugmentedCompletionValid = augmentedCompletion
            && suggestInlineCompletion
            && augmentedCompletion.insertText.startsWith(suggestInlineCompletion.insertText)
            && augmentedCompletion.range.equalsRange(suggestInlineCompletion.range);
        if (!isSuggestionPreviewEnabled && !isAugmentedCompletionValid) {
            return undefined;
        }
        // If the augmented completion is not valid and there is no suggest inline completion, we still show the augmented completion.
        const finalCompletion = isAugmentedCompletionValid ? augmentedCompletion : (suggestInlineCompletion || augmentedCompletion);
        const inlineCompletionPreviewLength = isAugmentedCompletionValid ? finalCompletion.insertText.length - suggestInlineCompletion.insertText.length : 0;
        const newGhostText = this.toGhostText(finalCompletion, inlineCompletionPreviewLength);
        return newGhostText;
    }
    toGhostText(completion, inlineCompletionPreviewLength) {
        const mode = this.editor.getOptions().get(108 /* EditorOption.suggest */).previewMode;
        return completion
            ? (inlineCompletionToGhostText(completion, this.editor.getModel(), mode, this.editor.getPosition(), inlineCompletionPreviewLength) ||
                // Show an invisible ghost text to reserve space
                new GhostText(completion.range.endLineNumber, [], this.minReservedLineCount))
            : undefined;
    }
};
SuggestWidgetPreviewModel = __decorate([
    __param(2, ILanguageFeaturesService)
], SuggestWidgetPreviewModel);
export { SuggestWidgetPreviewModel };
function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}
