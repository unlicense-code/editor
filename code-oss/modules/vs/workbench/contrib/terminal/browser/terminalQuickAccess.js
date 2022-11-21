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
import { PickerQuickAccessProvider, TriggerAction } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { matchesFuzzy } from 'vs/base/common/filters';
import { ITerminalEditorService, ITerminalGroupService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { killTerminalIcon, renameTerminalIcon } from 'vs/workbench/contrib/terminal/browser/terminalIcons';
import { getColorClass, getIconId, getUriClasses } from 'vs/workbench/contrib/terminal/browser/terminalIcon';
import { terminalStrings } from 'vs/workbench/contrib/terminal/common/terminalStrings';
import { TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
let terminalPicks = [];
let TerminalQuickAccessProvider = class TerminalQuickAccessProvider extends PickerQuickAccessProvider {
    _editorService;
    _terminalService;
    _terminalEditorService;
    _terminalGroupService;
    _commandService;
    _themeService;
    _instantiationService;
    static PREFIX = 'term ';
    constructor(_editorService, _terminalService, _terminalEditorService, _terminalGroupService, _commandService, _themeService, _instantiationService) {
        super(TerminalQuickAccessProvider.PREFIX, { canAcceptInBackground: true });
        this._editorService = _editorService;
        this._terminalService = _terminalService;
        this._terminalEditorService = _terminalEditorService;
        this._terminalGroupService = _terminalGroupService;
        this._commandService = _commandService;
        this._themeService = _themeService;
        this._instantiationService = _instantiationService;
    }
    _getPicks(filter) {
        terminalPicks = [];
        terminalPicks.push({ type: 'separator', label: 'panel' });
        const terminalGroups = this._terminalGroupService.groups;
        for (let groupIndex = 0; groupIndex < terminalGroups.length; groupIndex++) {
            const terminalGroup = terminalGroups[groupIndex];
            for (let terminalIndex = 0; terminalIndex < terminalGroup.terminalInstances.length; terminalIndex++) {
                const terminal = terminalGroup.terminalInstances[terminalIndex];
                const pick = this._createPick(terminal, terminalIndex, filter, { groupIndex, groupSize: terminalGroup.terminalInstances.length });
                if (pick) {
                    terminalPicks.push(pick);
                }
            }
        }
        if (terminalPicks.length > 0) {
            terminalPicks.push({ type: 'separator', label: 'editor' });
        }
        const terminalEditors = this._terminalEditorService.instances;
        for (let editorIndex = 0; editorIndex < terminalEditors.length; editorIndex++) {
            const term = terminalEditors[editorIndex];
            term.target = TerminalLocation.Editor;
            const pick = this._createPick(term, editorIndex, filter);
            if (pick) {
                terminalPicks.push(pick);
            }
        }
        if (terminalPicks.length > 0) {
            terminalPicks.push({ type: 'separator' });
        }
        const createTerminalLabel = localize("workbench.action.terminal.newplus", "Create New Terminal");
        terminalPicks.push({
            label: `$(plus) ${createTerminalLabel}`,
            ariaLabel: createTerminalLabel,
            accept: () => this._commandService.executeCommand("workbench.action.terminal.new" /* TerminalCommandId.New */)
        });
        const createWithProfileLabel = localize("workbench.action.terminal.newWithProfilePlus", "Create New Terminal With Profile");
        terminalPicks.push({
            label: `$(plus) ${createWithProfileLabel}`,
            ariaLabel: createWithProfileLabel,
            accept: () => this._commandService.executeCommand("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */)
        });
        return terminalPicks;
    }
    _createPick(terminal, terminalIndex, filter, groupInfo) {
        const iconId = this._instantiationService.invokeFunction(getIconId, terminal);
        const index = groupInfo
            ? (groupInfo.groupSize > 1
                ? `${groupInfo.groupIndex + 1}.${terminalIndex + 1}`
                : `${groupInfo.groupIndex + 1}`)
            : `${terminalIndex + 1}`;
        const label = `$(${iconId}) ${index}: ${terminal.title}`;
        const iconClasses = [];
        const colorClass = getColorClass(terminal);
        if (colorClass) {
            iconClasses.push(colorClass);
        }
        const uriClasses = getUriClasses(terminal, this._themeService.getColorTheme().type);
        if (uriClasses) {
            iconClasses.push(...uriClasses);
        }
        const highlights = matchesFuzzy(filter, label, true);
        if (highlights) {
            return {
                label,
                description: terminal.description,
                highlights: { label: highlights },
                buttons: [
                    {
                        iconClass: ThemeIcon.asClassName(renameTerminalIcon),
                        tooltip: localize('renameTerminal', "Rename Terminal")
                    },
                    {
                        iconClass: ThemeIcon.asClassName(killTerminalIcon),
                        tooltip: terminalStrings.kill.value
                    }
                ],
                iconClasses,
                trigger: buttonIndex => {
                    switch (buttonIndex) {
                        case 0:
                            this._commandService.executeCommand("workbench.action.terminal.rename" /* TerminalCommandId.Rename */, terminal);
                            return TriggerAction.NO_ACTION;
                        case 1:
                            this._terminalService.safeDisposeTerminal(terminal);
                            return TriggerAction.REMOVE_ITEM;
                    }
                    return TriggerAction.NO_ACTION;
                },
                accept: (keyMod, event) => {
                    if (terminal.target === TerminalLocation.Editor) {
                        const existingEditors = this._editorService.findEditors(terminal.resource);
                        this._terminalEditorService.openEditor(terminal, { viewColumn: existingEditors?.[0].groupId });
                        this._terminalEditorService.setActiveInstance(terminal);
                    }
                    else {
                        this._terminalGroupService.showPanel(!event.inBackground);
                        this._terminalGroupService.setActiveInstance(terminal);
                    }
                }
            };
        }
        return undefined;
    }
};
TerminalQuickAccessProvider = __decorate([
    __param(0, IEditorService),
    __param(1, ITerminalEditorService),
    __param(2, ITerminalEditorService),
    __param(3, ITerminalGroupService),
    __param(4, ICommandService),
    __param(5, IThemeService),
    __param(6, IInstantiationService)
], TerminalQuickAccessProvider);
export { TerminalQuickAccessProvider };
