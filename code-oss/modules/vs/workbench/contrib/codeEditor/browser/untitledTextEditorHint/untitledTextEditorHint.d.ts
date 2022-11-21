import 'vs/css!./untitledTextEditorHint';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
export declare class UntitledTextEditorHintContribution implements IEditorContribution {
    private editor;
    private readonly editorGroupsService;
    private readonly commandService;
    private readonly configurationService;
    private readonly keybindingService;
    static readonly ID = "editor.contrib.untitledTextEditorHint";
    private toDispose;
    private untitledTextHintContentWidget;
    constructor(editor: ICodeEditor, editorGroupsService: IEditorGroupsService, commandService: ICommandService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    private update;
    dispose(): void;
}
