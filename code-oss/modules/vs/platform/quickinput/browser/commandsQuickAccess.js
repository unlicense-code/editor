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
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { isCancellationError } from 'vs/base/common/errors';
import { matchesContiguousSubString, matchesPrefix, matchesWords, or } from 'vs/base/common/filters';
import { Disposable } from 'vs/base/common/lifecycle';
import { LRUCache } from 'vs/base/common/map';
import Severity from 'vs/base/common/severity';
import { withNullAsUndefined } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { PickerQuickAccessProvider } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
let AbstractCommandsQuickAccessProvider = class AbstractCommandsQuickAccessProvider extends PickerQuickAccessProvider {
    instantiationService;
    keybindingService;
    commandService;
    telemetryService;
    dialogService;
    static PREFIX = '>';
    static WORD_FILTER = or(matchesPrefix, matchesWords, matchesContiguousSubString);
    commandsHistory = this._register(this.instantiationService.createInstance(CommandsHistory));
    options;
    constructor(options, instantiationService, keybindingService, commandService, telemetryService, dialogService) {
        super(AbstractCommandsQuickAccessProvider.PREFIX, options);
        this.instantiationService = instantiationService;
        this.keybindingService = keybindingService;
        this.commandService = commandService;
        this.telemetryService = telemetryService;
        this.dialogService = dialogService;
        this.options = options;
    }
    async _getPicks(filter, _disposables, token) {
        // Ask subclass for all command picks
        const allCommandPicks = await this.getCommandPicks(token);
        if (token.isCancellationRequested) {
            return [];
        }
        // Filter
        const filteredCommandPicks = [];
        for (const commandPick of allCommandPicks) {
            const labelHighlights = withNullAsUndefined(AbstractCommandsQuickAccessProvider.WORD_FILTER(filter, commandPick.label));
            const aliasHighlights = commandPick.commandAlias ? withNullAsUndefined(AbstractCommandsQuickAccessProvider.WORD_FILTER(filter, commandPick.commandAlias)) : undefined;
            // Add if matching in label or alias
            if (labelHighlights || aliasHighlights) {
                commandPick.highlights = {
                    label: labelHighlights,
                    detail: this.options.showAlias ? aliasHighlights : undefined
                };
                filteredCommandPicks.push(commandPick);
            }
            // Also add if we have a 100% command ID match
            else if (filter === commandPick.commandId) {
                filteredCommandPicks.push(commandPick);
            }
        }
        // Add description to commands that have duplicate labels
        const mapLabelToCommand = new Map();
        for (const commandPick of filteredCommandPicks) {
            const existingCommandForLabel = mapLabelToCommand.get(commandPick.label);
            if (existingCommandForLabel) {
                commandPick.description = commandPick.commandId;
                existingCommandForLabel.description = existingCommandForLabel.commandId;
            }
            else {
                mapLabelToCommand.set(commandPick.label, commandPick);
            }
        }
        // Sort by MRU order and fallback to name otherwise
        filteredCommandPicks.sort((commandPickA, commandPickB) => {
            const commandACounter = this.commandsHistory.peek(commandPickA.commandId);
            const commandBCounter = this.commandsHistory.peek(commandPickB.commandId);
            if (commandACounter && commandBCounter) {
                return commandACounter > commandBCounter ? -1 : 1; // use more recently used command before older
            }
            if (commandACounter) {
                return -1; // first command was used, so it wins over the non used one
            }
            if (commandBCounter) {
                return 1; // other command was used so it wins over the command
            }
            // both commands were never used, so we sort by name
            return commandPickA.label.localeCompare(commandPickB.label);
        });
        const commandPicks = [];
        let addSeparator = false;
        for (let i = 0; i < filteredCommandPicks.length; i++) {
            const commandPick = filteredCommandPicks[i];
            const keybinding = this.keybindingService.lookupKeybinding(commandPick.commandId);
            const ariaLabel = keybinding ?
                localize('commandPickAriaLabelWithKeybinding', "{0}, {1}", commandPick.label, keybinding.getAriaLabel()) :
                commandPick.label;
            // Separator: recently used
            if (i === 0 && this.commandsHistory.peek(commandPick.commandId)) {
                commandPicks.push({ type: 'separator', label: localize('recentlyUsed', "recently used") });
                addSeparator = true;
            }
            // Separator: other commands
            if (i !== 0 && addSeparator && !this.commandsHistory.peek(commandPick.commandId)) {
                commandPicks.push({ type: 'separator', label: localize('morecCommands', "other commands") });
                addSeparator = false; // only once
            }
            // Command
            commandPicks.push({
                ...commandPick,
                ariaLabel,
                detail: this.options.showAlias && commandPick.commandAlias !== commandPick.label ? commandPick.commandAlias : undefined,
                keybinding,
                accept: async () => {
                    // Add to history
                    this.commandsHistory.push(commandPick.commandId);
                    // Telementry
                    this.telemetryService.publicLog2('workbenchActionExecuted', {
                        id: commandPick.commandId,
                        from: 'quick open'
                    });
                    // Run
                    try {
                        await this.commandService.executeCommand(commandPick.commandId);
                    }
                    catch (error) {
                        if (!isCancellationError(error)) {
                            this.dialogService.show(Severity.Error, localize('canNotRun', "Command '{0}' resulted in an error ({1})", commandPick.label, toErrorMessage(error)));
                        }
                    }
                }
            });
        }
        return commandPicks;
    }
};
AbstractCommandsQuickAccessProvider = __decorate([
    __param(1, IInstantiationService),
    __param(2, IKeybindingService),
    __param(3, ICommandService),
    __param(4, ITelemetryService),
    __param(5, IDialogService)
], AbstractCommandsQuickAccessProvider);
export { AbstractCommandsQuickAccessProvider };
let CommandsHistory = class CommandsHistory extends Disposable {
    storageService;
    configurationService;
    static DEFAULT_COMMANDS_HISTORY_LENGTH = 50;
    static PREF_KEY_CACHE = 'commandPalette.mru.cache';
    static PREF_KEY_COUNTER = 'commandPalette.mru.counter';
    static cache;
    static counter = 1;
    configuredCommandsHistoryLength = 0;
    constructor(storageService, configurationService) {
        super();
        this.storageService = storageService;
        this.configurationService = configurationService;
        this.updateConfiguration();
        this.load();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(() => this.updateConfiguration()));
    }
    updateConfiguration() {
        this.configuredCommandsHistoryLength = CommandsHistory.getConfiguredCommandHistoryLength(this.configurationService);
        if (CommandsHistory.cache && CommandsHistory.cache.limit !== this.configuredCommandsHistoryLength) {
            CommandsHistory.cache.limit = this.configuredCommandsHistoryLength;
            CommandsHistory.saveState(this.storageService);
        }
    }
    load() {
        const raw = this.storageService.get(CommandsHistory.PREF_KEY_CACHE, 0 /* StorageScope.PROFILE */);
        let serializedCache;
        if (raw) {
            try {
                serializedCache = JSON.parse(raw);
            }
            catch (error) {
                // invalid data
            }
        }
        const cache = CommandsHistory.cache = new LRUCache(this.configuredCommandsHistoryLength, 1);
        if (serializedCache) {
            let entries;
            if (serializedCache.usesLRU) {
                entries = serializedCache.entries;
            }
            else {
                entries = serializedCache.entries.sort((a, b) => a.value - b.value);
            }
            entries.forEach(entry => cache.set(entry.key, entry.value));
        }
        CommandsHistory.counter = this.storageService.getNumber(CommandsHistory.PREF_KEY_COUNTER, 0 /* StorageScope.PROFILE */, CommandsHistory.counter);
    }
    push(commandId) {
        if (!CommandsHistory.cache) {
            return;
        }
        CommandsHistory.cache.set(commandId, CommandsHistory.counter++); // set counter to command
        CommandsHistory.saveState(this.storageService);
    }
    peek(commandId) {
        return CommandsHistory.cache?.peek(commandId);
    }
    static saveState(storageService) {
        if (!CommandsHistory.cache) {
            return;
        }
        const serializedCache = { usesLRU: true, entries: [] };
        CommandsHistory.cache.forEach((value, key) => serializedCache.entries.push({ key, value }));
        storageService.store(CommandsHistory.PREF_KEY_CACHE, JSON.stringify(serializedCache), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        storageService.store(CommandsHistory.PREF_KEY_COUNTER, CommandsHistory.counter, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
    }
    static getConfiguredCommandHistoryLength(configurationService) {
        const config = configurationService.getValue();
        const configuredCommandHistoryLength = config.workbench?.commandPalette?.history;
        if (typeof configuredCommandHistoryLength === 'number') {
            return configuredCommandHistoryLength;
        }
        return CommandsHistory.DEFAULT_COMMANDS_HISTORY_LENGTH;
    }
    static clearHistory(configurationService, storageService) {
        const commandHistoryLength = CommandsHistory.getConfiguredCommandHistoryLength(configurationService);
        CommandsHistory.cache = new LRUCache(commandHistoryLength);
        CommandsHistory.counter = 1;
        CommandsHistory.saveState(storageService);
    }
};
CommandsHistory = __decorate([
    __param(0, IStorageService),
    __param(1, IConfigurationService)
], CommandsHistory);
export { CommandsHistory };
