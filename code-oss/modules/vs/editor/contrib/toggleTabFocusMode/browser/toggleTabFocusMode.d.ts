import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
export declare class ToggleTabFocusModeAction extends EditorAction {
    static readonly ID = "editor.action.toggleTabFocusMode";
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
