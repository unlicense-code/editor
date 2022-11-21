import { EditorAction2 } from 'vs/editor/browser/editorExtensions';
import { Action2, IAction2Options } from 'vs/platform/actions/common/actions';
export declare abstract class SnippetsAction extends Action2 {
    constructor(desc: Readonly<IAction2Options>);
}
export declare abstract class SnippetEditorAction extends EditorAction2 {
    constructor(desc: Readonly<IAction2Options>);
}
