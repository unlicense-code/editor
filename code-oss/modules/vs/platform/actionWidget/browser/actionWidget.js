var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as dom from 'vs/base/browser/dom';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { Disposable, DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import 'vs/css!./actionWidget';
import { localize } from 'vs/nls';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { acceptSelectedActionCommand, ActionList, previewSelectedActionCommand } from 'vs/platform/actionWidget/browser/actionList';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
const ActionWidgetContextKeys = {
    Visible: new RawContextKey('actionWidgetVisible', false, localize('actionWidgetVisible', "Whether the action widget list is visible"))
};
export const IActionWidgetService = createDecorator('actionWidgetService');
let ActionWidgetService = class ActionWidgetService extends Disposable {
    _commandService;
    contextViewService;
    _contextKeyService;
    _instantiationService;
    get isVisible() {
        return ActionWidgetContextKeys.Visible.getValue(this._contextKeyService) || false;
    }
    _showDisabled = false;
    _currentShowingContext;
    _list = this._register(new MutableDisposable());
    constructor(_commandService, contextViewService, _contextKeyService, _instantiationService) {
        super();
        this._commandService = _commandService;
        this.contextViewService = contextViewService;
        this._contextKeyService = _contextKeyService;
        this._instantiationService = _instantiationService;
    }
    async show(user, toMenuItems, delegate, actions, anchor, container, options, resolver) {
        this._currentShowingContext = undefined;
        const visibleContext = ActionWidgetContextKeys.Visible.bindTo(this._contextKeyService);
        const actionsToShow = options.includeDisabledActions && (this._showDisabled || actions.validActions.length === 0) ? actions.allActions : actions.validActions;
        if (!actionsToShow.length) {
            visibleContext.reset();
            return;
        }
        this._currentShowingContext = { user, toMenuItems, delegate, actions, anchor, container, options, resolver };
        const list = this._instantiationService.createInstance(ActionList, user, actionsToShow, true, delegate, resolver, toMenuItems);
        this.contextViewService.showContextView({
            getAnchor: () => anchor,
            render: (container) => {
                visibleContext.set(true);
                return this._renderWidget(container, list, actions, options);
            },
            onHide: (didCancel) => {
                visibleContext.reset();
                return this._onWidgetClosed(didCancel);
            },
        }, container, false);
    }
    acceptSelected(preview) {
        this._list.value?.acceptSelected(preview);
    }
    focusPrevious() {
        this._list?.value?.focusPrevious();
    }
    focusNext() {
        this._list?.value?.focusNext();
    }
    hide() {
        this._list.value?.hide();
        this._list.clear();
    }
    clear() {
        this._list.clear();
    }
    _renderWidget(element, list, actions, options) {
        const widget = document.createElement('div');
        widget.classList.add('action-widget');
        element.appendChild(widget);
        this._list.value = list;
        if (this._list.value) {
            widget.appendChild(this._list.value.domNode);
        }
        else {
            throw new Error('List has no value');
        }
        const renderDisposables = new DisposableStore();
        // Invisible div to block mouse interaction in the rest of the UI
        const menuBlock = document.createElement('div');
        const block = element.appendChild(menuBlock);
        block.classList.add('context-view-block');
        renderDisposables.add(dom.addDisposableListener(block, dom.EventType.MOUSE_DOWN, e => e.stopPropagation()));
        // Invisible div to block mouse interaction with the menu
        const pointerBlockDiv = document.createElement('div');
        const pointerBlock = element.appendChild(pointerBlockDiv);
        pointerBlock.classList.add('context-view-pointerBlock');
        // Removes block on click INSIDE widget or ANY mouse movement
        renderDisposables.add(dom.addDisposableListener(pointerBlock, dom.EventType.POINTER_MOVE, () => pointerBlock.remove()));
        renderDisposables.add(dom.addDisposableListener(pointerBlock, dom.EventType.MOUSE_DOWN, () => pointerBlock.remove()));
        // Action bar
        let actionBarWidth = 0;
        if (!options.fromLightbulb) {
            const actionBar = this._createActionBar('.action-widget-action-bar', actions, options);
            if (actionBar) {
                widget.appendChild(actionBar.getContainer().parentElement);
                renderDisposables.add(actionBar);
                actionBarWidth = actionBar.getContainer().offsetWidth;
            }
        }
        const width = this._list.value?.layout(actionBarWidth);
        widget.style.width = `${width}px`;
        const focusTracker = renderDisposables.add(dom.trackFocus(element));
        renderDisposables.add(focusTracker.onDidBlur(() => this.hide()));
        return renderDisposables;
    }
    _createActionBar(className, inputActions, options) {
        const actions = this._getActionBarActions(inputActions, options);
        if (!actions.length) {
            return undefined;
        }
        const container = dom.$(className);
        const actionBar = new ActionBar(container);
        actionBar.push(actions, { icon: false, label: true });
        return actionBar;
    }
    _getActionBarActions(actions, options) {
        const resultActions = actions.documentation.map((command) => ({
            id: command.id,
            label: command.title,
            tooltip: command.tooltip ?? '',
            class: undefined,
            enabled: true,
            run: () => this._commandService.executeCommand(command.id, ...(command.commandArguments ?? [])),
        }));
        if (options.includeDisabledActions && actions.validActions.length > 0 && actions.allActions.length !== actions.validActions.length) {
            resultActions.push(this._showDisabled ? {
                id: 'hideMoreActions',
                label: localize('hideMoreActions', 'Hide Disabled'),
                enabled: true,
                tooltip: '',
                class: undefined,
                run: () => this._toggleShowDisabled(false)
            } : {
                id: 'showMoreActions',
                label: localize('showMoreActions', 'Show Disabled'),
                enabled: true,
                tooltip: '',
                class: undefined,
                run: () => this._toggleShowDisabled(true)
            });
        }
        return resultActions;
    }
    /**
     * Toggles whether the disabled actions in the action widget are visible or not.
     */
    _toggleShowDisabled(newShowDisabled) {
        const previousCtx = this._currentShowingContext;
        this.hide();
        this._showDisabled = newShowDisabled;
        if (previousCtx) {
            this.show(previousCtx.user, previousCtx.toMenuItems, previousCtx.delegate, previousCtx.actions, previousCtx.anchor, previousCtx.container, previousCtx.options, previousCtx.resolver);
        }
    }
    _onWidgetClosed(didCancel) {
        this._currentShowingContext = undefined;
        this._list.value?.hide(didCancel);
    }
};
ActionWidgetService = __decorate([
    __param(0, ICommandService),
    __param(1, IContextViewService),
    __param(2, IContextKeyService),
    __param(3, IInstantiationService)
], ActionWidgetService);
registerSingleton(IActionWidgetService, ActionWidgetService, 1 /* InstantiationType.Delayed */);
const weight = 100 /* KeybindingWeight.EditorContrib */ + 1000;
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'hideCodeActionWidget',
            title: {
                value: localize('hideCodeActionWidget.title', "Hide action widget"),
                original: 'Hide action widget'
            },
            precondition: ActionWidgetContextKeys.Visible,
            keybinding: {
                weight,
                primary: 9 /* KeyCode.Escape */,
                secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
            },
        });
    }
    run(accessor) {
        accessor.get(IActionWidgetService).hide();
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'selectPrevCodeAction',
            title: {
                value: localize('selectPrevCodeAction.title', "Select previous action"),
                original: 'Select previous action'
            },
            precondition: ActionWidgetContextKeys.Visible,
            keybinding: {
                weight,
                primary: 16 /* KeyCode.UpArrow */,
                secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */],
                mac: { primary: 16 /* KeyCode.UpArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */, 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */] },
            }
        });
    }
    run(accessor) {
        const widgetService = accessor.get(IActionWidgetService);
        if (widgetService instanceof ActionWidgetService) {
            widgetService.focusPrevious();
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'selectNextCodeAction',
            title: {
                value: localize('selectNextCodeAction.title', "Select next action"),
                original: 'Select next action'
            },
            precondition: ActionWidgetContextKeys.Visible,
            keybinding: {
                weight,
                primary: 18 /* KeyCode.DownArrow */,
                secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */],
                mac: { primary: 18 /* KeyCode.DownArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, 256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */] }
            }
        });
    }
    run(accessor) {
        const widgetService = accessor.get(IActionWidgetService);
        if (widgetService instanceof ActionWidgetService) {
            widgetService.focusNext();
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: acceptSelectedActionCommand,
            title: {
                value: localize('acceptSelected.title', "Accept selected action"),
                original: 'Accept selected action'
            },
            precondition: ActionWidgetContextKeys.Visible,
            keybinding: {
                weight,
                primary: 3 /* KeyCode.Enter */,
                secondary: [2048 /* KeyMod.CtrlCmd */ | 84 /* KeyCode.Period */],
            }
        });
    }
    run(accessor) {
        const widgetService = accessor.get(IActionWidgetService);
        if (widgetService instanceof ActionWidgetService) {
            widgetService.acceptSelected();
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: previewSelectedActionCommand,
            title: {
                value: localize('previewSelected.title', "Preview selected action"),
                original: 'Preview selected action'
            },
            precondition: ActionWidgetContextKeys.Visible,
            keybinding: {
                weight,
                primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
            }
        });
    }
    run(accessor) {
        const widgetService = accessor.get(IActionWidgetService);
        if (widgetService instanceof ActionWidgetService) {
            widgetService.acceptSelected(true);
        }
    }
});
