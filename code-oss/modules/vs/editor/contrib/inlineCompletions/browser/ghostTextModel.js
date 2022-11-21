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
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { Position } from 'vs/editor/common/core/position';
import { InlineCompletionTriggerKind } from 'vs/editor/common/languages';
import { InlineCompletionsModel, SynchronizedInlineCompletionsCache } from 'vs/editor/contrib/inlineCompletions/browser/inlineCompletionsModel';
import { SuggestWidgetPreviewModel } from 'vs/editor/contrib/inlineCompletions/browser/suggestWidgetPreviewModel';
import { createDisposableRef } from 'vs/editor/contrib/inlineCompletions/browser/utils';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export class DelegatingModel extends Disposable {
    onDidChangeEmitter = new Emitter();
    onDidChange = this.onDidChangeEmitter.event;
    hasCachedGhostText = false;
    cachedGhostText;
    currentModelRef = this._register(new MutableDisposable());
    get targetModel() {
        return this.currentModelRef.value?.object;
    }
    setTargetModel(model) {
        if (this.currentModelRef.value?.object === model) {
            return;
        }
        this.currentModelRef.clear();
        this.currentModelRef.value = model ? createDisposableRef(model, model.onDidChange(() => {
            this.hasCachedGhostText = false;
            this.onDidChangeEmitter.fire();
        })) : undefined;
        this.hasCachedGhostText = false;
        this.onDidChangeEmitter.fire();
    }
    get ghostText() {
        if (!this.hasCachedGhostText) {
            this.cachedGhostText = this.currentModelRef.value?.object?.ghostText;
            this.hasCachedGhostText = true;
        }
        return this.cachedGhostText;
    }
    setExpanded(expanded) {
        this.targetModel?.setExpanded(expanded);
    }
    get expanded() {
        return this.targetModel ? this.targetModel.expanded : false;
    }
    get minReservedLineCount() {
        return this.targetModel ? this.targetModel.minReservedLineCount : 0;
    }
}
/**
 * A ghost text model that is both driven by inline completions and the suggest widget.
*/
let GhostTextModel = class GhostTextModel extends DelegatingModel {
    editor;
    instantiationService;
    sharedCache = this._register(new SharedInlineCompletionCache());
    suggestWidgetAdapterModel = this._register(this.instantiationService.createInstance(SuggestWidgetPreviewModel, this.editor, this.sharedCache));
    inlineCompletionsModel = this._register(this.instantiationService.createInstance(InlineCompletionsModel, this.editor, this.sharedCache));
    get activeInlineCompletionsModel() {
        if (this.targetModel === this.inlineCompletionsModel) {
            return this.inlineCompletionsModel;
        }
        return undefined;
    }
    constructor(editor, instantiationService) {
        super();
        this.editor = editor;
        this.instantiationService = instantiationService;
        this._register(this.suggestWidgetAdapterModel.onDidChange(() => {
            this.updateModel();
        }));
        this.updateModel();
    }
    updateModel() {
        this.setTargetModel(this.suggestWidgetAdapterModel.isActive
            ? this.suggestWidgetAdapterModel
            : this.inlineCompletionsModel);
        this.inlineCompletionsModel.setActive(this.targetModel === this.inlineCompletionsModel);
    }
    shouldShowHoverAt(hoverRange) {
        const ghostText = this.activeInlineCompletionsModel?.ghostText;
        if (ghostText) {
            return ghostText.parts.some(p => hoverRange.containsPosition(new Position(ghostText.lineNumber, p.column)));
        }
        return false;
    }
    triggerInlineCompletion() {
        this.activeInlineCompletionsModel?.trigger(InlineCompletionTriggerKind.Explicit);
    }
    commitInlineCompletion() {
        this.activeInlineCompletionsModel?.commitCurrentSuggestion();
    }
    hideInlineCompletion() {
        this.activeInlineCompletionsModel?.hide();
    }
    showNextInlineCompletion() {
        this.activeInlineCompletionsModel?.showNext();
    }
    showPreviousInlineCompletion() {
        this.activeInlineCompletionsModel?.showPrevious();
    }
    async hasMultipleInlineCompletions() {
        const result = await this.activeInlineCompletionsModel?.hasMultipleInlineCompletions();
        return result !== undefined ? result : false;
    }
};
GhostTextModel = __decorate([
    __param(1, IInstantiationService)
], GhostTextModel);
export { GhostTextModel };
export class SharedInlineCompletionCache extends Disposable {
    onDidChangeEmitter = new Emitter();
    onDidChange = this.onDidChangeEmitter.event;
    cache = this._register(new MutableDisposable());
    get value() {
        return this.cache.value;
    }
    setValue(editor, completionsSource, triggerKind) {
        this.cache.value = new SynchronizedInlineCompletionsCache(completionsSource, editor, () => this.onDidChangeEmitter.fire(), triggerKind);
    }
    clearAndLeak() {
        return this.cache.clearAndLeak();
    }
    clear() {
        this.cache.clear();
    }
}
