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
import { getDomNodePagePosition } from 'vs/base/browser/dom';
import { onUnexpectedError } from 'vs/base/common/errors';
import { Lazy } from 'vs/base/common/lazy';
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { Position } from 'vs/editor/common/core/position';
import { IActionWidgetService } from 'vs/platform/actionWidget/browser/actionWidget';
import { MessageController } from 'vs/editor/contrib/message/browser/messageController';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { LightBulbWidget } from './lightBulbWidget';
import { toMenuItems } from 'vs/editor/contrib/codeAction/browser/codeActionMenuItems';
let CodeActionUi = class CodeActionUi extends Disposable {
    _editor;
    delegate;
    _configurationService;
    instantiationService;
    _actionWidgetService;
    _lightBulbWidget;
    _activeCodeActions = this._register(new MutableDisposable());
    #disposed = false;
    constructor(_editor, quickFixActionId, preferredFixActionId, delegate, _configurationService, instantiationService, _actionWidgetService) {
        super();
        this._editor = _editor;
        this.delegate = delegate;
        this._configurationService = _configurationService;
        this.instantiationService = instantiationService;
        this._actionWidgetService = _actionWidgetService;
        this._lightBulbWidget = new Lazy(() => {
            const widget = this._register(instantiationService.createInstance(LightBulbWidget, this._editor, quickFixActionId, preferredFixActionId));
            this._register(widget.onClick(e => this.showCodeActionList(e.trigger, e.actions, e, { includeDisabledActions: false, fromLightbulb: true, showHeaders: this.shouldShowHeaders() })));
            return widget;
        });
        this._register(this._editor.onDidLayoutChange(() => this._actionWidgetService.hide()));
    }
    dispose() {
        this.#disposed = true;
        super.dispose();
    }
    async update(newState) {
        if (newState.type !== 1 /* CodeActionsState.Type.Triggered */) {
            this._lightBulbWidget.rawValue?.hide();
            return;
        }
        let actions;
        try {
            actions = await newState.actions;
        }
        catch (e) {
            onUnexpectedError(e);
            return;
        }
        if (this.#disposed) {
            return;
        }
        this._lightBulbWidget.getValue().update(actions, newState.trigger, newState.position);
        if (newState.trigger.type === 1 /* CodeActionTriggerType.Invoke */) {
            if (newState.trigger.filter?.include) { // Triggered for specific scope
                // Check to see if we want to auto apply.
                const validActionToApply = this.tryGetValidActionToApply(newState.trigger, actions);
                if (validActionToApply) {
                    try {
                        this._lightBulbWidget.getValue().hide();
                        await this.delegate.applyCodeAction(validActionToApply, false, false);
                    }
                    finally {
                        actions.dispose();
                    }
                    return;
                }
                // Check to see if there is an action that we would have applied were it not invalid
                if (newState.trigger.context) {
                    const invalidAction = this.getInvalidActionThatWouldHaveBeenApplied(newState.trigger, actions);
                    if (invalidAction && invalidAction.action.disabled) {
                        MessageController.get(this._editor)?.showMessage(invalidAction.action.disabled, newState.trigger.context.position);
                        actions.dispose();
                        return;
                    }
                }
            }
            const includeDisabledActions = !!newState.trigger.filter?.include;
            if (newState.trigger.context) {
                if (!actions.allActions.length || !includeDisabledActions && !actions.validActions.length) {
                    MessageController.get(this._editor)?.showMessage(newState.trigger.context.notAvailableMessage, newState.trigger.context.position);
                    this._activeCodeActions.value = actions;
                    actions.dispose();
                    return;
                }
            }
            this._activeCodeActions.value = actions;
            this.showCodeActionList(newState.trigger, actions, this.toCoords(newState.position), { includeDisabledActions, fromLightbulb: false, showHeaders: this.shouldShowHeaders() });
        }
        else {
            // auto magically triggered
            if (this._actionWidgetService.isVisible) {
                // TODO: Figure out if we should update the showing menu?
                actions.dispose();
            }
            else {
                this._activeCodeActions.value = actions;
            }
        }
    }
    getInvalidActionThatWouldHaveBeenApplied(trigger, actions) {
        if (!actions.allActions.length) {
            return undefined;
        }
        if ((trigger.autoApply === "first" /* CodeActionAutoApply.First */ && actions.validActions.length === 0)
            || (trigger.autoApply === "ifSingle" /* CodeActionAutoApply.IfSingle */ && actions.allActions.length === 1)) {
            return actions.allActions.find(({ action }) => action.disabled);
        }
        return undefined;
    }
    tryGetValidActionToApply(trigger, actions) {
        if (!actions.validActions.length) {
            return undefined;
        }
        if ((trigger.autoApply === "first" /* CodeActionAutoApply.First */ && actions.validActions.length > 0)
            || (trigger.autoApply === "ifSingle" /* CodeActionAutoApply.IfSingle */ && actions.validActions.length === 1)) {
            return actions.validActions[0];
        }
        return undefined;
    }
    async showCodeActionList(trigger, actions, at, options) {
        const editorDom = this._editor.getDomNode();
        if (!editorDom) {
            return;
        }
        const anchor = Position.isIPosition(at) ? this.toCoords(at) : at;
        const delegate = {
            onSelect: async (action, preview) => {
                this.delegate.applyCodeAction(action, /* retrigger */ true, !!preview ? preview : false);
                this._actionWidgetService.hide();
            },
            onHide: () => {
                this._editor?.focus();
            }
        };
        this._actionWidgetService.show('codeActionWidget', toMenuItems, delegate, actions, anchor, editorDom, { ...options, showHeaders: this.shouldShowHeaders() });
    }
    toCoords(position) {
        if (!this._editor.hasModel()) {
            return { x: 0, y: 0 };
        }
        this._editor.revealPosition(position, 1 /* ScrollType.Immediate */);
        this._editor.render();
        // Translate to absolute editor position
        const cursorCoords = this._editor.getScrolledVisiblePosition(position);
        const editorCoords = getDomNodePagePosition(this._editor.getDomNode());
        const x = editorCoords.left + cursorCoords.left;
        const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
        return { x, y };
    }
    shouldShowHeaders() {
        const model = this._editor?.getModel();
        return this._configurationService.getValue('editor.codeActionWidget.showHeaders', { resource: model?.uri });
    }
};
CodeActionUi = __decorate([
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, IActionWidgetService)
], CodeActionUi);
export { CodeActionUi };
