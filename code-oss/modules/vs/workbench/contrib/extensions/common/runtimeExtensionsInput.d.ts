import { URI } from 'vs/base/common/uri';
import { EditorInputCapabilities, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
export declare class RuntimeExtensionsInput extends EditorInput {
    static readonly ID = "workbench.runtimeExtensions.input";
    get typeId(): string;
    get capabilities(): EditorInputCapabilities;
    static _instance: RuntimeExtensionsInput;
    static get instance(): RuntimeExtensionsInput;
    readonly resource: URI;
    getName(): string;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
}
