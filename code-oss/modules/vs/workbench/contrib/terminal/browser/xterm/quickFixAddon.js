var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import * as dom from 'vs/base/browser/dom';
import { asArray } from 'vs/base/common/arrays';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { updateLayout } from 'vs/workbench/contrib/terminal/browser/xterm/decorationStyles';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ILogService } from 'vs/platform/log/common/log';
import { ITerminalContributionService } from 'vs/workbench/contrib/terminal/common/terminalExtensionPoints';
import { URI } from 'vs/base/common/uri';
import { gitCreatePr, gitPushSetUpstream, gitSimilar } from 'vs/workbench/contrib/terminal/browser/terminalQuickFixBuiltinActions';
import { AudioCue, IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
import { IActionWidgetService } from 'vs/platform/actionWidget/browser/actionWidget';
import { TerminalQuickFix, toMenuItems } from 'vs/workbench/contrib/terminal/browser/widgets/terminalQuickFixMenuItems';
const quickFixTelemetryTitle = 'terminal/quick-fix';
const quickFixSelectors = ["quick-fix" /* DecorationSelector.QuickFix */, "codicon-light-bulb" /* DecorationSelector.LightBulb */, "codicon" /* DecorationSelector.Codicon */, "terminal-command-decoration" /* DecorationSelector.CommandDecoration */, "xterm-decoration" /* DecorationSelector.XtermDecoration */];
let TerminalQuickFixAddon = class TerminalQuickFixAddon extends Disposable {
    _capabilities;
    _configurationService;
    _terminalContributionService;
    _audioCueService;
    _openerService;
    _telemetryService;
    _logService;
    _actionWidgetService;
    _onDidRequestRerunCommand = new Emitter();
    onDidRequestRerunCommand = this._onDidRequestRerunCommand.event;
    _terminal;
    _commandListeners = new Map();
    _quickFixes;
    _decoration;
    _fixesShown = false;
    _expectedCommands;
    _fixId;
    constructor(_capabilities, _configurationService, _terminalContributionService, _audioCueService, _openerService, _telemetryService, _logService, _actionWidgetService) {
        super();
        this._capabilities = _capabilities;
        this._configurationService = _configurationService;
        this._terminalContributionService = _terminalContributionService;
        this._audioCueService = _audioCueService;
        this._openerService = _openerService;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this._actionWidgetService = _actionWidgetService;
        const commandDetectionCapability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
        if (commandDetectionCapability) {
            this._registerCommandHandlers();
        }
        else {
            this._capabilities.onDidAddCapability(c => {
                if (c === 2 /* TerminalCapability.CommandDetection */) {
                    this._registerCommandHandlers();
                }
            });
        }
        for (const quickFix of this._terminalContributionService.quickFixes) {
            this.registerCommandFinishedListener(convertToQuickFixOptions(quickFix));
        }
        this.registerCommandFinishedListener(gitSimilar());
        this.registerCommandFinishedListener(convertToQuickFixOptions(gitCreatePr()));
        this.registerCommandFinishedListener(convertToQuickFixOptions(gitPushSetUpstream()));
    }
    activate(terminal) {
        this._terminal = terminal;
    }
    showMenu() {
        this._fixesShown = true;
        this._decoration?.element?.click();
    }
    registerCommandFinishedListener(options) {
        const matcherKey = options.commandLineMatcher.toString();
        const currentOptions = this._commandListeners.get(matcherKey) || [];
        currentOptions.push(options);
        this._commandListeners.set(matcherKey, currentOptions);
    }
    _registerCommandHandlers() {
        const terminal = this._terminal;
        const commandDetection = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
        if (!terminal || !commandDetection) {
            return;
        }
        this._register(commandDetection.onCommandFinished(command => {
            if (this._expectedCommands) {
                const quickFixId = this._fixId || '';
                const ranQuickFixCommand = this._expectedCommands.includes(command.command);
                this._logService.debug(quickFixTelemetryTitle, {
                    quickFixId,
                    fixesShown: this._fixesShown,
                    ranQuickFixCommand
                });
                this._telemetryService?.publicLog2(quickFixTelemetryTitle, {
                    quickFixId,
                    fixesShown: this._fixesShown,
                    ranQuickFixCommand
                });
                this._expectedCommands = undefined;
                this._fixId = undefined;
            }
            this._resolveQuickFixes(command);
            this._fixesShown = false;
        }));
        // The buffer is not ready by the time command finish
        // is called. Add the decoration on command start if there are corresponding quick fixes
        this._register(commandDetection.onCommandStarted(() => {
            this._registerQuickFixDecoration();
            this._quickFixes = undefined;
        }));
    }
    /**
     * Resolves quick fixes, if any, based on the
     * @param command & its output
     */
    _resolveQuickFixes(command) {
        if (command.command !== '') {
            this._disposeQuickFix();
        }
        const result = getQuickFixesForCommand(command, this._commandListeners, this._openerService, this._onDidRequestRerunCommand);
        if (!result) {
            return;
        }
        const { fixes, onDidRunQuickFix, expectedCommands } = result;
        this._expectedCommands = expectedCommands;
        this._fixId = fixes.map(f => f.id).join('');
        this._quickFixes = fixes;
        this._register(onDidRunQuickFix((quickFixId) => {
            const ranQuickFixCommand = (this._expectedCommands?.includes(command.command) || false);
            this._logService.debug(quickFixTelemetryTitle, {
                quickFixId,
                fixesShown: this._fixesShown,
                ranQuickFixCommand
            });
            this._telemetryService?.publicLog2(quickFixTelemetryTitle, {
                quickFixId,
                fixesShown: this._fixesShown,
                ranQuickFixCommand
            });
            this._disposeQuickFix();
            this._fixesShown = false;
        }));
    }
    _disposeQuickFix() {
        this._decoration?.dispose();
        this._decoration = undefined;
        this._quickFixes = undefined;
    }
    /**
     * Registers a decoration with the quick fixes
     */
    _registerQuickFixDecoration() {
        if (!this._terminal) {
            return;
        }
        if (!this._quickFixes) {
            return;
        }
        const marker = this._terminal.registerMarker();
        if (!marker) {
            return;
        }
        const decoration = this._terminal.registerDecoration({ marker, layer: 'top' });
        if (!decoration) {
            return;
        }
        this._decoration = decoration;
        const fixes = this._quickFixes;
        if (!fixes) {
            decoration.dispose();
            return;
        }
        decoration?.onRender((e) => {
            if (e.classList.contains("quick-fix" /* DecorationSelector.QuickFix */)) {
                return;
            }
            e.classList.add(...quickFixSelectors);
            updateLayout(this._configurationService, e);
            this._audioCueService.playAudioCue(AudioCue.terminalQuickFix);
            this._register(dom.addDisposableListener(e, dom.EventType.CLICK, () => {
                const rect = e.getBoundingClientRect();
                const anchor = {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                };
                // TODO: What's documentation do? Need a vscode command?
                const documentation = fixes.map(f => { return { id: f.id, title: f.label, tooltip: f.tooltip }; });
                const actions = fixes.map(f => new TerminalQuickFix(f, f.class || "command" /* TerminalQuickFixType.Command */, f.label));
                const actionSet = {
                    // TODO: Documentation and actions are separate?
                    documentation,
                    allActions: actions,
                    hasAutoFix: false,
                    validActions: actions,
                    dispose: () => { }
                };
                const parentElement = e.parentElement?.parentElement?.parentElement?.parentElement;
                if (!parentElement) {
                    return;
                }
                const delegate = {
                    onSelect: async (fix) => {
                        fix.action?.run();
                        this._actionWidgetService.hide();
                    },
                    onHide: () => {
                        this._terminal?.focus();
                    },
                };
                this._actionWidgetService.show('quickFixWidget', toMenuItems, delegate, actionSet, anchor, parentElement, {
                    showHeaders: true,
                    includeDisabledActions: false,
                    fromLightbulb: true
                });
            }));
        });
    }
};
TerminalQuickFixAddon = __decorate([
    __param(1, IConfigurationService),
    __param(2, ITerminalContributionService),
    __param(3, IAudioCueService),
    __param(4, IOpenerService),
    __param(5, ITelemetryService),
    __param(6, ILogService),
    __param(7, IActionWidgetService)
], TerminalQuickFixAddon);
export { TerminalQuickFixAddon };
export function getQuickFixesForCommand(command, quickFixOptions, openerService, onDidRequestRerunCommand) {
    const onDidRunQuickFixEmitter = new Emitter();
    const onDidRunQuickFix = onDidRunQuickFixEmitter.event;
    const fixes = [];
    const newCommand = command.command;
    const expectedCommands = [];
    for (const options of quickFixOptions.values()) {
        for (const option of options) {
            if (option.exitStatus !== undefined && option.exitStatus !== (command.exitCode === 0)) {
                continue;
            }
            const commandLineMatch = newCommand.match(option.commandLineMatcher);
            if (!commandLineMatch) {
                continue;
            }
            const outputMatcher = option.outputMatcher;
            let outputMatch;
            if (outputMatcher) {
                outputMatch = command.getOutputMatch(outputMatcher);
            }
            const id = option.id;
            const quickFixes = option.getQuickFixes({ commandLineMatch, outputMatch }, command);
            if (quickFixes) {
                for (const quickFix of asArray(quickFixes)) {
                    let action;
                    if ('type' in quickFix) {
                        switch (quickFix.type) {
                            case "command" /* TerminalQuickFixType.Command */: {
                                const label = localize('quickFix.command', 'Run: {0}', quickFix.command);
                                action = {
                                    id: quickFix.id,
                                    label,
                                    class: quickFix.type,
                                    enabled: true,
                                    run: () => {
                                        onDidRequestRerunCommand?.fire({
                                            command: quickFix.command,
                                            addNewLine: quickFix.addNewLine
                                        });
                                    },
                                    tooltip: label,
                                    command: quickFix.command
                                };
                                expectedCommands.push(quickFix.command);
                                break;
                            }
                            case "opener" /* TerminalQuickFixType.Opener */: {
                                const label = localize('quickFix.opener', 'Open: {0}', quickFix.uri.toString());
                                action = {
                                    id: quickFix.id,
                                    label,
                                    class: quickFix.type,
                                    enabled: true,
                                    run: () => {
                                        openerService.open(quickFix.uri);
                                        // since no command gets run here, need to
                                        // clear the decoration and quick fix
                                        onDidRunQuickFixEmitter.fire(id);
                                    },
                                    tooltip: label,
                                    uri: quickFix.uri
                                };
                                break;
                            }
                        }
                    }
                    else {
                        action = {
                            id: quickFix.id,
                            label: quickFix.label,
                            class: quickFix.class,
                            enabled: quickFix.enabled,
                            run: () => {
                                quickFix.run();
                                onDidRunQuickFixEmitter.fire(id);
                            },
                            tooltip: quickFix.tooltip
                        };
                    }
                    if (action) {
                        fixes.push(action);
                    }
                }
            }
        }
    }
    return fixes.length > 0 ? { fixes, onDidRunQuickFix, expectedCommands } : undefined;
}
export function convertToQuickFixOptions(quickFix) {
    const type = quickFix.commandToRun ? 'command' : quickFix.linkToOpen ? 'opener' : undefined;
    const options = {
        id: quickFix.id,
        commandLineMatcher: quickFix.commandLineMatcher,
        outputMatcher: quickFix.outputMatcher,
        type,
        getQuickFixes: type === 'command' ? (matchResult) => {
            const matches = matchResult.outputMatch;
            const commandToRun = quickFix.commandToRun;
            if (!matches || !commandToRun) {
                return;
            }
            const groups = matches.groups;
            if (!groups) {
                return;
            }
            const actions = [];
            let fixedCommand = commandToRun;
            for (const [key, value] of Object.entries(groups)) {
                const varToResolve = '${group:' + `${key}` + '}';
                if (!commandToRun.includes(varToResolve)) {
                    return [];
                }
                fixedCommand = fixedCommand.replaceAll(varToResolve, value);
            }
            if (fixedCommand) {
                actions.push({
                    type: 'command',
                    id: quickFix.id,
                    command: fixedCommand,
                    addNewLine: true
                });
                return actions;
            }
            return;
        } : (matchResult) => {
            const matches = matchResult.outputMatch;
            const linkToOpen = quickFix.linkToOpen;
            if (!matches || !linkToOpen) {
                return;
            }
            const groups = matches.groups;
            if (!groups) {
                return;
            }
            let link = linkToOpen;
            for (const [key, value] of Object.entries(groups)) {
                const varToResolve = '${group:' + `${key}` + '}';
                if (!linkToOpen?.includes(varToResolve)) {
                    return [];
                }
                link = link.replaceAll(varToResolve, value);
            }
            return link ? { type: 'opener', uri: URI.parse(link), id: quickFix.id } : [];
        },
        exitStatus: quickFix.exitStatus,
        source: quickFix.extensionIdentifier
    };
    return options;
}
