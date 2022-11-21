/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Registry } from 'vs/platform/registry/common/platform';
export const TERMINAL_VIEW_ID = 'terminal';
export const TERMINAL_CREATION_COMMANDS = ['workbench.action.terminal.toggleTerminal', 'workbench.action.terminal.new', 'workbench.action.togglePanel', 'workbench.action.terminal.focus'];
export const TerminalCursorStyle = {
    BLOCK: 'block',
    LINE: 'line',
    UNDERLINE: 'underline'
};
export const TERMINAL_CONFIG_SECTION = 'terminal.integrated';
export const TERMINAL_ACTION_CATEGORY = nls.localize('terminalCategory', "Terminal");
export const DEFAULT_LETTER_SPACING = 0;
export const MINIMUM_LETTER_SPACING = -5;
export const DEFAULT_LINE_HEIGHT = 1;
export const MINIMUM_FONT_WEIGHT = 1;
export const MAXIMUM_FONT_WEIGHT = 1000;
export const DEFAULT_FONT_WEIGHT = 'normal';
export const DEFAULT_BOLD_FONT_WEIGHT = 'bold';
export const SUGGESTIONS_FONT_WEIGHT = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
export const ITerminalProfileResolverService = createDecorator('terminalProfileResolverService');
/*
 * When there were shell integration args injected
 * and createProcess returns an error, this exit code will be used.
 */
