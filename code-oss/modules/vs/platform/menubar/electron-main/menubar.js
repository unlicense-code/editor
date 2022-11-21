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
import { app, BrowserWindow, Menu, MenuItem } from 'electron';
import { RunOnceScheduler } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { mnemonicButtonLabel, mnemonicMenuLabel } from 'vs/base/common/labels';
import { isMacintosh, language } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import * as nls from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { isMenubarMenuItemAction, isMenubarMenuItemRecentAction, isMenubarMenuItemSeparator, isMenubarMenuItemSubmenu } from 'vs/platform/menubar/common/menubar';
import { INativeHostMainService } from 'vs/platform/native/electron-main/nativeHostMainService';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUpdateService } from 'vs/platform/update/common/update';
import { getTitleBarStyle } from 'vs/platform/window/common/window';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { IWorkspacesHistoryMainService } from 'vs/platform/workspaces/electron-main/workspacesHistoryMainService';
const telemetryFrom = 'menu';
let Menubar = class Menubar {
    updateService;
    configurationService;
    windowsMainService;
    environmentMainService;
    telemetryService;
    workspacesHistoryMainService;
    stateMainService;
    lifecycleMainService;
    logService;
    nativeHostMainService;
    productService;
    static lastKnownMenubarStorageKey = 'lastKnownMenubarData';
    willShutdown;
    appMenuInstalled;
    closedLastWindow;
    noActiveWindow;
    menuUpdater;
    menuGC;
    // Array to keep menus around so that GC doesn't cause crash as explained in #55347
    // TODO@sbatten Remove this when fixed upstream by Electron
    oldMenus;
    menubarMenus;
    keybindings;
    fallbackMenuHandlers = Object.create(null);
    constructor(updateService, configurationService, windowsMainService, environmentMainService, telemetryService, workspacesHistoryMainService, stateMainService, lifecycleMainService, logService, nativeHostMainService, productService) {
        this.updateService = updateService;
        this.configurationService = configurationService;
        this.windowsMainService = windowsMainService;
        this.environmentMainService = environmentMainService;
        this.telemetryService = telemetryService;
        this.workspacesHistoryMainService = workspacesHistoryMainService;
        this.stateMainService = stateMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.logService = logService;
        this.nativeHostMainService = nativeHostMainService;
        this.productService = productService;
        this.menuUpdater = new RunOnceScheduler(() => this.doUpdateMenu(), 0);
        this.menuGC = new RunOnceScheduler(() => { this.oldMenus = []; }, 10000);
        this.menubarMenus = Object.create(null);
        this.keybindings = Object.create(null);
        if (isMacintosh || getTitleBarStyle(this.configurationService) === 'native') {
            this.restoreCachedMenubarData();
        }
        this.addFallbackHandlers();
        this.closedLastWindow = false;
        this.noActiveWindow = false;
        this.oldMenus = [];
        this.install();
        this.registerListeners();
    }
    restoreCachedMenubarData() {
        const menubarData = this.stateMainService.getItem(Menubar.lastKnownMenubarStorageKey);
        if (menubarData) {
            if (menubarData.menus) {
                this.menubarMenus = menubarData.menus;
            }
            if (menubarData.keybindings) {
                this.keybindings = menubarData.keybindings;
            }
        }
    }
    addFallbackHandlers() {
        // File Menu Items
        this.fallbackMenuHandlers['workbench.action.files.newUntitledFile'] = (menuItem, win, event) => this.windowsMainService.openEmptyWindow({ context: 2 /* OpenContext.MENU */, contextWindowId: win?.id });
        this.fallbackMenuHandlers['workbench.action.newWindow'] = (menuItem, win, event) => this.windowsMainService.openEmptyWindow({ context: 2 /* OpenContext.MENU */, contextWindowId: win?.id });
        this.fallbackMenuHandlers['workbench.action.files.openFileFolder'] = (menuItem, win, event) => this.nativeHostMainService.pickFileFolderAndOpen(undefined, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
        this.fallbackMenuHandlers['workbench.action.files.openFolder'] = (menuItem, win, event) => this.nativeHostMainService.pickFolderAndOpen(undefined, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
        this.fallbackMenuHandlers['workbench.action.openWorkspace'] = (menuItem, win, event) => this.nativeHostMainService.pickWorkspaceAndOpen(undefined, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
        // Recent Menu Items
        this.fallbackMenuHandlers['workbench.action.clearRecentFiles'] = () => this.workspacesHistoryMainService.clearRecentlyOpened();
        // Help Menu Items
        const twitterUrl = this.productService.twitterUrl;
        if (twitterUrl) {
            this.fallbackMenuHandlers['workbench.action.openTwitterUrl'] = () => this.openUrl(twitterUrl, 'openTwitterUrl');
        }
        const requestFeatureUrl = this.productService.requestFeatureUrl;
        if (requestFeatureUrl) {
            this.fallbackMenuHandlers['workbench.action.openRequestFeatureUrl'] = () => this.openUrl(requestFeatureUrl, 'openUserVoiceUrl');
        }
        const reportIssueUrl = this.productService.reportIssueUrl;
        if (reportIssueUrl) {
            this.fallbackMenuHandlers['workbench.action.openIssueReporter'] = () => this.openUrl(reportIssueUrl, 'openReportIssues');
        }
        const licenseUrl = this.productService.licenseUrl;
        if (licenseUrl) {
            this.fallbackMenuHandlers['workbench.action.openLicenseUrl'] = () => {
                if (language) {
                    const queryArgChar = licenseUrl.indexOf('?') > 0 ? '&' : '?';
                    this.openUrl(`${licenseUrl}${queryArgChar}lang=${language}`, 'openLicenseUrl');
                }
                else {
                    this.openUrl(licenseUrl, 'openLicenseUrl');
                }
            };
        }
        const privacyStatementUrl = this.productService.privacyStatementUrl;
        if (privacyStatementUrl && licenseUrl) {
            this.fallbackMenuHandlers['workbench.action.openPrivacyStatementUrl'] = () => {
                this.openUrl(privacyStatementUrl, 'openPrivacyStatement');
            };
        }
    }
    registerListeners() {
        // Keep flag when app quits
        this.lifecycleMainService.onWillShutdown(() => this.willShutdown = true);
        // Listen to some events from window service to update menu
        this.windowsMainService.onDidChangeWindowsCount(e => this.onDidChangeWindowsCount(e));
        this.nativeHostMainService.onDidBlurWindow(() => this.onDidChangeWindowFocus());
        this.nativeHostMainService.onDidFocusWindow(() => this.onDidChangeWindowFocus());
    }
    get currentEnableMenuBarMnemonics() {
        const enableMenuBarMnemonics = this.configurationService.getValue('window.enableMenuBarMnemonics');
        if (typeof enableMenuBarMnemonics !== 'boolean') {
            return true;
        }
        return enableMenuBarMnemonics;
    }
    get currentEnableNativeTabs() {
        if (!isMacintosh) {
            return false;
        }
        const enableNativeTabs = this.configurationService.getValue('window.nativeTabs');
        if (typeof enableNativeTabs !== 'boolean') {
            return false;
        }
        return enableNativeTabs;
    }
    updateMenu(menubarData, windowId) {
        this.menubarMenus = menubarData.menus;
        this.keybindings = menubarData.keybindings;
        // Save off new menu and keybindings
        this.stateMainService.setItem(Menubar.lastKnownMenubarStorageKey, menubarData);
        this.scheduleUpdateMenu();
    }
    scheduleUpdateMenu() {
        this.menuUpdater.schedule(); // buffer multiple attempts to update the menu
    }
    doUpdateMenu() {
        // Due to limitations in Electron, it is not possible to update menu items dynamically. The suggested
        // workaround from Electron is to set the application menu again.
        // See also https://github.com/electron/electron/issues/846
        //
        // Run delayed to prevent updating menu while it is open
        if (!this.willShutdown) {
            setTimeout(() => {
                if (!this.willShutdown) {
                    this.install();
                }
            }, 10 /* delay this because there is an issue with updating a menu when it is open */);
        }
    }
    onDidChangeWindowsCount(e) {
        if (!isMacintosh) {
            return;
        }
        // Update menu if window count goes from N > 0 or 0 > N to update menu item enablement
        if ((e.oldCount === 0 && e.newCount > 0) || (e.oldCount > 0 && e.newCount === 0)) {
            this.closedLastWindow = e.newCount === 0;
            this.scheduleUpdateMenu();
        }
    }
    onDidChangeWindowFocus() {
        if (!isMacintosh) {
            return;
        }
        this.noActiveWindow = !BrowserWindow.getFocusedWindow();
        this.scheduleUpdateMenu();
    }
    install() {
        // Store old menu in our array to avoid GC to collect the menu and crash. See #55347
        // TODO@sbatten Remove this when fixed upstream by Electron
        const oldMenu = Menu.getApplicationMenu();
        if (oldMenu) {
            this.oldMenus.push(oldMenu);
        }
        // If we don't have a menu yet, set it to null to avoid the electron menu.
        // This should only happen on the first launch ever
        if (Object.keys(this.menubarMenus).length === 0) {
            Menu.setApplicationMenu(isMacintosh ? new Menu() : null);
            return;
        }
        // Menus
        const menubar = new Menu();
        // Mac: Application
        let macApplicationMenuItem;
        if (isMacintosh) {
            const applicationMenu = new Menu();
            macApplicationMenuItem = new MenuItem({ label: this.productService.nameShort, submenu: applicationMenu });
            this.setMacApplicationMenu(applicationMenu);
            menubar.append(macApplicationMenuItem);
        }
        // Mac: Dock
        if (isMacintosh && !this.appMenuInstalled) {
            this.appMenuInstalled = true;
            const dockMenu = new Menu();
            dockMenu.append(new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miNewWindow', comment: ['&& denotes a mnemonic'] }, "New &&Window")), click: () => this.windowsMainService.openEmptyWindow({ context: 1 /* OpenContext.DOCK */ }) }));
            app.dock.setMenu(dockMenu);
        }
        // File
        if (this.shouldDrawMenu('File')) {
            const fileMenu = new Menu();
            const fileMenuItem = new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mFile', comment: ['&& denotes a mnemonic'] }, "&&File")), submenu: fileMenu });
            this.setMenuById(fileMenu, 'File');
            menubar.append(fileMenuItem);
        }
        // Edit
        if (this.shouldDrawMenu('Edit')) {
            const editMenu = new Menu();
            const editMenuItem = new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mEdit', comment: ['&& denotes a mnemonic'] }, "&&Edit")), submenu: editMenu });
            this.setMenuById(editMenu, 'Edit');
            menubar.append(editMenuItem);
        }
        // Selection
        if (this.shouldDrawMenu('Selection')) {
            const selectionMenu = new Menu();
            const selectionMenuItem = new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mSelection', comment: ['&& denotes a mnemonic'] }, "&&Selection")), submenu: selectionMenu });
            this.setMenuById(selectionMenu, 'Selection');
            menubar.append(selectionMenuItem);
        }
        // View
        if (this.shouldDrawMenu('View')) {
            const viewMenu = new Menu();
            const viewMenuItem = new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mView', comment: ['&& denotes a mnemonic'] }, "&&View")), submenu: viewMenu });
            this.setMenuById(viewMenu, 'View');
            menubar.append(viewMenuItem);
        }
        // Go
        if (this.shouldDrawMenu('Go')) {
            const gotoMenu = new Menu();
            const gotoMenuItem = new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mGoto', comment: ['&& denotes a mnemonic'] }, "&&Go")), submenu: gotoMenu });
            this.setMenuById(gotoMenu, 'Go');
            menubar.append(gotoMenuItem);
        }
        // Debug
        if (this.shouldDrawMenu('Run')) {
            const debugMenu = new Menu();
            const debugMenuItem = new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mRun', comment: ['&& denotes a mnemonic'] }, "&&Run")), submenu: debugMenu });
            this.setMenuById(debugMenu, 'Run');
            menubar.append(debugMenuItem);
        }
        // Terminal
        if (this.shouldDrawMenu('Terminal')) {
            const terminalMenu = new Menu();
            const terminalMenuItem = new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mTerminal', comment: ['&& denotes a mnemonic'] }, "&&Terminal")), submenu: terminalMenu });
            this.setMenuById(terminalMenu, 'Terminal');
            menubar.append(terminalMenuItem);
        }
        // Mac: Window
        let macWindowMenuItem;
        if (this.shouldDrawMenu('Window')) {
            const windowMenu = new Menu();
            macWindowMenuItem = new MenuItem({ label: this.mnemonicLabel(nls.localize('mWindow', "Window")), submenu: windowMenu, role: 'window' });
            this.setMacWindowMenu(windowMenu);
        }
        if (macWindowMenuItem) {
            menubar.append(macWindowMenuItem);
        }
        // Help
        if (this.shouldDrawMenu('Help')) {
            const helpMenu = new Menu();
            const helpMenuItem = new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'mHelp', comment: ['&& denotes a mnemonic'] }, "&&Help")), submenu: helpMenu, role: 'help' });
            this.setMenuById(helpMenu, 'Help');
            menubar.append(helpMenuItem);
        }
        if (menubar.items && menubar.items.length > 0) {
            Menu.setApplicationMenu(menubar);
        }
        else {
            Menu.setApplicationMenu(null);
        }
        // Dispose of older menus after some time
        this.menuGC.schedule();
    }
    setMacApplicationMenu(macApplicationMenu) {
        const about = this.createMenuItem(nls.localize('mAbout', "About {0}", this.productService.nameLong), 'workbench.action.showAboutDialog');
        const checkForUpdates = this.getUpdateMenuItems();
        let preferences;
        if (this.shouldDrawMenu('Preferences')) {
            const preferencesMenu = new Menu();
            this.setMenuById(preferencesMenu, 'Preferences');
            preferences = new MenuItem({ label: this.mnemonicLabel(nls.localize({ key: 'miPreferences', comment: ['&& denotes a mnemonic'] }, "&&Preferences")), submenu: preferencesMenu });
        }
        const servicesMenu = new Menu();
        const services = new MenuItem({ label: nls.localize('mServices', "Services"), role: 'services', submenu: servicesMenu });
        const hide = new MenuItem({ label: nls.localize('mHide', "Hide {0}", this.productService.nameLong), role: 'hide', accelerator: 'Command+H' });
        const hideOthers = new MenuItem({ label: nls.localize('mHideOthers', "Hide Others"), role: 'hideOthers', accelerator: 'Command+Alt+H' });
        const showAll = new MenuItem({ label: nls.localize('mShowAll', "Show All"), role: 'unhide' });
        const quit = new MenuItem(this.likeAction('workbench.action.quit', {
            label: nls.localize('miQuit', "Quit {0}", this.productService.nameLong), click: async (item, window, event) => {
                const lastActiveWindow = this.windowsMainService.getLastActiveWindow();
                if (this.windowsMainService.getWindowCount() === 0 || // allow to quit when no more windows are open
                    !!BrowserWindow.getFocusedWindow() || // allow to quit when window has focus (fix for https://github.com/microsoft/vscode/issues/39191)
                    lastActiveWindow?.isMinimized() // allow to quit when window has no focus but is minimized (https://github.com/microsoft/vscode/issues/63000)
                ) {
                    const confirmed = await this.confirmBeforeQuit(event);
                    if (confirmed) {
                        this.nativeHostMainService.quit(undefined);
                    }
                }
            }
        }));
        const actions = [about];
        actions.push(...checkForUpdates);
        if (preferences) {
            actions.push(...[
                __separator__(),
                preferences
            ]);
        }
        actions.push(...[
            __separator__(),
            services,
            __separator__(),
            hide,
            hideOthers,
            showAll,
            __separator__(),
            quit
        ]);
        actions.forEach(i => macApplicationMenu.append(i));
    }
    async confirmBeforeQuit(event) {
        if (this.windowsMainService.getWindowCount() === 0) {
            return true; // never confirm when no windows are opened
        }
        const confirmBeforeClose = this.configurationService.getValue('window.confirmBeforeClose');
        if (confirmBeforeClose === 'always' || (confirmBeforeClose === 'keyboardOnly' && this.isKeyboardEvent(event))) {
            const options = {
                title: this.productService.nameLong,
                type: 'question',
                buttons: [
                    mnemonicButtonLabel(nls.localize({ key: 'quit', comment: ['&& denotes a mnemonic'] }, "&&Quit")),
                    mnemonicButtonLabel(nls.localize({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&Cancel"))
                ],
                message: nls.localize('quitMessage', "Are you sure you want to quit?"),
                noLink: true,
                defaultId: 0,
                cancelId: 1
            };
            const { response } = await this.nativeHostMainService.showMessageBox(this.windowsMainService.getFocusedWindow()?.id, options);
            return response === 0;
        }
        return true;
    }
    shouldDrawMenu(menuId) {
        // We need to draw an empty menu to override the electron default
        if (!isMacintosh && getTitleBarStyle(this.configurationService) === 'custom') {
            return false;
        }
        switch (menuId) {
            case 'File':
            case 'Help':
                if (isMacintosh) {
                    return (this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow) || (this.windowsMainService.getWindowCount() > 0 && this.noActiveWindow) || (!!this.menubarMenus && !!this.menubarMenus[menuId]);
                }
            case 'Window':
                if (isMacintosh) {
                    return (this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow) || (this.windowsMainService.getWindowCount() > 0 && this.noActiveWindow) || !!this.menubarMenus;
                }
            default:
                return this.windowsMainService.getWindowCount() > 0 && (!!this.menubarMenus && !!this.menubarMenus[menuId]);
        }
    }
    setMenu(menu, items) {
        items.forEach((item) => {
            if (isMenubarMenuItemSeparator(item)) {
                menu.append(__separator__());
            }
            else if (isMenubarMenuItemSubmenu(item)) {
                const submenu = new Menu();
                const submenuItem = new MenuItem({ label: this.mnemonicLabel(item.label), submenu });
                this.setMenu(submenu, item.submenu.items);
                menu.append(submenuItem);
            }
            else if (isMenubarMenuItemRecentAction(item)) {
                menu.append(this.createOpenRecentMenuItem(item));
            }
            else if (isMenubarMenuItemAction(item)) {
                if (item.id === 'workbench.action.showAboutDialog') {
                    this.insertCheckForUpdatesItems(menu);
                }
                if (isMacintosh) {
                    if ((this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow) ||
                        (this.windowsMainService.getWindowCount() > 0 && this.noActiveWindow)) {
                        // In the fallback scenario, we are either disabled or using a fallback handler
                        if (this.fallbackMenuHandlers[item.id]) {
                            menu.append(new MenuItem(this.likeAction(item.id, { label: this.mnemonicLabel(item.label), click: this.fallbackMenuHandlers[item.id] })));
                        }
                        else {
                            menu.append(this.createMenuItem(item.label, item.id, false, item.checked));
                        }
                    }
                    else {
                        menu.append(this.createMenuItem(item.label, item.id, item.enabled === false ? false : true, !!item.checked));
                    }
                }
                else {
                    menu.append(this.createMenuItem(item.label, item.id, item.enabled === false ? false : true, !!item.checked));
                }
            }
        });
    }
    setMenuById(menu, menuId) {
        if (this.menubarMenus && this.menubarMenus[menuId]) {
            this.setMenu(menu, this.menubarMenus[menuId].items);
        }
    }
    insertCheckForUpdatesItems(menu) {
        const updateItems = this.getUpdateMenuItems();
        if (updateItems.length) {
            updateItems.forEach(i => menu.append(i));
            menu.append(__separator__());
        }
    }
    createOpenRecentMenuItem(item) {
        const revivedUri = URI.revive(item.uri);
        const commandId = item.id;
        const openable = (commandId === 'openRecentFile') ? { fileUri: revivedUri } :
            (commandId === 'openRecentWorkspace') ? { workspaceUri: revivedUri } : { folderUri: revivedUri };
        return new MenuItem(this.likeAction(commandId, {
            label: item.label,
            click: async (menuItem, win, event) => {
                const openInNewWindow = this.isOptionClick(event);
                const success = (await this.windowsMainService.open({
                    context: 2 /* OpenContext.MENU */,
                    cli: this.environmentMainService.args,
                    urisToOpen: [openable],
                    forceNewWindow: openInNewWindow,
                    gotoLineMode: false,
                    remoteAuthority: item.remoteAuthority
                })).length > 0;
                if (!success) {
                    await this.workspacesHistoryMainService.removeRecentlyOpened([revivedUri]);
                }
            }
        }, false));
    }
    isOptionClick(event) {
        return !!(event && ((!isMacintosh && (event.ctrlKey || event.shiftKey)) || (isMacintosh && (event.metaKey || event.altKey))));
    }
    isKeyboardEvent(event) {
        return !!(event.triggeredByAccelerator || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
    createRoleMenuItem(label, commandId, role) {
        const options = {
            label: this.mnemonicLabel(label),
            role,
            enabled: true
        };
        return new MenuItem(this.withKeybinding(commandId, options));
    }
    setMacWindowMenu(macWindowMenu) {
        const minimize = new MenuItem({ label: nls.localize('mMinimize', "Minimize"), role: 'minimize', accelerator: 'Command+M', enabled: this.windowsMainService.getWindowCount() > 0 });
        const zoom = new MenuItem({ label: nls.localize('mZoom', "Zoom"), role: 'zoom', enabled: this.windowsMainService.getWindowCount() > 0 });
        const bringAllToFront = new MenuItem({ label: nls.localize('mBringToFront', "Bring All to Front"), role: 'front', enabled: this.windowsMainService.getWindowCount() > 0 });
        const switchWindow = this.createMenuItem(nls.localize({ key: 'miSwitchWindow', comment: ['&& denotes a mnemonic'] }, "Switch &&Window..."), 'workbench.action.switchWindow');
        const nativeTabMenuItems = [];
        if (this.currentEnableNativeTabs) {
            nativeTabMenuItems.push(__separator__());
            nativeTabMenuItems.push(this.createMenuItem(nls.localize('mNewTab', "New Tab"), 'workbench.action.newWindowTab'));
            nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize('mShowPreviousTab', "Show Previous Tab"), 'workbench.action.showPreviousWindowTab', 'selectPreviousTab'));
            nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize('mShowNextTab', "Show Next Tab"), 'workbench.action.showNextWindowTab', 'selectNextTab'));
            nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize('mMoveTabToNewWindow', "Move Tab to New Window"), 'workbench.action.moveWindowTabToNewWindow', 'moveTabToNewWindow'));
            nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize('mMergeAllWindows', "Merge All Windows"), 'workbench.action.mergeAllWindowTabs', 'mergeAllWindows'));
        }
        [
            minimize,
            zoom,
            __separator__(),
            switchWindow,
            ...nativeTabMenuItems,
            __separator__(),
            bringAllToFront
        ].forEach(item => macWindowMenu.append(item));
    }
    getUpdateMenuItems() {
        const state = this.updateService.state;
        switch (state.type) {
            case "uninitialized" /* StateType.Uninitialized */:
                return [];
            case "idle" /* StateType.Idle */:
                return [new MenuItem({
                        label: this.mnemonicLabel(nls.localize('miCheckForUpdates', "Check for &&Updates...")), click: () => setTimeout(() => {
                            this.reportMenuActionTelemetry('CheckForUpdate');
                            this.updateService.checkForUpdates(true);
                        }, 0)
                    })];
            case "checking for updates" /* StateType.CheckingForUpdates */:
                return [new MenuItem({ label: nls.localize('miCheckingForUpdates', "Checking for Updates..."), enabled: false })];
            case "available for download" /* StateType.AvailableForDownload */:
                return [new MenuItem({
                        label: this.mnemonicLabel(nls.localize('miDownloadUpdate', "D&&ownload Available Update")), click: () => {
                            this.updateService.downloadUpdate();
                        }
                    })];
            case "downloading" /* StateType.Downloading */:
                return [new MenuItem({ label: nls.localize('miDownloadingUpdate', "Downloading Update..."), enabled: false })];
            case "downloaded" /* StateType.Downloaded */:
                return [new MenuItem({
                        label: this.mnemonicLabel(nls.localize('miInstallUpdate', "Install &&Update...")), click: () => {
                            this.reportMenuActionTelemetry('InstallUpdate');
                            this.updateService.applyUpdate();
                        }
                    })];
            case "updating" /* StateType.Updating */:
                return [new MenuItem({ label: nls.localize('miInstallingUpdate', "Installing Update..."), enabled: false })];
            case "ready" /* StateType.Ready */:
                return [new MenuItem({
                        label: this.mnemonicLabel(nls.localize('miRestartToUpdate', "Restart to &&Update")), click: () => {
                            this.reportMenuActionTelemetry('RestartToUpdate');
                            this.updateService.quitAndInstall();
                        }
                    })];
        }
    }
    createMenuItem(arg1, arg2, arg3, arg4) {
        const label = this.mnemonicLabel(arg1);
        const click = (typeof arg2 === 'function') ? arg2 : (menuItem, win, event) => {
            const userSettingsLabel = menuItem ? menuItem.userSettingsLabel : null;
            let commandId = arg2;
            if (Array.isArray(arg2)) {
                commandId = this.isOptionClick(event) ? arg2[1] : arg2[0]; // support alternative action if we got multiple action Ids and the option key was pressed while invoking
            }
            if (userSettingsLabel && event.triggeredByAccelerator) {
                this.runActionInRenderer({ type: 'keybinding', userSettingsLabel });
            }
            else {
                this.runActionInRenderer({ type: 'commandId', commandId });
            }
        };
        const enabled = typeof arg3 === 'boolean' ? arg3 : this.windowsMainService.getWindowCount() > 0;
        const checked = typeof arg4 === 'boolean' ? arg4 : false;
        const options = {
            label,
            click,
            enabled
        };
        if (checked) {
            options.type = 'checkbox';
            options.checked = checked;
        }
        let commandId;
        if (typeof arg2 === 'string') {
            commandId = arg2;
        }
        else if (Array.isArray(arg2)) {
            commandId = arg2[0];
        }
        if (isMacintosh) {
            // Add role for special case menu items
            if (commandId === 'editor.action.clipboardCutAction') {
                options.role = 'cut';
            }
            else if (commandId === 'editor.action.clipboardCopyAction') {
                options.role = 'copy';
            }
            else if (commandId === 'editor.action.clipboardPasteAction') {
                options.role = 'paste';
            }
            // Add context aware click handlers for special case menu items
            if (commandId === 'undo') {
                options.click = this.makeContextAwareClickHandler(click, {
                    inDevTools: devTools => devTools.undo(),
                    inNoWindow: () => Menu.sendActionToFirstResponder('undo:')
                });
            }
            else if (commandId === 'redo') {
                options.click = this.makeContextAwareClickHandler(click, {
                    inDevTools: devTools => devTools.redo(),
                    inNoWindow: () => Menu.sendActionToFirstResponder('redo:')
                });
            }
            else if (commandId === 'editor.action.selectAll') {
                options.click = this.makeContextAwareClickHandler(click, {
                    inDevTools: devTools => devTools.selectAll(),
                    inNoWindow: () => Menu.sendActionToFirstResponder('selectAll:')
                });
            }
        }
        return new MenuItem(this.withKeybinding(commandId, options));
    }
    makeContextAwareClickHandler(click, contextSpecificHandlers) {
        return (menuItem, win, event) => {
            // No Active Window
            const activeWindow = BrowserWindow.getFocusedWindow();
            if (!activeWindow) {
                return contextSpecificHandlers.inNoWindow();
            }
            // DevTools focused
            if (activeWindow.webContents.isDevToolsFocused() &&
                activeWindow.webContents.devToolsWebContents) {
                return contextSpecificHandlers.inDevTools(activeWindow.webContents.devToolsWebContents);
            }
            // Finally execute command in Window
            click(menuItem, win || activeWindow, event);
        };
    }
    runActionInRenderer(invocation) {
        // We make sure to not run actions when the window has no focus, this helps
        // for https://github.com/microsoft/vscode/issues/25907 and specifically for
        // https://github.com/microsoft/vscode/issues/11928
        // Still allow to run when the last active window is minimized though for
        // https://github.com/microsoft/vscode/issues/63000
        let activeBrowserWindow = BrowserWindow.getFocusedWindow();
        if (!activeBrowserWindow) {
            const lastActiveWindow = this.windowsMainService.getLastActiveWindow();
            if (lastActiveWindow?.isMinimized()) {
                activeBrowserWindow = lastActiveWindow.win;
            }
        }
        const activeWindow = activeBrowserWindow ? this.windowsMainService.getWindowById(activeBrowserWindow.id) : undefined;
        if (activeWindow) {
            this.logService.trace('menubar#runActionInRenderer', invocation);
            if (isMacintosh && !this.environmentMainService.isBuilt && !activeWindow.isReady) {
                if ((invocation.type === 'commandId' && invocation.commandId === 'workbench.action.toggleDevTools') || (invocation.type !== 'commandId' && invocation.userSettingsLabel === 'alt+cmd+i')) {
                    // prevent this action from running twice on macOS (https://github.com/microsoft/vscode/issues/62719)
                    // we already register a keybinding in bootstrap-window.js for opening developer tools in case something
                    // goes wrong and that keybinding is only removed when the application has loaded (= window ready).
                    return;
                }
            }
            if (invocation.type === 'commandId') {
                const runActionPayload = { id: invocation.commandId, from: 'menu' };
                activeWindow.sendWhenReady('vscode:runAction', CancellationToken.None, runActionPayload);
            }
            else {
                const runKeybindingPayload = { userSettingsLabel: invocation.userSettingsLabel };
                activeWindow.sendWhenReady('vscode:runKeybinding', CancellationToken.None, runKeybindingPayload);
            }
        }
        else {
            this.logService.trace('menubar#runActionInRenderer: no active window found', invocation);
        }
    }
    withKeybinding(commandId, options) {
        const binding = typeof commandId === 'string' ? this.keybindings[commandId] : undefined;
        // Apply binding if there is one
        if (binding?.label) {
            // if the binding is native, we can just apply it
            if (binding.isNative !== false) {
                options.accelerator = binding.label;
                options.userSettingsLabel = binding.userSettingsLabel;
            }
            // the keybinding is not native so we cannot show it as part of the accelerator of
            // the menu item. we fallback to a different strategy so that we always display it
            else if (typeof options.label === 'string') {
                const bindingIndex = options.label.indexOf('[');
                if (bindingIndex >= 0) {
                    options.label = `${options.label.substr(0, bindingIndex)} [${binding.label}]`;
                }
                else {
                    options.label = `${options.label} [${binding.label}]`;
                }
            }
        }
        // Unset bindings if there is none
        else {
            options.accelerator = undefined;
        }
        return options;
    }
    likeAction(commandId, options, setAccelerator = !options.accelerator) {
        if (setAccelerator) {
            options = this.withKeybinding(commandId, options);
        }
        const originalClick = options.click;
        options.click = (item, window, event) => {
            this.reportMenuActionTelemetry(commandId);
            originalClick?.(item, window, event);
        };
        return options;
    }
    openUrl(url, id) {
        this.nativeHostMainService.openExternal(undefined, url);
        this.reportMenuActionTelemetry(id);
    }
    reportMenuActionTelemetry(id) {
        this.telemetryService.publicLog2('workbenchActionExecuted', { id, from: telemetryFrom });
    }
    mnemonicLabel(label) {
        return mnemonicMenuLabel(label, !this.currentEnableMenuBarMnemonics);
    }
};
Menubar = __decorate([
    __param(0, IUpdateService),
    __param(1, IConfigurationService),
    __param(2, IWindowsMainService),
    __param(3, IEnvironmentMainService),
    __param(4, ITelemetryService),
    __param(5, IWorkspacesHistoryMainService),
    __param(6, IStateMainService),
    __param(7, ILifecycleMainService),
    __param(8, ILogService),
    __param(9, INativeHostMainService),
    __param(10, IProductService)
], Menubar);
export { Menubar };
function __separator__() {
    return new MenuItem({ type: 'separator' });
}