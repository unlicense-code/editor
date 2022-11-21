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
import * as browser from 'vs/base/browser/browser';
import * as dom from 'vs/base/browser/dom';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { Action } from 'vs/base/common/actions';
import * as arrays from 'vs/base/common/arrays';
import { RunOnceScheduler } from 'vs/base/common/async';
import * as errors from 'vs/base/common/errors';
import { DisposableStore, dispose } from 'vs/base/common/lifecycle';
import 'vs/css!./media/debugToolBar';
import { localize } from 'vs/nls';
import { DropdownWithPrimaryActionViewItem } from 'vs/platform/actions/browser/dropdownWithPrimaryActionViewItem';
import { createActionViewItem, createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IMenuService, MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { contrastBorder, widgetShadow } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService, Themable, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { FocusSessionActionViewItem } from 'vs/workbench/contrib/debug/browser/debugActionViewItems';
import { debugToolBarBackground, debugToolBarBorder } from 'vs/workbench/contrib/debug/browser/debugColors';
import { CONTINUE_ID, CONTINUE_LABEL, DISCONNECT_AND_SUSPEND_ID, DISCONNECT_AND_SUSPEND_LABEL, DISCONNECT_ID, DISCONNECT_LABEL, FOCUS_SESSION_ID, FOCUS_SESSION_LABEL, PAUSE_ID, PAUSE_LABEL, RESTART_LABEL, RESTART_SESSION_ID, REVERSE_CONTINUE_ID, STEP_BACK_ID, STEP_INTO_ID, STEP_INTO_LABEL, STEP_OUT_ID, STEP_OUT_LABEL, STEP_OVER_ID, STEP_OVER_LABEL, STOP_ID, STOP_LABEL } from 'vs/workbench/contrib/debug/browser/debugCommands';
import * as icons from 'vs/workbench/contrib/debug/browser/debugIcons';
import { CONTEXT_DEBUG_STATE, CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_MULTI_SESSION_DEBUG, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED, IDebugService, VIEWLET_ID } from 'vs/workbench/contrib/debug/common/debug';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
const DEBUG_TOOLBAR_POSITION_KEY = 'debug.actionswidgetposition';
const DEBUG_TOOLBAR_Y_KEY = 'debug.actionswidgety';
let DebugToolBar = class DebugToolBar extends Themable {
    notificationService;
    telemetryService;
    debugService;
    layoutService;
    storageService;
    configurationService;
    instantiationService;
    $el;
    dragArea;
    actionBar;
    activeActions;
    updateScheduler;
    debugToolBarMenu;
    yCoordinate = 0;
    isVisible = false;
    isBuilt = false;
    stopActionViewItemDisposables = this._register(new DisposableStore());
    constructor(notificationService, telemetryService, debugService, layoutService, storageService, configurationService, themeService, instantiationService, menuService, contextKeyService) {
        super(themeService);
        this.notificationService = notificationService;
        this.telemetryService = telemetryService;
        this.debugService = debugService;
        this.layoutService = layoutService;
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.$el = dom.$('div.debug-toolbar');
        this.$el.style.top = `${layoutService.offset.top}px`;
        this.dragArea = dom.append(this.$el, dom.$('div.drag-area' + ThemeIcon.asCSSSelector(icons.debugGripper)));
        const actionBarContainer = dom.append(this.$el, dom.$('div.action-bar-container'));
        this.debugToolBarMenu = menuService.createMenu(MenuId.DebugToolBar, contextKeyService);
        this._register(this.debugToolBarMenu);
        this.activeActions = [];
        this.actionBar = this._register(new ActionBar(actionBarContainer, {
            orientation: 0 /* ActionsOrientation.HORIZONTAL */,
            actionViewItemProvider: (action) => {
                if (action.id === FOCUS_SESSION_ID) {
                    return this.instantiationService.createInstance(FocusSessionActionViewItem, action, undefined);
                }
                else if (action.id === STOP_ID || action.id === DISCONNECT_ID) {
                    this.stopActionViewItemDisposables.clear();
                    const item = this.instantiationService.invokeFunction(accessor => createDisconnectMenuItemAction(action, this.stopActionViewItemDisposables, accessor));
                    if (item) {
                        return item;
                    }
                }
                return createActionViewItem(this.instantiationService, action);
            }
        }));
        this.updateScheduler = this._register(new RunOnceScheduler(() => {
            const state = this.debugService.state;
            const toolBarLocation = this.configurationService.getValue('debug').toolBarLocation;
            if (state === 0 /* State.Inactive */ ||
                toolBarLocation === 'docked' ||
                toolBarLocation === 'hidden' ||
                this.debugService.getModel().getSessions().every(s => s.suppressDebugToolbar) ||
                (state === 1 /* State.Initializing */ && this.debugService.initializingOptions?.suppressDebugToolbar)) {
                return this.hide();
            }
            const actions = [];
            createAndFillInActionBarActions(this.debugToolBarMenu, { shouldForwardArgs: true }, actions);
            if (!arrays.equals(actions, this.activeActions, (first, second) => first.id === second.id && first.enabled === second.enabled)) {
                this.actionBar.clear();
                this.actionBar.push(actions, { icon: true, label: false });
                this.activeActions = actions;
            }
            this.show();
        }, 20));
        this.updateStyles();
        this.registerListeners();
        this.hide();
    }
    registerListeners() {
        this._register(this.debugService.onDidChangeState(() => this.updateScheduler.schedule()));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('debug.toolBarLocation')) {
                this.updateScheduler.schedule();
            }
        }));
        this._register(this.debugToolBarMenu.onDidChange(() => this.updateScheduler.schedule()));
        this._register(this.actionBar.actionRunner.onDidRun((e) => {
            // check for error
            if (e.error && !errors.isCancellationError(e.error)) {
                this.notificationService.error(e.error);
            }
            // log in telemetry
            this.telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'debugActionsWidget' });
        }));
        this._register(dom.addDisposableListener(window, dom.EventType.RESIZE, () => this.setCoordinates()));
        this._register(dom.addDisposableGenericMouseUpListener(this.dragArea, (event) => {
            const mouseClickEvent = new StandardMouseEvent(event);
            if (mouseClickEvent.detail === 2) {
                // double click on debug bar centers it again #8250
                const widgetWidth = this.$el.clientWidth;
                this.setCoordinates(0.5 * window.innerWidth - 0.5 * widgetWidth, 0);
                this.storePosition();
            }
        }));
        this._register(dom.addDisposableGenericMouseDownListener(this.dragArea, (event) => {
            this.dragArea.classList.add('dragged');
            const mouseMoveListener = dom.addDisposableGenericMouseMoveListener(window, (e) => {
                const mouseMoveEvent = new StandardMouseEvent(e);
                // Prevent default to stop editor selecting text #8524
                mouseMoveEvent.preventDefault();
                // Reduce x by width of drag handle to reduce jarring #16604
                this.setCoordinates(mouseMoveEvent.posx - 14, mouseMoveEvent.posy - (this.layoutService.offset.top));
            });
            const mouseUpListener = dom.addDisposableGenericMouseUpListener(window, (e) => {
                this.storePosition();
                this.dragArea.classList.remove('dragged');
                mouseMoveListener.dispose();
                mouseUpListener.dispose();
            });
        }));
        this._register(this.layoutService.onDidChangePartVisibility(() => this.setYCoordinate()));
        this._register(browser.PixelRatio.onDidChange(() => this.setYCoordinate()));
    }
    storePosition() {
        const left = dom.getComputedStyle(this.$el).left;
        if (left) {
            const position = parseFloat(left) / window.innerWidth;
            this.storageService.store(DEBUG_TOOLBAR_POSITION_KEY, position, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    updateStyles() {
        super.updateStyles();
        if (this.$el) {
            this.$el.style.backgroundColor = this.getColor(debugToolBarBackground) || '';
            const widgetShadowColor = this.getColor(widgetShadow);
            this.$el.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
            const contrastBorderColor = this.getColor(contrastBorder);
            const borderColor = this.getColor(debugToolBarBorder);
            if (contrastBorderColor) {
                this.$el.style.border = `1px solid ${contrastBorderColor}`;
            }
            else {
                this.$el.style.border = borderColor ? `solid ${borderColor}` : 'none';
                this.$el.style.border = '1px 0';
            }
        }
    }
    setYCoordinate(y = this.yCoordinate) {
        const titlebarOffset = this.layoutService.offset.top;
        this.$el.style.top = `${titlebarOffset + y}px`;
        this.yCoordinate = y;
    }
    setCoordinates(x, y) {
        if (!this.isVisible) {
            return;
        }
        const widgetWidth = this.$el.clientWidth;
        if (x === undefined) {
            const positionPercentage = this.storageService.get(DEBUG_TOOLBAR_POSITION_KEY, 0 /* StorageScope.PROFILE */);
            x = positionPercentage !== undefined ? parseFloat(positionPercentage) * window.innerWidth : (0.5 * window.innerWidth - 0.5 * widgetWidth);
        }
        x = Math.max(0, Math.min(x, window.innerWidth - widgetWidth)); // do not allow the widget to overflow on the right
        this.$el.style.left = `${x}px`;
        if (y === undefined) {
            y = this.storageService.getNumber(DEBUG_TOOLBAR_Y_KEY, 0 /* StorageScope.PROFILE */, 0);
        }
        const titleAreaHeight = 35;
        if ((y < titleAreaHeight / 2) || (y > titleAreaHeight + titleAreaHeight / 2)) {
            const moveToTop = y < titleAreaHeight;
            this.setYCoordinate(moveToTop ? 0 : titleAreaHeight);
            this.storageService.store(DEBUG_TOOLBAR_Y_KEY, moveToTop ? 0 : 2 * titleAreaHeight, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    show() {
        if (this.isVisible) {
            this.setCoordinates();
            return;
        }
        if (!this.isBuilt) {
            this.isBuilt = true;
            this.layoutService.container.appendChild(this.$el);
        }
        this.isVisible = true;
        dom.show(this.$el);
        this.setCoordinates();
    }
    hide() {
        this.isVisible = false;
        dom.hide(this.$el);
    }
    dispose() {
        super.dispose();
        this.$el?.remove();
    }
};
DebugToolBar = __decorate([
    __param(0, INotificationService),
    __param(1, ITelemetryService),
    __param(2, IDebugService),
    __param(3, IWorkbenchLayoutService),
    __param(4, IStorageService),
    __param(5, IConfigurationService),
    __param(6, IThemeService),
    __param(7, IInstantiationService),
    __param(8, IMenuService),
    __param(9, IContextKeyService)
], DebugToolBar);
export { DebugToolBar };
export function createDisconnectMenuItemAction(action, disposables, accessor) {
    const menuService = accessor.get(IMenuService);
    const contextKeyService = accessor.get(IContextKeyService);
    const instantiationService = accessor.get(IInstantiationService);
    const contextMenuService = accessor.get(IContextMenuService);
    const menu = menuService.createMenu(MenuId.DebugToolBarStop, contextKeyService);
    const secondary = [];
    createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, secondary);
    if (!secondary.length) {
        return undefined;
    }
    const dropdownAction = disposables.add(new Action('notebook.moreRunActions', localize('notebook.moreRunActionsLabel', "More..."), 'codicon-chevron-down', true));
    const item = instantiationService.createInstance(DropdownWithPrimaryActionViewItem, action, dropdownAction, secondary, 'debug-stop-actions', contextMenuService, {});
    return item;
}
// Debug toolbar
const debugViewTitleItems = [];
const registerDebugToolBarItem = (id, title, order, icon, when, precondition, alt) => {
    MenuRegistry.appendMenuItem(MenuId.DebugToolBar, {
        group: 'navigation',
        when,
        order,
        command: {
            id,
            title,
            icon,
            precondition
        },
        alt
    });
    // Register actions in debug viewlet when toolbar is docked
    debugViewTitleItems.push(MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
        group: 'navigation',
        when: ContextKeyExpr.and(when, ContextKeyExpr.equals('viewContainer', VIEWLET_ID), CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked')),
        order,
        command: {
            id,
            title,
            icon,
            precondition
        }
    }));
};
MenuRegistry.onDidChangeMenu(e => {
    // In case the debug toolbar is docked we need to make sure that the docked toolbar has the up to date commands registered #115945
    if (e.has(MenuId.DebugToolBar)) {
        dispose(debugViewTitleItems);
        const items = MenuRegistry.getMenuItems(MenuId.DebugToolBar);
        for (const i of items) {
            debugViewTitleItems.push(MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
                ...i,
                when: ContextKeyExpr.and(i.when, ContextKeyExpr.equals('viewContainer', VIEWLET_ID), CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked'))
            }));
        }
    }
});
registerDebugToolBarItem(CONTINUE_ID, CONTINUE_LABEL, 10, icons.debugContinue, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(PAUSE_ID, PAUSE_LABEL, 10, icons.debugPause, CONTEXT_DEBUG_STATE.notEqualsTo('stopped'), CONTEXT_DEBUG_STATE.isEqualTo('running'));
registerDebugToolBarItem(STOP_ID, STOP_LABEL, 70, icons.debugStop, CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), undefined, { id: DISCONNECT_ID, title: DISCONNECT_LABEL, icon: icons.debugDisconnect, precondition: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), });
registerDebugToolBarItem(DISCONNECT_ID, DISCONNECT_LABEL, 70, icons.debugDisconnect, CONTEXT_FOCUSED_SESSION_IS_ATTACH, undefined, { id: STOP_ID, title: STOP_LABEL, icon: icons.debugStop, precondition: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), });
registerDebugToolBarItem(STEP_OVER_ID, STEP_OVER_LABEL, 20, icons.debugStepOver, undefined, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(STEP_INTO_ID, STEP_INTO_LABEL, 30, icons.debugStepInto, undefined, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(STEP_OUT_ID, STEP_OUT_LABEL, 40, icons.debugStepOut, undefined, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(RESTART_SESSION_ID, RESTART_LABEL, 60, icons.debugRestart);
registerDebugToolBarItem(STEP_BACK_ID, localize('stepBackDebug', "Step Back"), 50, icons.debugStepBack, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(REVERSE_CONTINUE_ID, localize('reverseContinue', "Reverse"), 55, icons.debugReverseContinue, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
registerDebugToolBarItem(FOCUS_SESSION_ID, FOCUS_SESSION_LABEL, 100, undefined, CONTEXT_MULTI_SESSION_DEBUG);
MenuRegistry.appendMenuItem(MenuId.DebugToolBarStop, {
    group: 'navigation',
    when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
    order: 0,
    command: {
        id: DISCONNECT_ID,
        title: DISCONNECT_LABEL,
        icon: icons.debugDisconnect
    }
});
MenuRegistry.appendMenuItem(MenuId.DebugToolBarStop, {
    group: 'navigation',
    when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
    order: 0,
    command: {
        id: STOP_ID,
        title: STOP_LABEL,
        icon: icons.debugStop
    }
});
MenuRegistry.appendMenuItem(MenuId.DebugToolBarStop, {
    group: 'navigation',
    when: ContextKeyExpr.or(ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED)),
    order: 0,
    command: {
        id: DISCONNECT_AND_SUSPEND_ID,
        title: DISCONNECT_AND_SUSPEND_LABEL,
        icon: icons.debugDisconnect
    }
});
