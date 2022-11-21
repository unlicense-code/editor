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
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import { Action } from 'vs/base/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService, ThemeIcon, Themable } from 'vs/platform/theme/common/themeService';
import { switchTerminalActionViewItemSeparator, switchTerminalShowTabsTitle } from 'vs/workbench/contrib/terminal/browser/terminalActions';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { ITerminalGroupService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IMenuService, MenuId, MenuItemAction } from 'vs/platform/actions/common/actions';
import { ITerminalProfileResolverService, ITerminalProfileService } from 'vs/workbench/contrib/terminal/common/terminal';
import { TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { ActionViewItem, SelectActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { attachSelectBoxStyler, attachStylerCallback } from 'vs/platform/theme/common/styler';
import { selectBorder } from 'vs/platform/theme/common/colorRegistry';
import { TerminalTabbedView } from 'vs/workbench/contrib/terminal/browser/terminalTabbedView';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { getColorForSeverity } from 'vs/workbench/contrib/terminal/browser/terminalStatusList';
import { createAndFillInContextMenuActions, MenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { DropdownWithPrimaryActionViewItem } from 'vs/platform/actions/browser/dropdownWithPrimaryActionViewItem';
import { dispose, toDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ColorScheme } from 'vs/platform/theme/common/theme';
import { getColorClass, getUriClasses } from 'vs/workbench/contrib/terminal/browser/terminalIcon';
import { withNullAsUndefined } from 'vs/base/common/types';
import { getTerminalActionBarArgs } from 'vs/workbench/contrib/terminal/browser/terminalMenus';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';
import { getShellIntegrationTooltip } from 'vs/workbench/contrib/terminal/browser/terminalTooltip';
let TerminalViewPane = class TerminalViewPane extends ViewPane {
    _contextKeyService;
    _configurationService;
    _contextMenuService;
    _instantiationService;
    _terminalService;
    _terminalGroupService;
    _notificationService;
    _keybindingService;
    _menuService;
    _terminalProfileService;
    _terminalProfileResolverService;
    _themeService;
    _fontStyleElement;
    _parentDomElement;
    _terminalTabbedView;
    get terminalTabbedView() { return this._terminalTabbedView; }
    _isWelcomeShowing = false;
    _newDropdown;
    _dropdownMenu;
    _singleTabMenu;
    _viewShowing;
    constructor(options, keybindingService, _contextKeyService, viewDescriptorService, _configurationService, _contextMenuService, _instantiationService, _terminalService, _terminalGroupService, themeService, telemetryService, _notificationService, _keybindingService, openerService, _menuService, _terminalProfileService, _terminalProfileResolverService, _themeService) {
        super(options, keybindingService, _contextMenuService, _configurationService, _contextKeyService, viewDescriptorService, _instantiationService, openerService, themeService, telemetryService);
        this._contextKeyService = _contextKeyService;
        this._configurationService = _configurationService;
        this._contextMenuService = _contextMenuService;
        this._instantiationService = _instantiationService;
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._notificationService = _notificationService;
        this._keybindingService = _keybindingService;
        this._menuService = _menuService;
        this._terminalProfileService = _terminalProfileService;
        this._terminalProfileResolverService = _terminalProfileResolverService;
        this._themeService = _themeService;
        this._register(this._terminalService.onDidRegisterProcessSupport(() => {
            this._onDidChangeViewWelcomeState.fire();
        }));
        this._register(this._terminalService.onDidChangeInstances(() => {
            if (!this._isWelcomeShowing) {
                return;
            }
            this._isWelcomeShowing = true;
            this._onDidChangeViewWelcomeState.fire();
            if (!this._terminalTabbedView && this._parentDomElement) {
                this._createTabsView();
                this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
            }
        }));
        this._dropdownMenu = this._register(this._menuService.createMenu(MenuId.TerminalNewDropdownContext, this._contextKeyService));
        this._singleTabMenu = this._register(this._menuService.createMenu(MenuId.TerminalInlineTabContext, this._contextKeyService));
        this._register(this._terminalProfileService.onDidChangeAvailableProfiles(profiles => this._updateTabActionBar(profiles)));
        this._viewShowing = TerminalContextKeys.viewShowing.bindTo(this._contextKeyService);
        this._register(this.onDidChangeBodyVisibility(e => {
            if (e) {
                this._terminalTabbedView?.rerenderTabs();
            }
        }));
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (this._parentDomElement && (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */) || e.affectsConfiguration("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */))) {
                this._updateForShellIntegration(this._parentDomElement);
            }
        }));
        this._register(this._terminalService.onDidCreateInstance((i) => {
            i.capabilities.onDidAddCapability(c => {
                if (c === 2 /* TerminalCapability.CommandDetection */ && this._gutterDecorationsEnabled()) {
                    this._parentDomElement?.classList.add('shell-integration');
                }
            });
        }));
    }
    _updateForShellIntegration(container) {
        container.classList.toggle('shell-integration', this._gutterDecorationsEnabled());
    }
    _gutterDecorationsEnabled() {
        const decorationsEnabled = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
        return (decorationsEnabled === 'both' || decorationsEnabled === 'gutter') && this._configurationService.getValue("terminal.integrated.shellIntegration.enabled" /* TerminalSettingId.ShellIntegrationEnabled */);
    }
    _initializeTerminal() {
        if (this.isBodyVisible() && this._terminalService.isProcessSupportRegistered && this._terminalService.connectionState === 1 /* TerminalConnectionState.Connected */ && !this._terminalGroupService.groups.length) {
            this._terminalService.createTerminal({ location: TerminalLocation.Panel });
        }
    }
    renderBody(container) {
        super.renderBody(container);
        if (!this._parentDomElement) {
            this._updateForShellIntegration(container);
        }
        this._parentDomElement = container;
        this._parentDomElement.classList.add('integrated-terminal');
        this._fontStyleElement = document.createElement('style');
        this._instantiationService.createInstance(TerminalThemeIconStyle, this._parentDomElement);
        if (!this.shouldShowWelcome()) {
            this._createTabsView();
        }
        this._parentDomElement.appendChild(this._fontStyleElement);
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */) || e.affectsConfiguration('editor.fontFamily')) {
                const configHelper = this._terminalService.configHelper;
                if (!configHelper.configFontIsMonospace()) {
                    const choices = [{
                            label: nls.localize('terminal.useMonospace', "Use 'monospace'"),
                            run: () => this.configurationService.updateValue("terminal.integrated.fontFamily" /* TerminalSettingId.FontFamily */, 'monospace'),
                        }];
                    this._notificationService.prompt(Severity.Warning, nls.localize('terminal.monospaceOnly', "The terminal only supports monospace fonts. Be sure to restart VS Code if this is a newly installed font."), choices);
                }
            }
        }));
        this._register(this.onDidChangeBodyVisibility(async (visible) => {
            this._viewShowing.set(visible);
            if (visible) {
                if (!this._terminalService.isProcessSupportRegistered) {
                    this._onDidChangeViewWelcomeState.fire();
                }
                this._initializeTerminal();
                // we don't know here whether or not it should be focused, so
                // defer focusing the panel to the focus() call
                // to prevent overriding preserveFocus for extensions
                this._terminalGroupService.showPanel(false);
            }
            else {
                for (const instance of this._terminalGroupService.instances) {
                    instance.resetFocusContextKey();
                }
            }
            this._terminalGroupService.updateVisibility();
        }));
        this._register(this._terminalService.onDidChangeConnectionState(() => this._initializeTerminal()));
        this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
    }
    _createTabsView() {
        if (!this._parentDomElement) {
            return;
        }
        this._terminalTabbedView = this.instantiationService.createInstance(TerminalTabbedView, this._parentDomElement);
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this._terminalTabbedView?.layout(width, height);
    }
    getActionViewItem(action) {
        switch (action.id) {
            case "workbench.action.terminal.split" /* TerminalCommandId.Split */: {
                // Split needs to be special cased to force splitting within the panel, not the editor
                const that = this;
                const panelOnlySplitAction = new class extends Action {
                    constructor() {
                        super(action.id, action.label, action.class, action.enabled);
                        this.checked = action.checked;
                        this.tooltip = action.tooltip;
                    }
                    dispose() {
                        action.dispose();
                    }
                    async run() {
                        const instance = that._terminalGroupService.activeInstance;
                        if (instance) {
                            const newInstance = await that._terminalService.createTerminal({ location: { parentTerminal: instance } });
                            return newInstance?.focusWhenReady();
                        }
                        return;
                    }
                };
                return new ActionViewItem(action, panelOnlySplitAction, { icon: true, label: false, keybinding: this._getKeybindingLabel(action) });
            }
            case "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */: {
                return this._instantiationService.createInstance(SwitchTerminalActionViewItem, action);
            }
            case "workbench.action.terminal.focus" /* TerminalCommandId.Focus */: {
                if (action instanceof MenuItemAction) {
                    const actions = [];
                    createAndFillInContextMenuActions(this._singleTabMenu, undefined, actions);
                    return this._instantiationService.createInstance(SingleTerminalTabActionViewItem, action, actions);
                }
            }
            case "workbench.action.terminal.new" /* TerminalCommandId.New */: {
                if (action instanceof MenuItemAction) {
                    const actions = getTerminalActionBarArgs(TerminalLocation.Panel, this._terminalProfileService.availableProfiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
                    this._newDropdown?.dispose();
                    this._newDropdown = new DropdownWithPrimaryActionViewItem(action, actions.dropdownAction, actions.dropdownMenuActions, actions.className, this._contextMenuService, {}, this._keybindingService, this._notificationService, this._contextKeyService, this._themeService);
                    this._updateTabActionBar(this._terminalProfileService.availableProfiles);
                    return this._newDropdown;
                }
            }
        }
        return super.getActionViewItem(action);
    }
    _getDefaultProfileName() {
        let defaultProfileName;
        try {
            defaultProfileName = this._terminalProfileService.getDefaultProfileName();
        }
        catch (e) {
            defaultProfileName = this._terminalProfileResolverService.defaultProfileName;
        }
        return defaultProfileName;
    }
    _getKeybindingLabel(action) {
        return withNullAsUndefined(this._keybindingService.lookupKeybinding(action.id)?.getLabel());
    }
    _updateTabActionBar(profiles) {
        const actions = getTerminalActionBarArgs(TerminalLocation.Panel, profiles, this._getDefaultProfileName(), this._terminalProfileService.contributedProfiles, this._terminalService, this._dropdownMenu);
        this._newDropdown?.update(actions.dropdownAction, actions.dropdownMenuActions);
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
                    this._terminalGroupService.showPanel(true);
                }
            }));
            return;
        }
        this._terminalGroupService.showPanel(true);
    }
    shouldShowWelcome() {
        this._isWelcomeShowing = !this._terminalService.isProcessSupportRegistered && this._terminalService.instances.length === 0;
        return this._isWelcomeShowing;
    }
};
TerminalViewPane = __decorate([
    __param(1, IKeybindingService),
    __param(2, IContextKeyService),
    __param(3, IViewDescriptorService),
    __param(4, IConfigurationService),
    __param(5, IContextMenuService),
    __param(6, IInstantiationService),
    __param(7, ITerminalService),
    __param(8, ITerminalGroupService),
    __param(9, IThemeService),
    __param(10, ITelemetryService),
    __param(11, INotificationService),
    __param(12, IKeybindingService),
    __param(13, IOpenerService),
    __param(14, IMenuService),
    __param(15, ITerminalProfileService),
    __param(16, ITerminalProfileResolverService),
    __param(17, IThemeService)
], TerminalViewPane);
export { TerminalViewPane };
let SwitchTerminalActionViewItem = class SwitchTerminalActionViewItem extends SelectActionViewItem {
    _terminalService;
    _terminalGroupService;
    _themeService;
    constructor(action, _terminalService, _terminalGroupService, _themeService, contextViewService, terminalProfileService) {
        super(null, action, getTerminalSelectOpenItems(_terminalService, _terminalGroupService), _terminalGroupService.activeGroupIndex, contextViewService, { ariaLabel: nls.localize('terminals', 'Open Terminals.'), optionsAsChildren: true });
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._themeService = _themeService;
        this._register(_terminalService.onDidChangeInstances(() => this._updateItems(), this));
        this._register(_terminalService.onDidChangeActiveGroup(() => this._updateItems(), this));
        this._register(_terminalService.onDidChangeActiveInstance(() => this._updateItems(), this));
        this._register(_terminalService.onDidChangeInstanceTitle(() => this._updateItems(), this));
        this._register(_terminalGroupService.onDidChangeGroups(() => this._updateItems(), this));
        this._register(_terminalService.onDidChangeConnectionState(() => this._updateItems(), this));
        this._register(terminalProfileService.onDidChangeAvailableProfiles(() => this._updateItems(), this));
        this._register(_terminalService.onDidChangeInstancePrimaryStatus(() => this._updateItems(), this));
        this._register(attachSelectBoxStyler(this.selectBox, this._themeService));
    }
    render(container) {
        super.render(container);
        container.classList.add('switch-terminal');
        this._register(attachStylerCallback(this._themeService, { selectBorder }, colors => {
            container.style.borderColor = colors.selectBorder ? `${colors.selectBorder}` : '';
        }));
    }
    _updateItems() {
        const options = getTerminalSelectOpenItems(this._terminalService, this._terminalGroupService);
        this.setOptions(options, this._terminalGroupService.activeGroupIndex);
    }
};
SwitchTerminalActionViewItem = __decorate([
    __param(1, ITerminalService),
    __param(2, ITerminalGroupService),
    __param(3, IThemeService),
    __param(4, IContextViewService),
    __param(5, ITerminalProfileService)
], SwitchTerminalActionViewItem);
function getTerminalSelectOpenItems(terminalService, terminalGroupService) {
    let items;
    if (terminalService.connectionState === 1 /* TerminalConnectionState.Connected */) {
        items = terminalGroupService.getGroupLabels().map(label => {
            return { text: label };
        });
    }
    else {
        items = [{ text: nls.localize('terminalConnectingLabel', "Starting...") }];
    }
    items.push({ text: switchTerminalActionViewItemSeparator, isDisabled: true });
    items.push({ text: switchTerminalShowTabsTitle });
    return items;
}
let SingleTerminalTabActionViewItem = class SingleTerminalTabActionViewItem extends MenuEntryActionViewItem {
    _actions;
    _terminalService;
    _terminalGroupService;
    _commandService;
    _instantiationService;
    _color;
    _altCommand;
    _class;
    _elementDisposables = [];
    constructor(action, _actions, keybindingService, notificationService, contextKeyService, themeService, _terminalService, _terminalGroupService, contextMenuService, _commandService, _instantiationService) {
        super(action, { draggable: true }, keybindingService, notificationService, contextKeyService, themeService, contextMenuService);
        this._actions = _actions;
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._commandService = _commandService;
        this._instantiationService = _instantiationService;
        // Register listeners to update the tab
        this._register(this._terminalService.onDidChangeInstancePrimaryStatus(e => this.updateLabel(e)));
        this._register(this._terminalGroupService.onDidChangeActiveInstance(() => this.updateLabel()));
        this._register(this._terminalService.onDidChangeInstanceIcon(e => this.updateLabel(e.instance)));
        this._register(this._terminalService.onDidChangeInstanceColor(e => this.updateLabel(e.instance)));
        this._register(this._terminalService.onDidChangeInstanceTitle(e => {
            if (e === this._terminalGroupService.activeInstance) {
                this._action.tooltip = getSingleTabTooltip(e, this._terminalService.configHelper.config.tabs.separator);
                this.updateLabel();
            }
        }));
        this._register(this._terminalService.onDidChangeInstanceCapability(e => {
            this._action.tooltip = getSingleTabTooltip(e, this._terminalService.configHelper.config.tabs.separator);
            this.updateLabel(e);
        }));
        // Clean up on dispose
        this._register(toDisposable(() => dispose(this._elementDisposables)));
    }
    async onClick(event) {
        if (event.altKey && this._menuItemAction.alt) {
            this._commandService.executeCommand(this._menuItemAction.alt.id, { target: TerminalLocation.Panel });
        }
        else {
            this._openContextMenu();
        }
    }
    updateLabel(e) {
        // Only update if it's the active instance
        if (e && e !== this._terminalGroupService.activeInstance) {
            return;
        }
        if (this._elementDisposables.length === 0 && this.element && this.label) {
            // Right click opens context menu
            this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.CONTEXT_MENU, e => {
                if (e.button === 2) {
                    this._openContextMenu();
                    e.preventDefault();
                }
            }));
            // Middle click kills
            this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.AUXCLICK, e => {
                if (e.button === 1) {
                    const instance = this._terminalGroupService.activeInstance;
                    if (instance) {
                        this._terminalService.safeDisposeTerminal(instance);
                    }
                    e.preventDefault();
                }
            }));
            // Drag and drop
            this._elementDisposables.push(dom.addDisposableListener(this.element, dom.EventType.DRAG_START, e => {
                const instance = this._terminalGroupService.activeInstance;
                if (e.dataTransfer && instance) {
                    e.dataTransfer.setData("Terminals" /* TerminalDataTransfers.Terminals */, JSON.stringify([instance.resource.toString()]));
                }
            }));
        }
        if (this.label) {
            const label = this.label;
            const instance = this._terminalGroupService.activeInstance;
            if (!instance) {
                dom.reset(label, '');
                return;
            }
            label.classList.add('single-terminal-tab');
            let colorStyle = '';
            const primaryStatus = instance.statusList.primary;
            if (primaryStatus) {
                const colorKey = getColorForSeverity(primaryStatus.severity);
                this._themeService.getColorTheme();
                const foundColor = this._themeService.getColorTheme().getColor(colorKey);
                if (foundColor) {
                    colorStyle = foundColor.toString();
                }
            }
            label.style.color = colorStyle;
            dom.reset(label, ...renderLabelWithIcons(this._instantiationService.invokeFunction(getSingleTabLabel, instance, this._terminalService.configHelper.config.tabs.separator, ThemeIcon.isThemeIcon(this._commandAction.item.icon) ? this._commandAction.item.icon : undefined)));
            if (this._altCommand) {
                label.classList.remove(this._altCommand);
                this._altCommand = undefined;
            }
            if (this._color) {
                label.classList.remove(this._color);
                this._color = undefined;
            }
            if (this._class) {
                label.classList.remove(this._class);
                label.classList.remove('terminal-uri-icon');
                this._class = undefined;
            }
            const colorClass = getColorClass(instance);
            if (colorClass) {
                this._color = colorClass;
                label.classList.add(colorClass);
            }
            const uriClasses = getUriClasses(instance, this._themeService.getColorTheme().type);
            if (uriClasses) {
                this._class = uriClasses?.[0];
                label.classList.add(...uriClasses);
            }
            if (this._commandAction.item.icon) {
                this._altCommand = `alt-command`;
                label.classList.add(this._altCommand);
            }
            this.updateTooltip();
        }
    }
    _openContextMenu() {
        this._contextMenuService.showContextMenu({
            getAnchor: () => this.element,
            getActions: () => this._actions,
            getActionsContext: () => this.label
        });
    }
};
SingleTerminalTabActionViewItem = __decorate([
    __param(2, IKeybindingService),
    __param(3, INotificationService),
    __param(4, IContextKeyService),
    __param(5, IThemeService),
    __param(6, ITerminalService),
    __param(7, ITerminalGroupService),
    __param(8, IContextMenuService),
    __param(9, ICommandService),
    __param(10, IInstantiationService)
], SingleTerminalTabActionViewItem);
function getSingleTabLabel(accessor, instance, separator, icon) {
    // Don't even show the icon if there is no title as the icon would shift around when the title
    // is added
    if (!instance || !instance.title) {
        return '';
    }
    const iconClass = ThemeIcon.isThemeIcon(instance.icon) ? instance.icon.id : accessor.get(ITerminalProfileResolverService).getDefaultIcon();
    const label = `$(${icon?.id || iconClass}) ${getSingleTabTitle(instance, separator)}`;
    const primaryStatus = instance.statusList.primary;
    if (!primaryStatus?.icon) {
        return label;
    }
    return `${label} $(${primaryStatus.icon.id})`;
}
function getSingleTabTooltip(instance, separator) {
    if (!instance) {
        return '';
    }
    const shellIntegrationString = getShellIntegrationTooltip(instance, false);
    const title = getSingleTabTitle(instance, separator);
    return shellIntegrationString ? title + shellIntegrationString : title;
}
function getSingleTabTitle(instance, separator) {
    if (!instance) {
        return '';
    }
    return !instance.description ? instance.title : `${instance.title} ${separator} ${instance.description}`;
}
let TerminalThemeIconStyle = class TerminalThemeIconStyle extends Themable {
    _themeService;
    _terminalService;
    _terminalGroupService;
    _styleElement;
    constructor(container, _themeService, _terminalService, _terminalGroupService) {
        super(_themeService);
        this._themeService = _themeService;
        this._terminalService = _terminalService;
        this._terminalGroupService = _terminalGroupService;
        this._registerListeners();
        this._styleElement = document.createElement('style');
        container.appendChild(this._styleElement);
        this._register(toDisposable(() => container.removeChild(this._styleElement)));
        this.updateStyles();
    }
    _registerListeners() {
        this._register(this._terminalService.onDidChangeInstanceIcon(() => this.updateStyles()));
        this._register(this._terminalService.onDidChangeInstanceColor(() => this.updateStyles()));
        this._register(this._terminalService.onDidChangeInstances(() => this.updateStyles()));
        this._register(this._terminalGroupService.onDidChangeGroups(() => this.updateStyles()));
    }
    updateStyles() {
        super.updateStyles();
        const colorTheme = this._themeService.getColorTheme();
        // TODO: add a rule collector to avoid duplication
        let css = '';
        // Add icons
        for (const instance of this._terminalService.instances) {
            const icon = instance.icon;
            if (!icon) {
                continue;
            }
            let uri = undefined;
            if (icon instanceof URI) {
                uri = icon;
            }
            else if (icon instanceof Object && 'light' in icon && 'dark' in icon) {
                uri = colorTheme.type === ColorScheme.LIGHT ? icon.light : icon.dark;
            }
            const iconClasses = getUriClasses(instance, colorTheme.type);
            if (uri instanceof URI && iconClasses && iconClasses.length > 1) {
                css += (`.monaco-workbench .${iconClasses[0]} .monaco-highlighted-label .codicon, .monaco-action-bar .terminal-uri-icon.single-terminal-tab.action-label:not(.alt-command) .codicon` +
                    `{background-image: ${dom.asCSSUrl(uri)};}`);
            }
        }
        // Add colors
        for (const instance of this._terminalService.instances) {
            const colorClass = getColorClass(instance);
            if (!colorClass || !instance.color) {
                continue;
            }
            const color = colorTheme.getColor(instance.color);
            if (color) {
                // exclude status icons (file-icon) and inline action icons (trashcan and horizontalSplit)
                css += (`.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon)` +
                    `{ color: ${color} !important; }`);
            }
        }
        this._styleElement.textContent = css;
    }
};
TerminalThemeIconStyle = __decorate([
    __param(1, IThemeService),
    __param(2, ITerminalService),
    __param(3, ITerminalGroupService)
], TerminalThemeIconStyle);
