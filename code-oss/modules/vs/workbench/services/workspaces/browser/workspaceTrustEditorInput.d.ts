import { URI } from 'vs/base/common/uri';
import { EditorInputCapabilities, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
export declare class WorkspaceTrustEditorInput extends EditorInput {
    static readonly ID: string;
    get capabilities(): EditorInputCapabilities;
    get typeId(): string;
    readonly resource: URI;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    getName(): string;
}
