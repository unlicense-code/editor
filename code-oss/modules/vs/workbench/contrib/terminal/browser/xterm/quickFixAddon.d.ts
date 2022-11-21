import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ITerminalCapabilityStore, ITerminalCommand } from 'vs/platform/terminal/common/capabilities/capabilities';
import { IAction } from 'vs/base/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITerminalQuickFixOptions } from 'vs/workbench/contrib/terminal/browser/terminal';
import { Terminal } from 'xterm';
import type { ITerminalAddon } from 'xterm-headless';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ILogService } from 'vs/platform/log/common/log';
import { ITerminalContributionService } from 'vs/workbench/contrib/terminal/common/terminalExtensionPoints';
import { IExtensionTerminalQuickFix } from 'vs/platform/terminal/common/terminal';
import { IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
import { IActionWidgetService } from 'vs/platform/actionWidget/browser/actionWidget';
export interface ITerminalQuickFix {
    showMenu(): void;
    /**
     * Registers a listener on onCommandFinished scoped to a particular command or regular
     * expression and provides a callback to be executed for commands that match.
     */
    registerCommandFinishedListener(options: ITerminalQuickFixOptions): void;
}
export interface ITerminalQuickFixAddon extends ITerminalQuickFix {
    onDidRequestRerunCommand: Event<{
        command: string;
        addNewLine?: boolean;
    }>;
}
export declare class TerminalQuickFixAddon extends Disposable implements ITerminalAddon, ITerminalQuickFixAddon {
    private readonly _capabilities;
    private readonly _configurationService;
    private readonly _terminalContributionService;
    private readonly _audioCueService;
    private readonly _openerService;
    private readonly _telemetryService;
    private readonly _logService;
    private readonly _actionWidgetService;
    private readonly _onDidRequestRerunCommand;
    readonly onDidRequestRerunCommand: Event<{
        command: string;
        addNewLine?: boolean | undefined;
    }>;
    private _terminal;
    private _commandListeners;
    private _quickFixes;
    private _decoration;
    private _fixesShown;
    private _expectedCommands;
    private _fixId;
    constructor(_capabilities: ITerminalCapabilityStore, _configurationService: IConfigurationService, _terminalContributionService: ITerminalContributionService, _audioCueService: IAudioCueService, _openerService: IOpenerService, _telemetryService: ITelemetryService, _logService: ILogService, _actionWidgetService: IActionWidgetService);
    activate(terminal: Terminal): void;
    showMenu(): void;
    registerCommandFinishedListener(options: ITerminalQuickFixOptions): void;
    private _registerCommandHandlers;
    /**
     * Resolves quick fixes, if any, based on the
     * @param command & its output
     */
    private _resolveQuickFixes;
    private _disposeQuickFix;
    /**
     * Registers a decoration with the quick fixes
     */
    private _registerQuickFixDecoration;
}
export declare function getQuickFixesForCommand(command: ITerminalCommand, quickFixOptions: Map<string, ITerminalQuickFixOptions[]>, openerService: IOpenerService, onDidRequestRerunCommand?: Emitter<{
    command: string;
    addNewLine?: boolean;
}>): {
    fixes: IAction[];
    onDidRunQuickFix: Event<string>;
    expectedCommands?: string[];
} | undefined;
export declare function convertToQuickFixOptions(quickFix: IExtensionTerminalQuickFix): ITerminalQuickFixOptions;
