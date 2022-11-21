import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
export declare class SettingsEditorContribution extends Disposable {
    private readonly editor;
    private readonly instantiationService;
    private readonly preferencesService;
    private readonly workspaceContextService;
    static readonly ID: string;
    private currentRenderer;
    private readonly disposables;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, preferencesService: IPreferencesService, workspaceContextService: IWorkspaceContextService);
    private _createPreferencesRenderer;
}
