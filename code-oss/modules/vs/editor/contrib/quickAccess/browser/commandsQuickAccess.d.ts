import { IEditor } from 'vs/editor/common/editorCommon';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { AbstractCommandsQuickAccessProvider, ICommandQuickPick, ICommandsQuickAccessOptions } from 'vs/platform/quickinput/browser/commandsQuickAccess';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare abstract class AbstractEditorCommandsQuickAccessProvider extends AbstractCommandsQuickAccessProvider {
    constructor(options: ICommandsQuickAccessOptions, instantiationService: IInstantiationService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService);
    /**
     * Subclasses to provide the current active editor control.
     */
    protected abstract activeTextEditorControl: IEditor | undefined;
    protected getCodeEditorCommandPicks(): ICommandQuickPick[];
}
