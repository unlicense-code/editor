import { IQuickPickSeparator } from 'vs/platform/quickinput/common/quickInput';
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class TerminalQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly _editorService;
    private readonly _terminalService;
    private readonly _terminalEditorService;
    private readonly _terminalGroupService;
    private readonly _commandService;
    private readonly _themeService;
    private readonly _instantiationService;
    static PREFIX: string;
    constructor(_editorService: IEditorService, _terminalService: ITerminalService, _terminalEditorService: ITerminalEditorService, _terminalGroupService: ITerminalGroupService, _commandService: ICommandService, _themeService: IThemeService, _instantiationService: IInstantiationService);
    protected _getPicks(filter: string): Array<IPickerQuickAccessItem | IQuickPickSeparator>;
    private _createPick;
}
