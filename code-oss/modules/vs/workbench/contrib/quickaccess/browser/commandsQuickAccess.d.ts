import { ICommandQuickPick } from 'vs/platform/quickinput/browser/commandsQuickAccess';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IMenuService, Action2 } from 'vs/platform/actions/common/actions';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { CancellationToken } from 'vs/base/common/cancellation';
import { AbstractEditorCommandsQuickAccessProvider } from 'vs/editor/contrib/quickAccess/browser/commandsQuickAccess';
import { IEditor } from 'vs/editor/common/editorCommon';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { DefaultQuickAccessFilterValue } from 'vs/platform/quickinput/common/quickAccess';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
export declare class CommandsQuickAccessProvider extends AbstractEditorCommandsQuickAccessProvider {
    private readonly editorService;
    private readonly menuService;
    private readonly extensionService;
    private readonly configurationService;
    private readonly editorGroupService;
    private readonly preferencesService;
    private readonly extensionRegistrationRace;
    protected get activeTextEditorControl(): IEditor | undefined;
    get defaultFilterValue(): DefaultQuickAccessFilterValue | undefined;
    constructor(editorService: IEditorService, menuService: IMenuService, extensionService: IExtensionService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, dialogService: IDialogService, configurationService: IConfigurationService, editorGroupService: IEditorGroupsService, preferencesService: IPreferencesService);
    private get configuration();
    protected getCommandPicks(token: CancellationToken): Promise<Array<ICommandQuickPick>>;
    private getGlobalCommandPicks;
}
export declare class ShowAllCommandsAction extends Action2 {
    static readonly ID = "workbench.action.showCommands";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ClearCommandHistoryAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
