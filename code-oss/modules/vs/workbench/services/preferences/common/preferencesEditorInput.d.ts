import { URI } from 'vs/base/common/uri';
import { IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { Settings2EditorModel } from 'vs/workbench/services/preferences/common/preferencesModels';
export interface IKeybindingsEditorSearchOptions {
    searchValue: string;
    recordKeybindings: boolean;
    sortByPrecedence: boolean;
}
export declare class SettingsEditor2Input extends EditorInput {
    static readonly ID: string;
    private readonly _settingsModel;
    readonly resource: URI;
    constructor(_preferencesService: IPreferencesService);
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    get typeId(): string;
    getName(): string;
    resolve(): Promise<Settings2EditorModel>;
    dispose(): void;
}
