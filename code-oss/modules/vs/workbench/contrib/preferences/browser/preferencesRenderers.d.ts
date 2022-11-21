import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IPreferencesService, ISetting } from 'vs/workbench/services/preferences/common/preferences';
import { SettingsEditorModel } from 'vs/workbench/services/preferences/common/preferencesModels';
export interface IPreferencesRenderer extends IDisposable {
    render(): void;
    updatePreference(key: string, value: any, source: ISetting): void;
    focusPreference(setting: ISetting): void;
    clearFocus(setting: ISetting): void;
    editPreference(setting: ISetting): boolean;
}
export declare class UserSettingsRenderer extends Disposable implements IPreferencesRenderer {
    protected editor: ICodeEditor;
    readonly preferencesModel: SettingsEditorModel;
    protected preferencesService: IPreferencesService;
    private readonly configurationService;
    protected instantiationService: IInstantiationService;
    private settingHighlighter;
    private editSettingActionRenderer;
    private modelChangeDelayer;
    private associatedPreferencesModel;
    private unsupportedSettingsRenderer;
    constructor(editor: ICodeEditor, preferencesModel: SettingsEditorModel, preferencesService: IPreferencesService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    render(): void;
    updatePreference(key: string, value: any, source: IIndexedSetting): void;
    private onModelChanged;
    private onSettingUpdated;
    private getSetting;
    focusPreference(setting: ISetting): void;
    clearFocus(setting: ISetting): void;
    editPreference(setting: ISetting): boolean;
}
export declare class WorkspaceSettingsRenderer extends UserSettingsRenderer implements IPreferencesRenderer {
    private workspaceConfigurationRenderer;
    constructor(editor: ICodeEditor, preferencesModel: SettingsEditorModel, preferencesService: IPreferencesService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    render(): void;
}
export interface IIndexedSetting extends ISetting {
    index: number;
    groupId: string;
}
