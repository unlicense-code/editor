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
import * as DOM from 'vs/base/browser/dom';
import { ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { disposableTimeout } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { createActionViewItem, createAndFillInActionBarActions, MenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IMenuService, MenuItemAction } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { CodiconActionViewItem } from 'vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView';
import { CellOverlayPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { registerStickyScroll } from 'vs/workbench/contrib/notebook/browser/view/cellParts/stickyScroll';
import { WorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
let BetweenCellToolbar = class BetweenCellToolbar extends CellOverlayPart {
    _notebookEditor;
    _bottomCellToolbarContainer;
    instantiationService;
    contextMenuService;
    contextKeyService;
    menuService;
    _betweenCellToolbar;
    constructor(_notebookEditor, _titleToolbarContainer, _bottomCellToolbarContainer, instantiationService, contextMenuService, contextKeyService, menuService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._bottomCellToolbarContainer = _bottomCellToolbarContainer;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
    }
    _initialize() {
        if (this._betweenCellToolbar) {
            return this._betweenCellToolbar;
        }
        const betweenCellToolbar = this._register(new ToolBar(this._bottomCellToolbarContainer, this.contextMenuService, {
            actionViewItemProvider: action => {
                if (action instanceof MenuItemAction) {
                    if (this._notebookEditor.notebookOptions.getLayoutConfiguration().insertToolbarAlignment === 'center') {
                        return this.instantiationService.createInstance(CodiconActionViewItem, action, undefined);
                    }
                    else {
                        return this.instantiationService.createInstance(MenuEntryActionViewItem, action, undefined);
                    }
                }
                return undefined;
            }
        }));
        this._betweenCellToolbar = betweenCellToolbar;
        const menu = this._register(this.menuService.createMenu(this._notebookEditor.creationOptions.menuIds.cellInsertToolbar, this.contextKeyService));
        const updateActions = () => {
            const actions = getCellToolbarActions(menu);
            betweenCellToolbar.setActions(actions.primary, actions.secondary);
        };
        this._register(menu.onDidChange(() => updateActions()));
        this._register(this._notebookEditor.notebookOptions.onDidChangeOptions((e) => {
            if (e.insertToolbarAlignment) {
                updateActions();
            }
        }));
        updateActions();
        return betweenCellToolbar;
    }
    didRenderCell(element) {
        const betweenCellToolbar = this._initialize();
        betweenCellToolbar.context = {
            ui: true,
            cell: element,
            notebookEditor: this._notebookEditor,
            $mid: 12 /* MarshalledId.NotebookCellActionContext */
        };
        this.updateInternalLayoutNow(element);
    }
    updateInternalLayoutNow(element) {
        const bottomToolbarOffset = element.layoutInfo.bottomToolbarOffset;
        this._bottomCellToolbarContainer.style.transform = `translateY(${bottomToolbarOffset}px)`;
    }
};
BetweenCellToolbar = __decorate([
    __param(3, IInstantiationService),
    __param(4, IContextMenuService),
    __param(5, IContextKeyService),
    __param(6, IMenuService)
], BetweenCellToolbar);
export { BetweenCellToolbar };
let CellTitleToolbarPart = class CellTitleToolbarPart extends CellOverlayPart {
    toolbarContainer;
    _rootClassDelegate;
    toolbarId;
    deleteToolbarId;
    _notebookEditor;
    contextKeyService;
    menuService;
    instantiationService;
    _model;
    _view;
    _onDidUpdateActions = this._register(new Emitter());
    onDidUpdateActions = this._onDidUpdateActions.event;
    get hasActions() {
        if (!this._model) {
            return false;
        }
        return this._model.actions.primary.length
            + this._model.actions.secondary.length
            + this._model.deleteActions.primary.length
            + this._model.deleteActions.secondary.length
            > 0;
    }
    constructor(toolbarContainer, _rootClassDelegate, toolbarId, deleteToolbarId, _notebookEditor, contextKeyService, menuService, instantiationService) {
        super();
        this.toolbarContainer = toolbarContainer;
        this._rootClassDelegate = _rootClassDelegate;
        this.toolbarId = toolbarId;
        this.deleteToolbarId = deleteToolbarId;
        this._notebookEditor = _notebookEditor;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this.instantiationService = instantiationService;
    }
    _initializeModel() {
        if (this._model) {
            return this._model;
        }
        const titleMenu = this._register(this.menuService.createMenu(this.toolbarId, this.contextKeyService));
        const deleteMenu = this._register(this.menuService.createMenu(this.deleteToolbarId, this.contextKeyService));
        const actions = getCellToolbarActions(titleMenu);
        const deleteActions = !this._notebookEditor.creationOptions.isReadOnly ? getCellToolbarActions(deleteMenu) : {
            primary: [],
            secondary: []
        };
        this._model = {
            titleMenu,
            actions,
            deleteMenu,
            deleteActions
        };
        return this._model;
    }
    _initialize(model, element) {
        if (this._view) {
            return this._view;
        }
        const toolbar = this.instantiationService.createInstance(WorkbenchToolBar, this.toolbarContainer, {
            actionViewItemProvider: action => {
                return createActionViewItem(this.instantiationService, action);
            },
            renderDropdownAsChildElement: true
        });
        const deleteToolbar = this._register(this.instantiationService.invokeFunction(accessor => createDeleteToolbar(accessor, this.toolbarContainer, 'cell-delete-toolbar')));
        if (model.deleteActions.primary.length !== 0 || model.deleteActions.secondary.length !== 0) {
            deleteToolbar.setActions(model.deleteActions.primary, model.deleteActions.secondary);
        }
        this.setupChangeListeners(toolbar, model.titleMenu, model.actions);
        this.setupChangeListeners(deleteToolbar, model.deleteMenu, model.deleteActions);
        this._view = {
            toolbar,
            deleteToolbar
        };
        return this._view;
    }
    prepareRenderCell(element) {
        this._initializeModel();
    }
    didRenderCell(element) {
        const model = this._initializeModel();
        const view = this._initialize(model, element);
        this.cellDisposables.add(registerStickyScroll(this._notebookEditor, element, this.toolbarContainer, { extraOffset: 4, min: -14 }));
        this.updateContext(view, {
            ui: true,
            cell: element,
            notebookEditor: this._notebookEditor,
            $mid: 12 /* MarshalledId.NotebookCellActionContext */
        });
    }
    updateContext(view, toolbarContext) {
        view.toolbar.context = toolbarContext;
        view.deleteToolbar.context = toolbarContext;
    }
    setupChangeListeners(toolbar, menu, initActions) {
        // #103926
        let dropdownIsVisible = false;
        let deferredUpdate;
        this.updateActions(toolbar, initActions);
        this._register(menu.onDidChange(() => {
            if (dropdownIsVisible) {
                const actions = getCellToolbarActions(menu);
                deferredUpdate = () => this.updateActions(toolbar, actions);
                return;
            }
            const actions = getCellToolbarActions(menu);
            this.updateActions(toolbar, actions);
        }));
        this._rootClassDelegate.toggle('cell-toolbar-dropdown-active', false);
        this._register(toolbar.onDidChangeDropdownVisibility(visible => {
            dropdownIsVisible = visible;
            this._rootClassDelegate.toggle('cell-toolbar-dropdown-active', visible);
            if (deferredUpdate && !visible) {
                this._register(disposableTimeout(() => {
                    deferredUpdate?.();
                }));
                deferredUpdate = undefined;
            }
        }));
    }
    updateActions(toolbar, actions) {
        const hadFocus = DOM.isAncestor(document.activeElement, toolbar.getElement());
        toolbar.setActions(actions.primary, actions.secondary);
        if (hadFocus) {
            this._notebookEditor.focus();
        }
        if (actions.primary.length || actions.secondary.length) {
            this._rootClassDelegate.toggle('cell-has-toolbar-actions', true);
            this._onDidUpdateActions.fire();
        }
        else {
            this._rootClassDelegate.toggle('cell-has-toolbar-actions', false);
            this._onDidUpdateActions.fire();
        }
    }
};
CellTitleToolbarPart = __decorate([
    __param(5, IContextKeyService),
    __param(6, IMenuService),
    __param(7, IInstantiationService)
], CellTitleToolbarPart);
export { CellTitleToolbarPart };
function getCellToolbarActions(menu) {
    const primary = [];
    const secondary = [];
    const result = { primary, secondary };
    createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
    return result;
}
function createDeleteToolbar(accessor, container, elementClass) {
    const contextMenuService = accessor.get(IContextMenuService);
    const keybindingService = accessor.get(IKeybindingService);
    const instantiationService = accessor.get(IInstantiationService);
    const toolbar = new ToolBar(container, contextMenuService, {
        getKeyBinding: action => keybindingService.lookupKeybinding(action.id),
        actionViewItemProvider: action => {
            return createActionViewItem(instantiationService, action);
        },
        renderDropdownAsChildElement: true
    });
    if (elementClass) {
        toolbar.getElement().classList.add(elementClass);
    }
    return toolbar;
}
