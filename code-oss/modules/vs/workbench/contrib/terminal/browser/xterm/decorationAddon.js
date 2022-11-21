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
import * as dom from 'vs/base/browser/dom';
import { Separator } from 'vs/base/common/actions';
import { Emitter } from 'vs/base/common/event';
import { Disposable, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IThemeService, registerThemingParticipant, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { terminalDecorationError, terminalDecorationIncomplete, terminalDecorationMark, terminalDecorationSuccess } from 'vs/workbench/contrib/terminal/browser/terminalIcons';
import { TerminalDecorationHoverManager, updateLayout } from 'vs/workbench/contrib/terminal/browser/xterm/decorationStyles';
import { TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR, TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR, TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR } from 'vs/workbench/contrib/terminal/common/terminalColorRegistry';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
let DecorationAddon = class DecorationAddon extends Disposable {
    _capabilities;
    _clipboardService;
    _contextMenuService;
    _configurationService;
    _themeService;
    _openerService;
    _quickInputService;
    _terminal;
    _capabilityDisposables = new Map();
    _decorations = new Map();
    _placeholderDecoration;
    _showGutterDecorations;
    _showOverviewRulerDecorations;
    _terminalDecorationHoverService;
    _onDidRequestRunCommand = this._register(new Emitter());
    onDidRequestRunCommand = this._onDidRequestRunCommand.event;
    constructor(_capabilities, _clipboardService, _contextMenuService, _configurationService, _themeService, _openerService, _quickInputService, lifecycleService, instantiationService) {
        super();
        this._capabilities = _capabilities;
        this._clipboardService = _clipboardService;
        this._contextMenuService = _contextMenuService;
        this._configurationService = _configurationService;
        this._themeService = _themeService;
        this._openerService = _openerService;
        this._quickInputService = _quickInputService;
        this._register(toDisposable(() => this._dispose()));
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.fontSize" /* TerminalSettingId.FontSize */) || e.affectsConfiguration("terminal.integrated.lineHeight" /* TerminalSettingId.LineHeight */)) {
                this.refreshLayouts();
            }
            else if (e.affectsConfiguration('workbench.colorCustomizations')) {
                this._refreshStyles(true);
            }
            else if (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */)) {
                this._removeCapabilityDisposables(2 /* TerminalCapability.CommandDetection */);
                this._updateDecorationVisibility();
            }
            else if (e.affectsConfiguration("task.showDecorations" /* TaskSettingId.ShowDecorations */)) {
                this._updateDecorationVisibility();
            }
        }));
        this._register(this._themeService.onDidColorThemeChange(() => this._refreshStyles(true)));
        this._updateDecorationVisibility();
        this._register(this._capabilities.onDidAddCapability(c => this._createCapabilityDisposables(c)));
        this._register(this._capabilities.onDidRemoveCapability(c => this._removeCapabilityDisposables(c)));
        this._register(lifecycleService.onWillShutdown(() => this._disposeAllDecorations()));
        this._terminalDecorationHoverService = instantiationService.createInstance(TerminalDecorationHoverManager);
    }
    _removeCapabilityDisposables(c) {
        const disposables = this._capabilityDisposables.get(c);
        if (disposables) {
            dispose(disposables);
        }
        this._capabilityDisposables.delete(c);
    }
    _createCapabilityDisposables(c) {
        let disposables = [];
        const capability = this._capabilities.get(c);
        if (!capability || this._capabilityDisposables.has(c)) {
            return;
        }
        switch (capability.type) {
            case 4 /* TerminalCapability.BufferMarkDetection */:
                disposables = [capability.onMarkAdded(mark => this.registerMarkDecoration(mark))];
                break;
            case 2 /* TerminalCapability.CommandDetection */:
                disposables = this._getCommandDetectionListeners(capability);
                break;
        }
        this._capabilityDisposables.set(c, disposables);
    }
    registerMarkDecoration(mark) {
        if (!this._terminal || (!this._showGutterDecorations && !this._showOverviewRulerDecorations)) {
            return undefined;
        }
        if (mark.hidden) {
            return undefined;
        }
        return this.registerCommandDecoration(undefined, undefined, mark);
    }
    _updateDecorationVisibility() {
        const showDecorations = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
        this._showGutterDecorations = (showDecorations === 'both' || showDecorations === 'gutter');
        this._showOverviewRulerDecorations = (showDecorations === 'both' || showDecorations === 'overviewRuler');
        this._disposeAllDecorations();
        if (this._showGutterDecorations || this._showOverviewRulerDecorations) {
            this._attachToCommandCapability();
            this._updateGutterDecorationVisibility();
        }
        const currentCommand = this._capabilities.get(2 /* TerminalCapability.CommandDetection */)?.executingCommandObject;
        if (currentCommand) {
            this.registerCommandDecoration(currentCommand, true);
        }
    }
    _disposeAllDecorations() {
        this._placeholderDecoration?.dispose();
        for (const value of this._decorations.values()) {
            value.decoration.dispose();
            dispose(value.disposables);
        }
    }
    _updateGutterDecorationVisibility() {
        const commandDecorationElements = document.querySelectorAll("terminal-command-decoration" /* DecorationSelector.CommandDecoration */);
        for (const commandDecorationElement of commandDecorationElements) {
            this._updateCommandDecorationVisibility(commandDecorationElement);
        }
    }
    _updateCommandDecorationVisibility(commandDecorationElement) {
        if (this._showGutterDecorations) {
            commandDecorationElement.classList.remove("hide" /* DecorationSelector.Hide */);
        }
        else {
            commandDecorationElement.classList.add("hide" /* DecorationSelector.Hide */);
        }
    }
    refreshLayouts() {
        updateLayout(this._configurationService, this._placeholderDecoration?.element);
        for (const decoration of this._decorations) {
            updateLayout(this._configurationService, decoration[1].decoration.element);
        }
    }
    _refreshStyles(refreshOverviewRulerColors) {
        if (refreshOverviewRulerColors) {
            for (const decoration of this._decorations.values()) {
                let color = decoration.exitCode === undefined ? defaultColor : decoration.exitCode ? errorColor : successColor;
                if (color && typeof color !== 'string') {
                    color = color.toString();
                }
                else {
                    color = '';
                }
                if (decoration.decoration.options?.overviewRulerOptions) {
                    decoration.decoration.options.overviewRulerOptions.color = color;
                }
                else if (decoration.decoration.options) {
                    decoration.decoration.options.overviewRulerOptions = { color };
                }
            }
        }
        this._updateClasses(this._placeholderDecoration?.element);
        for (const decoration of this._decorations.values()) {
            this._updateClasses(decoration.decoration.element, decoration.exitCode, decoration.markProperties);
        }
    }
    _dispose() {
        this._terminalDecorationHoverService.dispose();
        for (const disposable of this._capabilityDisposables.values()) {
            dispose(disposable);
        }
        this.clearDecorations();
    }
    _clearPlaceholder() {
        this._placeholderDecoration?.dispose();
        this._placeholderDecoration = undefined;
    }
    clearDecorations() {
        this._placeholderDecoration?.marker.dispose();
        this._clearPlaceholder();
        this._disposeAllDecorations();
        this._decorations.clear();
    }
    _attachToCommandCapability() {
        if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
            this._getCommandDetectionListeners(this._capabilities.get(2 /* TerminalCapability.CommandDetection */));
        }
    }
    _getCommandDetectionListeners(capability) {
        if (this._capabilityDisposables.has(2 /* TerminalCapability.CommandDetection */)) {
            const disposables = this._capabilityDisposables.get(2 /* TerminalCapability.CommandDetection */);
            dispose(disposables);
            this._capabilityDisposables.delete(capability.type);
        }
        const commandDetectionListeners = [];
        // Command started
        if (capability.executingCommandObject?.marker) {
            this.registerCommandDecoration(capability.executingCommandObject, true);
        }
        commandDetectionListeners.push(capability.onCommandStarted(command => this.registerCommandDecoration(command, true)));
        // Command finished
        for (const command of capability.commands) {
            this.registerCommandDecoration(command);
        }
        commandDetectionListeners.push(capability.onCommandFinished(command => this.registerCommandDecoration(command)));
        // Command invalidated
        commandDetectionListeners.push(capability.onCommandInvalidated(commands => {
            for (const command of commands) {
                const id = command.marker?.id;
                if (id) {
                    const match = this._decorations.get(id);
                    if (match) {
                        match.decoration.dispose();
                        dispose(match.disposables);
                    }
                }
            }
        }));
        // Current command invalidated
        commandDetectionListeners.push(capability.onCurrentCommandInvalidated((request) => {
            if (request.reason === "noProblemsReported" /* CommandInvalidationReason.NoProblemsReported */) {
                const lastDecoration = Array.from(this._decorations.entries())[this._decorations.size - 1];
                lastDecoration?.[1].decoration.dispose();
            }
            else if (request.reason === "windows" /* CommandInvalidationReason.Windows */) {
                this._clearPlaceholder();
            }
        }));
        return commandDetectionListeners;
    }
    activate(terminal) {
        this._terminal = terminal;
        this._attachToCommandCapability();
    }
    registerCommandDecoration(command, beforeCommandExecution, markProperties) {
        if (!this._terminal || (beforeCommandExecution && !command) || (!this._showGutterDecorations && !this._showOverviewRulerDecorations)) {
            return undefined;
        }
        const marker = command?.marker || markProperties?.marker;
        if (!marker) {
            throw new Error(`cannot add a decoration for a command ${JSON.stringify(command)} with no marker`);
        }
        this._clearPlaceholder();
        let color = command?.exitCode === undefined ? defaultColor : command.exitCode ? errorColor : successColor;
        if (color && typeof color !== 'string') {
            color = color.toString();
        }
        else {
            color = '';
        }
        const decoration = this._terminal.registerDecoration({
            marker,
            overviewRulerOptions: this._showOverviewRulerDecorations ? (beforeCommandExecution
                ? { color, position: 'left' }
                : { color, position: command?.exitCode ? 'right' : 'left' }) : undefined
        });
        if (!decoration) {
            return undefined;
        }
        if (beforeCommandExecution) {
            this._placeholderDecoration = decoration;
        }
        decoration.onRender(element => {
            if (element.classList.contains(".xterm-decoration-overview-ruler" /* DecorationSelector.OverviewRuler */)) {
                return;
            }
            if (!this._decorations.get(decoration.marker.id)) {
                decoration.onDispose(() => this._decorations.delete(decoration.marker.id));
                this._decorations.set(decoration.marker.id, {
                    decoration,
                    disposables: this._createDisposables(element, command, markProperties),
                    exitCode: command?.exitCode,
                    markProperties: command?.markProperties
                });
            }
            if (!element.classList.contains("codicon" /* DecorationSelector.Codicon */) || command?.marker?.line === 0) {
                // first render or buffer was cleared
                updateLayout(this._configurationService, element);
                this._updateClasses(element, command?.exitCode, command?.markProperties || markProperties);
            }
        });
        return decoration;
    }
    _createDisposables(element, command, markProperties) {
        if (command?.exitCode === undefined && !command?.markProperties) {
            return [];
        }
        else if (command?.markProperties || markProperties) {
            return [this._terminalDecorationHoverService.createHover(element, command || markProperties, markProperties?.hoverMessage)];
        }
        return [this._createContextMenu(element, command), this._terminalDecorationHoverService.createHover(element, command)];
    }
    _updateClasses(element, exitCode, markProperties) {
        if (!element) {
            return;
        }
        for (const classes of element.classList) {
            element.classList.remove(classes);
        }
        element.classList.add("terminal-command-decoration" /* DecorationSelector.CommandDecoration */, "codicon" /* DecorationSelector.Codicon */, "xterm-decoration" /* DecorationSelector.XtermDecoration */);
        if (markProperties) {
            element.classList.add("default-color" /* DecorationSelector.DefaultColor */, ...ThemeIcon.asClassNameArray(terminalDecorationMark));
            if (!markProperties.hoverMessage) {
                //disable the mouse pointer
                element.classList.add("default" /* DecorationSelector.Default */);
            }
        }
        else {
            // command decoration
            this._updateCommandDecorationVisibility(element);
            if (exitCode === undefined) {
                element.classList.add("default-color" /* DecorationSelector.DefaultColor */, "default" /* DecorationSelector.Default */);
                element.classList.add(...ThemeIcon.asClassNameArray(terminalDecorationIncomplete));
            }
            else if (exitCode) {
                element.classList.add("error" /* DecorationSelector.ErrorColor */);
                element.classList.add(...ThemeIcon.asClassNameArray(terminalDecorationError));
            }
            else {
                element.classList.add(...ThemeIcon.asClassNameArray(terminalDecorationSuccess));
            }
        }
    }
    _createContextMenu(element, command) {
        // When the xterm Decoration gets disposed of, its element gets removed from the dom
        // along with its listeners
        return dom.addDisposableListener(element, dom.EventType.CLICK, async () => {
            this._terminalDecorationHoverService.hideHover();
            const actions = await this._getCommandActions(command);
            this._contextMenuService.showContextMenu({ getAnchor: () => element, getActions: () => actions });
        });
    }
    async _getCommandActions(command) {
        const actions = [];
        if (command.command !== '') {
            const labelRun = localize("terminal.rerunCommand", 'Rerun Command');
            actions.push({
                class: undefined, tooltip: labelRun, id: 'terminal.rerunCommand', label: labelRun, enabled: true,
                run: () => this._onDidRequestRunCommand.fire({ command })
            });
            const labelCopy = localize("terminal.copyCommand", 'Copy Command');
            actions.push({
                class: undefined, tooltip: labelCopy, id: 'terminal.copyCommand', label: labelCopy, enabled: true,
                run: () => this._clipboardService.writeText(command.command)
            });
        }
        if (command.hasOutput()) {
            if (actions.length > 0) {
                actions.push(new Separator());
            }
            const labelText = localize("terminal.copyOutput", 'Copy Output');
            actions.push({
                class: undefined, tooltip: labelText, id: 'terminal.copyOutput', label: labelText, enabled: true,
                run: () => {
                    const text = command.getOutput();
                    if (typeof text === 'string') {
                        this._clipboardService.writeText(text);
                    }
                }
            });
            const labelHtml = localize("terminal.copyOutputAsHtml", 'Copy Output as HTML');
            actions.push({
                class: undefined, tooltip: labelHtml, id: 'terminal.copyOutputAsHtml', label: labelHtml, enabled: true,
                run: () => this._onDidRequestRunCommand.fire({ command, copyAsHtml: true })
            });
        }
        if (actions.length > 0) {
            actions.push(new Separator());
        }
        const labelConfigure = localize("terminal.configureCommandDecorations", 'Configure Command Decorations');
        actions.push({
            class: undefined, tooltip: labelConfigure, id: 'terminal.configureCommandDecorations', label: labelConfigure, enabled: true,
            run: () => this._showConfigureCommandDecorationsQuickPick()
        });
        const labelAbout = localize("terminal.learnShellIntegration", 'Learn About Shell Integration');
        actions.push({
            class: undefined, tooltip: labelAbout, id: 'terminal.learnShellIntegration', label: labelAbout, enabled: true,
            run: () => this._openerService.open('https://code.visualstudio.com/docs/terminal/shell-integration')
        });
        return actions;
    }
    async _showConfigureCommandDecorationsQuickPick() {
        const quickPick = this._quickInputService.createQuickPick();
        quickPick.items = [
            { id: 'a', label: localize('toggleVisibility', 'Toggle visibility') },
        ];
        quickPick.canSelectMany = false;
        quickPick.onDidAccept(async (e) => {
            quickPick.hide();
            const result = quickPick.activeItems[0];
            switch (result.id) {
                case 'a':
                    this._showToggleVisibilityQuickPick();
                    break;
            }
        });
        quickPick.show();
    }
    _showToggleVisibilityQuickPick() {
        const quickPick = this._quickInputService.createQuickPick();
        quickPick.hideInput = true;
        quickPick.hideCheckAll = true;
        quickPick.canSelectMany = true;
        quickPick.title = localize('toggleVisibility', 'Toggle visibility');
        const configValue = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */);
        const gutterIcon = {
            label: localize('gutter', 'Gutter command decorations'),
            picked: configValue !== 'never' && configValue !== 'overviewRuler'
        };
        const overviewRulerIcon = {
            label: localize('overviewRuler', 'Overview ruler command decorations'),
            picked: configValue !== 'never' && configValue !== 'gutter'
        };
        quickPick.items = [gutterIcon, overviewRulerIcon];
        const selectedItems = [];
        if (configValue !== 'never') {
            if (configValue !== 'gutter') {
                selectedItems.push(gutterIcon);
            }
            if (configValue !== 'overviewRuler') {
                selectedItems.push(overviewRulerIcon);
            }
        }
        quickPick.selectedItems = selectedItems;
        quickPick.onDidChangeSelection(async (e) => {
            let newValue = 'never';
            if (e.includes(gutterIcon)) {
                if (e.includes(overviewRulerIcon)) {
                    newValue = 'both';
                }
                else {
                    newValue = 'gutter';
                }
            }
            else if (e.includes(overviewRulerIcon)) {
                newValue = 'overviewRuler';
            }
            await this._configurationService.updateValue("terminal.integrated.shellIntegration.decorationsEnabled" /* TerminalSettingId.ShellIntegrationDecorationsEnabled */, newValue);
        });
        quickPick.ok = false;
        quickPick.show();
    }
};
DecorationAddon = __decorate([
    __param(1, IClipboardService),
    __param(2, IContextMenuService),
    __param(3, IConfigurationService),
    __param(4, IThemeService),
    __param(5, IOpenerService),
    __param(6, IQuickInputService),
    __param(7, ILifecycleService),
    __param(8, IInstantiationService)
], DecorationAddon);
export { DecorationAddon };
let successColor;
let errorColor;
let defaultColor;
registerThemingParticipant((theme) => {
    successColor = theme.getColor(TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR);
    errorColor = theme.getColor(TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR);
    defaultColor = theme.getColor(TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR);
});
