import { URI } from 'vs/base/common/uri';
import { EditorInputCapabilities, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { ExtensionEditorTab, IExtension } from 'vs/workbench/contrib/extensions/common/extensions';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
export interface IExtensionEditorOptions extends IEditorOptions {
    showPreReleaseVersion?: boolean;
    tab?: ExtensionEditorTab;
    sideByside?: boolean;
}
export declare class ExtensionsInput extends EditorInput {
    private _extension;
    static readonly ID = "workbench.extensions.input2";
    get typeId(): string;
    get capabilities(): EditorInputCapabilities;
    get resource(): URI;
    constructor(_extension: IExtension);
    get extension(): IExtension;
    getName(): string;
    matches(other: EditorInput | IUntypedEditorInput): boolean;
}
