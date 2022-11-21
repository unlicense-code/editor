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
import 'vs/css!./media/titlebarpart';
import { localize } from 'vs/nls';
import { Part } from 'vs/workbench/browser/part';
import { getZoomFactor, isWCOVisible } from 'vs/base/browser/browser';
import { getTitleBarStyle, getMenuBarVisibility } from 'vs/platform/window/common/window';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IThemeService, registerThemingParticipant, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { TITLE_BAR_ACTIVE_BACKGROUND, TITLE_BAR_ACTIVE_FOREGROUND, TITLE_BAR_INACTIVE_FOREGROUND, TITLE_BAR_INACTIVE_BACKGROUND, TITLE_BAR_BORDER, WORKBENCH_BACKGROUND } from 'vs/workbench/common/theme';
import { isMacintosh, isWindows, isLinux, isWeb, isNative } from 'vs/base/common/platform';
import { Color } from 'vs/base/common/color';
import { EventType, EventHelper, Dimension, isAncestor, append, $, addDisposableListener, runAtThisOrScheduleAtNextAnimationFrame, prepend, reset } from 'vs/base/browser/dom';
import { CustomMenubarControl } from 'vs/workbench/browser/parts/titlebar/menubarControl';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Emitter } from 'vs/base/common/event';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { createActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { Action2, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { Codicon } from 'vs/base/common/codicons';
import { getIconRegistry } from 'vs/platform/theme/common/iconRegistry';
import { WindowTitle } from 'vs/workbench/browser/parts/titlebar/windowTitle';
import { CommandCenterControl } from 'vs/workbench/browser/parts/titlebar/commandCenterControl';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { MenuWorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
let TitlebarPart = class TitlebarPart extends Part {
    contextMenuService;
    configurationService;
    environmentService;
    instantiationService;
    contextKeyService;
    hostService;
    static configCommandCenter = 'window.commandCenter';
    //#region IView
    minimumWidth = 0;
    maximumWidth = Number.POSITIVE_INFINITY;
    get minimumHeight() {
        const value = this.isCommandCenterVisible || (isWeb && isWCOVisible()) ? 35 : 30;
        return value / (this.useCounterZoom ? getZoomFactor() : 1);
    }
    get maximumHeight() { return this.minimumHeight; }
    //#endregion
    _onMenubarVisibilityChange = this._register(new Emitter());
    onMenubarVisibilityChange = this._onMenubarVisibilityChange.event;
    _onDidChangeCommandCenterVisibility = new Emitter();
    onDidChangeCommandCenterVisibility = this._onDidChangeCommandCenterVisibility.event;
    rootContainer;
    windowControls;
    dragRegion;
    title;
    customMenubar;
    appIcon;
    appIconBadge;
    menubar;
    layoutControls;
    layoutToolbar;
    lastLayoutDimensions;
    hoverDelegate;
    titleDisposables = this._register(new DisposableStore());
    titleBarStyle;
    isInactive = false;
    windowTitle;
    constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, hoverService) {
        super("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, { hasTitle: false }, themeService, storageService, layoutService);
        this.contextMenuService = contextMenuService;
        this.configurationService = configurationService;
        this.environmentService = environmentService;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.hostService = hostService;
        this.windowTitle = this._register(instantiationService.createInstance(WindowTitle));
        this.titleBarStyle = getTitleBarStyle(this.configurationService);
        this.hoverDelegate = new class {
            _lastHoverHideTime = 0;
            showHover = hoverService.showHover.bind(hoverService);
            placement = 'element';
            get delay() {
                return Date.now() - this._lastHoverHideTime < 200
                    ? 0 // show instantly when a hover was recently shown
                    : configurationService.getValue('workbench.hover.delay');
            }
            onDidHideHover() {
                this._lastHoverHideTime = Date.now();
            }
        };
        this.registerListeners();
    }
    updateProperties(properties) {
        this.windowTitle.updateProperties(properties);
    }
    get isCommandCenterVisible() {
        return this.configurationService.getValue(TitlebarPart.configCommandCenter);
    }
    registerListeners() {
        this._register(this.hostService.onDidChangeFocus(focused => focused ? this.onFocus() : this.onBlur()));
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
    }
    onBlur() {
        this.isInactive = true;
        this.updateStyles();
    }
    onFocus() {
        this.isInactive = false;
        this.updateStyles();
    }
    onConfigurationChanged(event) {
        if (this.titleBarStyle !== 'native' && (!isMacintosh || isWeb)) {
            if (event.affectsConfiguration('window.menuBarVisibility')) {
                if (this.currentMenubarVisibility === 'compact') {
                    this.uninstallMenubar();
                }
                else {
                    this.installMenubar();
                }
            }
        }
        if (this.titleBarStyle !== 'native' && this.layoutControls && event.affectsConfiguration('workbench.layoutControl.enabled')) {
            this.layoutControls.classList.toggle('show-layout-control', this.layoutControlEnabled);
            this._onDidChange.fire(undefined);
        }
        if (event.affectsConfiguration(TitlebarPart.configCommandCenter)) {
            this.updateTitle();
            this.adjustTitleMarginToCenter();
            this._onDidChangeCommandCenterVisibility.fire();
        }
    }
    onMenubarVisibilityChanged(visible) {
        if (isWeb || isWindows || isLinux) {
            if (this.lastLayoutDimensions) {
                this.layout(this.lastLayoutDimensions.width, this.lastLayoutDimensions.height);
            }
            this._onMenubarVisibilityChange.fire(visible);
        }
    }
    uninstallMenubar() {
        if (this.customMenubar) {
            this.customMenubar.dispose();
            this.customMenubar = undefined;
        }
        if (this.menubar) {
            this.menubar.remove();
            this.menubar = undefined;
        }
        this.onMenubarVisibilityChanged(false);
    }
    installMenubar() {
        // If the menubar is already installed, skip
        if (this.menubar) {
            return;
        }
        this.customMenubar = this._register(this.instantiationService.createInstance(CustomMenubarControl));
        this.menubar = this.rootContainer.insertBefore($('div.menubar'), this.title);
        this.menubar.setAttribute('role', 'menubar');
        this._register(this.customMenubar.onVisibilityChange(e => this.onMenubarVisibilityChanged(e)));
        this.customMenubar.create(this.menubar);
    }
    updateTitle() {
        this.titleDisposables.clear();
        if (!this.isCommandCenterVisible) {
            // Text Title
            this.title.innerText = this.windowTitle.value;
            this.titleDisposables.add(this.windowTitle.onDidChange(() => {
                this.title.innerText = this.windowTitle.value;
                this.adjustTitleMarginToCenter();
            }));
        }
        else {
            // Menu Title
            const commandCenter = this.instantiationService.createInstance(CommandCenterControl, this.windowTitle, this.hoverDelegate);
            reset(this.title, commandCenter.element);
            this.titleDisposables.add(commandCenter);
            this.titleDisposables.add(commandCenter.onDidChangeVisibility(this.adjustTitleMarginToCenter, this));
        }
    }
    createContentArea(parent) {
        this.element = parent;
        this.rootContainer = append(parent, $('.titlebar-container'));
        // Draggable region that we can manipulate for #52522
        this.dragRegion = prepend(this.rootContainer, $('div.titlebar-drag-region'));
        // App Icon (Native Windows/Linux and Web)
        if (!isMacintosh && !isWeb) {
            this.appIcon = prepend(this.rootContainer, $('a.window-appicon'));
            // Web-only home indicator and menu
            if (isWeb) {
                const homeIndicator = this.environmentService.options?.homeIndicator;
                if (homeIndicator) {
                    const icon = getIconRegistry().getIcon(homeIndicator.icon) ? { id: homeIndicator.icon } : Codicon.code;
                    this.appIcon.setAttribute('href', homeIndicator.href);
                    this.appIcon.classList.add(...ThemeIcon.asClassNameArray(icon));
                    this.appIconBadge = document.createElement('div');
                    this.appIconBadge.classList.add('home-bar-icon-badge');
                    this.appIcon.appendChild(this.appIconBadge);
                }
            }
        }
        // Menubar: install a custom menu bar depending on configuration
        // and when not in activity bar
        if (this.titleBarStyle !== 'native'
            && (!isMacintosh || isWeb)
            && this.currentMenubarVisibility !== 'compact') {
            this.installMenubar();
        }
        // Title
        this.title = append(this.rootContainer, $('div.window-title'));
        this.updateTitle();
        if (this.titleBarStyle !== 'native') {
            this.layoutControls = append(this.rootContainer, $('div.layout-controls-container'));
            this.layoutControls.classList.toggle('show-layout-control', this.layoutControlEnabled);
            this.layoutToolbar = this.instantiationService.createInstance(MenuWorkbenchToolBar, this.layoutControls, MenuId.LayoutControlMenu, {
                contextMenu: MenuId.TitleBarContext,
                toolbarOptions: { primaryGroup: () => true },
                actionViewItemProvider: action => {
                    return createActionViewItem(this.instantiationService, action, { hoverDelegate: this.hoverDelegate });
                }
            });
        }
        this.windowControls = append(this.element, $('div.window-controls-container'));
        // Context menu on title
        [EventType.CONTEXT_MENU, EventType.MOUSE_DOWN].forEach(event => {
            this._register(addDisposableListener(this.rootContainer, event, e => {
                if (e.type === EventType.CONTEXT_MENU || (e.target === this.title && e.metaKey)) {
                    EventHelper.stop(e);
                    this.onContextMenu(e, e.target === this.title ? MenuId.TitleBarTitleContext : MenuId.TitleBarContext);
                }
            }));
        });
        // Since the title area is used to drag the window, we do not want to steal focus from the
        // currently active element. So we restore focus after a timeout back to where it was.
        this._register(addDisposableListener(this.element, EventType.MOUSE_DOWN, e => {
            if (e.target && this.menubar && isAncestor(e.target, this.menubar)) {
                return;
            }
            if (e.target && this.layoutToolbar && isAncestor(e.target, this.layoutToolbar.getElement())) {
                return;
            }
            if (e.target && isAncestor(e.target, this.title)) {
                return;
            }
            const active = document.activeElement;
            setTimeout(() => {
                if (active instanceof HTMLElement) {
                    active.focus();
                }
            }, 0 /* need a timeout because we are in capture phase */);
        }, true /* use capture to know the currently active element properly */));
        this.updateStyles();
        const that = this;
        registerAction2(class FocusTitleBar extends Action2 {
            constructor() {
                super({
                    id: `workbench.action.focusTitleBar`,
                    title: { value: localize('focusTitleBar', "Focus Title Bar"), original: 'Focus Title Bar' },
                    category: Categories.View,
                    f1: true,
                });
            }
            run(accessor, ...args) {
                if (that.customMenubar) {
                    that.customMenubar.toggleFocus();
                }
                else {
                    that.element.querySelector('[tabindex]:not([tabindex="-1"])').focus();
                }
            }
        });
        return this.element;
    }
    updateStyles() {
        super.updateStyles();
        // Part container
        if (this.element) {
            if (this.isInactive) {
                this.element.classList.add('inactive');
            }
            else {
                this.element.classList.remove('inactive');
            }
            const titleBackground = this.getColor(this.isInactive ? TITLE_BAR_INACTIVE_BACKGROUND : TITLE_BAR_ACTIVE_BACKGROUND, (color, theme) => {
                // LCD Rendering Support: the title bar part is a defining its own GPU layer.
                // To benefit from LCD font rendering, we must ensure that we always set an
                // opaque background color. As such, we compute an opaque color given we know
                // the background color is the workbench background.
                return color.isOpaque() ? color : color.makeOpaque(WORKBENCH_BACKGROUND(theme));
            }) || '';
            this.element.style.backgroundColor = titleBackground;
            if (this.appIconBadge) {
                this.appIconBadge.style.backgroundColor = titleBackground;
            }
            if (titleBackground && Color.fromHex(titleBackground).isLighter()) {
                this.element.classList.add('light');
            }
            else {
                this.element.classList.remove('light');
            }
            const titleForeground = this.getColor(this.isInactive ? TITLE_BAR_INACTIVE_FOREGROUND : TITLE_BAR_ACTIVE_FOREGROUND);
            this.element.style.color = titleForeground || '';
            const titleBorder = this.getColor(TITLE_BAR_BORDER);
            this.element.style.borderBottom = titleBorder ? `1px solid ${titleBorder}` : '';
        }
    }
    onContextMenu(e, menuId) {
        // Find target anchor
        const event = new StandardMouseEvent(e);
        const anchor = { x: event.posx, y: event.posy };
        // Show it
        this.contextMenuService.showContextMenu({
            getAnchor: () => anchor,
            menuId,
            contextKeyService: this.contextKeyService,
            domForShadowRoot: isMacintosh && isNative ? event.target : undefined
        });
    }
    adjustTitleMarginToCenter() {
        const base = isMacintosh ? (this.windowControls?.clientWidth ?? 0) : 0;
        const leftMarker = base + (this.appIcon?.clientWidth ?? 0) + (this.menubar?.clientWidth ?? 0) + 10;
        const rightMarker = base + this.rootContainer.clientWidth - (this.layoutControls?.clientWidth ?? 0) - 10;
        // Not enough space to center the titlebar within window,
        // Center between left and right controls
        if (leftMarker > (this.rootContainer.clientWidth + (this.windowControls?.clientWidth ?? 0) - this.title.clientWidth) / 2 ||
            rightMarker < (this.rootContainer.clientWidth + (this.windowControls?.clientWidth ?? 0) + this.title.clientWidth) / 2) {
            this.title.style.position = '';
            this.title.style.left = '';
            this.title.style.transform = '';
            return;
        }
        this.title.style.position = 'absolute';
        this.title.style.left = `calc(50% - ${this.title.clientWidth / 2}px)`;
    }
    get currentMenubarVisibility() {
        return getMenuBarVisibility(this.configurationService);
    }
    get layoutControlEnabled() {
        return this.configurationService.getValue('workbench.layoutControl.enabled');
    }
    get useCounterZoom() {
        // Prevent zooming behavior if any of the following conditions are met:
        // 1. Shrinking below the window control size (zoom < 1)
        // 2. No custom items are present in the title bar
        const zoomFactor = getZoomFactor();
        const noMenubar = this.currentMenubarVisibility === 'hidden' || (!isWeb && isMacintosh);
        const noCommandCenter = !this.isCommandCenterVisible;
        const noLayoutControls = !this.layoutControlEnabled;
        return zoomFactor < 1 || (noMenubar && noCommandCenter && noLayoutControls);
    }
    updateLayout(dimension) {
        this.lastLayoutDimensions = dimension;
        if (getTitleBarStyle(this.configurationService) === 'custom') {
            const zoomFactor = getZoomFactor();
            this.element.style.setProperty('--zoom-factor', zoomFactor.toString());
            this.rootContainer.classList.toggle('counter-zoom', this.useCounterZoom);
            if (this.customMenubar) {
                const menubarDimension = new Dimension(0, dimension.height);
                this.customMenubar.layout(menubarDimension);
            }
            runAtThisOrScheduleAtNextAnimationFrame(() => this.adjustTitleMarginToCenter());
        }
    }
    layout(width, height) {
        this.updateLayout(new Dimension(width, height));
        super.layoutContents(width, height);
    }
    toJSON() {
        return {
            type: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */
        };
    }
};
TitlebarPart = __decorate([
    __param(0, IContextMenuService),
    __param(1, IConfigurationService),
    __param(2, IBrowserWorkbenchEnvironmentService),
    __param(3, IInstantiationService),
    __param(4, IThemeService),
    __param(5, IStorageService),
    __param(6, IWorkbenchLayoutService),
    __param(7, IContextKeyService),
    __param(8, IHostService),
    __param(9, IHoverService)
], TitlebarPart);
export { TitlebarPart };
registerThemingParticipant((theme, collector) => {
    const titlebarActiveFg = theme.getColor(TITLE_BAR_ACTIVE_FOREGROUND);
    if (titlebarActiveFg) {
        collector.addRule(`
		.monaco-workbench .part.titlebar .window-controls-container .window-icon {
			color: ${titlebarActiveFg};
		}
		`);
    }
    const titlebarInactiveFg = theme.getColor(TITLE_BAR_INACTIVE_FOREGROUND);
    if (titlebarInactiveFg) {
        collector.addRule(`
		.monaco-workbench .part.titlebar.inactive .window-controls-container .window-icon {
				color: ${titlebarInactiveFg};
			}
		`);
    }
});
class ToogleConfigAction extends Action2 {
    section;
    constructor(section, title, order) {
        super({
            id: `toggle.${section}`,
            title,
            toggled: ContextKeyExpr.equals(`config.${section}`, true),
            menu: { id: MenuId.TitleBarContext, order }
        });
        this.section = section;
    }
    run(accessor, ...args) {
        const configService = accessor.get(IConfigurationService);
        const value = configService.getValue(this.section);
        configService.updateValue(this.section, !value);
    }
}
registerAction2(class ToogleCommandCenter extends ToogleConfigAction {
    constructor() {
        super('window.commandCenter', localize('toggle.commandCenter', 'Command Center'), 1);
    }
});
registerAction2(class ToogleLayoutControl extends ToogleConfigAction {
    constructor() {
        super('workbench.layoutControl.enabled', localize('toggle.layout', 'Layout Controls'), 2);
    }
});
