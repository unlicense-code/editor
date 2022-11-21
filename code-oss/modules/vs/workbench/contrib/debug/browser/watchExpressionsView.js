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
import { RunOnceScheduler } from 'vs/base/common/async';
import { IDebugService, CONTEXT_WATCH_EXPRESSIONS_FOCUSED, WATCH_VIEW_ID, CONTEXT_WATCH_EXPRESSIONS_EXIST, CONTEXT_WATCH_ITEM_TYPE, CONTEXT_VARIABLE_IS_READONLY } from 'vs/workbench/contrib/debug/common/debug';
import { Expression, Variable } from 'vs/workbench/contrib/debug/common/debugModel';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { renderExpressionValue, renderViewTree, AbstractExpressionsRenderer } from 'vs/workbench/contrib/debug/browser/baseDebugView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ViewPane, ViewAction } from 'vs/workbench/browser/parts/views/viewPane';
import { WorkbenchAsyncDataTree } from 'vs/platform/list/browser/listService';
import { ElementsDragAndDropData } from 'vs/base/browser/ui/list/listView';
import { VariablesRenderer } from 'vs/workbench/contrib/debug/browser/variablesView';
import { IContextKeyService, ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { watchExpressionsRemoveAll, watchExpressionsAdd } from 'vs/workbench/contrib/debug/browser/debugIcons';
import { registerAction2, MenuId, Action2, IMenuService } from 'vs/platform/actions/common/actions';
import { localize } from 'vs/nls';
import { Codicon } from 'vs/base/common/codicons';
import { createAndFillInContextMenuActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { LinkDetector } from 'vs/workbench/contrib/debug/browser/linkDetector';
const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
let ignoreViewUpdates = false;
let useCachedEvaluation = false;
let WatchExpressionsView = class WatchExpressionsView extends ViewPane {
    debugService;
    watchExpressionsUpdatedScheduler;
    needsRefresh = false;
    tree;
    watchExpressionsExist;
    watchItemType;
    variableReadonly;
    menu;
    constructor(options, contextMenuService, debugService, keybindingService, instantiationService, viewDescriptorService, configurationService, contextKeyService, openerService, themeService, telemetryService, menuService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        this.debugService = debugService;
        this.menu = menuService.createMenu(MenuId.DebugWatchContext, contextKeyService);
        this._register(this.menu);
        this.watchExpressionsUpdatedScheduler = new RunOnceScheduler(() => {
            this.needsRefresh = false;
            this.tree.updateChildren();
        }, 50);
        this.watchExpressionsExist = CONTEXT_WATCH_EXPRESSIONS_EXIST.bindTo(contextKeyService);
        this.variableReadonly = CONTEXT_VARIABLE_IS_READONLY.bindTo(contextKeyService);
        this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
        this.watchItemType = CONTEXT_WATCH_ITEM_TYPE.bindTo(contextKeyService);
    }
    renderBody(container) {
        super.renderBody(container);
        this.element.classList.add('debug-pane');
        container.classList.add('debug-watch');
        const treeContainer = renderViewTree(container);
        const expressionsRenderer = this.instantiationService.createInstance(WatchExpressionsRenderer);
        const linkeDetector = this.instantiationService.createInstance(LinkDetector);
        this.tree = this.instantiationService.createInstance(WorkbenchAsyncDataTree, 'WatchExpressions', treeContainer, new WatchExpressionsDelegate(), [expressionsRenderer, this.instantiationService.createInstance(VariablesRenderer, linkeDetector)], new WatchExpressionsDataSource(), {
            accessibilityProvider: new WatchExpressionsAccessibilityProvider(),
            identityProvider: { getId: (element) => element.getId() },
            keyboardNavigationLabelProvider: {
                getKeyboardNavigationLabel: (e) => {
                    if (e === this.debugService.getViewModel().getSelectedExpression()?.expression) {
                        // Don't filter input box
                        return undefined;
                    }
                    return e.name;
                }
            },
            dnd: new WatchExpressionsDragAndDrop(this.debugService),
            overrideStyles: {
                listBackground: this.getBackgroundColor()
            }
        });
        this.tree.setInput(this.debugService);
        CONTEXT_WATCH_EXPRESSIONS_FOCUSED.bindTo(this.tree.contextKeyService);
        this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
        this._register(this.tree.onMouseDblClick(e => this.onMouseDblClick(e)));
        this._register(this.debugService.getModel().onDidChangeWatchExpressions(async (we) => {
            this.watchExpressionsExist.set(this.debugService.getModel().getWatchExpressions().length > 0);
            if (!this.isBodyVisible()) {
                this.needsRefresh = true;
            }
            else {
                if (we && !we.name) {
                    // We are adding a new input box, no need to re-evaluate watch expressions
                    useCachedEvaluation = true;
                }
                await this.tree.updateChildren();
                useCachedEvaluation = false;
                if (we instanceof Expression) {
                    this.tree.reveal(we);
                }
            }
        }));
        this._register(this.debugService.getViewModel().onDidFocusStackFrame(() => {
            if (!this.isBodyVisible()) {
                this.needsRefresh = true;
                return;
            }
            if (!this.watchExpressionsUpdatedScheduler.isScheduled()) {
                this.watchExpressionsUpdatedScheduler.schedule();
            }
        }));
        this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
            if (!ignoreViewUpdates) {
                this.tree.updateChildren();
            }
        }));
        this._register(this.onDidChangeBodyVisibility(visible => {
            if (visible && this.needsRefresh) {
                this.watchExpressionsUpdatedScheduler.schedule();
            }
        }));
        let horizontalScrolling;
        this._register(this.debugService.getViewModel().onDidSelectExpression(e => {
            const expression = e?.expression;
            if (expression instanceof Expression || (expression instanceof Variable && e?.settingWatch)) {
                horizontalScrolling = this.tree.options.horizontalScrolling;
                if (horizontalScrolling) {
                    this.tree.updateOptions({ horizontalScrolling: false });
                }
                if (expression.name) {
                    // Only rerender if the input is already done since otherwise the tree is not yet aware of the new element
                    this.tree.rerender(expression);
                }
            }
            else if (!expression && horizontalScrolling !== undefined) {
                this.tree.updateOptions({ horizontalScrolling: horizontalScrolling });
                horizontalScrolling = undefined;
            }
        }));
        this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
            if (e instanceof Variable && this.tree.hasNode(e)) {
                await this.tree.updateChildren(e, false, true);
                await this.tree.expand(e);
            }
        }));
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.tree.layout(height, width);
    }
    focus() {
        this.tree.domFocus();
    }
    collapseAll() {
        this.tree.collapseAll();
    }
    onMouseDblClick(e) {
        if (e.browserEvent.target.className.indexOf('twistie') >= 0) {
            // Ignore double click events on twistie
            return;
        }
        const element = e.element;
        // double click on primitive value: open input box to be able to select and copy value.
        const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
        if (element instanceof Expression && element !== selectedExpression?.expression) {
            this.debugService.getViewModel().setSelectedExpression(element, false);
        }
        else if (!element) {
            // Double click in watch panel triggers to add a new watch expression
            this.debugService.addWatchExpression();
        }
    }
    onContextMenu(e) {
        const element = e.element;
        const selection = this.tree.getSelection();
        this.watchItemType.set(element instanceof Expression ? 'expression' : element instanceof Variable ? 'variable' : undefined);
        const actions = [];
        const attributes = element instanceof Variable ? element.presentationHint?.attributes : undefined;
        this.variableReadonly.set(!!attributes && attributes.indexOf('readOnly') >= 0 || !!element?.presentationHint?.lazy);
        createAndFillInContextMenuActions(this.menu, { arg: element, shouldForwardArgs: true }, actions);
        this.contextMenuService.showContextMenu({
            getAnchor: () => e.anchor,
            getActions: () => actions,
            getActionsContext: () => element && selection.includes(element) ? selection : element ? [element] : [],
        });
    }
};
WatchExpressionsView = __decorate([
    __param(1, IContextMenuService),
    __param(2, IDebugService),
    __param(3, IKeybindingService),
    __param(4, IInstantiationService),
    __param(5, IViewDescriptorService),
    __param(6, IConfigurationService),
    __param(7, IContextKeyService),
    __param(8, IOpenerService),
    __param(9, IThemeService),
    __param(10, ITelemetryService),
    __param(11, IMenuService)
], WatchExpressionsView);
export { WatchExpressionsView };
class WatchExpressionsDelegate {
    getHeight(_element) {
        return 22;
    }
    getTemplateId(element) {
        if (element instanceof Expression) {
            return WatchExpressionsRenderer.ID;
        }
        // Variable
        return VariablesRenderer.ID;
    }
}
function isDebugService(element) {
    return typeof element.getConfigurationManager === 'function';
}
class WatchExpressionsDataSource {
    hasChildren(element) {
        return isDebugService(element) || element.hasChildren;
    }
    getChildren(element) {
        if (isDebugService(element)) {
            const debugService = element;
            const watchExpressions = debugService.getModel().getWatchExpressions();
            const viewModel = debugService.getViewModel();
            return Promise.all(watchExpressions.map(we => !!we.name && !useCachedEvaluation
                ? we.evaluate(viewModel.focusedSession, viewModel.focusedStackFrame, 'watch').then(() => we)
                : Promise.resolve(we)));
        }
        return element.getChildren();
    }
}
let WatchExpressionsRenderer = class WatchExpressionsRenderer extends AbstractExpressionsRenderer {
    menuService;
    contextKeyService;
    static ID = 'watchexpression';
    constructor(menuService, contextKeyService, debugService, contextViewService, themeService) {
        super(debugService, contextViewService, themeService);
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
    }
    get templateId() {
        return WatchExpressionsRenderer.ID;
    }
    renderExpression(expression, data, highlights) {
        const text = typeof expression.value === 'string' ? `${expression.name}:` : expression.name;
        let title;
        if (expression.type) {
            title = expression.type === expression.value ?
                expression.type :
                `${expression.type}: ${expression.value}`;
        }
        else {
            title = expression.value;
        }
        data.label.set(text, highlights, title);
        renderExpressionValue(expression, data.value, {
            showChanged: true,
            maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
            showHover: true,
            colorize: true
        });
    }
    getInputBoxOptions(expression, settingValue) {
        if (settingValue) {
            return {
                initialValue: expression.value,
                ariaLabel: localize('typeNewValue', "Type new value"),
                onFinish: async (value, success) => {
                    if (success && value) {
                        const focusedFrame = this.debugService.getViewModel().focusedStackFrame;
                        if (focusedFrame && (expression instanceof Variable || expression instanceof Expression)) {
                            await expression.setExpression(value, focusedFrame);
                            this.debugService.getViewModel().updateViews();
                        }
                    }
                }
            };
        }
        return {
            initialValue: expression.name ? expression.name : '',
            ariaLabel: localize('watchExpressionInputAriaLabel', "Type watch expression"),
            placeholder: localize('watchExpressionPlaceholder', "Expression to watch"),
            onFinish: (value, success) => {
                if (success && value) {
                    this.debugService.renameWatchExpression(expression.getId(), value);
                    ignoreViewUpdates = true;
                    this.debugService.getViewModel().updateViews();
                    ignoreViewUpdates = false;
                }
                else if (!expression.name) {
                    this.debugService.removeWatchExpressions(expression.getId());
                }
            }
        };
    }
    renderActionBar(actionBar, expression) {
        const contextKeyService = getContextForWatchExpressionMenu(this.contextKeyService);
        const menu = this.menuService.createMenu(MenuId.DebugWatchContext, contextKeyService);
        const primary = [];
        const context = expression;
        createAndFillInContextMenuActions(menu, { arg: context, shouldForwardArgs: false }, { primary, secondary: [] }, 'inline');
        actionBar.clear();
        actionBar.context = context;
        actionBar.push(primary, { icon: true, label: false });
    }
};
WatchExpressionsRenderer = __decorate([
    __param(0, IMenuService),
    __param(1, IContextKeyService),
    __param(2, IDebugService),
    __param(3, IContextViewService),
    __param(4, IThemeService)
], WatchExpressionsRenderer);
/**
 * Gets a context key overlay that has context for the given expression.
 */
