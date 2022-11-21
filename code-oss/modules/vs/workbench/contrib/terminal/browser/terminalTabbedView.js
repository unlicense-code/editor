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
import { Sizing, SplitView } from 'vs/base/browser/ui/splitview/splitview';
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITerminalGroupService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { TerminalTabList } from 'vs/workbench/contrib/terminal/browser/terminalTabsList';
import { isLinux, isMacintosh } from 'vs/base/common/platform';
import * as dom from 'vs/base/browser/dom';
import { BrowserFeatures } from 'vs/base/browser/canIUse';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { Action, Separator } from 'vs/base/common/actions';
import { IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { localize } from 'vs/nls';
import { openContextMenu } from 'vs/workbench/contrib/terminal/browser/terminalContextMenu';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';
const $ = dom.$;
var CssClass;
(function (CssClass) {
    CssClass["ViewIsVertical"] = "terminal-side-view";
})(CssClass || (CssClass = {}));
var WidthConstants;
(function (WidthConstants) {
    WidthConstants[WidthConstants["StatusIcon"] = 30] = "StatusIcon";
    WidthConstants[WidthConstants["SplitAnnotation"] = 30] = "SplitAnnotation";
})(WidthConstants || (WidthConstants = {}));
let TerminalTabbedView = class TerminalTabbedView extends Disposable {
    _terminalService;
    _terminalGroupService;
    _instantiationService;
    _notificationService;
    _contextMenuService;
    _configurationService;
    _storageService;
    _splitView;
    _terminalContainer;
    _tabListElement;
    _parentElement;
    _tabContainer;
    _tabList;
    _sashDisposables;
    _plusButton;
    _tabTreeIndex;
    _terminalContainerIndex;
    _height;
    _width;
    _cancelContextMenu = false;
    _instanceMenu;
    _tabsListMenu;
    _tabsListEmptyMenu;
    _terminalIsTabsNarrowContextKey;
    _terminalTabsFocusContextKey;
    _terminalTabsMouseContextKey;
    _panelOrientation;
    constructor(parentElement, _terminalService, _terminalGroupService, _instantiationService, _notificationService, _contextMenuService, _configurationService, menuService, _storageService, contextKeyService) {
        super();
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._instantiationService = _instantiationService;
        this._notificationService = _notificationService;
        this._contextMenuService = _contextMenuService;
        this._configurationService = _configurationService;
        this._storageService = _storageService;
        this._parentElement = parentElement;
        this._tabContainer = $('.tabs-container');
        const tabListContainer = $('.tabs-list-container');
        this._tabListElement = $('.tabs-list');
        tabListContainer.appendChild(this._tabListElement);
        this._tabContainer.appendChild(tabListContainer);
        this._instanceMenu = this._register(menuService.createMenu(MenuId.TerminalInstanceContext, contextKeyService));
        this._tabsListMenu = this._register(menuService.createMenu(MenuId.TerminalTabContext, contextKeyService));
        this._tabsListEmptyMenu = this._register(menuService.createMenu(MenuId.TerminalTabEmptyAreaContext, contextKeyService));
        this._tabList = this._register(this._instantiationService.createInstance(TerminalTabList, this._tabListElement));
        const terminalOuterContainer = $('.terminal-outer-container');
        this._terminalContainer = $('.terminal-groups-container');
        terminalOuterContainer.appendChild(this._terminalContainer);
        this._terminalService.setContainers(parentElement, this._terminalContainer);
        this._terminalIsTabsNarrowContextKey = TerminalContextKeys.tabsNarrow.bindTo(contextKeyService);
        this._terminalTabsFocusContextKey = TerminalContextKeys.tabsFocus.bindTo(contextKeyService);
        this._terminalTabsMouseContextKey = TerminalContextKeys.tabsMouse.bindTo(contextKeyService);
        this._tabTreeIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 0 : 1;
        this._terminalContainerIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 1 : 0;
        _configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */) ||
                e.affectsConfiguration("terminal.integrated.tabs.hideCondition" /* TerminalSettingId.TabsHideCondition */)) {
                this._refreshShowTabs();
            }
            else if (e.affectsConfiguration("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */)) {
                this._tabTreeIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 0 : 1;
                this._terminalContainerIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 1 : 0;
                if (this._shouldShowTabs()) {
                    this._splitView.swapViews(0, 1);
                    this._removeSashListener();
                    this._addSashListener();
                    this._splitView.resizeView(this._tabTreeIndex, this._getLastListWidth());
                }
            }
        });
        this._register(this._terminalGroupService.onDidChangeInstances(() => this._refreshShowTabs()));
        this._register(this._terminalGroupService.onDidChangeGroups(() => this._refreshShowTabs()));
        this._attachEventListeners(parentElement, this._terminalContainer);
        this._terminalGroupService.onDidChangePanelOrientation((orientation) => {
            this._panelOrientation = orientation;
            if (this._panelOrientation === 0 /* Orientation.VERTICAL */) {
                this._terminalContainer.classList.add("terminal-side-view" /* CssClass.ViewIsVertical */);
            }
            else {
                this._terminalContainer.classList.remove("terminal-side-view" /* CssClass.ViewIsVertical */);
            }
        });
        this._splitView = new SplitView(parentElement, { orientation: 1 /* Orientation.HORIZONTAL */, proportionalLayout: false });
        this._setupSplitView(terminalOuterContainer);
    }
    _shouldShowTabs() {
        const enabled = this._terminalService.configHelper.config.tabs.enabled;
        const hide = this._terminalService.configHelper.config.tabs.hideCondition;
        if (!enabled) {
            return false;
        }
        if (hide === 'never') {
            return true;
        }
        if (hide === 'singleTerminal' && this._terminalGroupService.instances.length > 1) {
            return true;
        }
        if (hide === 'singleGroup' && this._terminalGroupService.groups.length > 1) {
            return true;
        }
        return false;
    }
    _refreshShowTabs() {
        if (this._shouldShowTabs()) {
            if (this._splitView.length === 1) {
                this._addTabTree();
                this._addSashListener();
                this._splitView.resizeView(this._tabTreeIndex, this._getLastListWidth());
                this.rerenderTabs();
            }
        }
        else {
            if (this._splitView.length === 2 && !this._terminalTabsMouseContextKey.get()) {
                this._splitView.removeView(this._tabTreeIndex);
                if (this._plusButton) {
                    this._tabContainer.removeChild(this._plusButton);
                }
                this._removeSashListener();
            }
        }
    }
    _getLastListWidth() {
        const widthKey = this._panelOrientation === 0 /* Orientation.VERTICAL */ ? "tabs-list-width-vertical" /* TerminalStorageKeys.TabsListWidthVertical */ : "tabs-list-width-horizontal" /* TerminalStorageKeys.TabsListWidthHorizontal */;
        const storedValue = this._storageService.get(widthKey, 0 /* StorageScope.PROFILE */);
        if (!storedValue || !parseInt(storedValue)) {
            // we want to use the min width by default for the vertical orientation bc
            // there is such a limited width for the terminal panel to begin w there.
            return this._panelOrientation === 0 /* Orientation.VERTICAL */ ? 46 /* TerminalTabsListSizes.NarrowViewWidth */ : 120 /* TerminalTabsListSizes.DefaultWidth */;
        }
        return parseInt(storedValue);
    }
    _handleOnDidSashReset() {
        // Calculate ideal size of list to display all text based on its contents
        let idealWidth = 80 /* TerminalTabsListSizes.WideViewMinimumWidth */;
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = 1;
        offscreenCanvas.height = 1;
        const ctx = offscreenCanvas.getContext('2d');
        if (ctx) {
            const style = window.getComputedStyle(this._tabListElement);
            ctx.font = `${style.fontStyle} ${style.fontSize} ${style.fontFamily}`;
            const maxInstanceWidth = this._terminalGroupService.instances.reduce((p, c) => {
                return Math.max(p, ctx.measureText(c.title + (c.description || '')).width + this._getAdditionalWidth(c));
            }, 0);
            idealWidth = Math.ceil(Math.max(maxInstanceWidth, 80 /* TerminalTabsListSizes.WideViewMinimumWidth */));
        }
        // If the size is already ideal, toggle to collapsed
        const currentWidth = Math.ceil(this._splitView.getViewSize(this._tabTreeIndex));
        if (currentWidth === idealWidth) {
            idealWidth = 46 /* TerminalTabsListSizes.NarrowViewWidth */;
        }
        this._splitView.resizeView(this._tabTreeIndex, idealWidth);
        this._updateListWidth(idealWidth);
    }
    _getAdditionalWidth(instance) {
        // Size to include padding, icon, status icon (if any), split annotation (if any), + a little more
        const additionalWidth = 40;
        const statusIconWidth = instance.statusList.statuses.length > 0 ? 30 /* WidthConstants.StatusIcon */ : 0;
        const splitAnnotationWidth = (this._terminalGroupService.getGroupForInstance(instance)?.terminalInstances.length || 0) > 1 ? 30 /* WidthConstants.SplitAnnotation */ : 0;
        return additionalWidth + splitAnnotationWidth + statusIconWidth;
    }
    _handleOnDidSashChange() {
        const listWidth = this._splitView.getViewSize(this._tabTreeIndex);
        if (!this._width || listWidth <= 0) {
            return;
        }
        this._updateListWidth(listWidth);
    }
    _updateListWidth(width) {
        if (width < 63 /* TerminalTabsListSizes.MidpointViewWidth */ && width >= 46 /* TerminalTabsListSizes.NarrowViewWidth */) {
            width = 46 /* TerminalTabsListSizes.NarrowViewWidth */;
            this._splitView.resizeView(this._tabTreeIndex, width);
        }
        else if (width >= 63 /* TerminalTabsListSizes.MidpointViewWidth */ && width < 80 /* TerminalTabsListSizes.WideViewMinimumWidth */) {
            width = 80 /* TerminalTabsListSizes.WideViewMinimumWidth */;
            this._splitView.resizeView(this._tabTreeIndex, width);
        }
        this.rerenderTabs();
        const widthKey = this._panelOrientation === 0 /* Orientation.VERTICAL */ ? "tabs-list-width-vertical" /* TerminalStorageKeys.TabsListWidthVertical */ : "tabs-list-width-horizontal" /* TerminalStorageKeys.TabsListWidthHorizontal */;
        this._storageService.store(widthKey, width, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
    }
    _setupSplitView(terminalOuterContainer) {
        this._register(this._splitView.onDidSashReset(() => this._handleOnDidSashReset()));
        this._register(this._splitView.onDidSashChange(() => this._handleOnDidSashChange()));
        if (this._shouldShowTabs()) {
            this._addTabTree();
        }
        this._splitView.addView({
            element: terminalOuterContainer,
            layout: width => this._terminalGroupService.groups.forEach(tab => tab.layout(width, this._height || 0)),
            minimumSize: 120,
            maximumSize: Number.POSITIVE_INFINITY,
            onDidChange: () => Disposable.None,
            priority: 2 /* LayoutPriority.High */
        }, Sizing.Distribute, this._terminalContainerIndex);
        if (this._shouldShowTabs()) {
            this._addSashListener();
        }
    }
    _addTabTree() {
        this._splitView.addView({
            element: this._tabContainer,
            layout: width => this._tabList.layout(this._height || 0, width),
            minimumSize: 46 /* TerminalTabsListSizes.NarrowViewWidth */,
            maximumSize: 500 /* TerminalTabsListSizes.MaximumWidth */,
            onDidChange: () => Disposable.None,
            priority: 1 /* LayoutPriority.Low */
        }, Sizing.Distribute, this._tabTreeIndex);
        this.rerenderTabs();
    }
    rerenderTabs() {
        this._updateHasText();
        this._tabList.refresh();
    }
    _addSashListener() {
        let interval;
        this._sashDisposables = [
            this._splitView.sashes[0].onDidStart(e => {
                interval = window.setInterval(() => {
                    this.rerenderTabs();
                }, 100);
            }),
            this._splitView.sashes[0].onDidEnd(e => {
                window.clearInterval(interval);
                interval = 0;
            })
        ];
    }
    _removeSashListener() {
        if (this._sashDisposables) {
            dispose(this._sashDisposables);
            this._sashDisposables = undefined;
        }
    }
    _updateHasText() {
        const hasText = this._tabListElement.clientWidth > 63 /* TerminalTabsListSizes.MidpointViewWidth */;
        this._tabContainer.classList.toggle('has-text', hasText);
        this._terminalIsTabsNarrowContextKey.set(!hasText);
    }
    layout(width, height) {
        this._height = height;
        this._width = width;
        this._splitView.layout(width);
        if (this._shouldShowTabs()) {
            this._splitView.resizeView(this._tabTreeIndex, this._getLastListWidth());
        }
        this._updateHasText();
    }
    _attachEventListeners(parentDomElement, terminalContainer) {
        this._register(dom.addDisposableListener(this._tabContainer, 'mouseleave', async (event) => {
            this._terminalTabsMouseContextKey.set(false);
            this._refreshShowTabs();
            event.stopPropagation();
        }));
        this._register(dom.addDisposableListener(this._tabContainer, 'mouseenter', async (event) => {
            this._terminalTabsMouseContextKey.set(true);
            event.stopPropagation();
        }));
        this._register(dom.addDisposableListener(terminalContainer, 'mousedown', async (event) => {
            const terminal = this._terminalGroupService.activeInstance;
            if (this._terminalGroupService.instances.length === 0 || !terminal) {
                this._cancelContextMenu = true;
                return;
            }
            if (event.which === 2 && isLinux) {
                // Drop selection and focus terminal on Linux to enable middle button paste when click
                // occurs on the selection itself.
                terminal.focus();
            }
            else if (event.which === 3) {
                const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                if (rightClickBehavior === 'nothing') {
                    if (!event.shiftKey) {
                        this._cancelContextMenu = true;
                    }
                    return;
                }
                else if (rightClickBehavior === 'copyPaste' || rightClickBehavior === 'paste') {
                    // copyPaste: Shift+right click should open context menu
                    if (rightClickBehavior === 'copyPaste' && event.shiftKey) {
                        openContextMenu(event, this._parentElement, this._instanceMenu, this._contextMenuService);
                        return;
                    }
                    if (rightClickBehavior === 'copyPaste' && terminal.hasSelection()) {
                        await terminal.copySelection();
                        terminal.clearSelection();
                    }
                    else {
                        if (BrowserFeatures.clipboard.readText) {
                            terminal.paste();
                        }
                        else {
                            this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${isMacintosh ? '⌘' : 'Ctrl'}+V instead.`);
                        }
                    }
                    // Clear selection after all click event bubbling is finished on Mac to prevent
                    // right-click selecting a word which is seemed cannot be disabled. There is a
                    // flicker when pasting but this appears to give the best experience if the
                    // setting is enabled.
                    if (isMacintosh) {
                        setTimeout(() => {
                            terminal.clearSelection();
                        }, 0);
                    }
                    this._cancelContextMenu = true;
                }
            }
        }));
        this._register(dom.addDisposableListener(terminalContainer, 'contextmenu', (event) => {
            const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
            if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                this._cancelContextMenu = true;
            }
            if (!this._cancelContextMenu) {
                openContextMenu(event, this._parentElement, this._instanceMenu, this._contextMenuService);
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            this._cancelContextMenu = false;
        }));
        this._register(dom.addDisposableListener(this._tabContainer, 'contextmenu', (event) => {
            const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
            if (rightClickBehavior === 'nothing' && !event.shiftKey) {
                this._cancelContextMenu = true;
            }
            if (!this._cancelContextMenu) {
                const emptyList = this._tabList.getFocus().length === 0;
                openContextMenu(event, this._parentElement, emptyList ? this._tabsListEmptyMenu : this._tabsListMenu, this._contextMenuService, emptyList ? this._getTabActions() : undefined);
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            this._cancelContextMenu = false;
        }));
        this._register(dom.addDisposableListener(document, 'keydown', (event) => {
            terminalContainer.classList.toggle('alt-active', !!event.altKey);
        }));
        this._register(dom.addDisposableListener(document, 'keyup', (event) => {
            terminalContainer.classList.toggle('alt-active', !!event.altKey);
        }));
        this._register(dom.addDisposableListener(parentDomElement, 'keyup', (event) => {
            if (event.keyCode === 27) {
                // Keep terminal open on escape
                event.stopPropagation();
            }
        }));
        this._register(dom.addDisposableListener(this._tabContainer, dom.EventType.FOCUS_IN, () => {
            this._terminalTabsFocusContextKey.set(true);
        }));
        this._register(dom.addDisposableListener(this._tabContainer, dom.EventType.FOCUS_OUT, () => {
            this._terminalTabsFocusContextKey.set(false);
        }));
    }
    _getTabActions() {
        return [
            new Separator(),
            this._configurationService.inspect("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */).userValue === 'left' ?
                new Action('moveRight', localize('moveTabsRight', "Move Tabs Right"), undefined, undefined, async () => {
                    this._configurationService.updateValue("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */, 'right');
                }) :
                new Action('moveLeft', localize('moveTabsLeft', "Move Tabs Left"), undefined, undefined, async () => {
                    this._configurationService.updateValue("terminal.integrated.tabs.location" /* TerminalSettingId.TabsLocation */, 'left');
                }),
            new Action('hideTabs', localize('hideTabs', "Hide Tabs"), undefined, undefined, async () => {
                this._configurationService.updateValue("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */, false);
            })
        ];
    }
    setEditable(isEditing) {
        if (!isEditing) {
            this._tabList.domFocus();
        }
        this._tabList.refresh(false);
    }
    focusTabs() {
        if (!this._shouldShowTabs()) {
            return;
        }
        this._terminalTabsFocusContextKey.set(true);
        const selected = this._tabList.getSelection();
        this._tabList.domFocus();
        if (selected) {
            this._tabList.setFocus(selected);
        }
    }
    focus() {
        if (this._terminalService.connectionState === 0 /* TerminalConnectionState.Connecting */) {
            // If the terminal is waiting to reconnect to remote terminals, then there is no TerminalInstance yet that can
            // be focused. So wait for connection to finish, then focus.
            const activeElement = document.activeElement;
            this._register(this._terminalService.onDidChangeConnectionState(() => {
                // Only focus the terminal if the activeElement has not changed since focus() was called
                // TODO hack
                if (document.activeElement === activeElement) {
                    this._focus();
                }
            }));
            return;
        }
        this._focus();
    }
    _focus() {
        this._terminalGroupService.activeInstance?.focusWhenReady();
    }
};
TerminalTabbedView = __decorate([
    __param(1, ITerminalService),
    __param(2, ITerminalGroupService),
    __param(3, IInstantiationService),
    __param(4, INotificationService),
    __param(5, IContextMenuService),
    __param(6, IConfigurationService),
    __param(7, IMenuService),
    __param(8, IStorageService),
    __param(9, IContextKeyService)
], TerminalTabbedView);
export { TerminalTabbedView };
