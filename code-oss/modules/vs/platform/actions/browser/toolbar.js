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
import { addDisposableListener } from 'vs/base/browser/dom';
import { ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { Separator, toAction } from 'vs/base/common/actions';
import { coalesceInPlace } from 'vs/base/common/arrays';
import { BugIndicatingError } from 'vs/base/common/errors';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IMenuService, MenuItemAction, SubmenuItemAction } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export var HiddenItemStrategy;
(function (HiddenItemStrategy) {
    /** This toolbar doesn't support hiding*/
    HiddenItemStrategy[HiddenItemStrategy["NoHide"] = -1] = "NoHide";
    /** Hidden items aren't shown anywhere */
    HiddenItemStrategy[HiddenItemStrategy["Ignore"] = 0] = "Ignore";
    /** Hidden items move into the secondary group */
    HiddenItemStrategy[HiddenItemStrategy["RenderInSecondaryGroup"] = 1] = "RenderInSecondaryGroup";
})(HiddenItemStrategy || (HiddenItemStrategy = {}));
/**
 * The `WorkbenchToolBar` does
 * - support hiding of menu items
 * - lookup keybindings for each actions automatically
 * - send `workbenchActionExecuted`-events for each action
 *
 * See {@link MenuWorkbenchToolBar} for a toolbar that is backed by a menu.
 */
let WorkbenchToolBar = class WorkbenchToolBar extends ToolBar {
    _options;
    _menuService;
    _contextKeyService;
    _contextMenuService;
    _sessionDisposables = this._store.add(new DisposableStore());
    constructor(container, _options, _menuService, _contextKeyService, _contextMenuService, keybindingService, telemetryService) {
        super(container, _contextMenuService, {
            // defaults
            getKeyBinding: (action) => keybindingService.lookupKeybinding(action.id) ?? undefined,
            // options (override defaults)
            ..._options,
            // mandatory (overide options)
            allowContextMenu: true,
        });
        this._options = _options;
        this._menuService = _menuService;
        this._contextKeyService = _contextKeyService;
        this._contextMenuService = _contextMenuService;
        // telemetry logic
        if (_options?.telemetrySource) {
            this._store.add(this.actionBar.onDidRun(e => telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: _options.telemetrySource })));
        }
    }
    setActions(_primary, _secondary = [], menuIds) {
        this._sessionDisposables.clear();
        const primary = _primary.slice();
        const secondary = _secondary.slice();
        const toggleActions = [];
        let someAreHidden = false;
        // unless disabled, move all hidden items to secondary group or ignore them
        if (this._options?.hiddenItemStrategy !== -1 /* HiddenItemStrategy.NoHide */) {
            let shouldPrependSeparator = secondary.length > 0;
            for (let i = 0; i < primary.length; i++) {
                const action = primary[i];
                if (!(action instanceof MenuItemAction) && !(action instanceof SubmenuItemAction)) {
                    // console.warn(`Action ${action.id}/${action.label} is not a MenuItemAction`);
                    continue;
                }
                if (!action.hideActions) {
                    continue;
                }
                // collect all toggle actions
                toggleActions.push(action.hideActions.toggle);
                // hidden items move into overflow or ignore
                if (action.hideActions.isHidden) {
                    someAreHidden = true;
                    primary[i] = undefined;
                    if (this._options?.hiddenItemStrategy !== 0 /* HiddenItemStrategy.Ignore */) {
                        if (shouldPrependSeparator) {
                            shouldPrependSeparator = false;
                            secondary.unshift(new Separator());
                        }
                        secondary.unshift(action);
                    }
                }
            }
        }
        coalesceInPlace(primary);
        super.setActions(primary, secondary);
        // add context menu for toggle actions
        if (toggleActions.length > 0) {
            this._sessionDisposables.add(addDisposableListener(this.getElement(), 'contextmenu', e => {
                const action = this.getItemAction(e.target);
                if (!(action)) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                let actions = toggleActions;
                // add "hide foo" actions
                let hideAction;
                if (action instanceof MenuItemAction || action instanceof SubmenuItemAction) {
                    if (!action.hideActions) {
                        // no context menu for MenuItemAction instances that support no hiding
                        // those are fake actions and need to be cleaned up
                        return;
                    }
                    hideAction = action.hideActions.hide;
                }
                else {
                    hideAction = toAction({
                        id: 'label',
                        label: localize('hide', "Hide"),
                        enabled: false,
                        run() { }
                    });
                }
                actions = [hideAction, new Separator(), ...toggleActions];
                // add "Reset Menu" action
                if (this._options?.resetMenu && !menuIds) {
                    menuIds = [this._options.resetMenu];
                }
                if (someAreHidden && menuIds) {
                    actions.push(new Separator());
                    actions.push(toAction({
                        id: 'resetThisMenu',
                        label: localize('resetThisMenu', "Reset Menu"),
                        run: () => this._menuService.resetHiddenStates(menuIds)
                    }));
                }
                this._contextMenuService.showContextMenu({
                    getAnchor: () => e,
                    getActions: () => actions,
                    // add context menu actions (iff appicable)
                    menuId: this._options?.contextMenu,
                    menuActionOptions: { renderShortTitle: true, ...this._options?.menuOptions },
                    contextKeyService: this._contextKeyService,
                });
            }));
        }
    }
};
WorkbenchToolBar = __decorate([
    __param(2, IMenuService),
    __param(3, IContextKeyService),
    __param(4, IContextMenuService),
    __param(5, IKeybindingService),
    __param(6, ITelemetryService)
], WorkbenchToolBar);
export { WorkbenchToolBar };
/**
 * A {@link WorkbenchToolBar workbench toolbar} that is purely driven from a {@link MenuId menu}-identifier.
 *
 * *Note* that Manual updates via `setActions` are NOT supported.
 */
let MenuWorkbenchToolBar = class MenuWorkbenchToolBar extends WorkbenchToolBar {
    constructor(container, menuId, options, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService) {
        super(container, { resetMenu: menuId, ...options }, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService);
        // update logic
        const menu = this._store.add(menuService.createMenu(menuId, contextKeyService, { emitEventsForSubmenuChanges: true }));
        const updateToolbar = () => {
            const primary = [];
            const secondary = [];
            createAndFillInActionBarActions(menu, options?.menuOptions, { primary, secondary }, options?.toolbarOptions?.primaryGroup, options?.toolbarOptions?.primaryMaxCount, options?.toolbarOptions?.shouldInlineSubmenu, options?.toolbarOptions?.useSeparatorsInPrimaryActions);
            super.setActions(primary, secondary);
        };
        this._store.add(menu.onDidChange(updateToolbar));
        updateToolbar();
    }
    /**
     * @deprecated The WorkbenchToolBar does not support this method because it works with menus.
     */
    setActions() {
        throw new BugIndicatingError('This toolbar is populated from a menu.');
    }
};
MenuWorkbenchToolBar = __decorate([
    __param(3, IMenuService),
    __param(4, IContextKeyService),
    __param(5, IContextMenuService),
    __param(6, IKeybindingService),
    __param(7, ITelemetryService)
], MenuWorkbenchToolBar);
export { MenuWorkbenchToolBar };
