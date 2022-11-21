import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable, DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IPickerQuickAccessItem, IPickerQuickAccessProviderOptions, PickerQuickAccessProvider } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { IQuickPickSeparator } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export interface ICommandQuickPick extends IPickerQuickAccessItem {
    commandId: string;
    commandAlias?: string;
}
export interface ICommandsQuickAccessOptions extends IPickerQuickAccessProviderOptions<ICommandQuickPick> {
    showAlias: boolean;
}
export declare abstract class AbstractCommandsQuickAccessProvider extends PickerQuickAccessProvider<ICommandQuickPick> implements IDisposable {
    private readonly instantiationService;
    private readonly keybindingService;
    private readonly commandService;
    private readonly telemetryService;
    private readonly dialogService;
    static PREFIX: string;
    private static WORD_FILTER;
    private readonly commandsHistory;
    protected readonly options: ICommandsQuickAccessOptions;
    constructor(options: ICommandsQuickAccessOptions, instantiationService: IInstantiationService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService);
    protected _getPicks(filter: string, _disposables: DisposableStore, token: CancellationToken): Promise<Array<ICommandQuickPick | IQuickPickSeparator>>;
    /**
     * Subclasses to provide the actual command entries.
     */
    protected abstract getCommandPicks(token: CancellationToken): Promise<Array<ICommandQuickPick>>;
}
export declare class CommandsHistory extends Disposable {
    private readonly storageService;
    private readonly configurationService;
    static readonly DEFAULT_COMMANDS_HISTORY_LENGTH = 50;
    private static readonly PREF_KEY_CACHE;
    private static readonly PREF_KEY_COUNTER;
    private static cache;
    private static counter;
    private configuredCommandsHistoryLength;
    constructor(storageService: IStorageService, configurationService: IConfigurationService);
    private registerListeners;
    private updateConfiguration;
    private load;
    push(commandId: string): void;
    peek(commandId: string): number | undefined;
    static saveState(storageService: IStorageService): void;
    static getConfiguredCommandHistoryLength(configurationService: IConfigurationService): number;
    static clearHistory(configurationService: IConfigurationService, storageService: IStorageService): void;
}