function getContextForWatchExpressionMenu(parentContext) {
    return parentContext.createOverlay([
        [CONTEXT_WATCH_ITEM_TYPE.key, 'expression']
    ]);
}
class WatchExpressionsAccessibilityProvider {
    getWidgetAriaLabel() {
        return localize({ comment: ['Debug is a noun in this context, not a verb.'], key: 'watchAriaTreeLabel' }, "Debug Watch Expressions");
    }
    getAriaLabel(element) {
        if (element instanceof Expression) {
            return localize('watchExpressionAriaLabel', "{0}, value {1}", element.name, element.value);
        }
        // Variable
        return localize('watchVariableAriaLabel', "{0}, value {1}", element.name, element.value);
    }
}
class WatchExpressionsDragAndDrop {
    debugService;
    constructor(debugService) {
        this.debugService = debugService;
    }
    onDragOver(data) {
        if (!(data instanceof ElementsDragAndDropData)) {
            return false;
        }
        const expressions = data.elements;
        return expressions.length > 0 && expressions[0] instanceof Expression;
    }
    getDragURI(element) {
        if (!(element instanceof Expression) || element === this.debugService.getViewModel().getSelectedExpression()?.expression) {
            return null;
        }
        return element.getId();
    }
    getDragLabel(elements) {
        if (elements.length === 1) {
            return elements[0].name;
        }
        return undefined;
    }
    drop(data, targetElement) {
        if (!(data instanceof ElementsDragAndDropData)) {
            return;
        }
        const draggedElement = data.elements[0];
        const watches = this.debugService.getModel().getWatchExpressions();
        const position = targetElement instanceof Expression ? watches.indexOf(targetElement) : watches.length - 1;
        this.debugService.moveWatchExpression(draggedElement.getId(), position);
    }
}
registerAction2(class Collapse extends ViewAction {
    constructor() {
        super({
            id: 'watch.collapse',
            viewId: WATCH_VIEW_ID,
            title: localize('collapse', "Collapse All"),
            f1: false,
            icon: Codicon.collapseAll,
            precondition: CONTEXT_WATCH_EXPRESSIONS_EXIST,
            menu: {
                id: MenuId.ViewTitle,
                order: 30,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', WATCH_VIEW_ID)
            }
        });
    }
    runInView(_accessor, view) {
        view.collapseAll();
    }
});
export const ADD_WATCH_ID = 'workbench.debug.viewlet.action.addWatchExpression'; // Use old and long id for backwards compatibility
export const ADD_WATCH_LABEL = localize('addWatchExpression', "Add Expression");
registerAction2(class AddWatchExpressionAction extends Action2 {
    constructor() {
        super({
            id: ADD_WATCH_ID,
            title: ADD_WATCH_LABEL,
            f1: false,
            icon: watchExpressionsAdd,
            menu: {
                id: MenuId.ViewTitle,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', WATCH_VIEW_ID)
            }
        });
    }
    run(accessor) {
        const debugService = accessor.get(IDebugService);
        debugService.addWatchExpression();
    }
});
export const REMOVE_WATCH_EXPRESSIONS_COMMAND_ID = 'workbench.debug.viewlet.action.removeAllWatchExpressions';
export const REMOVE_WATCH_EXPRESSIONS_LABEL = localize('removeAllWatchExpressions', "Remove All Expressions");
registerAction2(class RemoveAllWatchExpressionsAction extends Action2 {
    constructor() {
        super({
            id: REMOVE_WATCH_EXPRESSIONS_COMMAND_ID,
            title: REMOVE_WATCH_EXPRESSIONS_LABEL,
            f1: false,
            icon: watchExpressionsRemoveAll,
            precondition: CONTEXT_WATCH_EXPRESSIONS_EXIST,
            menu: {
                id: MenuId.ViewTitle,
                order: 20,
                group: 'navigation',
                when: ContextKeyExpr.equals('view', WATCH_VIEW_ID)
            }
        });
    }
    run(accessor) {
        const debugService = accessor.get(IDebugService);
        debugService.removeWatchExpressions();
    }
});
