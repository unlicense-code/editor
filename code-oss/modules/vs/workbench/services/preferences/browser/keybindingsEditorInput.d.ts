import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { KeybindingsEditorModel } from 'vs/workbench/services/preferences/browser/keybindingsEditorModel';
export interface IKeybindingsEditorSearchOptions {
    searchValue: string;
    recordKeybindings: boolean;
    sortByPrecedence: boolean;
}
export declare class KeybindingsEditorInput extends EditorInput {
    static readonly ID: string;
    readonly keybindingsModel: KeybindingsEditorModel;
    searchOptions: IKeybindingsEditorSearchOptions | null;
    readonly resource: undefined;
    constructor(instantiationService: IInstantiationService);
    get typeId(): string;
    getName(): string;
    resolve(): Promise<KeybindingsEditorModel>;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
}
