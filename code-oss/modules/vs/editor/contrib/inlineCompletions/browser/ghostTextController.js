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
import { Emitter } from 'vs/base/common/event';
import { Disposable, MutableDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { firstNonWhitespaceIndex } from 'vs/base/common/strings';
import { EditorAction } from 'vs/editor/browser/editorExtensions';
import { CursorColumns } from 'vs/editor/common/core/cursorColumns';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { GhostTextModel } from 'vs/editor/contrib/inlineCompletions/browser/ghostTextModel';
import { GhostTextWidget } from 'vs/editor/contrib/inlineCompletions/browser/ghostTextWidget';
import * as nls from 'vs/nls';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
let GhostTextController = class GhostTextController extends Disposable {
    editor;
    instantiationService;
    static inlineSuggestionVisible = new RawContextKey('inlineSuggestionVisible', false, nls.localize('inlineSuggestionVisible', "Whether an inline suggestion is visible"));
    static inlineSuggestionHasIndentation = new RawContextKey('inlineSuggestionHasIndentation', false, nls.localize('inlineSuggestionHasIndentation', "Whether the inline suggestion starts with whitespace"));
    static inlineSuggestionHasIndentationLessThanTabSize = new RawContextKey('inlineSuggestionHasIndentationLessThanTabSize', true, nls.localize('inlineSuggestionHasIndentationLessThanTabSize', "Whether the inline suggestion starts with whitespace that is less than what would be inserted by tab"));
    static ID = 'editor.contrib.ghostTextController';
    static get(editor) {
        return editor.getContribution(GhostTextController.ID);
    }
    triggeredExplicitly = false;
    activeController = this._register(new MutableDisposable());
    get activeModel() {
        return this.activeController.value?.model;
    }
    activeModelDidChangeEmitter = this._register(new Emitter());
    onActiveModelDidChange = this.activeModelDidChangeEmitter.event;
    constructor(editor, instantiationService) {
        super();
        this.editor = editor;
        this.instantiationService = instantiationService;
        this._register(this.editor.onDidChangeModel(() => {
            this.updateModelController();
        }));
        this._register(this.editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(108 /* EditorOption.suggest */)) {
                this.updateModelController();
            }
            if (e.hasChanged(56 /* EditorOption.inlineSuggest */)) {
                this.updateModelController();
            }
        }));
        this.updateModelController();
    }
    // Don't call this method when not necessary. It will recreate the activeController.
    updateModelController() {
        const suggestOptions = this.editor.getOption(108 /* EditorOption.suggest */);
        const inlineSuggestOptions = this.editor.getOption(56 /* EditorOption.inlineSuggest */);
        this.activeController.value = undefined;
        // ActiveGhostTextController is only created if one of those settings is set or if the inline completions are triggered explicitly.
        this.activeController.value =
            this.editor.hasModel() && (suggestOptions.preview || inlineSuggestOptions.enabled || this.triggeredExplicitly)
                ? this.instantiationService.createInstance(ActiveGhostTextController, this.editor)
                : undefined;
        this.activeModelDidChangeEmitter.fire();
    }
    shouldShowHoverAt(hoverRange) {
        return this.activeModel?.shouldShowHoverAt(hoverRange) || false;
    }
    shouldShowHoverAtViewZone(viewZoneId) {
        return this.activeController.value?.widget?.shouldShowHoverAtViewZone(viewZoneId) || false;
    }
    trigger() {
        this.triggeredExplicitly = true;
        if (!this.activeController.value) {
            this.updateModelController();
        }
        this.activeModel?.triggerInlineCompletion();
    }
    commit() {
        this.activeModel?.commitInlineCompletion();
    }
    hide() {
        this.activeModel?.hideInlineCompletion();
    }
    showNextInlineCompletion() {
        this.activeModel?.showNextInlineCompletion();
    }
    showPreviousInlineCompletion() {
        this.activeModel?.showPreviousInlineCompletion();
    }
    async hasMultipleInlineCompletions() {
        const result = await this.activeModel?.hasMultipleInlineCompletions();
        return result !== undefined ? result : false;
    }
};
GhostTextController = __decorate([
    __param(1, IInstantiationService)
], GhostTextController);
export { GhostTextController };
class GhostTextContextKeys {
    contextKeyService;
    inlineCompletionVisible = GhostTextController.inlineSuggestionVisible.bindTo(this.contextKeyService);
    inlineCompletionSuggestsIndentation = GhostTextController.inlineSuggestionHasIndentation.bindTo(this.contextKeyService);
    inlineCompletionSuggestsIndentationLessThanTabSize = GhostTextController.inlineSuggestionHasIndentationLessThanTabSize.bindTo(this.contextKeyService);
    constructor(contextKeyService) {
        this.contextKeyService = contextKeyService;
    }
}
/**
 * The controller for a text editor with an initialized text model.
 * Must be disposed as soon as the model detaches from the editor.
*/
let ActiveGhostTextController = class ActiveGhostTextController extends Disposable {
    editor;
    instantiationService;
    contextKeyService;
    contextKeys = new GhostTextContextKeys(this.contextKeyService);
    model = this._register(this.instantiationService.createInstance(GhostTextModel, this.editor));
    widget = this._register(this.instantiationService.createInstance(GhostTextWidget, this.editor, this.model));
    constructor(editor, instantiationService, contextKeyService) {
        super();
        this.editor = editor;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this._register(toDisposable(() => {
            this.contextKeys.inlineCompletionVisible.set(false);
            this.contextKeys.inlineCompletionSuggestsIndentation.set(false);
            this.contextKeys.inlineCompletionSuggestsIndentationLessThanTabSize.set(true);
        }));
        this._register(this.model.onDidChange(() => {
            this.updateContextKeys();
        }));
        this.updateContextKeys();
    }
    updateContextKeys() {
        this.contextKeys.inlineCompletionVisible.set(this.model.activeInlineCompletionsModel?.ghostText !== undefined);
        let startsWithIndentation = false;
        let startsWithIndentationLessThanTabSize = true;
        const ghostText = this.model.inlineCompletionsModel.ghostText;
        if (!!this.model.activeInlineCompletionsModel && ghostText && ghostText.parts.length > 0) {
            const { column, lines } = ghostText.parts[0];
            const firstLine = lines[0];
            const indentationEndColumn = this.editor.getModel().getLineIndentColumn(ghostText.lineNumber);
            const inIndentation = column <= indentationEndColumn;
            if (inIndentation) {
                let firstNonWsIdx = firstNonWhitespaceIndex(firstLine);
                if (firstNonWsIdx === -1) {
                    firstNonWsIdx = firstLine.length - 1;
                }
                startsWithIndentation = firstNonWsIdx > 0;
                const tabSize = this.editor.getModel().getOptions().tabSize;
                const visibleColumnIndentation = CursorColumns.visibleColumnFromColumn(firstLine, firstNonWsIdx + 1, tabSize);
                startsWithIndentationLessThanTabSize = visibleColumnIndentation < tabSize;
            }
        }
        this.contextKeys.inlineCompletionSuggestsIndentation.set(startsWithIndentation);
        this.contextKeys.inlineCompletionSuggestsIndentationLessThanTabSize.set(startsWithIndentationLessThanTabSize);
    }
};
ActiveGhostTextController = __decorate([
    __param(1, IInstantiationService),
    __param(2, IContextKeyService)
], ActiveGhostTextController);
export { ActiveGhostTextController };
export class ShowNextInlineSuggestionAction extends EditorAction {
    static ID = 'editor.action.inlineSuggest.showNext';
    constructor() {
        super({
            id: ShowNextInlineSuggestionAction.ID,
            label: nls.localize('action.inlineSuggest.showNext', "Show Next Inline Suggestion"),
            alias: 'Show Next Inline Suggestion',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, GhostTextController.inlineSuggestionVisible),
            kbOpts: {
                weight: 100,
                primary: 512 /* KeyMod.Alt */ | 89 /* KeyCode.BracketRight */,
            },
        });
    }
    async run(accessor, editor) {
        const controller = GhostTextController.get(editor);
        if (controller) {
            controller.showNextInlineCompletion();
            editor.focus();
        }
    }
}
export class ShowPreviousInlineSuggestionAction extends EditorAction {
    static ID = 'editor.action.inlineSuggest.showPrevious';
    constructor() {
        super({
            id: ShowPreviousInlineSuggestionAction.ID,
            label: nls.localize('action.inlineSuggest.showPrevious', "Show Previous Inline Suggestion"),
            alias: 'Show Previous Inline Suggestion',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, GhostTextController.inlineSuggestionVisible),
            kbOpts: {
                weight: 100,
                primary: 512 /* KeyMod.Alt */ | 87 /* KeyCode.BracketLeft */,
            },
        });
    }
    async run(accessor, editor) {
        const controller = GhostTextController.get(editor);
        if (controller) {
            controller.showPreviousInlineCompletion();
            editor.focus();
        }
    }
}
export class TriggerInlineSuggestionAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.inlineSuggest.trigger',
            label: nls.localize('action.inlineSuggest.trigger', "Trigger Inline Suggestion"),
            alias: 'Trigger Inline Suggestion',
            precondition: EditorContextKeys.writable
        });
    }
    async run(accessor, editor) {
        const controller = GhostTextController.get(editor);
        controller?.trigger();
    }
}
