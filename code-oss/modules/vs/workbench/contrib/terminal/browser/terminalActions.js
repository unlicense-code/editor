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
import { BrowserFeatures } from 'vs/base/browser/canIUse';
import { Action } from 'vs/base/common/actions';
import { Codicon } from 'vs/base/common/codicons';
import { Schemas } from 'vs/base/common/network';
import { isLinux, isWindows } from 'vs/base/common/platform';
import { withNullAsUndefined } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { localize } from 'vs/nls';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from 'vs/platform/accessibility/common/accessibility';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { ILabelService } from 'vs/platform/label/common/label';
import { IListService } from 'vs/platform/list/browser/listService';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { TerminalExitReason, TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from 'vs/workbench/browser/actions/workspaceCommands';
import { CLOSE_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { ResourceContextKey } from 'vs/workbench/common/contextkeys';
import { findInFilesCommand } from 'vs/workbench/contrib/search/browser/searchActionsFind';
import { ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { TerminalQuickAccessProvider } from 'vs/workbench/contrib/terminal/browser/terminalQuickAccess';
import { ITerminalProfileService, TERMINAL_ACTION_CATEGORY } from 'vs/workbench/contrib/terminal/common/terminal';
import { TerminalContextKeys } from 'vs/workbench/contrib/terminal/common/terminalContextKey';
import { createProfileSchemaEnums } from 'vs/platform/terminal/common/terminalProfiles';
import { terminalStrings } from 'vs/workbench/contrib/terminal/common/terminalStrings';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { isAbsolute } from 'vs/base/common/path';
import { AbstractVariableResolverService } from 'vs/workbench/services/configurationResolver/common/variableResolver';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { getIconId, getColorClass, getUriClasses } from 'vs/workbench/contrib/terminal/browser/terminalIcon';
import { clearShellFileHistory, getCommandHistory } from 'vs/workbench/contrib/terminal/common/history';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { CancellationToken } from 'vs/base/common/cancellation';
import { dirname } from 'vs/base/common/resources';
import { getIconClasses } from 'vs/editor/common/services/getIconClasses';
import { FileKind, IFileService } from 'vs/platform/files/common/files';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { VSBuffer } from 'vs/base/common/buffer';
import { killTerminalIcon, newTerminalIcon } from 'vs/workbench/contrib/terminal/browser/terminalIcons';
export const switchTerminalActionViewItemSeparator = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
export const switchTerminalShowTabsTitle = localize('showTerminalTabs', "Show Tabs");
export async function getCwdForSplit(configHelper, instance, folders, commandService) {
    switch (configHelper.config.splitCwd) {
        case 'workspaceRoot':
            if (folders !== undefined && commandService !== undefined) {
                if (folders.length === 1) {
                    return folders[0].uri;
                }
                else if (folders.length > 1) {
                    // Only choose a path when there's more than 1 folder
                    const options = {
                        placeHolder: localize('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal")
                    };
                    const workspace = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                    if (!workspace) {
                        // Don't split the instance if the workspace picker was canceled
                        return undefined;
                    }
                    return Promise.resolve(workspace.uri);
                }
            }
            return '';
        case 'initial':
            return instance.getInitialCwd();
        case 'inherited':
            return instance.getCwd();
    }
}
export const terminalSendSequenceCommand = (accessor, args) => {
    accessor.get(ITerminalService).doWithActiveInstance(async (t) => {
        if (!args?.text) {
            return;
        }
        const configurationResolverService = accessor.get(IConfigurationResolverService);
        const workspaceContextService = accessor.get(IWorkspaceContextService);
        const historyService = accessor.get(IHistoryService);
        const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(t.isRemote ? Schemas.vscodeRemote : Schemas.file);
        const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? withNullAsUndefined(workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri)) : undefined;
        const resolvedText = await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, args.text);
        t.sendText(resolvedText, false);
    });
};
const terminalIndexRe = /^([0-9]+): /;
let TerminalLaunchHelpAction = class TerminalLaunchHelpAction extends Action {
    _openerService;
    constructor(_openerService) {
        super('workbench.action.terminal.launchHelp', localize('terminalLaunchHelp', "Open Help"));
        this._openerService = _openerService;
    }
    async run() {
        this._openerService.open('https://aka.ms/vscode-troubleshoot-terminal-launch');
    }
};
TerminalLaunchHelpAction = __decorate([
    __param(0, IOpenerService)
], TerminalLaunchHelpAction);
export { TerminalLaunchHelpAction };
export function registerTerminalActions() {
    const category = { value: TERMINAL_ACTION_CATEGORY, original: 'Terminal' };
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.newInActiveWorkspace" /* TerminalCommandId.NewInActiveWorkspace */,
                title: { value: localize('workbench.action.terminal.newInActiveWorkspace', "Create New Terminal (In Active Workspace)"), original: 'Create New Terminal (In Active Workspace)' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            if (terminalService.isProcessSupportRegistered) {
                const instance = await terminalService.createTerminal({ location: terminalService.defaultLocation });
                if (!instance) {
                    return;
                }
                terminalService.setActiveInstance(instance);
            }
            await terminalGroupService.showPanel(true);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.quickFix" /* TerminalCommandId.QuickFix */,
                title: { value: localize('workbench.action.terminal.quickFix', "Quick Fix"), original: 'Quick Fix' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 84 /* KeyCode.Period */,
                    when: TerminalContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
            });
        }
        async run(accessor) {
            accessor.get(ITerminalService).activeInstance?.quickFix?.showMenu();
        }
    });
    // Register new with profile command
    refreshTerminalActions([]);
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.createTerminalEditor" /* TerminalCommandId.CreateTerminalEditor */,
                title: { value: localize('workbench.action.terminal.createTerminalEditor', "Create New Terminal in Editor Area"), original: 'Create New Terminal in Editor Area' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        async run(accessor, args) {
            const terminalService = accessor.get(ITerminalService);
            const options = (typeof args === 'object' && args && 'location' in args) ? args : { location: TerminalLocation.Editor };
            const instance = await terminalService.createTerminal(options);
            instance.focusWhenReady();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.createTerminalEditorSide" /* TerminalCommandId.CreateTerminalEditorSide */,
                title: { value: localize('workbench.action.terminal.createTerminalEditorSide', "Create New Terminal in Editor Area to the Side"), original: 'Create New Terminal in Editor Area to the Side' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const instance = await terminalService.createTerminal({
                location: { viewColumn: SIDE_GROUP }
            });
            instance.focusWhenReady();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.moveToEditor" /* TerminalCommandId.MoveToEditor */,
                title: terminalStrings.moveToEditor,
                f1: true,
                category,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.terminalEditorActive.toNegated(), TerminalContextKeys.viewShowing)
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            terminalService.doWithActiveInstance(instance => terminalService.moveToEditor(instance));
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.moveToEditorInstance" /* TerminalCommandId.MoveToEditorInstance */,
                title: terminalStrings.moveToEditor,
                f1: false,
                category,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.isOpen)
            });
        }
        async run(accessor) {
            const selectedInstances = getSelectedInstances(accessor);
            if (!selectedInstances || selectedInstances.length === 0) {
                return;
            }
            const terminalService = accessor.get(ITerminalService);
            for (const instance of selectedInstances) {
                terminalService.moveToEditor(instance);
            }
            selectedInstances[selectedInstances.length - 1].focus();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
                title: terminalStrings.moveToTerminalPanel,
                f1: true,
                category,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.terminalEditorActive),
            });
        }
        async run(accessor, resource) {
            const castedResource = URI.isUri(resource) ? resource : undefined;
            await accessor.get(ITerminalService).moveToTerminalView(castedResource);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.showTabs" /* TerminalCommandId.ShowTabs */,
                title: { value: localize('workbench.action.terminal.showTabs', "Show Tabs"), original: 'Show Tabs' },
                f1: false,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            accessor.get(ITerminalGroupService).showTabs();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.focusPreviousPane" /* TerminalCommandId.FocusPreviousPane */,
                title: { value: localize('workbench.action.terminal.focusPreviousPane', "Focus Previous Terminal in Terminal Group"), original: 'Focus Previous Terminal in Terminal Group' },
                f1: true,
                category,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */,
                    secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */],
                    mac: {
                        primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */,
                        secondary: [512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */]
                    },
                    when: TerminalContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            const terminalGroupService = accessor.get(ITerminalGroupService);
            terminalGroupService.activeGroup?.focusPreviousPane();
            await terminalGroupService.showPanel(true);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.focusNextPane" /* TerminalCommandId.FocusNextPane */,
                title: { value: localize('workbench.action.terminal.focusNextPane', "Focus Next Terminal in Terminal Group"), original: 'Focus Next Terminal in Terminal Group' },
                f1: true,
                category,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */,
                    secondary: [512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */],
                    mac: {
                        primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */,
                        secondary: [512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
                    },
                    when: TerminalContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            const terminalGroupService = accessor.get(ITerminalGroupService);
            terminalGroupService.activeGroup?.focusNextPane();
            await terminalGroupService.showPanel(true);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */,
                title: { value: localize('workbench.action.terminal.runRecentCommand', "Run Recent Command..."), original: 'Run Recent Command...' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const terminalEditorService = accessor.get(ITerminalEditorService);
            const instance = accessor.get(ITerminalService).activeInstance;
            if (instance) {
                await instance.runRecent('command');
                if (instance?.target === TerminalLocation.Editor) {
                    await terminalEditorService.revealActiveEditor();
                }
                else {
                    await terminalGroupService.showPanel(false);
                }
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.copyLastCommand" /* TerminalCommandId.CopyLastCommand */,
                title: { value: localize('workbench.action.terminal.copyLastCommand', 'Copy Last Command'), original: 'Copy Last Command' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            const instance = accessor.get(ITerminalService).activeInstance;
            const commands = instance?.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.commands;
            if (!commands || commands.length === 0) {
                return;
            }
            const command = commands[commands.length - 1];
            if (!command?.hasOutput()) {
                return;
            }
            const output = command.getOutput();
            if (output && typeof output === 'string') {
                await accessor.get(IClipboardService).writeText(output);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.goToRecentDirectory" /* TerminalCommandId.GoToRecentDirectory */,
                title: { value: localize('workbench.action.terminal.goToRecentDirectory', "Go to Recent Directory..."), original: 'Go to Recent Directory...' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const terminalEditorService = accessor.get(ITerminalEditorService);
            const instance = accessor.get(ITerminalService).activeInstance;
            if (instance) {
                await instance.runRecent('cwd');
                if (instance?.target === TerminalLocation.Editor) {
                    await terminalEditorService.revealActiveEditor();
                }
                else {
                    await terminalGroupService.showPanel(false);
                }
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.resizePaneLeft" /* TerminalCommandId.ResizePaneLeft */,
                title: { value: localize('workbench.action.terminal.resizePaneLeft', "Resize Terminal Left"), original: 'Resize Terminal Left' },
                f1: true,
                category,
                keybinding: {
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 15 /* KeyCode.LeftArrow */ },
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 15 /* KeyCode.LeftArrow */ },
                    when: TerminalContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            accessor.get(ITerminalGroupService).activeGroup?.resizePane(0 /* Direction.Left */);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.resizePaneRight" /* TerminalCommandId.ResizePaneRight */,
                title: { value: localize('workbench.action.terminal.resizePaneRight', "Resize Terminal Right"), original: 'Resize Terminal Right' },
                f1: true,
                category,
                keybinding: {
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 17 /* KeyCode.RightArrow */ },
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 17 /* KeyCode.RightArrow */ },
                    when: TerminalContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            accessor.get(ITerminalGroupService).activeGroup?.resizePane(1 /* Direction.Right */);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.resizePaneUp" /* TerminalCommandId.ResizePaneUp */,
                title: { value: localize('workbench.action.terminal.resizePaneUp', "Resize Terminal Up"), original: 'Resize Terminal Up' },
                f1: true,
                category,
                keybinding: {
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 16 /* KeyCode.UpArrow */ },
                    when: TerminalContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            accessor.get(ITerminalGroupService).activeGroup?.resizePane(2 /* Direction.Up */);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.resizePaneDown" /* TerminalCommandId.ResizePaneDown */,
                title: { value: localize('workbench.action.terminal.resizePaneDown', "Resize Terminal Down"), original: 'Resize Terminal Down' },
                f1: true,
                category,
                keybinding: {
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 18 /* KeyCode.DownArrow */ },
                    when: TerminalContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            accessor.get(ITerminalGroupService).activeGroup?.resizePane(3 /* Direction.Down */);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
                title: terminalStrings.focus,
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const instance = terminalService.activeInstance || await terminalService.createTerminal({ location: TerminalLocation.Panel });
            if (!instance) {
                return;
            }
            terminalService.setActiveInstance(instance);
            return terminalGroupService.showPanel(true);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.focusTabs" /* TerminalCommandId.FocusTabs */,
                title: { value: localize('workbench.action.terminal.focus.tabsView', "Focus Terminal Tabs View"), original: 'Focus Terminal Tabs View' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 88 /* KeyCode.Backslash */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: ContextKeyExpr.or(TerminalContextKeys.tabsFocus, TerminalContextKeys.focus),
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            accessor.get(ITerminalGroupService).focusTabs();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.focusNext" /* TerminalCommandId.FocusNext */,
                title: { value: localize('workbench.action.terminal.focusNext', "Focus Next Terminal Group"), original: 'Focus Next Terminal Group' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 12 /* KeyCode.PageDown */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 89 /* KeyCode.BracketRight */
                    },
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async run(accessor) {
            const terminalGroupService = accessor.get(ITerminalGroupService);
            terminalGroupService.setActiveGroupToNext();
            await terminalGroupService.showPanel(true);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.focusPrevious" /* TerminalCommandId.FocusPrevious */,
                title: { value: localize('workbench.action.terminal.focusPrevious', "Focus Previous Terminal Group"), original: 'Focus Previous Terminal Group' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 11 /* KeyCode.PageUp */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 87 /* KeyCode.BracketLeft */
                    },
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            });
        }
        async run(accessor) {
            const terminalGroupService = accessor.get(ITerminalGroupService);
            terminalGroupService.setActiveGroupToPrevious();
            await terminalGroupService.showPanel(true);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
                title: { value: localize('workbench.action.terminal.runSelectedText', "Run Selected Text In Active Terminal"), original: 'Run Selected Text In Active Terminal' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const codeEditorService = accessor.get(ICodeEditorService);
            const terminalEditorService = accessor.get(ITerminalEditorService);
            const instance = await terminalService.getActiveOrCreateInstance();
            const editor = codeEditorService.getActiveCodeEditor();
            if (!editor || !editor.hasModel()) {
                return;
            }
            const selection = editor.getSelection();
            let text;
            if (selection.isEmpty()) {
                text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
            }
            else {
                const endOfLinePreference = isWindows ? 1 /* EndOfLinePreference.LF */ : 2 /* EndOfLinePreference.CRLF */;
                text = editor.getModel().getValueInRange(selection, endOfLinePreference);
            }
            instance.sendText(text, true);
            if (instance.target === TerminalLocation.Editor) {
                await terminalEditorService.revealActiveEditor();
            }
            else {
                await terminalGroupService.showPanel();
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
                title: { value: localize('workbench.action.terminal.runActiveFile', "Run Active File In Active Terminal"), original: 'Run Active File In Active Terminal' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const codeEditorService = accessor.get(ICodeEditorService);
            const notificationService = accessor.get(INotificationService);
            const workbenchEnvironmentService = accessor.get(IWorkbenchEnvironmentService);
            const editor = codeEditorService.getActiveCodeEditor();
            if (!editor || !editor.hasModel()) {
                return;
            }
            let instance = terminalService.activeInstance;
            const isRemote = instance ? instance.isRemote : (workbenchEnvironmentService.remoteAuthority ? true : false);
            const uri = editor.getModel().uri;
            if ((!isRemote && uri.scheme !== Schemas.file) || (isRemote && uri.scheme !== Schemas.vscodeRemote)) {
                notificationService.warn(localize('workbench.action.terminal.runActiveFile.noFile', 'Only files on disk can be run in the terminal'));
                return;
            }
            if (!instance) {
                instance = await terminalService.getActiveOrCreateInstance();
            }
            // TODO: Convert this to ctrl+c, ctrl+v for pwsh?
            await instance.sendPath(uri.fsPath, true);
            return terminalGroupService.showPanel();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.scrollDown" /* TerminalCommandId.ScrollDownLine */,
                title: { value: localize('workbench.action.terminal.scrollDown', "Scroll Down (Line)"), original: 'Scroll Down (Line)' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 12 /* KeyCode.PageDown */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */ },
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.altBufferActive.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.scrollDownLine();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.scrollDownPage" /* TerminalCommandId.ScrollDownPage */,
                title: { value: localize('workbench.action.terminal.scrollDownPage', "Scroll Down (Page)"), original: 'Scroll Down (Page)' },
                f1: true,
                category,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 12 /* KeyCode.PageDown */,
                    mac: { primary: 12 /* KeyCode.PageDown */ },
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.altBufferActive.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.scrollDownPage();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.scrollToBottom" /* TerminalCommandId.ScrollToBottom */,
                title: { value: localize('workbench.action.terminal.scrollToBottom', "Scroll to Bottom"), original: 'Scroll to Bottom' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 13 /* KeyCode.End */,
                    linux: { primary: 1024 /* KeyMod.Shift */ | 13 /* KeyCode.End */ },
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.altBufferActive.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.scrollToBottom();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.scrollUp" /* TerminalCommandId.ScrollUpLine */,
                title: { value: localize('workbench.action.terminal.scrollUp', "Scroll Up (Line)"), original: 'Scroll Up (Line)' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 11 /* KeyCode.PageUp */,
                    linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */ },
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.altBufferActive.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.scrollUpLine();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.scrollUpPage" /* TerminalCommandId.ScrollUpPage */,
                title: { value: localize('workbench.action.terminal.scrollUpPage', "Scroll Up (Page)"), original: 'Scroll Up (Page)' },
                f1: true,
                category,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 11 /* KeyCode.PageUp */,
                    mac: { primary: 11 /* KeyCode.PageUp */ },
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.altBufferActive.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.scrollUpPage();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.scrollToTop" /* TerminalCommandId.ScrollToTop */,
                title: { value: localize('workbench.action.terminal.scrollToTop', "Scroll to Top"), original: 'Scroll to Top' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */,
                    linux: { primary: 1024 /* KeyMod.Shift */ | 14 /* KeyCode.Home */ },
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.altBufferActive.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.scrollToTop();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.navigationModeExit" /* TerminalCommandId.NavigationModeExit */,
                title: { value: localize('workbench.action.terminal.navigationModeExit', "Exit Navigation Mode"), original: 'Exit Navigation Mode' },
                f1: true,
                category,
                keybinding: {
                    primary: 9 /* KeyCode.Escape */,
                    when: ContextKeyExpr.and(TerminalContextKeys.a11yTreeFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: TerminalContextKeys.processSupported
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.navigationMode?.exitNavigationMode();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.navigationModeFocusPrevious" /* TerminalCommandId.NavigationModeFocusPrevious */,
                title: { value: localize('workbench.action.terminal.navigationModeFocusPrevious', "Focus Previous Line (Navigation Mode)"), original: 'Focus Previous Line (Navigation Mode)' },
                f1: true,
                category,
                keybinding: [{
                        primary: 16 /* KeyCode.UpArrow */,
                        when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.a11yTreeFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.navigationModeActive), ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.navigationModeActive)),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    },
                    {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                        when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.a11yTreeFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED), ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED)),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    }],
                precondition: TerminalContextKeys.processSupported
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.navigationMode?.focusPreviousLine();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.navigationModeFocusPreviousPage" /* TerminalCommandId.NavigationModeFocusPreviousPage */,
                title: { value: localize('workbench.action.terminal.navigationModeFocusPreviousPage', "Focus Previous Page (Navigation Mode)"), original: 'Focus Previous Page (Navigation Mode)' },
                f1: true,
                category,
                keybinding: [{
                        primary: 11 /* KeyCode.PageUp */,
                        when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.a11yTreeFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.navigationModeActive), ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.navigationModeActive)),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    }],
                precondition: TerminalContextKeys.processSupported
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.navigationMode?.focusPreviousPage();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.navigationModeFocusNext" /* TerminalCommandId.NavigationModeFocusNext */,
                title: { value: localize('workbench.action.terminal.navigationModeFocusNext', "Focus Next Line (Navigation Mode)"), original: 'Focus Next Line (Navigation Mode)' },
                f1: true,
                category,
                keybinding: [{
                        primary: 18 /* KeyCode.DownArrow */,
                        when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.a11yTreeFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.navigationModeActive), ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.navigationModeActive)),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    },
                    {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                        when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.a11yTreeFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED), ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED)),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    }],
                precondition: TerminalContextKeys.processSupported
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.navigationMode?.focusNextLine();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.navigationModeFocusNextPage" /* TerminalCommandId.NavigationModeFocusNextPage */,
                title: { value: localize('workbench.action.terminal.navigationModeFocusNextPage', "Focus Next Page (Navigation Mode)"), original: 'Focus Next Page (Navigation Mode)' },
                f1: true,
                category,
                keybinding: [{
                        primary: 12 /* KeyCode.PageDown */,
                        when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.a11yTreeFocus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.navigationModeActive), ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.navigationModeActive)),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    }],
                precondition: TerminalContextKeys.processSupported
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.navigationMode?.focusNextPage();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.clearSelection" /* TerminalCommandId.ClearSelection */,
                title: { value: localize('workbench.action.terminal.clearSelection', "Clear Selection"), original: 'Clear Selection' },
                f1: true,
                category,
                keybinding: {
                    primary: 9 /* KeyCode.Escape */,
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.textSelected, TerminalContextKeys.notFindVisible),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            const terminalInstance = accessor.get(ITerminalService).activeInstance;
            if (terminalInstance && terminalInstance.hasSelection()) {
                terminalInstance.clearSelection();
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.changeIcon" /* TerminalCommandId.ChangeIcon */,
                title: terminalStrings.changeIcon,
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor, resource) {
            getActiveInstance(accessor, resource)?.changeIcon();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.changeIconPanel" /* TerminalCommandId.ChangeIconPanel */,
                title: terminalStrings.changeIcon,
                f1: false,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            return accessor.get(ITerminalGroupService).activeInstance?.changeIcon();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.changeIconInstance" /* TerminalCommandId.ChangeIconInstance */,
                title: terminalStrings.changeIcon,
                f1: false,
                category,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.tabsSingularSelection)
            });
        }
        async run(accessor) {
            return getSelectedInstances(accessor)?.[0].changeIcon();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.changeColor" /* TerminalCommandId.ChangeColor */,
                title: terminalStrings.changeColor,
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor, resource) {
            getActiveInstance(accessor, resource)?.changeColor();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.changeColorPanel" /* TerminalCommandId.ChangeColorPanel */,
                title: terminalStrings.changeColor,
                f1: false,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            return accessor.get(ITerminalGroupService).activeInstance?.changeColor();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.changeColorInstance" /* TerminalCommandId.ChangeColorInstance */,
                title: terminalStrings.changeColor,
                f1: false,
                category,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.tabsSingularSelection)
            });
        }
        async run(accessor) {
            return getSelectedInstances(accessor)?.[0].changeColor();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.rename" /* TerminalCommandId.Rename */,
                title: terminalStrings.rename,
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor, resource) {
            renameWithQuickPick(accessor, resource);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.renamePanel" /* TerminalCommandId.RenamePanel */,
                title: terminalStrings.rename,
                f1: false,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            renameWithQuickPick(accessor);
        }
    });
    async function renameWithQuickPick(accessor, resource) {
        const instance = getActiveInstance(accessor, resource);
        if (instance) {
            const title = await accessor.get(IQuickInputService).input({
                value: instance.title,
                prompt: localize('workbench.action.terminal.rename.prompt', "Enter terminal name"),
            });
            instance.rename(title);
        }
    }
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.renameInstance" /* TerminalCommandId.RenameInstance */,
                title: terminalStrings.rename,
                f1: false,
                category,
                keybinding: {
                    primary: 60 /* KeyCode.F2 */,
                    mac: {
                        primary: 3 /* KeyCode.Enter */
                    },
                    when: ContextKeyExpr.and(TerminalContextKeys.tabsFocus),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.tabsSingularSelection),
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const notificationService = accessor.get(INotificationService);
            const instance = getSelectedInstances(accessor)?.[0];
            if (!instance) {
                return;
            }
            terminalService.setEditable(instance, {
                validationMessage: value => validateTerminalName(value),
                onFinish: async (value, success) => {
                    // Cancel editing first as instance.rename will trigger a rerender automatically
                    terminalService.setEditable(instance, null);
                    if (success) {
                        try {
                            await instance.rename(value);
                        }
                        catch (e) {
                            notificationService.error(e);
                        }
                    }
                }
            });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.focusFind" /* TerminalCommandId.FindFocus */,
                title: { value: localize('workbench.action.terminal.focusFind', "Focus Find"), original: 'Focus Find' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                    when: ContextKeyExpr.or(TerminalContextKeys.findFocus, TerminalContextKeys.focus),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.findWidget.getValue().reveal();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.hideFind" /* TerminalCommandId.FindHide */,
                title: { value: localize('workbench.action.terminal.hideFind', "Hide Find"), original: 'Hide Find' },
                f1: true,
                category,
                keybinding: {
                    primary: 9 /* KeyCode.Escape */,
                    secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.findVisible),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.findWidget.getValue().hide();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.detachSession" /* TerminalCommandId.DetachSession */,
                title: { value: localize('workbench.action.terminal.detachSession', "Detach Session"), original: 'Detach Session' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            await terminalService.activeInstance?.detachProcessAndDispose(TerminalExitReason.User);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.attachToSession" /* TerminalCommandId.AttachToSession */,
                title: { value: localize('workbench.action.terminal.attachToSession', "Attach to Session"), original: 'Attach to Session' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(IQuickInputService);
            const terminalService = accessor.get(ITerminalService);
            const labelService = accessor.get(ILabelService);
            const remoteAgentService = accessor.get(IRemoteAgentService);
            const notificationService = accessor.get(INotificationService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const remoteAuthority = remoteAgentService.getConnection()?.remoteAuthority ?? undefined;
            const backend = await accessor.get(ITerminalInstanceService).getBackend(remoteAuthority);
            if (!backend) {
                throw new Error(`No backend registered for remote authority '${remoteAuthority}'`);
            }
            const terms = await backend.listProcesses();
            backend.reduceConnectionGraceTime();
            const unattachedTerms = terms.filter(term => !terminalService.isAttachedToTerminal(term));
            const items = unattachedTerms.map(term => {
                const cwdLabel = labelService.getUriLabel(URI.file(term.cwd));
                return {
                    label: term.title,
                    detail: term.workspaceName ? `${term.workspaceName} \u2E31 ${cwdLabel}` : cwdLabel,
                    description: term.pid ? String(term.pid) : '',
                    term
                };
            });
            if (items.length === 0) {
                notificationService.info(localize('noUnattachedTerminals', 'There are no unattached terminals to attach to'));
                return;
            }
            const selected = await quickInputService.pick(items, { canPickMany: false });
            if (selected) {
                const instance = await terminalService.createTerminal({
                    config: { attachPersistentProcess: selected.term }
                });
                terminalService.setActiveInstance(instance);
                if (instance.target === TerminalLocation.Editor) {
                    await instance.focusWhenReady(true);
                }
                else {
                    terminalGroupService.showPanel(true);
                }
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.quickOpenTerm" /* TerminalCommandId.QuickOpenTerm */,
                title: { value: localize('quickAccessTerminal', "Switch Active Terminal"), original: 'Switch Active Terminal' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(IQuickInputService).quickAccess.show(TerminalQuickAccessProvider.PREFIX);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.scrollToPreviousCommand" /* TerminalCommandId.ScrollToPreviousCommand */,
                title: { value: localize('workbench.action.terminal.scrollToPreviousCommand', "Scroll To Previous Command"), original: 'Scroll To Previous Command' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => {
                t.xterm?.markTracker.scrollToPreviousMark();
            });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.scrollToNextCommand" /* TerminalCommandId.ScrollToNextCommand */,
                title: { value: localize('workbench.action.terminal.scrollToNextCommand', "Scroll To Next Command"), original: 'Scroll To Next Command' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => {
                t.xterm?.markTracker.scrollToNextMark();
                t.focus();
            });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.selectToPreviousCommand" /* TerminalCommandId.SelectToPreviousCommand */,
                title: { value: localize('workbench.action.terminal.selectToPreviousCommand', "Select To Previous Command"), original: 'Select To Previous Command' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */,
                    when: TerminalContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => {
                t.xterm?.markTracker.selectToPreviousMark();
                t.focus();
            });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.selectToNextCommand" /* TerminalCommandId.SelectToNextCommand */,
                title: { value: localize('workbench.action.terminal.selectToNextCommand', "Select To Next Command"), original: 'Select To Next Command' },
                f1: true,
                category,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */,
                    when: TerminalContextKeys.focus,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => {
                t.xterm?.markTracker.selectToNextMark();
                t.focus();
            });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.selectToPreviousLine" /* TerminalCommandId.SelectToPreviousLine */,
                title: { value: localize('workbench.action.terminal.selectToPreviousLine', "Select To Previous Line"), original: 'Select To Previous Line' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => {
                t.xterm?.markTracker.selectToPreviousLine();
                t.focus();
            });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.selectToNextLine" /* TerminalCommandId.SelectToNextLine */,
                title: { value: localize('workbench.action.terminal.selectToNextLine', "Select To Next Line"), original: 'Select To Next Line' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => {
                t.xterm?.markTracker.selectToNextLine();
                t.focus();
            });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "toggleEscapeSequenceLogging" /* TerminalCommandId.ToggleEscapeSequenceLogging */,
                title: { value: localize('workbench.action.terminal.toggleEscapeSequenceLogging', "Toggle Escape Sequence Logging"), original: 'Toggle Escape Sequence Logging' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            await terminalService.toggleEscapeSequenceLogging();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            const title = localize('workbench.action.terminal.sendSequence', "Send Custom Sequence To Terminal");
            super({
                id: "workbench.action.terminal.sendSequence" /* TerminalCommandId.SendSequence */,
                title: { value: title, original: 'Send Custom Sequence To Terminal' },
                category,
                description: {
                    description: title,
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                required: ['text'],
                                properties: {
                                    text: { type: 'string' }
                                },
                            }
                        }]
                },
                precondition: TerminalContextKeys.processSupported
            });
        }
        run(accessor, args) {
            terminalSendSequenceCommand(accessor, args);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            const title = localize('workbench.action.terminal.newWithCwd', "Create New Terminal Starting in a Custom Working Directory");
            super({
                id: "workbench.action.terminal.newWithCwd" /* TerminalCommandId.NewWithCwd */,
                title: { value: title, original: 'Create New Terminal Starting in a Custom Working Directory' },
                category,
                description: {
                    description: title,
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                required: ['cwd'],
                                properties: {
                                    cwd: {
                                        description: localize('workbench.action.terminal.newWithCwd.cwd', "The directory to start the terminal at"),
                                        type: 'string'
                                    }
                                },
                            }
                        }]
                },
                precondition: TerminalContextKeys.processSupported
            });
        }
        async run(accessor, args) {
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            if (terminalService.isProcessSupportRegistered) {
                const instance = await terminalService.createTerminal({
                    cwd: args?.cwd
                });
                if (!instance) {
                    return;
                }
                terminalService.setActiveInstance(instance);
                if (instance.target === TerminalLocation.Editor) {
                    await instance.focusWhenReady(true);
                }
                else {
                    return terminalGroupService.showPanel(true);
                }
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            const title = localize('workbench.action.terminal.renameWithArg', "Rename the Currently Active Terminal");
            super({
                id: "workbench.action.terminal.renameWithArg" /* TerminalCommandId.RenameWithArgs */,
                title: { value: title, original: 'Rename the Currently Active Terminal' },
                category,
                description: {
                    description: title,
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                    name: {
                                        description: localize('workbench.action.terminal.renameWithArg.name', "The new name for the terminal"),
                                        type: 'string',
                                        minLength: 1
                                    }
                                }
                            }
                        }]
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor, args) {
            const notificationService = accessor.get(INotificationService);
            if (!args?.name) {
                notificationService.warn(localize('workbench.action.terminal.renameWithArg.noName', "No name argument provided"));
                return;
            }
            accessor.get(ITerminalService).activeInstance?.rename(args.name);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.toggleFindRegex" /* TerminalCommandId.ToggleFindRegex */,
                title: { value: localize('workbench.action.terminal.toggleFindRegex', "Toggle Find Using Regex"), original: 'Toggle Find Using Regex' },
                f1: true,
                category,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ },
                    when: ContextKeyExpr.or(TerminalContextKeys.focus, TerminalContextKeys.findFocus),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const state = terminalService.activeInstance?.findWidget.getValue().findState;
            state?.change({ isRegex: !state.isRegex }, false);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.toggleFindWholeWord" /* TerminalCommandId.ToggleFindWholeWord */,
                title: { value: localize('workbench.action.terminal.toggleFindWholeWord', "Toggle Find Using Whole Word"), original: 'Toggle Find Using Whole Word' },
                f1: true,
                category,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 53 /* KeyCode.KeyW */ },
                    when: ContextKeyExpr.or(TerminalContextKeys.focus, TerminalContextKeys.findFocus),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const state = terminalService.activeInstance?.findWidget.getValue().findState;
            state?.change({ wholeWord: !state.wholeWord }, false);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.toggleFindCaseSensitive" /* TerminalCommandId.ToggleFindCaseSensitive */,
                title: { value: localize('workbench.action.terminal.toggleFindCaseSensitive', "Toggle Find Using Case Sensitive"), original: 'Toggle Find Using Case Sensitive' },
                f1: true,
                category,
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */ },
                    when: ContextKeyExpr.or(TerminalContextKeys.focus, TerminalContextKeys.findFocus),
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const state = terminalService.activeInstance?.findWidget.getValue().findState;
            state?.change({ matchCase: !state.matchCase }, false);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.findNext" /* TerminalCommandId.FindNext */,
                title: { value: localize('workbench.action.terminal.findNext', "Find Next"), original: 'Find Next' },
                f1: true,
                category,
                keybinding: [
                    {
                        primary: 61 /* KeyCode.F3 */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, secondary: [61 /* KeyCode.F3 */] },
                        when: ContextKeyExpr.or(TerminalContextKeys.focus, TerminalContextKeys.findFocus),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    },
                    {
                        primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                        when: TerminalContextKeys.findInputFocus,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    }
                ],
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const findWidget = terminalService.activeInstance?.findWidget.getValue();
            if (findWidget) {
                findWidget.show();
                findWidget.find(false);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.findPrevious" /* TerminalCommandId.FindPrevious */,
                title: { value: localize('workbench.action.terminal.findPrevious', "Find Previous"), original: 'Find Previous' },
                f1: true,
                category,
                keybinding: [
                    {
                        primary: 1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */, secondary: [1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */] },
                        when: ContextKeyExpr.or(TerminalContextKeys.focus, TerminalContextKeys.findFocus),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    },
                    {
                        primary: 3 /* KeyCode.Enter */,
                        when: TerminalContextKeys.findInputFocus,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */
                    }
                ],
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const findWidget = terminalService.activeInstance?.findWidget.getValue();
            if (findWidget) {
                findWidget.show();
                findWidget.find(true);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.searchWorkspace" /* TerminalCommandId.SearchWorkspace */,
                title: { value: localize('workbench.action.terminal.searchWorkspace', "Search Workspace"), original: 'Search Workspace' },
                f1: true,
                category,
                keybinding: [
                    {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 36 /* KeyCode.KeyF */,
                        when: ContextKeyExpr.and(TerminalContextKeys.processSupported, TerminalContextKeys.focus, TerminalContextKeys.textSelected),
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50
                    }
                ],
                precondition: TerminalContextKeys.processSupported
            });
        }
        run(accessor) {
            const query = accessor.get(ITerminalService).activeInstance?.selection;
            findInFilesCommand(accessor, { query });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.relaunch" /* TerminalCommandId.Relaunch */,
                title: { value: localize('workbench.action.terminal.relaunch', "Relaunch Active Terminal"), original: 'Relaunch Active Terminal' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.relaunch();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.showEnvironmentInformation" /* TerminalCommandId.ShowEnvironmentInformation */,
                title: { value: localize('workbench.action.terminal.showEnvironmentInformation', "Show Environment Information"), original: 'Show Environment Information' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.showEnvironmentInfoHover();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.split" /* TerminalCommandId.Split */,
                title: terminalStrings.split,
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 88 /* KeyCode.Backslash */,
                        secondary: [256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */]
                    },
                    when: TerminalContextKeys.focus
                },
                icon: Codicon.splitHorizontal,
                description: {
                    description: 'workbench.action.terminal.split',
                    args: [{
                            name: 'profile',
                            schema: {
                                type: 'object'
                            }
                        }]
                }
            });
        }
        async run(accessor, optionsOrProfile) {
            const commandService = accessor.get(ICommandService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const terminalService = accessor.get(ITerminalService);
            const workspaceContextService = accessor.get(IWorkspaceContextService);
            const options = convertOptionsOrProfileToOptions(optionsOrProfile);
            const activeInstance = terminalService.getInstanceHost(options?.location).activeInstance;
            if (!activeInstance) {
                return;
            }
            const cwd = await getCwdForSplit(terminalService.configHelper, activeInstance, workspaceContextService.getWorkspace().folders, commandService);
            if (cwd === undefined) {
                return undefined;
            }
            const instance = await terminalService.createTerminal({ location: { parentTerminal: activeInstance }, config: options?.config, cwd });
            if (instance) {
                if (instance.target === TerminalLocation.Editor) {
                    instance.focusWhenReady();
                }
                else {
                    return terminalGroupService.showPanel(true);
                }
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.splitInstance" /* TerminalCommandId.SplitInstance */,
                title: terminalStrings.split,
                f1: false,
                category,
                precondition: TerminalContextKeys.processSupported,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 88 /* KeyCode.Backslash */,
                        secondary: [256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 26 /* KeyCode.Digit5 */]
                    },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: TerminalContextKeys.tabsFocus
                }
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const instances = getSelectedInstances(accessor);
            if (instances) {
                for (const t of instances) {
                    terminalService.setActiveInstance(t);
                    terminalService.doWithActiveInstance(async (instance) => {
                        await terminalService.createTerminal({ location: { parentTerminal: instance } });
                        await terminalGroupService.showPanel(true);
                    });
                }
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.unsplit" /* TerminalCommandId.Unsplit */,
                title: terminalStrings.unsplit,
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            await accessor.get(ITerminalService).doWithActiveInstance(async (t) => accessor.get(ITerminalGroupService).unsplitInstance(t));
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.unsplitInstance" /* TerminalCommandId.UnsplitInstance */,
                title: terminalStrings.unsplit,
                f1: false,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const instances = getSelectedInstances(accessor);
            // should not even need this check given the context key
            // but TS complains
            if (instances?.length === 1) {
                const group = terminalGroupService.getGroupForInstance(instances[0]);
                if (group && group?.terminalInstances.length > 1) {
                    terminalGroupService.unsplitInstance(instances[0]);
                }
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.joinInstance" /* TerminalCommandId.JoinInstance */,
                title: { value: localize('workbench.action.terminal.joinInstance', "Join Terminals"), original: 'Join Terminals' },
                category,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.tabsSingularSelection.toNegated())
            });
        }
        async run(accessor) {
            const instances = getSelectedInstances(accessor);
            if (instances && instances.length > 1) {
                accessor.get(ITerminalGroupService).joinInstances(instances);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.join" /* TerminalCommandId.Join */,
                title: { value: localize('workbench.action.terminal.join', "Join Terminals"), original: 'Join Terminals' },
                category,
                f1: true,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated))
            });
        }
        async run(accessor) {
            const themeService = accessor.get(IThemeService);
            const groupService = accessor.get(ITerminalGroupService);
            const notificationService = accessor.get(INotificationService);
            const picks = [];
            if (groupService.instances.length <= 1) {
                notificationService.warn(localize('workbench.action.terminal.join.insufficientTerminals', 'Insufficient terminals for the join action'));
                return;
            }
            const otherInstances = groupService.instances.filter(i => i.instanceId !== groupService.activeInstance?.instanceId);
            for (const terminal of otherInstances) {
                const group = groupService.getGroupForInstance(terminal);
                if (group?.terminalInstances.length === 1) {
                    const iconId = getIconId(accessor, terminal);
                    const label = `$(${iconId}): ${terminal.title}`;
                    const iconClasses = [];
                    const colorClass = getColorClass(terminal);
                    if (colorClass) {
                        iconClasses.push(colorClass);
                    }
                    const uriClasses = getUriClasses(terminal, themeService.getColorTheme().type);
                    if (uriClasses) {
                        iconClasses.push(...uriClasses);
                    }
                    picks.push({
                        terminal,
                        label,
                        iconClasses
                    });
                }
            }
            if (picks.length === 0) {
                notificationService.warn(localize('workbench.action.terminal.join.onlySplits', 'All terminals are joined already'));
                return;
            }
            const result = await accessor.get(IQuickInputService).pick(picks, {});
            if (result) {
                groupService.joinInstances([result.terminal, groupService.activeInstance]);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.splitInActiveWorkspace" /* TerminalCommandId.SplitInActiveWorkspace */,
                title: { value: localize('workbench.action.terminal.splitInActiveWorkspace', "Split Terminal (In Active Workspace)"), original: 'Split Terminal (In Active Workspace)' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported,
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            await terminalService.doWithActiveInstance(async (t) => {
                const instance = await terminalService.createTerminal({ location: { parentTerminal: t } });
                if (instance?.target !== TerminalLocation.Editor) {
                    await terminalGroupService.showPanel(true);
                }
            });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
                title: { value: localize('workbench.action.terminal.selectAll', "Select All"), original: 'Select All' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
                keybinding: [{
                        // Don't use ctrl+a by default as that would override the common go to start
                        // of prompt shell binding
                        primary: 0,
                        // Technically this doesn't need to be here as it will fall back to this
                        // behavior anyway when handed to xterm.js, having this handled by VS Code
                        // makes it easier for users to see how it works though.
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: TerminalContextKeys.focus
                    }]
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).activeInstance?.selectAll();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
                title: { value: localize('workbench.action.terminal.new', "Create New Terminal"), original: 'Create New Terminal' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
                icon: newTerminalIcon,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 86 /* KeyCode.Backquote */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 86 /* KeyCode.Backquote */ },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                description: {
                    description: 'workbench.action.terminal.new',
                    args: [{
                            name: 'eventOrOptions',
                            schema: {
                                type: 'object'
                            }
                        }]
                }
            });
        }
        async run(accessor, eventOrOptions) {
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const workspaceContextService = accessor.get(IWorkspaceContextService);
            const commandService = accessor.get(ICommandService);
            const folders = workspaceContextService.getWorkspace().folders;
            if (eventOrOptions && eventOrOptions instanceof MouseEvent && (eventOrOptions.altKey || eventOrOptions.ctrlKey)) {
                await terminalService.createTerminal({ location: { splitActiveTerminal: true } });
                return;
            }
            if (terminalService.isProcessSupportRegistered) {
                eventOrOptions = !eventOrOptions || eventOrOptions instanceof MouseEvent ? {} : eventOrOptions;
                let instance;
                if (folders.length <= 1) {
                    // Allow terminal service to handle the path when there is only a
                    // single root
                    instance = await terminalService.createTerminal(eventOrOptions);
                }
                else {
                    const cwd = (await pickTerminalCwd(accessor))?.cwd;
                    if (!cwd) {
                        // Don't create the instance if the workspace picker was canceled
                        return;
                    }
                    eventOrOptions.cwd = cwd;
                    instance = await terminalService.createTerminal(eventOrOptions);
                }
                terminalService.setActiveInstance(instance);
                if (instance.target === TerminalLocation.Editor) {
                    await instance.focusWhenReady(true);
                }
                else {
                    await terminalGroupService.showPanel(true);
                }
            }
            else if (TerminalContextKeys.webExtensionContributedProfile) {
                commandService.executeCommand("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
                title: { value: localize('workbench.action.terminal.kill', "Kill the Active Terminal Instance"), original: 'Kill the Active Terminal Instance' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.isOpen),
                icon: killTerminalIcon
            });
        }
        async run(accessor) {
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const terminalService = accessor.get(ITerminalService);
            const instance = terminalGroupService.activeInstance;
            if (!instance) {
                return;
            }
            await terminalService.safeDisposeTerminal(instance);
            if (terminalGroupService.instances.length > 0) {
                await terminalGroupService.showPanel(true);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.killAll" /* TerminalCommandId.KillAll */,
                title: { value: localize('workbench.action.terminal.killAll', "Kill All Terminals"), original: 'Kill All Terminals' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.isOpen),
                icon: Codicon.trash
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const disposePromises = [];
            for (const instance of terminalService.instances) {
                disposePromises.push(terminalService.safeDisposeTerminal(instance));
            }
            await Promise.all(disposePromises);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
                title: { value: localize('workbench.action.terminal.killEditor', "Kill the Active Terminal in Editor Area"), original: 'Kill the Active Terminal in Editor Area' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
                    win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: ContextKeyExpr.and(TerminalContextKeys.focus, ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal), TerminalContextKeys.editorFocus)
                }
            });
        }
        async run(accessor) {
            accessor.get(ICommandService).executeCommand(CLOSE_EDITOR_COMMAND_ID);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.killInstance" /* TerminalCommandId.KillInstance */,
                title: terminalStrings.kill,
                f1: false,
                category,
                precondition: ContextKeyExpr.or(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.isOpen),
                keybinding: {
                    primary: 20 /* KeyCode.Delete */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
                        secondary: [20 /* KeyCode.Delete */]
                    },
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: TerminalContextKeys.tabsFocus
                }
            });
        }
        async run(accessor) {
            const selectedInstances = getSelectedInstances(accessor);
            if (!selectedInstances) {
                return;
            }
            const listService = accessor.get(IListService);
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const disposePromises = [];
            for (const instance of selectedInstances) {
                disposePromises.push(terminalService.safeDisposeTerminal(instance));
            }
            await Promise.all(disposePromises);
            if (terminalService.instances.length > 0) {
                terminalGroupService.focusTabs();
                listService.lastFocusedList?.focusNext();
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
                title: { value: localize('workbench.action.terminal.clear', "Clear"), original: 'Clear' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
                keybinding: [{
                        primary: 0,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */ },
                        // Weight is higher than work workbench contributions so the keybinding remains
                        // highest priority when chords are registered afterwards
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
                        when: TerminalContextKeys.focus
                    }]
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => t.clearBuffer());
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.openDetectedLink" /* TerminalCommandId.OpenDetectedLink */,
                title: { value: localize('workbench.action.terminal.openDetectedLink', "Open Detected Link..."), original: 'Open Detected Link...' },
                f1: true,
                category,
                precondition: TerminalContextKeys.terminalHasBeenCreated,
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => t.showLinkQuickpick());
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.openUrlLink" /* TerminalCommandId.OpenWebLink */,
                title: { value: localize('workbench.action.terminal.openLastUrlLink', "Open Last Url Link"), original: 'Open Last Url Link' },
                f1: true,
                category,
                precondition: TerminalContextKeys.terminalHasBeenCreated,
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => t.openRecentLink('url'));
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.openFileLink" /* TerminalCommandId.OpenFileLink */,
                title: { value: localize('workbench.action.terminal.openLastLocalFileLink', "Open Last Local File Link"), original: 'Open Last Local File Link' },
                f1: true,
                category,
                precondition: TerminalContextKeys.terminalHasBeenCreated,
            });
        }
        run(accessor) {
            accessor.get(ITerminalService).doWithActiveInstance(t => t.openRecentLink('localFile'));
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.selectDefaultShell" /* TerminalCommandId.SelectDefaultProfile */,
                title: { value: localize('workbench.action.terminal.selectDefaultShell', "Select Default Profile"), original: 'Select Default Profile' },
                f1: true,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        async run(accessor) {
            await accessor.get(ITerminalService).showProfileQuickPick('setDefault');
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.gitCreateProfileButton" /* TerminalCommandId.CreateWithProfileButton */,
                title: "workbench.action.terminal.gitCreateProfileButton" /* TerminalCommandId.CreateWithProfileButton */,
                f1: false,
                category,
                precondition: TerminalContextKeys.processSupported
            });
        }
        async run(accessor) {
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.openSettings" /* TerminalCommandId.ConfigureTerminalSettings */,
                title: { value: localize('workbench.action.terminal.openSettings', "Configure Terminal Settings"), original: 'Configure Terminal Settings' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor) {
            await accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: '@feature:terminal' });
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.setDimensions" /* TerminalCommandId.SetDimensions */,
                title: { value: localize('workbench.action.terminal.setFixedDimensions', "Set Fixed Dimensions"), original: 'Set Fixed Dimensions' },
                f1: true,
                category,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.isOpen)
            });
        }
        async run(accessor) {
            await accessor.get(ITerminalService).doWithActiveInstance(t => t.setFixedDimensions());
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
                title: { value: localize('workbench.action.terminal.sizeToContentWidth', "Toggle Size to Content Width"), original: 'Toggle Size to Content Width' },
                f1: true,
                category,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.isOpen),
                keybinding: {
                    primary: 512 /* KeyMod.Alt */ | 56 /* KeyCode.KeyZ */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: TerminalContextKeys.focus
                }
            });
        }
        async run(accessor) {
            await accessor.get(ITerminalService).doWithActiveInstance(t => t.toggleSizeToContentWidth());
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.sizeToContentWidthInstance" /* TerminalCommandId.SizeToContentWidthInstance */,
                title: terminalStrings.toggleSizeToContentWidth,
                f1: false,
                category,
                precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus)
            });
        }
        async run(accessor) {
            return getSelectedInstances(accessor)?.[0].toggleSizeToContentWidth();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.clearCommandHistory" /* TerminalCommandId.ClearCommandHistory */,
                title: { value: localize('workbench.action.terminal.clearCommandHistory', "Clear Command History"), original: 'Clear Command History' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        run(accessor) {
            getCommandHistory(accessor).clear();
            clearShellFileHistory();
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.showTextureAtlas" /* TerminalCommandId.ShowTextureAtlas */,
                title: { value: localize('workbench.action.terminal.showTextureAtlas', "Show Terminal Texture Atlas"), original: 'Show Terminal Texture Atlas' },
                f1: true,
                category: Categories.Developer,
                precondition: ContextKeyExpr.or(TerminalContextKeys.isOpen)
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const fileService = accessor.get(IFileService);
            const openerService = accessor.get(IOpenerService);
            const workspaceContextService = accessor.get(IWorkspaceContextService);
            const bitmap = await terminalService.activeInstance?.xterm?.textureAtlas;
            if (!bitmap) {
                return;
            }
            const cwdUri = workspaceContextService.getWorkspace().folders[0].uri;
            const fileUri = URI.joinPath(cwdUri, 'textureAtlas.png');
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('bitmaprenderer');
            if (!ctx) {
                return;
            }
            ctx.transferFromImageBitmap(bitmap);
            const blob = await new Promise((res) => canvas.toBlob(res));
            if (!blob) {
                return;
            }
            await fileService.writeFile(fileUri, VSBuffer.wrap(new Uint8Array(await blob.arrayBuffer())));
            openerService.open(fileUri);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.writeDataToTerminal" /* TerminalCommandId.WriteDataToTerminal */,
                title: { value: localize('workbench.action.terminal.writeDataToTerminal', "Write Data to Terminal"), original: 'Write Data to Terminal' },
                f1: true,
                category: Categories.Developer
            });
        }
        async run(accessor) {
            const terminalService = accessor.get(ITerminalService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const quickInputService = accessor.get(IQuickInputService);
            const instance = await terminalService.getActiveOrCreateInstance();
            await terminalGroupService.showPanel();
            await instance.processReady;
            if (!instance.xterm) {
                throw new Error('Cannot write data to terminal if xterm isn\'t initialized');
            }
            const data = await quickInputService.input({
                value: '',
                placeHolder: 'Enter data, use \\x to escape',
                prompt: localize('workbench.action.terminal.writeDataToTerminal.prompt', "Enter data to write directly to the terminal, bypassing the pty"),
            });
            if (!data) {
                return;
            }
            let escapedData = data
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r');
            while (true) {
                const match = escapedData.match(/\\x([0-9a-fA-F]{2})/);
                if (match === null || match.index === undefined || match.length < 2) {
                    break;
                }
                escapedData = escapedData.slice(0, match.index) + String.fromCharCode(parseInt(match[1], 16)) + escapedData.slice(match.index + 4);
            }
            const xterm = instance.xterm;
            xterm._writeText(escapedData);
        }
    });
    // Some commands depend on platform features
    if (BrowserFeatures.clipboard.writeText) {
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
                    title: { value: localize('workbench.action.terminal.copySelection', "Copy Selection"), original: 'Copy Selection' },
                    f1: true,
                    category,
                    // TODO: Why is copy still showing up when text isn't selected?
                    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.textSelected),
                    keybinding: [{
                            primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */] },
                            linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */ },
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: ContextKeyExpr.and(TerminalContextKeys.textSelected, TerminalContextKeys.focus)
                        }]
                });
            }
            async run(accessor) {
                await accessor.get(ITerminalService).activeInstance?.copySelection();
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
                    title: { value: localize('workbench.action.terminal.copySelectionAsHtml', "Copy Selection as HTML"), original: 'Copy Selection as HTML' },
                    f1: true,
                    category,
                    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.textSelected)
                });
            }
            async run(accessor) {
                await accessor.get(ITerminalService).activeInstance?.copySelection(true);
            }
        });
    }
    if (BrowserFeatures.clipboard.readText) {
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
                    title: { value: localize('workbench.action.terminal.paste', "Paste into Active Terminal"), original: 'Paste into Active Terminal' },
                    f1: true,
                    category,
                    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
                    keybinding: [{
                            primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
                            win: { primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */, secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 52 /* KeyCode.KeyV */] },
                            linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 52 /* KeyCode.KeyV */ },
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: TerminalContextKeys.focus
                        }],
                });
            }
            async run(accessor) {
                await accessor.get(ITerminalService).activeInstance?.paste();
            }
        });
    }
    if (BrowserFeatures.clipboard.readText && isLinux) {
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.pasteSelection" /* TerminalCommandId.PasteSelection */,
                    title: { value: localize('workbench.action.terminal.pasteSelection', "Paste Selection into Active Terminal"), original: 'Paste Selection into Active Terminal' },
                    f1: true,
                    category,
                    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
                    keybinding: [{
                            linux: { primary: 1024 /* KeyMod.Shift */ | 19 /* KeyCode.Insert */ },
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: TerminalContextKeys.focus
                        }],
                });
            }
            async run(accessor) {
                await accessor.get(ITerminalService).activeInstance?.pasteSelection();
            }
        });
    }
    const switchTerminalTitle = { value: localize('workbench.action.terminal.switchTerminal', "Switch Terminal"), original: 'Switch Terminal' };
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.switchTerminal" /* TerminalCommandId.SwitchTerminal */,
                title: switchTerminalTitle,
                f1: false,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated)
            });
        }
        async run(accessor, item) {
            const terminalService = accessor.get(ITerminalService);
            const terminalProfileService = accessor.get(ITerminalProfileService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            if (!item || !item.split) {
                return Promise.resolve(null);
            }
            if (item === switchTerminalActionViewItemSeparator) {
                terminalService.refreshActiveGroup();
                return Promise.resolve(null);
            }
            if (item === switchTerminalShowTabsTitle) {
                accessor.get(IConfigurationService).updateValue("terminal.integrated.tabs.enabled" /* TerminalSettingId.TabsEnabled */, true);
                return;
            }
            const indexMatches = terminalIndexRe.exec(item);
            if (indexMatches) {
                terminalGroupService.setActiveGroupByIndex(Number(indexMatches[1]) - 1);
                return terminalGroupService.showPanel(true);
            }
            const quickSelectProfiles = terminalProfileService.availableProfiles;
            // Remove 'New ' from the selected item to get the profile name
            const profileSelection = item.substring(4);
            if (quickSelectProfiles) {
                const profile = quickSelectProfiles.find(profile => profile.profileName === profileSelection);
                if (profile) {
                    const instance = await terminalService.createTerminal({
                        config: profile
                    });
                    terminalService.setActiveInstance(instance);
                }
                else {
                    console.warn(`No profile with name "${profileSelection}"`);
                }
            }
            else {
                console.warn(`Unmatched terminal item: "${item}"`);
            }
            return Promise.resolve();
        }
    });
}
function getSelectedInstances(accessor) {
    const listService = accessor.get(IListService);
    const terminalService = accessor.get(ITerminalService);
    if (!listService.lastFocusedList?.getSelection()) {
        return undefined;
    }
    const selections = listService.lastFocusedList.getSelection();
    const focused = listService.lastFocusedList.getFocus();
    const instances = [];
    if (focused.length === 1 && !selections.includes(focused[0])) {
        // focused length is always a max of 1
        // if the focused one is not in the selected list, return that item
        instances.push(terminalService.getInstanceFromIndex(focused[0]));
        return instances;
    }
    // multi-select
    for (const selection of selections) {
        instances.push(terminalService.getInstanceFromIndex(selection));
    }
    return instances;
}
export function validateTerminalName(name) {
    if (!name || name.trim().length === 0) {
        return {
            content: localize('emptyTerminalNameInfo', "Providing no name will reset it to the default value"),
            severity: Severity.Info
        };
    }
    return null;
}
function convertOptionsOrProfileToOptions(optionsOrProfile) {
    if (typeof optionsOrProfile === 'object' && 'profileName' in optionsOrProfile) {
        return { config: optionsOrProfile, location: optionsOrProfile.location };
    }
    return optionsOrProfile;
}
let newWithProfileAction;
export function refreshTerminalActions(detectedProfiles) {
    const profileEnum = createProfileSchemaEnums(detectedProfiles);
    const category = { value: TERMINAL_ACTION_CATEGORY, original: 'Terminal' };
    newWithProfileAction?.dispose();
    newWithProfileAction = registerAction2(class extends Action2 {
        constructor() {
            super({
                id: "workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */,
                title: { value: localize('workbench.action.terminal.newWithProfile', "Create New Terminal (With Profile)"), original: 'Create New Terminal (With Profile)' },
                f1: true,
                category,
                precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
                description: {
                    description: 'workbench.action.terminal.newWithProfile',
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                required: ['profileName'],
                                properties: {
                                    profileName: {
                                        description: localize('workbench.action.terminal.newWithProfile.profileName', "The name of the profile to create"),
                                        type: 'string',
                                        enum: profileEnum.values,
                                        markdownEnumDescriptions: profileEnum.markdownDescriptions
                                    }
                                }
                            }
                        }]
                },
            });
        }
        async run(accessor, eventOrOptionsOrProfile, profile) {
            const terminalService = accessor.get(ITerminalService);
            const terminalProfileService = accessor.get(ITerminalProfileService);
            const terminalGroupService = accessor.get(ITerminalGroupService);
            const workspaceContextService = accessor.get(IWorkspaceContextService);
            const commandService = accessor.get(ICommandService);
            let event;
            let options;
            let instance;
            let cwd;
            if (typeof eventOrOptionsOrProfile === 'object' && eventOrOptionsOrProfile && 'profileName' in eventOrOptionsOrProfile) {
                const config = terminalProfileService.availableProfiles.find(profile => profile.profileName === eventOrOptionsOrProfile.profileName);
                if (!config) {
                    throw new Error(`Could not find terminal profile "${eventOrOptionsOrProfile.profileName}"`);
                }
                options = { config };
            }
            else if (eventOrOptionsOrProfile instanceof MouseEvent || eventOrOptionsOrProfile instanceof PointerEvent || eventOrOptionsOrProfile instanceof KeyboardEvent) {
                event = eventOrOptionsOrProfile;
                options = profile ? { config: profile } : undefined;
            }
            else {
                options = convertOptionsOrProfileToOptions(eventOrOptionsOrProfile);
            }
            // split terminal
            if (event && (event.altKey || event.ctrlKey)) {
                const parentTerminal = terminalService.activeInstance;
                if (parentTerminal) {
                    await terminalService.createTerminal({ location: { parentTerminal }, config: options?.config });
                    return;
                }
            }
            const folders = workspaceContextService.getWorkspace().folders;
            if (folders.length > 1) {
                // multi-root workspace, create root picker
                const options = {
                    placeHolder: localize('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal")
                };
                const workspace = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                if (!workspace) {
                    // Don't create the instance if the workspace picker was canceled
                    return;
                }
                cwd = workspace.uri;
            }
            if (options) {
                options.cwd = cwd;
                instance = await terminalService.createTerminal(options);
            }
            else {
                instance = await terminalService.showProfileQuickPick('createInstance', cwd);
            }
            if (instance) {
                terminalService.setActiveInstance(instance);
                if (instance.target === TerminalLocation.Editor) {
                    await instance.focusWhenReady(true);
                }
                else {
                    await terminalGroupService.showPanel(true);
                }
            }
        }
    });
}
/** doc */
function getActiveInstance(accessor, resource) {
    const terminalService = accessor.get(ITerminalService);
    const castedResource = URI.isUri(resource) ? resource : undefined;
    const instance = terminalService.getInstanceFromResource(castedResource) || terminalService.activeInstance;
    return instance;
}
async function pickTerminalCwd(accessor, cancel) {
    const quickInputService = accessor.get(IQuickInputService);
    const labelService = accessor.get(ILabelService);
    const contextService = accessor.get(IWorkspaceContextService);
    const modelService = accessor.get(IModelService);
    const languageService = accessor.get(ILanguageService);
    const configurationService = accessor.get(IConfigurationService);
    const configurationResolverService = accessor.get(IConfigurationResolverService);
    const folders = contextService.getWorkspace().folders;
    if (!folders.length) {
        return;
    }
    const folderCwdPairs = await Promise.all(folders.map(x => resolveWorkspaceFolderCwd(x, configurationService, configurationResolverService)));
    const shrinkedPairs = shrinkWorkspaceFolderCwdPairs(folderCwdPairs);
    if (shrinkedPairs.length === 1) {
        return shrinkedPairs[0];
    }
    const folderPicks = shrinkedPairs.map(pair => ({
        label: pair.folder.name,
        description: pair.isOverridden
            ? localize('workbench.action.terminal.overriddenCwdDescription', "(Overriden) {0}", labelService.getUriLabel(pair.cwd, { relative: !pair.isAbsolute }))
            : labelService.getUriLabel(dirname(pair.cwd), { relative: true }),
        pair: pair,
        iconClasses: getIconClasses(modelService, languageService, pair.cwd, FileKind.ROOT_FOLDER)
    }));
    const options = {
        placeHolder: localize('workbench.action.terminal.newWorkspacePlaceholder', "Select current working directory for new terminal"),
        matchOnDescription: true,
        canPickMany: false,
    };
    const token = cancel || CancellationToken.None;
    const pick = await quickInputService.pick(folderPicks, options, token);
    return pick?.pair;
}
async function resolveWorkspaceFolderCwd(folder, configurationService, configurationResolverService) {
    const cwdConfig = configurationService.getValue("terminal.integrated.cwd" /* TerminalSettingId.Cwd */, { resource: folder.uri });
    if (typeof cwdConfig !== 'string' || cwdConfig.length === 0) {
        return { folder, cwd: folder.uri, isAbsolute: false, isOverridden: false };
    }
    const resolvedCwdConfig = await configurationResolverService.resolveAsync(folder, cwdConfig);
    return isAbsolute(resolvedCwdConfig) || resolvedCwdConfig.startsWith(AbstractVariableResolverService.VARIABLE_LHS)
        ? { folder, isAbsolute: true, isOverridden: true, cwd: URI.from({ scheme: folder.uri.scheme, path: resolvedCwdConfig }) }
        : { folder, isAbsolute: false, isOverridden: true, cwd: URI.joinPath(folder.uri, resolvedCwdConfig) };
}
/**
 * Drops repeated CWDs, if any, by keeping the one which best matches the workspace folder. It also preserves the original order.
 */
export function shrinkWorkspaceFolderCwdPairs(pairs) {
    const map = new Map();
    for (const pair of pairs) {
        const key = pair.cwd.toString();
        const value = map.get(key);
        if (!value || key === pair.folder.uri.toString()) {
            map.set(key, pair);
        }
    }
    const selectedPairs = new Set(map.values());
    const selectedPairsInOrder = pairs.filter(x => selectedPairs.has(x));
    return selectedPairsInOrder;
}
