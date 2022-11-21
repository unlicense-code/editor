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
import { localize } from 'vs/nls';
import { IMenuService, MenuId, SubmenuItemAction, registerAction2, Action2, MenuItemAction, MenuRegistry } from 'vs/platform/actions/common/actions';
import { registerThemingParticipant, IThemeService } from 'vs/platform/theme/common/themeService';
import { getTitleBarStyle, getMenuBarVisibility } from 'vs/platform/window/common/window';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Action, SubmenuAction, Separator, ActionRunner } from 'vs/base/common/actions';
import { addDisposableListener, Dimension, EventType } from 'vs/base/browser/dom';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { isMacintosh, isWeb, isIOS, isNative } from 'vs/base/common/platform';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Emitter } from 'vs/base/common/event';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { isRecentFolder, isRecentWorkspace, IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { RunOnceScheduler } from 'vs/base/common/async';
import { MENUBAR_SELECTION_FOREGROUND, MENUBAR_SELECTION_BACKGROUND, MENUBAR_SELECTION_BORDER, TITLE_BAR_ACTIVE_FOREGROUND, TITLE_BAR_INACTIVE_FOREGROUND, ACTIVITY_BAR_FOREGROUND, ACTIVITY_BAR_INACTIVE_FOREGROUND } from 'vs/workbench/common/theme';
import { ILabelService } from 'vs/platform/label/common/label';
import { IUpdateService } from 'vs/platform/update/common/update';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { MenuBar } from 'vs/base/browser/ui/menu/menubar';
import { Direction } from 'vs/base/browser/ui/menu/menu';
import { attachMenuStyler } from 'vs/platform/theme/common/styler';
import { mnemonicMenuLabel, unmnemonicLabel } from 'vs/base/common/labels';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { isFullscreen } from 'vs/base/browser/browser';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { BrowserFeatures } from 'vs/base/browser/canIUse';
import { IsMacNativeContext, IsWebContext } from 'vs/platform/contextkey/common/contextkeys';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { OpenRecentAction } from 'vs/workbench/browser/actions/windowActions';
import { isICommandActionToggleInfo } from 'vs/platform/action/common/action';
import { createAndFillInContextMenuActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
    submenu: MenuId.MenubarFileMenu,
    title: {
        value: 'File',
        original: 'File',
        mnemonicTitle: localize({ key: 'mFile', comment: ['&& denotes a mnemonic'] }, "&&File"),
    },
    order: 1
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
    submenu: MenuId.MenubarEditMenu,
    title: {
        value: 'Edit',
        original: 'Edit',
        mnemonicTitle: localize({ key: 'mEdit', comment: ['&& denotes a mnemonic'] }, "&&Edit")
    },
    order: 2
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
    submenu: MenuId.MenubarSelectionMenu,
    title: {
        value: 'Selection',
        original: 'Selection',
        mnemonicTitle: localize({ key: 'mSelection', comment: ['&& denotes a mnemonic'] }, "&&Selection")
    },
    order: 3
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
    submenu: MenuId.MenubarViewMenu,
    title: {
        value: 'View',
        original: 'View',
        mnemonicTitle: localize({ key: 'mView', comment: ['&& denotes a mnemonic'] }, "&&View")
    },
    order: 4
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
    submenu: MenuId.MenubarGoMenu,
    title: {
        value: 'Go',
        original: 'Go',
        mnemonicTitle: localize({ key: 'mGoto', comment: ['&& denotes a mnemonic'] }, "&&Go")
    },
    order: 5
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
    submenu: MenuId.MenubarTerminalMenu,
    title: {
        value: 'Terminal',
        original: 'Terminal',
        mnemonicTitle: localize({ key: 'mTerminal', comment: ['&& denotes a mnemonic'] }, "&&Terminal")
    },
    order: 7,
    when: ContextKeyExpr.has('terminalProcessSupported')
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
    submenu: MenuId.MenubarHelpMenu,
    title: {
        value: 'Help',
        original: 'Help',
        mnemonicTitle: localize({ key: 'mHelp', comment: ['&& denotes a mnemonic'] }, "&&Help")
    },
    order: 8
});
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
    submenu: MenuId.MenubarPreferencesMenu,
    title: {
        value: 'Preferences',
        original: 'Preferences',
        mnemonicTitle: localize('mPreferences', "Preferences")
    },
    when: IsMacNativeContext,
    order: 9
});
export class MenubarControl extends Disposable {
    menuService;
    workspacesService;
    contextKeyService;
    keybindingService;
    configurationService;
    labelService;
    updateService;
    storageService;
    notificationService;
    preferencesService;
    environmentService;
    accessibilityService;
    hostService;
    commandService;
    keys = [
        'window.menuBarVisibility',
        'window.enableMenuBarMnemonics',
        'window.customMenuBarAltFocus',
        'workbench.sideBar.location',
        'window.nativeTabs'
    ];
    mainMenu;
    menus = {};
    topLevelTitles = {};
    mainMenuDisposables;
    recentlyOpened = { files: [], workspaces: [] };
    menuUpdater;
    static MAX_MENU_RECENT_ENTRIES = 10;
    constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService) {
        super();
        this.menuService = menuService;
        this.workspacesService = workspacesService;
        this.contextKeyService = contextKeyService;
        this.keybindingService = keybindingService;
        this.configurationService = configurationService;
        this.labelService = labelService;
        this.updateService = updateService;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.preferencesService = preferencesService;
        this.environmentService = environmentService;
        this.accessibilityService = accessibilityService;
        this.hostService = hostService;
        this.commandService = commandService;
        this.mainMenu = this._register(this.menuService.createMenu(MenuId.MenubarMainMenu, this.contextKeyService));
        this.mainMenuDisposables = this._register(new DisposableStore());
        this.setupMainMenu();
        this.menuUpdater = this._register(new RunOnceScheduler(() => this.doUpdateMenubar(false), 200));
        this.notifyUserOfCustomMenubarAccessibility();
    }
    registerListeners() {
        // Listen for window focus changes
        this._register(this.hostService.onDidChangeFocus(e => this.onDidChangeWindowFocus(e)));
        // Update when config changes
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
        // Listen to update service
        this.updateService.onStateChange(() => this.onUpdateStateChange());
        // Listen for changes in recently opened menu
        this._register(this.workspacesService.onDidChangeRecentlyOpened(() => { this.onDidChangeRecentlyOpened(); }));
        // Listen to keybindings change
        this._register(this.keybindingService.onDidUpdateKeybindings(() => this.updateMenubar()));
        // Update recent menu items on formatter registration
        this._register(this.labelService.onDidChangeFormatters(() => { this.onDidChangeRecentlyOpened(); }));
        // Listen for changes on the main menu
        this._register(this.mainMenu.onDidChange(() => { this.setupMainMenu(); this.doUpdateMenubar(true); }));
    }
    setupMainMenu() {
        this.mainMenuDisposables.clear();
        this.menus = {};
        this.topLevelTitles = {};
        const [, mainMenuActions] = this.mainMenu.getActions()[0];
        for (const mainMenuAction of mainMenuActions) {
            if (mainMenuAction instanceof SubmenuItemAction && typeof mainMenuAction.item.title !== 'string') {
                this.menus[mainMenuAction.item.title.original] = this.mainMenuDisposables.add(this.menuService.createMenu(mainMenuAction.item.submenu, this.contextKeyService, { emitEventsForSubmenuChanges: true }));
                this.topLevelTitles[mainMenuAction.item.title.original] = mainMenuAction.item.title.mnemonicTitle ?? mainMenuAction.item.title.value;
            }
        }
    }
    updateMenubar() {
        this.menuUpdater.schedule();
    }
    calculateActionLabel(action) {
        const label = action.label;
        switch (action.id) {
            default:
                break;
        }
        return label;
    }
    onUpdateStateChange() {
        this.updateMenubar();
    }
    onUpdateKeybindings() {
        this.updateMenubar();
    }
    getOpenRecentActions() {
        if (!this.recentlyOpened) {
            return [];
        }
        const { workspaces, files } = this.recentlyOpened;
        const result = [];
        if (workspaces.length > 0) {
            for (let i = 0; i < MenubarControl.MAX_MENU_RECENT_ENTRIES && i < workspaces.length; i++) {
                result.push(this.createOpenRecentMenuAction(workspaces[i]));
            }
            result.push(new Separator());
        }
        if (files.length > 0) {
            for (let i = 0; i < MenubarControl.MAX_MENU_RECENT_ENTRIES && i < files.length; i++) {
                result.push(this.createOpenRecentMenuAction(files[i]));
            }
            result.push(new Separator());
        }
        return result;
    }
    onDidChangeWindowFocus(hasFocus) {
        // When we regain focus, update the recent menu items
        if (hasFocus) {
            this.onDidChangeRecentlyOpened();
        }
    }
    onConfigurationUpdated(event) {
        if (this.keys.some(key => event.affectsConfiguration(key))) {
            this.updateMenubar();
        }
        if (event.affectsConfiguration('editor.accessibilitySupport')) {
            this.notifyUserOfCustomMenubarAccessibility();
        }
        // Since we try not update when hidden, we should
        // try to update the recently opened list on visibility changes
        if (event.affectsConfiguration('window.menuBarVisibility')) {
            this.onDidChangeRecentlyOpened();
        }
    }
    get menubarHidden() {
        return isMacintosh && isNative ? false : getMenuBarVisibility(this.configurationService) === 'hidden';
    }
    onDidChangeRecentlyOpened() {
        // Do not update recently opened when the menubar is hidden #108712
        if (!this.menubarHidden) {
            this.workspacesService.getRecentlyOpened().then(recentlyOpened => {
                this.recentlyOpened = recentlyOpened;
                this.updateMenubar();
            });
        }
    }
    createOpenRecentMenuAction(recent) {
        let label;
        let uri;
        let commandId;
        let openable;
        const remoteAuthority = recent.remoteAuthority;
        if (isRecentFolder(recent)) {
            uri = recent.folderUri;
            label = recent.label || this.labelService.getWorkspaceLabel(uri, { verbose: true });
            commandId = 'openRecentFolder';
            openable = { folderUri: uri };
        }
        else if (isRecentWorkspace(recent)) {
            uri = recent.workspace.configPath;
            label = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: true });
            commandId = 'openRecentWorkspace';
            openable = { workspaceUri: uri };
        }
        else {
            uri = recent.fileUri;
            label = recent.label || this.labelService.getUriLabel(uri);
            commandId = 'openRecentFile';
            openable = { fileUri: uri };
        }
        const ret = new Action(commandId, unmnemonicLabel(label), undefined, undefined, event => {
            const browserEvent = event;
            const openInNewWindow = event && ((!isMacintosh && (browserEvent.ctrlKey || browserEvent.shiftKey)) || (isMacintosh && (browserEvent.metaKey || browserEvent.altKey)));
            return this.hostService.openWindow([openable], {
                forceNewWindow: !!openInNewWindow,
                remoteAuthority: remoteAuthority || null // local window if remoteAuthority is not set or can not be deducted from the openable
            });
        });
        return Object.assign(ret, { uri, remoteAuthority });
    }
    notifyUserOfCustomMenubarAccessibility() {
        if (isWeb || isMacintosh) {
            return;
        }
        const hasBeenNotified = this.storageService.getBoolean('menubar/accessibleMenubarNotified', -1 /* StorageScope.APPLICATION */, false);
        const usingCustomMenubar = getTitleBarStyle(this.configurationService) === 'custom';
        if (hasBeenNotified || usingCustomMenubar || !this.accessibilityService.isScreenReaderOptimized()) {
            return;
        }
        const message = localize('menubar.customTitlebarAccessibilityNotification', "Accessibility support is enabled for you. For the most accessible experience, we recommend the custom title bar style.");
        this.notificationService.prompt(Severity.Info, message, [
            {
                label: localize('goToSetting', "Open Settings"),
                run: () => {
                    return this.preferencesService.openUserSettings({ query: 'window.titleBarStyle' });
                }
            }
        ]);
        this.storageService.store('menubar/accessibleMenubarNotified', true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
    }
}
let CustomMenubarControl = class CustomMenubarControl extends MenubarControl {
    themeService;
    layoutService;
    telemetryService;
    menubar;
    container;
    alwaysOnMnemonics = false;
    focusInsideMenubar = false;
    pendingFirstTimeUpdate = false;
    visible = true;
    actionRunner;
    webNavigationMenu = this._register(this.menuService.createMenu(MenuId.MenubarHomeMenu, this.contextKeyService));
    _onVisibilityChange;
    _onFocusStateChange;
    constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, themeService, layoutService, telemetryService, hostService, commandService) {
        super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
        this.themeService = themeService;
        this.layoutService = layoutService;
        this.telemetryService = telemetryService;
        this._onVisibilityChange = this._register(new Emitter());
        this._onFocusStateChange = this._register(new Emitter());
        this.actionRunner = this._register(new ActionRunner());
        this.actionRunner.onDidRun(e => {
            this.telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'menu' });
        });
        this.workspacesService.getRecentlyOpened().then((recentlyOpened) => {
            this.recentlyOpened = recentlyOpened;
        });
        this.registerListeners();
        this.registerActions();
        registerThemingParticipant((theme, collector) => {
            const menubarActiveWindowFgColor = theme.getColor(TITLE_BAR_ACTIVE_FOREGROUND);
            if (menubarActiveWindowFgColor) {
                collector.addRule(`
				.monaco-workbench .menubar > .menubar-menu-button,
				.monaco-workbench .menubar .toolbar-toggle-more {
					color: ${menubarActiveWindowFgColor};
				}
				`);
            }
            const activityBarInactiveFgColor = theme.getColor(ACTIVITY_BAR_INACTIVE_FOREGROUND);
            if (activityBarInactiveFgColor) {
                collector.addRule(`
				.monaco-workbench .activitybar .menubar.compact > .menubar-menu-button,
				.monaco-workbench .activitybar .menubar.compact .toolbar-toggle-more {
					color: ${activityBarInactiveFgColor};
				}
				`);
            }
            const activityBarFgColor = theme.getColor(ACTIVITY_BAR_FOREGROUND);
            if (activityBarFgColor) {
                collector.addRule(`
				.monaco-workbench .activitybar .menubar.compact > .menubar-menu-button.open,
				.monaco-workbench .activitybar .menubar.compact > .menubar-menu-button:focus,
				.monaco-workbench .activitybar .menubar.compact:not(:focus-within) > .menubar-menu-button:hover,
				.monaco-workbench .activitybar .menubar.compact  > .menubar-menu-button.open .toolbar-toggle-more,
				.monaco-workbench .activitybar .menubar.compact > .menubar-menu-button:focus .toolbar-toggle-more,
				.monaco-workbench .activitybar .menubar.compact:not(:focus-within) > .menubar-menu-button:hover .toolbar-toggle-more {
					color: ${activityBarFgColor};
				}
			`);
            }
            const menubarInactiveWindowFgColor = theme.getColor(TITLE_BAR_INACTIVE_FOREGROUND);
            if (menubarInactiveWindowFgColor) {
                collector.addRule(`
					.monaco-workbench .menubar.inactive:not(.compact) > .menubar-menu-button,
					.monaco-workbench .menubar.inactive:not(.compact) > .menubar-menu-button .toolbar-toggle-more  {
						color: ${menubarInactiveWindowFgColor};
					}
				`);
            }
            const menubarSelectedFgColor = theme.getColor(MENUBAR_SELECTION_FOREGROUND);
            if (menubarSelectedFgColor) {
                collector.addRule(`
					.monaco-workbench .menubar:not(.compact) > .menubar-menu-button.open,
					.monaco-workbench .menubar:not(.compact) > .menubar-menu-button:focus,
					.monaco-workbench .menubar:not(:focus-within):not(.compact) > .menubar-menu-button:hover,
					.monaco-workbench .menubar:not(.compact) > .menubar-menu-button.open .toolbar-toggle-more,
					.monaco-workbench .menubar:not(.compact) > .menubar-menu-button:focus .toolbar-toggle-more,
					.monaco-workbench .menubar:not(:focus-within):not(.compact) > .menubar-menu-button:hover .toolbar-toggle-more {
						color: ${menubarSelectedFgColor};
					}
				`);
            }
            const menubarSelectedBgColor = theme.getColor(MENUBAR_SELECTION_BACKGROUND);
            if (menubarSelectedBgColor) {
                collector.addRule(`
					.monaco-workbench .menubar:not(.compact) > .menubar-menu-button.open .menubar-menu-title,
					.monaco-workbench .menubar:not(.compact) > .menubar-menu-button:focus .menubar-menu-title,
					.monaco-workbench .menubar:not(:focus-within):not(.compact) > .menubar-menu-button:hover .menubar-menu-title {
						background-color: ${menubarSelectedBgColor};
					}
				`);
            }
            const menubarSelectedBorderColor = theme.getColor(MENUBAR_SELECTION_BORDER);
            if (menubarSelectedBorderColor) {
                collector.addRule(`
					.monaco-workbench .menubar > .menubar-menu-button:hover .menubar-menu-title  {
						outline: dashed 1px;
					}

					.monaco-workbench .menubar > .menubar-menu-button.open .menubar-menu-title,
					.monaco-workbench .menubar > .menubar-menu-button:focus .menubar-menu-title {
						outline: solid 1px;
					}

					.monaco-workbench .menubar > .menubar-menu-button.open .menubar-menu-title,
					.monaco-workbench .menubar > .menubar-menu-button:focus .menubar-menu-title,
					.monaco-workbench .menubar > .menubar-menu-button:hover .menubar-menu-title {
						outline-color: ${menubarSelectedBorderColor};
						outline-offset: -1px;
					}
				`);
            }
        });
    }
    doUpdateMenubar(firstTime) {
        if (!this.focusInsideMenubar) {
            this.setupCustomMenubar(firstTime);
        }
        if (firstTime) {
            this.pendingFirstTimeUpdate = true;
        }
    }
    registerActions() {
        const that = this;
        if (isWeb) {
            this._register(registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.menubar.focus`,
                        title: { value: localize('focusMenu', "Focus Application Menu"), original: 'Focus Application Menu' },
                        keybinding: {
                            primary: 68 /* KeyCode.F10 */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: IsWebContext
                        },
                        f1: true
                    });
                }
                async run() {
                    that.menubar?.toggleFocus();
                }
            }));
        }
    }
    getUpdateAction() {
        const state = this.updateService.state;
        switch (state.type) {
            case "uninitialized" /* StateType.Uninitialized */:
                return null;
            case "idle" /* StateType.Idle */:
                return new Action('update.check', localize({ key: 'checkForUpdates', comment: ['&& denotes a mnemonic'] }, "Check for &&Updates..."), undefined, true, () => this.updateService.checkForUpdates(true));
            case "checking for updates" /* StateType.CheckingForUpdates */:
                return new Action('update.checking', localize('checkingForUpdates', "Checking for Updates..."), undefined, false);
            case "available for download" /* StateType.AvailableForDownload */:
                return new Action('update.downloadNow', localize({ key: 'download now', comment: ['&& denotes a mnemonic'] }, "D&&ownload Update"), undefined, true, () => this.updateService.downloadUpdate());
            case "downloading" /* StateType.Downloading */:
                return new Action('update.downloading', localize('DownloadingUpdate', "Downloading Update..."), undefined, false);
            case "downloaded" /* StateType.Downloaded */:
                return new Action('update.install', localize({ key: 'installUpdate...', comment: ['&& denotes a mnemonic'] }, "Install &&Update..."), undefined, true, () => this.updateService.applyUpdate());
            case "updating" /* StateType.Updating */:
                return new Action('update.updating', localize('installingUpdate', "Installing Update..."), undefined, false);
            case "ready" /* StateType.Ready */:
                return new Action('update.restart', localize({ key: 'restartToUpdate', comment: ['&& denotes a mnemonic'] }, "Restart to &&Update"), undefined, true, () => this.updateService.quitAndInstall());
        }
    }
    get currentMenubarVisibility() {
        return getMenuBarVisibility(this.configurationService);
    }
    get currentDisableMenuBarAltFocus() {
        const settingValue = this.configurationService.getValue('window.customMenuBarAltFocus');
        let disableMenuBarAltBehavior = false;
        if (typeof settingValue === 'boolean') {
            disableMenuBarAltBehavior = !settingValue;
        }
        return disableMenuBarAltBehavior;
    }
    insertActionsBefore(nextAction, target) {
        switch (nextAction.id) {
            case OpenRecentAction.ID:
                target.push(...this.getOpenRecentActions());
                break;
            case 'workbench.action.showAboutDialog':
                if (!isMacintosh && !isWeb) {
                    const updateAction = this.getUpdateAction();
                    if (updateAction) {
                        updateAction.label = mnemonicMenuLabel(updateAction.label);
                        target.push(updateAction);
                        target.push(new Separator());
                    }
                }
                break;
            default:
                break;
        }
    }
    get currentEnableMenuBarMnemonics() {
        let enableMenuBarMnemonics = this.configurationService.getValue('window.enableMenuBarMnemonics');
        if (typeof enableMenuBarMnemonics !== 'boolean') {
            enableMenuBarMnemonics = true;
        }
        return enableMenuBarMnemonics && (!isWeb || isFullscreen());
    }
    get currentCompactMenuMode() {
        if (this.currentMenubarVisibility !== 'compact') {
            return undefined;
        }
        // Menu bar lives in activity bar and should flow based on its location
        const currentSidebarLocation = this.configurationService.getValue('workbench.sideBar.location');
        return currentSidebarLocation === 'right' ? Direction.Left : Direction.Right;
    }
    onDidVisibilityChange(visible) {
        this.visible = visible;
        this.onDidChangeRecentlyOpened();
        this._onVisibilityChange.fire(visible);
    }
    toActionsArray(menu) {
        const result = [];
        createAndFillInContextMenuActions(menu, { shouldForwardArgs: true }, result);
        return result;
    }
    reinstallDisposables = this._register(new DisposableStore());
    setupCustomMenubar(firstTime) {
        // If there is no container, we cannot setup the menubar
        if (!this.container) {
            return;
        }
        if (firstTime) {
            // Reset and create new menubar
            if (this.menubar) {
                this.reinstallDisposables.clear();
            }
            this.menubar = this.reinstallDisposables.add(new MenuBar(this.container, this.getMenuBarOptions()));
            this.accessibilityService.alwaysUnderlineAccessKeys().then(val => {
                this.alwaysOnMnemonics = val;
                this.menubar?.update(this.getMenuBarOptions());
            });
            this.reinstallDisposables.add(this.menubar.onFocusStateChange(focused => {
                this._onFocusStateChange.fire(focused);
                // When the menubar loses focus, update it to clear any pending updates
                if (!focused) {
                    if (this.pendingFirstTimeUpdate) {
                        this.setupCustomMenubar(true);
                        this.pendingFirstTimeUpdate = false;
                    }
                    else {
                        this.updateMenubar();
                    }
                    this.focusInsideMenubar = false;
                }
            }));
            this.reinstallDisposables.add(this.menubar.onVisibilityChange(e => this.onDidVisibilityChange(e)));
            // Before we focus the menubar, stop updates to it so that focus-related context keys will work
            this.reinstallDisposables.add(addDisposableListener(this.container, EventType.FOCUS_IN, () => {
                this.focusInsideMenubar = true;
            }));
            this.reinstallDisposables.add(addDisposableListener(this.container, EventType.FOCUS_OUT, () => {
                this.focusInsideMenubar = false;
            }));
            this.reinstallDisposables.add(attachMenuStyler(this.menubar, this.themeService));
            // Fire visibility change for the first install if menu is shown
            if (this.menubar.isVisible) {
                this.onDidVisibilityChange(true);
            }
        }
        else {
            this.menubar?.update(this.getMenuBarOptions());
        }
        // Update the menu actions
        const updateActions = (menuActions, target, topLevelTitle) => {
            target.splice(0);
            for (const menuItem of menuActions) {
                this.insertActionsBefore(menuItem, target);
                if (menuItem instanceof Separator) {
                    target.push(menuItem);
                }
                else if (menuItem instanceof SubmenuItemAction || menuItem instanceof MenuItemAction) {
                    // use mnemonicTitle whenever possible
                    let title = typeof menuItem.item.title === 'string'
                        ? menuItem.item.title
                        : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
                    if (menuItem instanceof SubmenuItemAction) {
                        const submenuActions = [];
                        updateActions(menuItem.actions, submenuActions, topLevelTitle);
                        if (submenuActions.length > 0) {
                            target.push(new SubmenuAction(menuItem.id, mnemonicMenuLabel(title), submenuActions));
                        }
                    }
                    else {
                        if (isICommandActionToggleInfo(menuItem.item.toggled)) {
                            title = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
                        }
                        const newAction = new Action(menuItem.id, mnemonicMenuLabel(title), menuItem.class, menuItem.enabled, () => this.commandService.executeCommand(menuItem.id));
                        newAction.tooltip = menuItem.tooltip;
                        newAction.checked = menuItem.checked;
                        target.push(newAction);
                    }
                }
            }
            // Append web navigation menu items to the file menu when not compact
            if (topLevelTitle === 'File' && this.currentCompactMenuMode === undefined) {
                const webActions = this.getWebNavigationActions();
                if (webActions.length) {
                    target.push(...webActions);
                }
            }
        };
        for (const title of Object.keys(this.topLevelTitles)) {
            const menu = this.menus[title];
            if (firstTime && menu) {
                this.reinstallDisposables.add(menu.onDidChange(() => {
                    if (!this.focusInsideMenubar) {
                        const actions = [];
                        updateActions(this.toActionsArray(menu), actions, title);
                        this.menubar?.updateMenu({ actions: actions, label: mnemonicMenuLabel(this.topLevelTitles[title]) });
                    }
                }));
                // For the file menu, we need to update if the web nav menu updates as well
                if (menu === this.menus.File) {
                    this.reinstallDisposables.add(this.webNavigationMenu.onDidChange(() => {
                        if (!this.focusInsideMenubar) {
                            const actions = [];
                            updateActions(this.toActionsArray(menu), actions, title);
                            this.menubar?.updateMenu({ actions: actions, label: mnemonicMenuLabel(this.topLevelTitles[title]) });
                        }
                    }));
                }
            }
            const actions = [];
            if (menu) {
                updateActions(this.toActionsArray(menu), actions, title);
            }
            if (this.menubar) {
                if (!firstTime) {
                    this.menubar.updateMenu({ actions: actions, label: mnemonicMenuLabel(this.topLevelTitles[title]) });
                }
                else {
                    this.menubar.push({ actions: actions, label: mnemonicMenuLabel(this.topLevelTitles[title]) });
                }
            }
        }
    }
    getWebNavigationActions() {
        if (!isWeb) {
            return []; // only for web
        }
        const webNavigationActions = [];
        for (const groups of this.webNavigationMenu.getActions()) {
            const [, actions] = groups;
            for (const action of actions) {
                if (action instanceof MenuItemAction) {
                    const title = typeof action.item.title === 'string'
                        ? action.item.title
                        : action.item.title.mnemonicTitle ?? action.item.title.value;
                    webNavigationActions.push(new Action(action.id, mnemonicMenuLabel(title), action.class, action.enabled, async (event) => {
                        this.commandService.executeCommand(action.id, event);
                    }));
                }
            }
            webNavigationActions.push(new Separator());
        }
        if (webNavigationActions.length) {
            webNavigationActions.pop();
        }
        return webNavigationActions;
    }
    getMenuBarOptions() {
        return {
            enableMnemonics: this.currentEnableMenuBarMnemonics,
            disableAltFocus: this.currentDisableMenuBarAltFocus,
            visibility: this.currentMenubarVisibility,
            actionRunner: this.actionRunner,
            getKeybinding: (action) => this.keybindingService.lookupKeybinding(action.id),
            alwaysOnMnemonics: this.alwaysOnMnemonics,
            compactMode: this.currentCompactMenuMode,
            getCompactMenuActions: () => {
                if (!isWeb) {
                    return []; // only for web
                }
                return this.getWebNavigationActions();
            }
        };
    }
    onDidChangeWindowFocus(hasFocus) {
        if (!this.visible) {
            return;
        }
        super.onDidChangeWindowFocus(hasFocus);
        if (this.container) {
            if (hasFocus) {
                this.container.classList.remove('inactive');
            }
            else {
                this.container.classList.add('inactive');
                this.menubar?.blur();
            }
        }
    }
    onUpdateStateChange() {
        if (!this.visible) {
            return;
        }
        super.onUpdateStateChange();
    }
    onDidChangeRecentlyOpened() {
        if (!this.visible) {
            return;
        }
        super.onDidChangeRecentlyOpened();
    }
    onUpdateKeybindings() {
        if (!this.visible) {
            return;
        }
        super.onUpdateKeybindings();
    }
    registerListeners() {
        super.registerListeners();
        this._register(addDisposableListener(window, EventType.RESIZE, () => {
            if (this.menubar && !(isIOS && BrowserFeatures.pointerEvents)) {
                this.menubar.blur();
            }
        }));
        // Mnemonics require fullscreen in web
        if (isWeb) {
            this._register(this.layoutService.onDidChangeFullscreen(e => this.updateMenubar()));
            this._register(this.webNavigationMenu.onDidChange(() => this.updateMenubar()));
        }
    }
    get onVisibilityChange() {
        return this._onVisibilityChange.event;
    }
    get onFocusStateChange() {
        return this._onFocusStateChange.event;
    }
    getMenubarItemsDimensions() {
        if (this.menubar) {
            return new Dimension(this.menubar.getWidth(), this.menubar.getHeight());
        }
        return new Dimension(0, 0);
    }
    create(parent) {
        this.container = parent;
        // Build the menubar
        if (this.container) {
            this.doUpdateMenubar(true);
        }
        return this.container;
    }
    layout(dimension) {
        this.menubar?.update(this.getMenuBarOptions());
    }
    toggleFocus() {
        this.menubar?.toggleFocus();
    }
};
CustomMenubarControl = __decorate([
    __param(0, IMenuService),
    __param(1, IWorkspacesService),
    __param(2, IContextKeyService),
    __param(3, IKeybindingService),
    __param(4, IConfigurationService),
    __param(5, ILabelService),
    __param(6, IUpdateService),
    __param(7, IStorageService),
    __param(8, INotificationService),
    __param(9, IPreferencesService),
    __param(10, IWorkbenchEnvironmentService),
    __param(11, IAccessibilityService),
    __param(12, IThemeService),
    __param(13, IWorkbenchLayoutService),
    __param(14, ITelemetryService),
    __param(15, IHostService),
    __param(16, ICommandService)
], CustomMenubarControl);
export { CustomMenubarControl };
