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
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { ToggleMenuAction, ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { Separator } from 'vs/base/common/actions';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { MenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IMenuService, MenuItemAction } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { SELECT_KERNEL_ID } from 'vs/workbench/contrib/notebook/browser/controller/coreActions';
import { NOTEBOOK_EDITOR_ID, NotebookSetting } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { NotebooKernelActionViewItem } from 'vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView';
import { ActionViewWithLabel } from 'vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
var RenderLabel;
(function (RenderLabel) {
    RenderLabel[RenderLabel["Always"] = 0] = "Always";
    RenderLabel[RenderLabel["Never"] = 1] = "Never";
    RenderLabel[RenderLabel["Dynamic"] = 2] = "Dynamic";
})(RenderLabel || (RenderLabel = {}));
const ICON_ONLY_ACTION_WIDTH = 21;
const TOGGLE_MORE_ACTION_WIDTH = 21;
const ACTION_PADDING = 8;
class FixedLabelStrategy {
    notebookEditor;
    editorToolbar;
    instantiationService;
    constructor(notebookEditor, editorToolbar, instantiationService) {
        this.notebookEditor = notebookEditor;
        this.editorToolbar = editorToolbar;
        this.instantiationService = instantiationService;
    }
    actionProvider(action) {
        if (action.id === SELECT_KERNEL_ID) {
            // 	// this is being disposed by the consumer
            return this.instantiationService.createInstance(NotebooKernelActionViewItem, action, this.notebookEditor);
        }
        const a = this.editorToolbar.primaryActions.find(a => a.action.id === action.id);
        if (a && a.renderLabel) {
            return action instanceof MenuItemAction ? this.instantiationService.createInstance(ActionViewWithLabel, action, undefined) : undefined;
        }
        else {
            return action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, undefined) : undefined;
        }
    }
    _calculateFixedActions(leftToolbarContainerMaxWidth) {
        const primaryActions = this.editorToolbar.primaryActions;
        const lastItemInLeft = primaryActions[primaryActions.length - 1];
        const hasToggleMoreAction = lastItemInLeft.action.id === ToggleMenuAction.ID;
        let size = 0;
        const actions = [];
        for (let i = 0; i < primaryActions.length - (hasToggleMoreAction ? 1 : 0); i++) {
            const actionModel = primaryActions[i];
            const itemSize = actionModel.size;
            if (size + itemSize <= leftToolbarContainerMaxWidth) {
                size += ACTION_PADDING + itemSize;
                actions.push(actionModel);
            }
            else {
                break;
            }
        }
        actions.forEach(action => action.visible = true);
        primaryActions.slice(actions.length).forEach(action => action.visible = false);
        return {
            primaryActions: actions.filter(action => (action.visible && action.action.id !== ToggleMenuAction.ID)).map(action => action.action),
            secondaryActions: [...primaryActions.slice(actions.length).filter(action => !action.visible && action.action.id !== ToggleMenuAction.ID).map(action => action.action), ...this.editorToolbar.secondaryActions]
        };
    }
    calculateActions(leftToolbarContainerMaxWidth) {
        return this._calculateFixedActions(leftToolbarContainerMaxWidth);
    }
}
class FixedLabellessStrategy extends FixedLabelStrategy {
    constructor(notebookEditor, editorToolbar, instantiationService) {
        super(notebookEditor, editorToolbar, instantiationService);
    }
    actionProvider(action) {
        if (action.id === SELECT_KERNEL_ID) {
            // 	// this is being disposed by the consumer
            return this.instantiationService.createInstance(NotebooKernelActionViewItem, action, this.notebookEditor);
        }
        return action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, undefined) : undefined;
    }
}
class DynamicLabelStrategy {
    notebookEditor;
    editorToolbar;
    instantiationService;
    constructor(notebookEditor, editorToolbar, instantiationService) {
        this.notebookEditor = notebookEditor;
        this.editorToolbar = editorToolbar;
        this.instantiationService = instantiationService;
    }
    actionProvider(action) {
        if (action.id === SELECT_KERNEL_ID) {
            // 	// this is being disposed by the consumer
            return this.instantiationService.createInstance(NotebooKernelActionViewItem, action, this.notebookEditor);
        }
        const a = this.editorToolbar.primaryActions.find(a => a.action.id === action.id);
        if (a && a.renderLabel) {
            return action instanceof MenuItemAction ? this.instantiationService.createInstance(ActionViewWithLabel, action, undefined) : undefined;
        }
        else {
            return action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, undefined) : undefined;
        }
    }
    calculateActions(leftToolbarContainerMaxWidth) {
        const primaryActions = this.editorToolbar.primaryActions;
        const secondaryActions = this.editorToolbar.secondaryActions;
        const lastItemInLeft = primaryActions[primaryActions.length - 1];
        const hasToggleMoreAction = lastItemInLeft.action.id === ToggleMenuAction.ID;
        const actions = primaryActions.slice(0, primaryActions.length - (hasToggleMoreAction ? 1 : 0));
        if (actions.length === 0) {
            return {
                primaryActions: primaryActions.filter(action => (action.visible && action.action.id !== ToggleMenuAction.ID)).map(action => action.action),
                secondaryActions
            };
        }
        const totalWidthWithLabels = actions.map(action => action.size).reduce((a, b) => a + b, 0) + (actions.length - 1) * ACTION_PADDING;
        if (totalWidthWithLabels <= leftToolbarContainerMaxWidth) {
            primaryActions.forEach(action => {
                action.visible = true;
                action.renderLabel = true;
            });
            return {
                primaryActions: primaryActions.filter(action => (action.visible && action.action.id !== ToggleMenuAction.ID)).map(action => action.action),
                secondaryActions
            };
        }
        // too narrow, we need to hide some labels
        if ((actions.length * ICON_ONLY_ACTION_WIDTH + (actions.length - 1) * ACTION_PADDING) > leftToolbarContainerMaxWidth) {
            return this._calcuateWithAlllabelsHidden(actions, leftToolbarContainerMaxWidth);
        }
        const sums = [];
        let sum = 0;
        let lastActionWithLabel = -1;
        for (let i = 0; i < actions.length; i++) {
            sum += actions[i].size + ACTION_PADDING;
            sums.push(sum);
            if (actions[i].action instanceof Separator) {
                // find group separator
                const remainingItems = actions.slice(i + 1);
                const newTotalSum = sum + (remainingItems.length === 0 ? 0 : (remainingItems.length * ICON_ONLY_ACTION_WIDTH + (remainingItems.length - 1) * ACTION_PADDING));
                if (newTotalSum <= leftToolbarContainerMaxWidth) {
                    lastActionWithLabel = i;
                }
            }
            else {
                continue;
            }
        }
        if (lastActionWithLabel < 0) {
            return this._calcuateWithAlllabelsHidden(actions, leftToolbarContainerMaxWidth);
        }
        const visibleActions = actions.slice(0, lastActionWithLabel + 1);
        visibleActions.forEach(action => { action.visible = true; action.renderLabel = true; });
        primaryActions.slice(visibleActions.length).forEach(action => { action.visible = true; action.renderLabel = false; });
        return {
            primaryActions: primaryActions.filter(action => (action.visible && action.action.id !== ToggleMenuAction.ID)).map(action => action.action),
            secondaryActions
        };
    }
    _calcuateWithAlllabelsHidden(actions, leftToolbarContainerMaxWidth) {
        const primaryActions = this.editorToolbar.primaryActions;
        const secondaryActions = this.editorToolbar.secondaryActions;
        // all actions hidden labels
        primaryActions.forEach(action => { action.renderLabel = false; });
        let size = 0;
        const renderActions = [];
        for (let i = 0; i < actions.length; i++) {
            const actionModel = actions[i];
            if (actionModel.action.id === 'notebook.cell.insertMarkdownCellBelow') {
                renderActions.push(actionModel);
                continue;
            }
            const itemSize = ICON_ONLY_ACTION_WIDTH;
            if (size + itemSize <= leftToolbarContainerMaxWidth) {
                size += ACTION_PADDING + itemSize;
                renderActions.push(actionModel);
            }
            else {
                break;
            }
        }
        renderActions.forEach(action => {
            if (action.action.id === 'notebook.cell.insertMarkdownCellBelow') {
                action.visible = false;
            }
            else {
                action.visible = true;
            }
        });
        primaryActions.slice(renderActions.length).forEach(action => action.visible = false);
        return {
            primaryActions: renderActions.filter(action => (action.visible && action.action.id !== ToggleMenuAction.ID)).map(action => action.action),
            secondaryActions: [...primaryActions.slice(actions.length).filter(action => !action.visible && action.action.id !== ToggleMenuAction.ID).map(action => action.action), ...secondaryActions]
        };
    }
}
let NotebookEditorToolbar = class NotebookEditorToolbar extends Disposable {
    notebookEditor;
    contextKeyService;
    notebookOptions;
    domNode;
    instantiationService;
    configurationService;
    contextMenuService;
    menuService;
    editorService;
    keybindingService;
    experimentService;
    // private _editorToolbarContainer!: HTMLElement;
    _leftToolbarScrollable;
    _notebookTopLeftToolbarContainer;
    _notebookTopRightToolbarContainer;
    _notebookGlobalActionsMenu;
    _notebookLeftToolbar;
    _primaryActions;
    get primaryActions() {
        return this._primaryActions;
    }
    _secondaryActions;
    get secondaryActions() {
        return this._secondaryActions;
    }
    _notebookRightToolbar;
    _useGlobalToolbar = false;
    _strategy;
    _renderLabel = RenderLabel.Always;
    _onDidChangeState = this._register(new Emitter());
    onDidChangeState = this._onDidChangeState.event;
    get useGlobalToolbar() {
        return this._useGlobalToolbar;
    }
    _dimension = null;
    constructor(notebookEditor, contextKeyService, notebookOptions, domNode, instantiationService, configurationService, contextMenuService, menuService, editorService, keybindingService, experimentService) {
        super();
        this.notebookEditor = notebookEditor;
        this.contextKeyService = contextKeyService;
        this.notebookOptions = notebookOptions;
        this.domNode = domNode;
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        this.contextMenuService = contextMenuService;
        this.menuService = menuService;
        this.editorService = editorService;
        this.keybindingService = keybindingService;
        this.experimentService = experimentService;
        this._primaryActions = [];
        this._secondaryActions = [];
        this._buildBody();
        this._register(Event.debounce(this.editorService.onDidActiveEditorChange, (last, _current) => last, 200)(this._updatePerEditorChange, this));
        this._registerNotebookActionsToolbar();
    }
    _buildBody() {
        this._notebookTopLeftToolbarContainer = document.createElement('div');
        this._notebookTopLeftToolbarContainer.classList.add('notebook-toolbar-left');
        this._leftToolbarScrollable = new DomScrollableElement(this._notebookTopLeftToolbarContainer, {
            vertical: 2 /* ScrollbarVisibility.Hidden */,
            horizontal: 1 /* ScrollbarVisibility.Auto */,
            horizontalScrollbarSize: 3,
            useShadows: false,
            scrollYToX: true
        });
        this._register(this._leftToolbarScrollable);
        DOM.append(this.domNode, this._leftToolbarScrollable.getDomNode());
        this._notebookTopRightToolbarContainer = document.createElement('div');
        this._notebookTopRightToolbarContainer.classList.add('notebook-toolbar-right');
        DOM.append(this.domNode, this._notebookTopRightToolbarContainer);
    }
    _updatePerEditorChange() {
        if (this.editorService.activeEditorPane?.getId() === NOTEBOOK_EDITOR_ID) {
            const notebookEditor = this.editorService.activeEditorPane.getControl();
            if (notebookEditor === this.notebookEditor) {
                // this is the active editor
                this._showNotebookActionsinEditorToolbar();
                return;
            }
        }
    }
    _registerNotebookActionsToolbar() {
        this._notebookGlobalActionsMenu = this._register(this.menuService.createMenu(this.notebookEditor.creationOptions.menuIds.notebookToolbar, this.contextKeyService));
        this._register(this._notebookGlobalActionsMenu);
        this._useGlobalToolbar = this.notebookOptions.getLayoutConfiguration().globalToolbar;
        this._renderLabel = this._convertConfiguration(this.configurationService.getValue(NotebookSetting.globalToolbarShowLabel));
        this._updateStrategy();
        const context = {
            ui: true,
            notebookEditor: this.notebookEditor
        };
        const actionProvider = (action) => {
            if (action.id === SELECT_KERNEL_ID) {
                // 	// this is being disposed by the consumer
                return this.instantiationService.createInstance(NotebooKernelActionViewItem, action, this.notebookEditor);
            }
            if (this._renderLabel !== RenderLabel.Never) {
                const a = this._primaryActions.find(a => a.action.id === action.id);
                if (a && a.renderLabel) {
                    return action instanceof MenuItemAction ? this.instantiationService.createInstance(ActionViewWithLabel, action, undefined) : undefined;
                }
                else {
                    return action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, undefined) : undefined;
                }
            }
            else {
                return action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, undefined) : undefined;
            }
        };
        this._notebookLeftToolbar = new ToolBar(this._notebookTopLeftToolbarContainer, this.contextMenuService, {
            getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
            actionViewItemProvider: (action) => {
                return this._strategy.actionProvider(action);
            },
            renderDropdownAsChildElement: true
        });
        this._register(this._notebookLeftToolbar);
        this._notebookLeftToolbar.context = context;
        this._notebookRightToolbar = new ToolBar(this._notebookTopRightToolbarContainer, this.contextMenuService, {
            getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
            actionViewItemProvider: actionProvider,
            renderDropdownAsChildElement: true
        });
        this._register(this._notebookRightToolbar);
        this._notebookRightToolbar.context = context;
        this._showNotebookActionsinEditorToolbar();
        let dropdownIsVisible = false;
        let deferredUpdate;
        this._register(this._notebookGlobalActionsMenu.onDidChange(() => {
            if (dropdownIsVisible) {
                deferredUpdate = () => this._showNotebookActionsinEditorToolbar();
                return;
            }
            this._showNotebookActionsinEditorToolbar();
        }));
        this._register(this._notebookLeftToolbar.onDidChangeDropdownVisibility(visible => {
            dropdownIsVisible = visible;
            if (deferredUpdate && !visible) {
                setTimeout(() => {
                    deferredUpdate?.();
                }, 0);
                deferredUpdate = undefined;
            }
        }));
        this._register(this.notebookOptions.onDidChangeOptions(e => {
            if (e.globalToolbar !== undefined) {
                this._useGlobalToolbar = this.notebookOptions.getLayoutConfiguration().globalToolbar;
                this._showNotebookActionsinEditorToolbar();
            }
        }));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(NotebookSetting.globalToolbarShowLabel)) {
                this._renderLabel = this._convertConfiguration(this.configurationService.getValue(NotebookSetting.globalToolbarShowLabel));
                this._updateStrategy();
                const oldElement = this._notebookLeftToolbar.getElement();
                oldElement.parentElement?.removeChild(oldElement);
                this._notebookLeftToolbar.dispose();
                this._notebookLeftToolbar = new ToolBar(this._notebookTopLeftToolbarContainer, this.contextMenuService, {
                    getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                    actionViewItemProvider: actionProvider,
                    renderDropdownAsChildElement: true
                });
                this._register(this._notebookLeftToolbar);
                this._notebookLeftToolbar.context = context;
                this._showNotebookActionsinEditorToolbar();
                return;
            }
        }));
        if (this.experimentService) {
            this.experimentService.getTreatment('nbtoolbarineditor').then(treatment => {
                if (treatment === undefined) {
                    return;
                }
                if (this._useGlobalToolbar !== treatment) {
                    this._useGlobalToolbar = treatment;
                    this._showNotebookActionsinEditorToolbar();
                }
            });
        }
    }
    _updateStrategy() {
        switch (this._renderLabel) {
            case RenderLabel.Always:
                this._strategy = new FixedLabelStrategy(this.notebookEditor, this, this.instantiationService);
                break;
            case RenderLabel.Never:
                this._strategy = new FixedLabellessStrategy(this.notebookEditor, this, this.instantiationService);
                break;
            case RenderLabel.Dynamic:
                this._strategy = new DynamicLabelStrategy(this.notebookEditor, this, this.instantiationService);
                break;
        }
    }
    _convertConfiguration(value) {
        switch (value) {
            case true:
                return RenderLabel.Always;
            case false:
                return RenderLabel.Never;
            case 'always':
                return RenderLabel.Always;
            case 'never':
                return RenderLabel.Never;
            case 'dynamic':
                return RenderLabel.Dynamic;
        }
    }
    _showNotebookActionsinEditorToolbar() {
        // when there is no view model, just ignore.
        if (!this.notebookEditor.hasModel()) {
            return;
        }
        if (!this._useGlobalToolbar) {
            this.domNode.style.display = 'none';
        }
        else {
            this._setNotebookActions();
        }
        this._onDidChangeState.fire();
    }
    _setNotebookActions() {
        const groups = this._notebookGlobalActionsMenu.getActions({ shouldForwardArgs: true, renderShortTitle: true });
        this.domNode.style.display = 'flex';
        const primaryLeftGroups = groups.filter(group => /^navigation/.test(group[0]));
        const primaryActions = [];
        primaryLeftGroups.sort((a, b) => {
            if (a[0] === 'navigation') {
                return 1;
            }
            if (b[0] === 'navigation') {
                return -1;
            }
            return 0;
        }).forEach((group, index) => {
            primaryActions.push(...group[1]);
            if (index < primaryLeftGroups.length - 1) {
                primaryActions.push(new Separator());
            }
        });
        const primaryRightGroup = groups.find(group => /^status/.test(group[0]));
        const primaryRightActions = primaryRightGroup ? primaryRightGroup[1] : [];
        const secondaryActions = groups.filter(group => !/^navigation/.test(group[0]) && !/^status/.test(group[0])).reduce((prev, curr) => { prev.push(...curr[1]); return prev; }, []);
        this._notebookLeftToolbar.setActions([], []);
        this._primaryActions.forEach(action => action.renderLabel = true);
        this._notebookLeftToolbar.setActions(primaryActions, secondaryActions);
        this._notebookRightToolbar.setActions(primaryRightActions, []);
        this._secondaryActions = secondaryActions;
        // flush to make sure it can be updated later
        this._primaryActions = [];
        if (this._dimension && this._dimension.width >= 0 && this._dimension.height >= 0) {
            this._cacheItemSizes(this._notebookLeftToolbar);
        }
        this._computeSizes();
    }
    _cacheItemSizes(toolbar) {
        const actions = [];
        for (let i = 0; i < toolbar.getItemsLength(); i++) {
            const action = toolbar.getItemAction(i);
            if (action) {
                actions.push({
                    action: action,
                    size: toolbar.getItemWidth(i),
                    visible: true,
                    renderLabel: true
                });
            }
        }
        this._primaryActions = actions;
    }
    _canBeVisible(width) {
        let w = 0;
        for (let i = 0; i < this._primaryActions.length; i++) {
            w += this._primaryActions[i].size + 8;
        }
        return w <= width;
    }
    _computeSizes() {
        const toolbar = this._notebookLeftToolbar;
        const rightToolbar = this._notebookRightToolbar;
        if (toolbar && rightToolbar && this._dimension && this._dimension.height >= 0 && this._dimension.width >= 0) {
            // compute size only if it's visible
            if (this._primaryActions.length === 0 && toolbar.getItemsLength() !== this._primaryActions.length) {
                this._cacheItemSizes(this._notebookLeftToolbar);
            }
            if (this._primaryActions.length === 0) {
                return;
            }
            const kernelWidth = (rightToolbar.getItemsLength() ? rightToolbar.getItemWidth(0) : 0) + ACTION_PADDING;
            if (this._canBeVisible(this._dimension.width - kernelWidth - ACTION_PADDING /** left margin */)) {
                this._primaryActions.forEach(action => {
                    action.visible = true;
                    action.renderLabel = true;
                });
                toolbar.setActions(this._primaryActions.filter(action => action.action.id !== ToggleMenuAction.ID).map(model => model.action), this._secondaryActions);
                return;
            }
            const leftToolbarContainerMaxWidth = this._dimension.width - kernelWidth - (TOGGLE_MORE_ACTION_WIDTH + ACTION_PADDING) /** ... */ - ACTION_PADDING /** toolbar left margin */;
            const calculatedActions = this._strategy.calculateActions(leftToolbarContainerMaxWidth);
            this._notebookLeftToolbar.setActions(calculatedActions.primaryActions, calculatedActions.secondaryActions);
        }
    }
    layout(dimension) {
        this._dimension = dimension;
        if (!this._useGlobalToolbar) {
            this.domNode.style.display = 'none';
        }
        else {
            this.domNode.style.display = 'flex';
        }
        this._computeSizes();
    }
    dispose() {
        this._notebookLeftToolbar.context = undefined;
        this._notebookRightToolbar.context = undefined;
        this._notebookLeftToolbar.dispose();
        this._notebookRightToolbar.dispose();
        this._notebookLeftToolbar = null;
        this._notebookRightToolbar = null;
        super.dispose();
    }
};
NotebookEditorToolbar = __decorate([
    __param(4, IInstantiationService),
    __param(5, IConfigurationService),
    __param(6, IContextMenuService),
    __param(7, IMenuService),
    __param(8, IEditorService),
    __param(9, IKeybindingService),
    __param(10, IWorkbenchAssignmentService)
], NotebookEditorToolbar);
export { NotebookEditorToolbar };