export const ShellIntegrationExitCode = 633;
export const ITerminalProfileService = createDecorator('terminalProfileService');
export const TerminalExtensions = {
    Backend: 'workbench.contributions.terminal.processBackend'
};
class TerminalBackendRegistry {
    _backends = new Map();
    registerTerminalBackend(backend) {
        const key = this._sanitizeRemoteAuthority(backend.remoteAuthority);
        if (this._backends.has(key)) {
            throw new Error(`A terminal backend with remote authority '${key}' was already registered.`);
        }
        this._backends.set(key, backend);
    }
    getTerminalBackend(remoteAuthority) {
        return this._backends.get(this._sanitizeRemoteAuthority(remoteAuthority));
    }
    _sanitizeRemoteAuthority(remoteAuthority) {
        // Normalize the key to lowercase as the authority is case-insensitive
        return remoteAuthority?.toLowerCase() ?? '';
    }
}
Registry.add(TerminalExtensions.Backend, new TerminalBackendRegistry());
export const DEFAULT_LOCAL_ECHO_EXCLUDE = ['vim', 'vi', 'nano', 'tmux'];
export var ProcessState;
(function (ProcessState) {
    // The process has not been initialized yet.
    ProcessState[ProcessState["Uninitialized"] = 1] = "Uninitialized";
    // The process is currently launching, the process is marked as launching
    // for a short duration after being created and is helpful to indicate
    // whether the process died as a result of bad shell and args.
    ProcessState[ProcessState["Launching"] = 2] = "Launching";
    // The process is running normally.
    ProcessState[ProcessState["Running"] = 3] = "Running";
    // The process was killed during launch, likely as a result of bad shell and
    // args.
    ProcessState[ProcessState["KilledDuringLaunch"] = 4] = "KilledDuringLaunch";
    // The process was killed by the user (the event originated from VS Code).
    ProcessState[ProcessState["KilledByUser"] = 5] = "KilledByUser";
    // The process was killed by itself, for example the shell crashed or `exit`
    // was run.
    ProcessState[ProcessState["KilledByProcess"] = 6] = "KilledByProcess";
})(ProcessState || (ProcessState = {}));
export const QUICK_LAUNCH_PROFILE_CHOICE = 'workbench.action.terminal.profile.choice';
export var TerminalCommandId;
(function (TerminalCommandId) {
    TerminalCommandId["FindNext"] = "workbench.action.terminal.findNext";
    TerminalCommandId["FindPrevious"] = "workbench.action.terminal.findPrevious";
    TerminalCommandId["Toggle"] = "workbench.action.terminal.toggleTerminal";
    TerminalCommandId["Kill"] = "workbench.action.terminal.kill";
    TerminalCommandId["KillEditor"] = "workbench.action.terminal.killEditor";
    TerminalCommandId["KillInstance"] = "workbench.action.terminal.killInstance";
    TerminalCommandId["KillAll"] = "workbench.action.terminal.killAll";
    TerminalCommandId["QuickKill"] = "workbench.action.terminal.quickKill";
    TerminalCommandId["ConfigureTerminalSettings"] = "workbench.action.terminal.openSettings";
    TerminalCommandId["OpenDetectedLink"] = "workbench.action.terminal.openDetectedLink";
    TerminalCommandId["OpenWordLink"] = "workbench.action.terminal.openWordLink";
    TerminalCommandId["ShellIntegrationLearnMore"] = "workbench.action.terminal.learnMore";
    TerminalCommandId["OpenFileLink"] = "workbench.action.terminal.openFileLink";
    TerminalCommandId["OpenWebLink"] = "workbench.action.terminal.openUrlLink";
    TerminalCommandId["RunRecentCommand"] = "workbench.action.terminal.runRecentCommand";
    TerminalCommandId["CopyLastCommand"] = "workbench.action.terminal.copyLastCommand";
    TerminalCommandId["GoToRecentDirectory"] = "workbench.action.terminal.goToRecentDirectory";
    TerminalCommandId["CopySelection"] = "workbench.action.terminal.copySelection";
    TerminalCommandId["CopySelectionAsHtml"] = "workbench.action.terminal.copySelectionAsHtml";
    TerminalCommandId["SelectAll"] = "workbench.action.terminal.selectAll";
    TerminalCommandId["DeleteWordLeft"] = "workbench.action.terminal.deleteWordLeft";
    TerminalCommandId["DeleteWordRight"] = "workbench.action.terminal.deleteWordRight";
    TerminalCommandId["DeleteToLineStart"] = "workbench.action.terminal.deleteToLineStart";
    TerminalCommandId["MoveToLineStart"] = "workbench.action.terminal.moveToLineStart";
    TerminalCommandId["MoveToLineEnd"] = "workbench.action.terminal.moveToLineEnd";
    TerminalCommandId["New"] = "workbench.action.terminal.new";
    TerminalCommandId["NewWithCwd"] = "workbench.action.terminal.newWithCwd";
    TerminalCommandId["NewLocal"] = "workbench.action.terminal.newLocal";
    TerminalCommandId["NewInActiveWorkspace"] = "workbench.action.terminal.newInActiveWorkspace";
    TerminalCommandId["NewWithProfile"] = "workbench.action.terminal.newWithProfile";
    TerminalCommandId["Split"] = "workbench.action.terminal.split";
    TerminalCommandId["SplitInstance"] = "workbench.action.terminal.splitInstance";
    TerminalCommandId["SplitInActiveWorkspace"] = "workbench.action.terminal.splitInActiveWorkspace";
    TerminalCommandId["Unsplit"] = "workbench.action.terminal.unsplit";
    TerminalCommandId["UnsplitInstance"] = "workbench.action.terminal.unsplitInstance";
    TerminalCommandId["JoinInstance"] = "workbench.action.terminal.joinInstance";
    TerminalCommandId["Join"] = "workbench.action.terminal.join";
    TerminalCommandId["Relaunch"] = "workbench.action.terminal.relaunch";
    TerminalCommandId["FocusPreviousPane"] = "workbench.action.terminal.focusPreviousPane";
    TerminalCommandId["ShowTabs"] = "workbench.action.terminal.showTabs";
    TerminalCommandId["CreateTerminalEditor"] = "workbench.action.createTerminalEditor";
    TerminalCommandId["CreateTerminalEditorSide"] = "workbench.action.createTerminalEditorSide";
    TerminalCommandId["FocusTabs"] = "workbench.action.terminal.focusTabs";
    TerminalCommandId["FocusNextPane"] = "workbench.action.terminal.focusNextPane";
    TerminalCommandId["ResizePaneLeft"] = "workbench.action.terminal.resizePaneLeft";
    TerminalCommandId["ResizePaneRight"] = "workbench.action.terminal.resizePaneRight";
    TerminalCommandId["ResizePaneUp"] = "workbench.action.terminal.resizePaneUp";
    TerminalCommandId["CreateWithProfileButton"] = "workbench.action.terminal.gitCreateProfileButton";
    TerminalCommandId["SizeToContentWidth"] = "workbench.action.terminal.sizeToContentWidth";
    TerminalCommandId["SizeToContentWidthInstance"] = "workbench.action.terminal.sizeToContentWidthInstance";
    TerminalCommandId["ResizePaneDown"] = "workbench.action.terminal.resizePaneDown";
    TerminalCommandId["Focus"] = "workbench.action.terminal.focus";
    TerminalCommandId["FocusNext"] = "workbench.action.terminal.focusNext";
    TerminalCommandId["FocusPrevious"] = "workbench.action.terminal.focusPrevious";
    TerminalCommandId["Paste"] = "workbench.action.terminal.paste";
    TerminalCommandId["PasteSelection"] = "workbench.action.terminal.pasteSelection";
    TerminalCommandId["SelectDefaultProfile"] = "workbench.action.terminal.selectDefaultShell";
    TerminalCommandId["RunSelectedText"] = "workbench.action.terminal.runSelectedText";
    TerminalCommandId["RunActiveFile"] = "workbench.action.terminal.runActiveFile";
    TerminalCommandId["SwitchTerminal"] = "workbench.action.terminal.switchTerminal";
    TerminalCommandId["ScrollDownLine"] = "workbench.action.terminal.scrollDown";
    TerminalCommandId["ScrollDownPage"] = "workbench.action.terminal.scrollDownPage";
    TerminalCommandId["ScrollToBottom"] = "workbench.action.terminal.scrollToBottom";
    TerminalCommandId["ScrollUpLine"] = "workbench.action.terminal.scrollUp";
    TerminalCommandId["ScrollUpPage"] = "workbench.action.terminal.scrollUpPage";
    TerminalCommandId["ScrollToTop"] = "workbench.action.terminal.scrollToTop";
    TerminalCommandId["Clear"] = "workbench.action.terminal.clear";
    TerminalCommandId["ClearSelection"] = "workbench.action.terminal.clearSelection";
    TerminalCommandId["ChangeIcon"] = "workbench.action.terminal.changeIcon";
    TerminalCommandId["ChangeIconPanel"] = "workbench.action.terminal.changeIconPanel";
    TerminalCommandId["ChangeIconInstance"] = "workbench.action.terminal.changeIconInstance";
    TerminalCommandId["ChangeColor"] = "workbench.action.terminal.changeColor";
    TerminalCommandId["ChangeColorPanel"] = "workbench.action.terminal.changeColorPanel";
    TerminalCommandId["ChangeColorInstance"] = "workbench.action.terminal.changeColorInstance";
    TerminalCommandId["Rename"] = "workbench.action.terminal.rename";
    TerminalCommandId["RenamePanel"] = "workbench.action.terminal.renamePanel";
    TerminalCommandId["RenameInstance"] = "workbench.action.terminal.renameInstance";
    TerminalCommandId["RenameWithArgs"] = "workbench.action.terminal.renameWithArg";
    TerminalCommandId["FindFocus"] = "workbench.action.terminal.focusFind";
    TerminalCommandId["FindHide"] = "workbench.action.terminal.hideFind";
    TerminalCommandId["QuickOpenTerm"] = "workbench.action.quickOpenTerm";
    TerminalCommandId["ScrollToPreviousCommand"] = "workbench.action.terminal.scrollToPreviousCommand";
    TerminalCommandId["ScrollToNextCommand"] = "workbench.action.terminal.scrollToNextCommand";
    TerminalCommandId["SelectToPreviousCommand"] = "workbench.action.terminal.selectToPreviousCommand";
    TerminalCommandId["SelectToNextCommand"] = "workbench.action.terminal.selectToNextCommand";
    TerminalCommandId["SelectToPreviousLine"] = "workbench.action.terminal.selectToPreviousLine";
    TerminalCommandId["SelectToNextLine"] = "workbench.action.terminal.selectToNextLine";
    TerminalCommandId["ToggleEscapeSequenceLogging"] = "toggleEscapeSequenceLogging";
    TerminalCommandId["SendSequence"] = "workbench.action.terminal.sendSequence";
    TerminalCommandId["QuickFix"] = "workbench.action.terminal.quickFix";
    TerminalCommandId["ToggleFindRegex"] = "workbench.action.terminal.toggleFindRegex";
    TerminalCommandId["ToggleFindWholeWord"] = "workbench.action.terminal.toggleFindWholeWord";
    TerminalCommandId["ToggleFindCaseSensitive"] = "workbench.action.terminal.toggleFindCaseSensitive";
    TerminalCommandId["NavigationModeExit"] = "workbench.action.terminal.navigationModeExit";
    TerminalCommandId["NavigationModeFocusNext"] = "workbench.action.terminal.navigationModeFocusNext";
    TerminalCommandId["NavigationModeFocusNextPage"] = "workbench.action.terminal.navigationModeFocusNextPage";
    TerminalCommandId["NavigationModeFocusPrevious"] = "workbench.action.terminal.navigationModeFocusPrevious";
    TerminalCommandId["NavigationModeFocusPreviousPage"] = "workbench.action.terminal.navigationModeFocusPreviousPage";
    TerminalCommandId["ShowEnvironmentInformation"] = "workbench.action.terminal.showEnvironmentInformation";
    TerminalCommandId["SearchWorkspace"] = "workbench.action.terminal.searchWorkspace";
    TerminalCommandId["AttachToSession"] = "workbench.action.terminal.attachToSession";
    TerminalCommandId["DetachSession"] = "workbench.action.terminal.detachSession";
    TerminalCommandId["MoveToEditor"] = "workbench.action.terminal.moveToEditor";
    TerminalCommandId["MoveToEditorInstance"] = "workbench.action.terminal.moveToEditorInstance";
    TerminalCommandId["MoveToTerminalPanel"] = "workbench.action.terminal.moveToTerminalPanel";
    TerminalCommandId["SetDimensions"] = "workbench.action.terminal.setDimensions";
    TerminalCommandId["ClearCommandHistory"] = "workbench.action.terminal.clearCommandHistory";
    TerminalCommandId["WriteDataToTerminal"] = "workbench.action.terminal.writeDataToTerminal";
    TerminalCommandId["ShowTextureAtlas"] = "workbench.action.terminal.showTextureAtlas";
})(TerminalCommandId || (TerminalCommandId = {}));
export const DEFAULT_COMMANDS_TO_SKIP_SHELL = [
    "workbench.action.terminal.clearSelection" /* TerminalCommandId.ClearSelection */,
    "workbench.action.terminal.clear" /* TerminalCommandId.Clear */,
    "workbench.action.terminal.copySelection" /* TerminalCommandId.CopySelection */,
    "workbench.action.terminal.copySelectionAsHtml" /* TerminalCommandId.CopySelectionAsHtml */,
    "workbench.action.terminal.copyLastCommand" /* TerminalCommandId.CopyLastCommand */,
    "workbench.action.terminal.deleteToLineStart" /* TerminalCommandId.DeleteToLineStart */,
    "workbench.action.terminal.deleteWordLeft" /* TerminalCommandId.DeleteWordLeft */,
    "workbench.action.terminal.deleteWordRight" /* TerminalCommandId.DeleteWordRight */,
    "workbench.action.terminal.focusFind" /* TerminalCommandId.FindFocus */,
    "workbench.action.terminal.hideFind" /* TerminalCommandId.FindHide */,
    "workbench.action.terminal.findNext" /* TerminalCommandId.FindNext */,
    "workbench.action.terminal.findPrevious" /* TerminalCommandId.FindPrevious */,
    "workbench.action.terminal.goToRecentDirectory" /* TerminalCommandId.GoToRecentDirectory */,
    "workbench.action.terminal.toggleFindRegex" /* TerminalCommandId.ToggleFindRegex */,
    "workbench.action.terminal.toggleFindWholeWord" /* TerminalCommandId.ToggleFindWholeWord */,
    "workbench.action.terminal.toggleFindCaseSensitive" /* TerminalCommandId.ToggleFindCaseSensitive */,
    "workbench.action.terminal.focusNextPane" /* TerminalCommandId.FocusNextPane */,
    "workbench.action.terminal.focusNext" /* TerminalCommandId.FocusNext */,
    "workbench.action.terminal.focusPreviousPane" /* TerminalCommandId.FocusPreviousPane */,
    "workbench.action.terminal.focusPrevious" /* TerminalCommandId.FocusPrevious */,
    "workbench.action.terminal.focus" /* TerminalCommandId.Focus */,
    "workbench.action.terminal.sizeToContentWidth" /* TerminalCommandId.SizeToContentWidth */,
    "workbench.action.terminal.kill" /* TerminalCommandId.Kill */,
    "workbench.action.terminal.killEditor" /* TerminalCommandId.KillEditor */,
    "workbench.action.terminal.moveToEditor" /* TerminalCommandId.MoveToEditor */,
    "workbench.action.terminal.moveToLineEnd" /* TerminalCommandId.MoveToLineEnd */,
    "workbench.action.terminal.moveToLineStart" /* TerminalCommandId.MoveToLineStart */,
    "workbench.action.terminal.moveToTerminalPanel" /* TerminalCommandId.MoveToTerminalPanel */,
    "workbench.action.terminal.newInActiveWorkspace" /* TerminalCommandId.NewInActiveWorkspace */,
    "workbench.action.terminal.new" /* TerminalCommandId.New */,
    "workbench.action.terminal.paste" /* TerminalCommandId.Paste */,
    "workbench.action.terminal.pasteSelection" /* TerminalCommandId.PasteSelection */,
    "workbench.action.terminal.quickFix" /* TerminalCommandId.QuickFix */,
    "workbench.action.terminal.resizePaneDown" /* TerminalCommandId.ResizePaneDown */,
    "workbench.action.terminal.resizePaneLeft" /* TerminalCommandId.ResizePaneLeft */,
    "workbench.action.terminal.resizePaneRight" /* TerminalCommandId.ResizePaneRight */,
    "workbench.action.terminal.resizePaneUp" /* TerminalCommandId.ResizePaneUp */,
    "workbench.action.terminal.runActiveFile" /* TerminalCommandId.RunActiveFile */,
    "workbench.action.terminal.runSelectedText" /* TerminalCommandId.RunSelectedText */,
    "workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */,
    "workbench.action.terminal.scrollDown" /* TerminalCommandId.ScrollDownLine */,
    "workbench.action.terminal.scrollDownPage" /* TerminalCommandId.ScrollDownPage */,
    "workbench.action.terminal.scrollToBottom" /* TerminalCommandId.ScrollToBottom */,
    "workbench.action.terminal.scrollToNextCommand" /* TerminalCommandId.ScrollToNextCommand */,
    "workbench.action.terminal.scrollToPreviousCommand" /* TerminalCommandId.ScrollToPreviousCommand */,
    "workbench.action.terminal.scrollToTop" /* TerminalCommandId.ScrollToTop */,
    "workbench.action.terminal.scrollUp" /* TerminalCommandId.ScrollUpLine */,
    "workbench.action.terminal.scrollUpPage" /* TerminalCommandId.ScrollUpPage */,
    "workbench.action.terminal.sendSequence" /* TerminalCommandId.SendSequence */,
    "workbench.action.terminal.selectAll" /* TerminalCommandId.SelectAll */,
    "workbench.action.terminal.selectToNextCommand" /* TerminalCommandId.SelectToNextCommand */,
    "workbench.action.terminal.selectToNextLine" /* TerminalCommandId.SelectToNextLine */,
    "workbench.action.terminal.selectToPreviousCommand" /* TerminalCommandId.SelectToPreviousCommand */,
    "workbench.action.terminal.selectToPreviousLine" /* TerminalCommandId.SelectToPreviousLine */,
    "workbench.action.terminal.splitInActiveWorkspace" /* TerminalCommandId.SplitInActiveWorkspace */,
    "workbench.action.terminal.split" /* TerminalCommandId.Split */,
    "workbench.action.terminal.toggleTerminal" /* TerminalCommandId.Toggle */,
    "workbench.action.terminal.navigationModeExit" /* TerminalCommandId.NavigationModeExit */,
    "workbench.action.terminal.navigationModeFocusNext" /* TerminalCommandId.NavigationModeFocusNext */,
    "workbench.action.terminal.navigationModeFocusPrevious" /* TerminalCommandId.NavigationModeFocusPrevious */,
    'editor.action.toggleTabFocusMode',
    'notifications.hideList',
    'notifications.hideToasts',
    'workbench.action.closeQuickOpen',
    'workbench.action.quickOpen',
    'workbench.action.quickOpenPreviousEditor',
    'workbench.action.showCommands',
    'workbench.action.tasks.build',
    'workbench.action.tasks.restartTask',
    'workbench.action.tasks.runTask',
    'workbench.action.tasks.reRunTask',
    'workbench.action.tasks.showLog',
    'workbench.action.tasks.showTasks',
    'workbench.action.tasks.terminate',
    'workbench.action.tasks.test',
    'workbench.action.toggleFullScreen',
    'workbench.action.terminal.focusAtIndex1',
    'workbench.action.terminal.focusAtIndex2',
    'workbench.action.terminal.focusAtIndex3',
    'workbench.action.terminal.focusAtIndex4',
    'workbench.action.terminal.focusAtIndex5',
    'workbench.action.terminal.focusAtIndex6',
    'workbench.action.terminal.focusAtIndex7',
    'workbench.action.terminal.focusAtIndex8',
    'workbench.action.terminal.focusAtIndex9',
    'workbench.action.focusSecondEditorGroup',
    'workbench.action.focusThirdEditorGroup',
    'workbench.action.focusFourthEditorGroup',
    'workbench.action.focusFifthEditorGroup',
    'workbench.action.focusSixthEditorGroup',
    'workbench.action.focusSeventhEditorGroup',
    'workbench.action.focusEighthEditorGroup',
    'workbench.action.focusNextPart',
    'workbench.action.focusPreviousPart',
    'workbench.action.nextPanelView',
    'workbench.action.previousPanelView',
    'workbench.action.nextSideBarView',
    'workbench.action.previousSideBarView',
    'workbench.action.debug.start',
    'workbench.action.debug.stop',
    'workbench.action.debug.run',
    'workbench.action.debug.restart',
    'workbench.action.debug.continue',
    'workbench.action.debug.pause',
    'workbench.action.debug.stepInto',
    'workbench.action.debug.stepOut',
    'workbench.action.debug.stepOver',
    'workbench.action.nextEditor',
    'workbench.action.previousEditor',
    'workbench.action.nextEditorInGroup',
    'workbench.action.previousEditorInGroup',
    'workbench.action.openNextRecentlyUsedEditor',
    'workbench.action.openPreviousRecentlyUsedEditor',
    'workbench.action.openNextRecentlyUsedEditorInGroup',
    'workbench.action.openPreviousRecentlyUsedEditorInGroup',
    'workbench.action.quickOpenPreviousRecentlyUsedEditor',
    'workbench.action.quickOpenLeastRecentlyUsedEditor',
    'workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup',
    'workbench.action.quickOpenLeastRecentlyUsedEditorInGroup',
    'workbench.action.focusActiveEditorGroup',
    'workbench.action.focusFirstEditorGroup',
    'workbench.action.focusLastEditorGroup',
    'workbench.action.firstEditorInGroup',
    'workbench.action.lastEditorInGroup',
    'workbench.action.navigateUp',
    'workbench.action.navigateDown',
    'workbench.action.navigateRight',
    'workbench.action.navigateLeft',
    'workbench.action.togglePanel',
    'workbench.action.quickOpenView',
    'workbench.action.toggleMaximizedPanel'
];
export const terminalContributionsDescriptor = {
    extensionPoint: 'terminal',
    defaultExtensionKind: ['workspace'],
    jsonSchema: {
        description: nls.localize('vscode.extension.contributes.terminal', 'Contributes terminal functionality.'),
        type: 'object',
        properties: {
            quickFixes: {
                type: 'array',
                description: nls.localize('vscode.extension.contributes.terminal.quickFixes', "Defines quick fixes for terminals with shell integration enabled."),
                items: {
                    type: 'object',
                    required: ['id', 'commandLineMatcher', 'outputMatcher'],
                    defaultSnippets: [{
                            body: {
                                id: '$1',
                                commandLineMatcher: '$2',
                                outputMatcher: '$3',
                                commandToRun: '$4',
                                linkToOpen: '$5'
                            }
                        }],
                    properties: {
                        id: {
                            description: nls.localize('vscode.extension.contributes.terminal.quickFixes.id', "The ID of the quick fix."),
                            type: 'string',
                        },
                        commandLineMatcher: {
                            description: nls.localize('vscode.extension.contributes.terminal.quickFixes.commandLineMatcher', "The command line to match."),
                            type: 'string',
                        },
                        outputMatcher: {
                            description: nls.localize('vscode.extension.contributes.terminal.quickFixes.outputMatcher', "The output to match, which provides groups of the form <group_name> to be referenced via ${group:group_name} in commandToRun and linkToOpen."),
                            type: 'object',
                            required: ['lineMatcher', 'anchor', 'offset', 'length'],
                            properties: {
                                lineMatcher: {
                                    description: 'The command line to match',
                                    type: 'string'
                                },
                                anchor: {
                                    description: 'Which side of the output to anchor the offset and length against',
                                    enum: ['top', 'bottom']
                                },
                                offset: {
                                    description: 'How far from either the top or the bottom of the butter to start matching against.',
                                    type: 'number'
                                },
                                length: {
                                    description: 'The number of rows to match against, this should be as small as possible for performance reasons',
                                    type: 'number'
                                }
                            }
                        },
                        commandToRun: {
                            description: 'The command to run in the terminal for this match. Refer to a group found in the outputMatcher via ${group:group_name}. When provided, will take precedence over linkToOpen.',
                            type: 'string'
                        },
                        linkToOpen: {
                            description: 'The link to open for this match. Refer to a group found in the outputMatcher via ${group:group_name}. If a commandToRun is provided, this will be ignored.',
                            type: 'string'
                        }
                    },
                }
            },
            profiles: {
                type: 'array',
                description: nls.localize('vscode.extension.contributes.terminal.profiles', "Defines additional terminal profiles that the user can create."),
                items: {
                    type: 'object',
                    required: ['id', 'title'],
                    defaultSnippets: [{
                            body: {
                                id: '$1',
                                title: '$2'
                            }
                        }],
                    properties: {
                        id: {
                            description: nls.localize('vscode.extension.contributes.terminal.profiles.id', "The ID of the terminal profile provider."),
                            type: 'string',
                        },
                        title: {
                            description: nls.localize('vscode.extension.contributes.terminal.profiles.title', "Title for this terminal profile."),
                            type: 'string',
                        },
                        icon: {
                            description: nls.localize('vscode.extension.contributes.terminal.types.icon', "A codicon, URI, or light and dark URIs to associate with this terminal type."),
                            anyOf: [{
                                    type: 'string',
                                },
                                {
                                    type: 'object',
                                    properties: {
                                        light: {
                                            description: nls.localize('vscode.extension.contributes.terminal.types.icon.light', 'Icon path when a light theme is used'),
                                            type: 'string'
                                        },
                                        dark: {
                                            description: nls.localize('vscode.extension.contributes.terminal.types.icon.dark', 'Icon path when a dark theme is used'),
                                            type: 'string'
                                        }
                                    }
                                }]
                        },
                    },
                },
            },
        },
    },
};
