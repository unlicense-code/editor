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
import 'vs/css!./media/activityaction';
import { localize } from 'vs/nls';
import { EventType, addDisposableListener, EventHelper } from 'vs/base/browser/dom';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { EventType as TouchEventType } from 'vs/base/browser/touch';
import { Action, Separator, SubmenuAction, toAction } from 'vs/base/common/actions';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IMenuService, MenuId, registerAction2, Action2 } from 'vs/platform/actions/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { activeContrastBorder, focusBorder } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService, registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { ActivityAction, ActivityActionViewItem, ToggleCompositePinnedAction } from 'vs/workbench/browser/parts/compositeBarActions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { ACTIVITY_BAR_FOREGROUND, ACTIVITY_BAR_ACTIVE_BORDER, ACTIVITY_BAR_ACTIVE_FOCUS_BORDER, ACTIVITY_BAR_ACTIVE_BACKGROUND, ACTIVITY_BAR_PROFILE_BACKGROUND, ACTIVITY_BAR_PROFILE_HOVER_FOREGROUND } from 'vs/workbench/common/theme';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { getCurrentAuthenticationSessionInfo } from 'vs/workbench/services/authentication/browser/authenticationService';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { ICredentialsService } from 'vs/platform/credentials/common/credentials';
import { IUserDataProfileService, ManageProfilesSubMenu, PROFILES_CATEGORY } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
let ViewContainerActivityAction = class ViewContainerActivityAction extends ActivityAction {
    paneCompositePart;
    layoutService;
    telemetryService;
    configurationService;
    static preventDoubleClickDelay = 300;
    lastRun = 0;
    constructor(activity, paneCompositePart, layoutService, telemetryService, configurationService) {
        super(activity);
        this.paneCompositePart = paneCompositePart;
        this.layoutService = layoutService;
        this.telemetryService = telemetryService;
        this.configurationService = configurationService;
    }
    updateActivity(activity) {
        this.activity = activity;
    }
    async run(event) {
        if (event instanceof MouseEvent && event.button === 2) {
            return; // do not run on right click
        }
        // prevent accident trigger on a doubleclick (to help nervous people)
        const now = Date.now();
        if (now > this.lastRun /* https://github.com/microsoft/vscode/issues/25830 */ && now - this.lastRun < ViewContainerActivityAction.preventDoubleClickDelay) {
            return;
        }
        this.lastRun = now;
        const sideBarVisible = this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        const activeViewlet = this.paneCompositePart.getActivePaneComposite();
        const focusBehavior = this.configurationService.getValue('workbench.activityBar.iconClickBehavior');
        const focus = (event && 'preserveFocus' in event) ? !event.preserveFocus : true;
        if (sideBarVisible && activeViewlet?.getId() === this.activity.id) {
            switch (focusBehavior) {
                case 'focus':
                    this.logAction('refocus');
                    this.paneCompositePart.openPaneComposite(this.activity.id, focus);
                    break;
                case 'toggle':
                default:
                    // Hide sidebar if selected viewlet already visible
                    this.logAction('hide');
                    this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                    break;
            }
            return;
        }
        this.logAction('show');
        await this.paneCompositePart.openPaneComposite(this.activity.id, focus);
        return this.activate();
    }
    logAction(action) {
        this.telemetryService.publicLog2('activityBarAction', { viewletId: this.activity.id, action });
    }
};
ViewContainerActivityAction = __decorate([
    __param(2, IWorkbenchLayoutService),
    __param(3, ITelemetryService),
    __param(4, IConfigurationService)
], ViewContainerActivityAction);
export { ViewContainerActivityAction };
let AbstractGlobalActivityActionViewItem = class AbstractGlobalActivityActionViewItem extends ActivityActionViewItem {
    contextMenuActionsProvider;
    menuService;
    contextMenuService;
    contextKeyService;
    environmentService;
    constructor(action, contextMenuActionsProvider, options, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService) {
        super(action, options, themeService, hoverService, configurationService, keybindingService);
        this.contextMenuActionsProvider = contextMenuActionsProvider;
        this.menuService = menuService;
        this.contextMenuService = contextMenuService;
        this.contextKeyService = contextKeyService;
        this.environmentService = environmentService;
    }
    render(container) {
        super.render(container);
        this._register(addDisposableListener(this.container, EventType.MOUSE_DOWN, async (e) => {
            EventHelper.stop(e, true);
            const isLeftClick = e?.button !== 2;
            // Left-click run
            if (isLeftClick) {
                this.run();
            }
        }));
        // The rest of the activity bar uses context menu event for the context menu, so we match this
        this._register(addDisposableListener(this.container, EventType.CONTEXT_MENU, async (e) => {
            const disposables = new DisposableStore();
            const actions = await this.resolveContextMenuActions(disposables);
            const event = new StandardMouseEvent(e);
            const anchor = {
                x: event.posx,
                y: event.posy
            };
            this.contextMenuService.showContextMenu({
                getAnchor: () => anchor,
                getActions: () => actions,
                onHide: () => disposables.dispose()
            });
        }));
        this._register(addDisposableListener(this.container, EventType.KEY_UP, (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                EventHelper.stop(e, true);
                this.run();
            }
        }));
        this._register(addDisposableListener(this.container, TouchEventType.Tap, (e) => {
            EventHelper.stop(e, true);
            this.run();
        }));
    }
    async resolveContextMenuActions(disposables) {
        return this.contextMenuActionsProvider();
    }
};
AbstractGlobalActivityActionViewItem = __decorate([
    __param(3, IThemeService),
    __param(4, IHoverService),
    __param(5, IMenuService),
    __param(6, IContextMenuService),
    __param(7, IContextKeyService),
    __param(8, IConfigurationService),
    __param(9, IWorkbenchEnvironmentService),
    __param(10, IKeybindingService)
], AbstractGlobalActivityActionViewItem);
let MenuActivityActionViewItem = class MenuActivityActionViewItem extends AbstractGlobalActivityActionViewItem {
    menuId;
    constructor(menuId, action, contextMenuActionsProvider, icon, colors, hoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService) {
        super(action, contextMenuActionsProvider, { draggable: false, colors, icon, hasPopup: true, hoverOptions }, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
        this.menuId = menuId;
    }
    async run() {
        const disposables = new DisposableStore();
        const menu = disposables.add(this.menuService.createMenu(this.menuId, this.contextKeyService));
        const actions = await this.resolveMainMenuActions(menu, disposables);
        this.contextMenuService.showContextMenu({
            getAnchor: () => this.container,
            anchorAlignment: this.configurationService.getValue('workbench.sideBar.location') === 'left' ? 1 /* AnchorAlignment.RIGHT */ : 0 /* AnchorAlignment.LEFT */,
            anchorAxisAlignment: 1 /* AnchorAxisAlignment.HORIZONTAL */,
            getActions: () => actions,
            onHide: () => disposables.dispose()
        });
    }
    async resolveMainMenuActions(menu, _disposable) {
        const actions = [];
        createAndFillInActionBarActions(menu, undefined, { primary: [], secondary: actions });
        return actions;
    }
};
MenuActivityActionViewItem = __decorate([
    __param(6, IThemeService),
    __param(7, IHoverService),
    __param(8, IMenuService),
    __param(9, IContextMenuService),
    __param(10, IContextKeyService),
    __param(11, IConfigurationService),
    __param(12, IWorkbenchEnvironmentService),
    __param(13, IKeybindingService)
], MenuActivityActionViewItem);
let AccountsActivityActionViewItem = class AccountsActivityActionViewItem extends MenuActivityActionViewItem {
    authenticationService;
    productService;
    storageService;
    credentialsService;
    static ACCOUNTS_VISIBILITY_PREFERENCE_KEY = 'workbench.activity.showAccounts';
    constructor(action, contextMenuActionsProvider, colors, activityHoverOptions, themeService, hoverService, contextMenuService, menuService, contextKeyService, authenticationService, environmentService, productService, configurationService, storageService, keybindingService, credentialsService) {
        super(MenuId.AccountsContext, action, contextMenuActionsProvider, true, colors, activityHoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
        this.authenticationService = authenticationService;
        this.productService = productService;
        this.storageService = storageService;
        this.credentialsService = credentialsService;
    }
    async resolveMainMenuActions(accountsMenu, disposables) {
        await super.resolveMainMenuActions(accountsMenu, disposables);
        const otherCommands = accountsMenu.getActions();
        const providers = this.authenticationService.getProviderIds();
        const allSessions = providers.map(async (providerId) => {
            try {
                const sessions = await this.authenticationService.getSessions(providerId);
                const groupedSessions = {};
                sessions.forEach(session => {
                    if (groupedSessions[session.account.label]) {
                        groupedSessions[session.account.label].push(session);
                    }
                    else {
                        groupedSessions[session.account.label] = [session];
                    }
                });
                return { providerId, sessions: groupedSessions };
            }
            catch {
                return { providerId };
            }
        });
        const result = await Promise.all(allSessions);
        let menus = [];
        const authenticationSession = await getCurrentAuthenticationSessionInfo(this.credentialsService, this.productService);
        result.forEach(sessionInfo => {
            const providerDisplayName = this.authenticationService.getLabel(sessionInfo.providerId);
            if (sessionInfo.sessions) {
                Object.keys(sessionInfo.sessions).forEach(accountName => {
                    const manageExtensionsAction = disposables.add(new Action(`configureSessions${accountName}`, localize('manageTrustedExtensions', "Manage Trusted Extensions"), '', true, () => {
                        return this.authenticationService.manageTrustedExtensionsForAccount(sessionInfo.providerId, accountName);
                    }));
                    const signOutAction = disposables.add(new Action('signOut', localize('signOut', "Sign Out"), '', true, () => {
                        return this.authenticationService.removeAccountSessions(sessionInfo.providerId, accountName, sessionInfo.sessions[accountName]);
                    }));
                    const providerSubMenuActions = [manageExtensionsAction];
                    const hasEmbedderAccountSession = sessionInfo.sessions[accountName].some(session => session.id === (authenticationSession?.id));
                    if (!hasEmbedderAccountSession || authenticationSession?.canSignOut) {
                        providerSubMenuActions.push(signOutAction);
                    }
                    const providerSubMenu = new SubmenuAction('activitybar.submenu', `${accountName} (${providerDisplayName})`, providerSubMenuActions);
                    menus.push(providerSubMenu);
                });
            }
            else {
                const providerUnavailableAction = disposables.add(new Action('providerUnavailable', localize('authProviderUnavailable', '{0} is currently unavailable', providerDisplayName)));
                menus.push(providerUnavailableAction);
            }
        });
        if (providers.length && !menus.length) {
            const noAccountsAvailableAction = disposables.add(new Action('noAccountsAvailable', localize('noAccounts', "You are not signed in to any accounts"), undefined, false));
            menus.push(noAccountsAvailableAction);
        }
        if (menus.length && otherCommands.length) {
            menus.push(new Separator());
        }
        otherCommands.forEach((group, i) => {
            const actions = group[1];
            menus = menus.concat(actions);
            if (i !== otherCommands.length - 1) {
                menus.push(new Separator());
            }
        });
        return menus;
    }
    async resolveContextMenuActions(disposables) {
        const actions = await super.resolveContextMenuActions(disposables);
        actions.unshift(...[
            toAction({ id: 'hideAccounts', label: localize('hideAccounts', "Hide Accounts"), run: () => this.storageService.store(AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, false, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */) }),
            new Separator()
        ]);
        return actions;
    }
};
AccountsActivityActionViewItem = __decorate([
    __param(4, IThemeService),
    __param(5, IHoverService),
    __param(6, IContextMenuService),
    __param(7, IMenuService),
    __param(8, IContextKeyService),
    __param(9, IAuthenticationService),
    __param(10, IWorkbenchEnvironmentService),
    __param(11, IProductService),
    __param(12, IConfigurationService),
    __param(13, IStorageService),
    __param(14, IKeybindingService),
    __param(15, ICredentialsService)
], AccountsActivityActionViewItem);
export { AccountsActivityActionViewItem };
let ProfilesActivityActionViewItem = class ProfilesActivityActionViewItem extends MenuActivityActionViewItem {
    userDataProfileService;
    storageService;
    static PROFILES_VISIBILITY_PREFERENCE_KEY = 'workbench.activity.showProfiles';
    constructor(action, contextMenuActionsProvider, colors, hoverOptions, userDataProfileService, storageService, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService) {
        super(ManageProfilesSubMenu, action, contextMenuActionsProvider, action.activity.icon, colors, hoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
        this.userDataProfileService = userDataProfileService;
        this.storageService = storageService;
    }
    render(container) {
        super.render(container);
        this.container.classList.add('profile-activity-item');
    }
    async resolveContextMenuActions(disposables) {
        const actions = await super.resolveContextMenuActions(disposables);
        actions.unshift(...[
            toAction({ id: 'hideprofiles', label: localize('hideprofiles', "Hide {0}", PROFILES_CATEGORY.value), run: () => this.storageService.store(ProfilesActivityActionViewItem.PROFILES_VISIBILITY_PREFERENCE_KEY, false, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */) }),
            new Separator()
        ]);
        return actions;
    }
    computeTitle() {
        return localize('profiles', "{0} (Profile)", this.userDataProfileService.currentProfile.name);
    }
};
ProfilesActivityActionViewItem = __decorate([
    __param(4, IUserDataProfileService),
    __param(5, IStorageService),
    __param(6, IThemeService),
    __param(7, IHoverService),
    __param(8, IMenuService),
    __param(9, IContextMenuService),
    __param(10, IContextKeyService),
    __param(11, IConfigurationService),
    __param(12, IWorkbenchEnvironmentService),
    __param(13, IKeybindingService)
], ProfilesActivityActionViewItem);
export { ProfilesActivityActionViewItem };
let GlobalActivityActionViewItem = class GlobalActivityActionViewItem extends MenuActivityActionViewItem {
    constructor(action, contextMenuActionsProvider, colors, activityHoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService) {
        super(MenuId.GlobalActivity, action, contextMenuActionsProvider, true, colors, activityHoverOptions, themeService, hoverService, menuService, contextMenuService, contextKeyService, configurationService, environmentService, keybindingService);
    }
};
GlobalActivityActionViewItem = __decorate([
    __param(4, IThemeService),
    __param(5, IHoverService),
    __param(6, IMenuService),
    __param(7, IContextMenuService),
    __param(8, IContextKeyService),
    __param(9, IConfigurationService),
    __param(10, IWorkbenchEnvironmentService),
    __param(11, IKeybindingService)
], GlobalActivityActionViewItem);
export { GlobalActivityActionViewItem };
export class PlaceHolderViewContainerActivityAction extends ViewContainerActivityAction {
}
export class PlaceHolderToggleCompositePinnedAction extends ToggleCompositePinnedAction {
    constructor(id, compositeBar) {
        super({ id, name: id, cssClass: undefined }, compositeBar);
    }
    setActivity(activity) {
        this.label = activity.name;
    }
}
class SwitchSideBarViewAction extends Action2 {
    offset;
    constructor(desc, offset) {
        super(desc);
        this.offset = offset;
    }
    async run(accessor) {
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        const visibleViewletIds = paneCompositeService.getVisiblePaneCompositeIds(0 /* ViewContainerLocation.Sidebar */);
        const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
        if (!activeViewlet) {
            return;
        }
        let targetViewletId;
        for (let i = 0; i < visibleViewletIds.length; i++) {
            if (visibleViewletIds[i] === activeViewlet.getId()) {
                targetViewletId = visibleViewletIds[(i + visibleViewletIds.length + this.offset) % visibleViewletIds.length];
                break;
            }
        }
        await paneCompositeService.openPaneComposite(targetViewletId, 0 /* ViewContainerLocation.Sidebar */, true);
    }
}
registerAction2(class PreviousSideBarViewAction extends SwitchSideBarViewAction {
    constructor() {
        super({
            id: 'workbench.action.previousSideBarView',
            title: { value: localize('previousSideBarView', "Previous Primary Side Bar View"), original: 'Previous Primary Side Bar View' },
            category: Categories.View,
            f1: true
        }, -1);
    }
});
registerAction2(class NextSideBarViewAction extends SwitchSideBarViewAction {
    constructor() {
        super({
            id: 'workbench.action.nextSideBarView',
            title: { value: localize('nextSideBarView', "Next Primary Side Bar View"), original: 'Next Primary Side Bar View' },
            category: Categories.View,
            f1: true
        }, 1);
    }
});
registerAction2(class FocusActivityBarAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.focusActivityBar',
            title: { value: localize('focusActivityBar', "Focus Activity Bar"), original: 'Focus Activity Bar' },
            category: Categories.View,
            f1: true
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        layoutService.setPartHidden(false, "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
        layoutService.focusPart("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
    }
});
registerThemingParticipant((theme, collector) => {
    const activityBarForegroundColor = theme.getColor(ACTIVITY_BAR_FOREGROUND);
    if (activityBarForegroundColor) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active .action-label:not(.codicon):not(.profile-activity-item),
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .action-label:not(.codicon):not(.profile-activity-item),
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover .action-label:not(.codicon):not(.profile-activity-item) {
				background-color: ${activityBarForegroundColor} !important;
			}
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active .action-label.codicon,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .action-label.codicon,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover .action-label.codicon {
				color: ${activityBarForegroundColor} !important;
			}
		`);
    }
    const activityBarProfileBgColor = theme.getColor(ACTIVITY_BAR_PROFILE_BACKGROUND);
    if (activityBarProfileBgColor) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item .action-label.profile-activity-item,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item .action-label.profile-activity-item,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item .action-label.profile-activity-item {
				background-color: ${activityBarProfileBgColor} !important;
			}
		`);
    }
    const activityBarProfileHoverFgColor = theme.getColor(ACTIVITY_BAR_PROFILE_HOVER_FOREGROUND);
    if (activityBarProfileHoverFgColor) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active .action-label.profile-activity-item,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .action-label.profile-activity-item,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover .action-label.profile-activity-item {
				color: ${activityBarProfileHoverFgColor} !important;
			}
		`);
    }
    const activityBarActiveBorderColor = theme.getColor(ACTIVITY_BAR_ACTIVE_BORDER);
    if (activityBarActiveBorderColor) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator:before {
				border-left-color: ${activityBarActiveBorderColor};
			}
		`);
    }
    const activityBarActiveFocusBorderColor = theme.getColor(ACTIVITY_BAR_ACTIVE_FOCUS_BORDER);
    if (activityBarActiveFocusBorderColor) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus::before {
				visibility: hidden;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus .active-item-indicator:before {
				visibility: visible;
				border-left-color: ${activityBarActiveFocusBorderColor};
			}
		`);
    }
    const activityBarActiveBackgroundColor = theme.getColor(ACTIVITY_BAR_ACTIVE_BACKGROUND);
    if (activityBarActiveBackgroundColor) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator {
				z-index: 0;
				background-color: ${activityBarActiveBackgroundColor};
			}
		`);
    }
    // Styling with Outline color (e.g. high contrast theme)
    const outline = theme.getColor(activeContrastBorder);
    if (outline) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:before {
				content: "";
				position: absolute;
				top: 8px;
				left: 8px;
				height: 32px;
				width: 32px;
				z-index: 1;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.profile-activity-item:before {
				top: -6px;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:hover:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:hover:before {
				outline: 1px solid;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover:before {
				outline: 1px dashed;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator:before {
				border-left-color: ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:hover:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:hover:before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover:before {
				outline-color: ${outline};
			}
		`);
    }
    // Styling without outline color
    else {
        const focusBorderColor = theme.getColor(focusBorder);
        if (focusBorderColor) {
            collector.addRule(`
				.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator:before {
						border-left-color: ${focusBorderColor};
					}
				`);
        }
    }
});
