import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
/**
 * Prevents the top-level menu from showing up when doing Alt + Click in the editor
 */
export declare class MenuPreventer extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.menuPreventer";
    private _editor;
    private _altListeningMouse;
    private _altMouseTriggered;
    constructor(editor: ICodeEditor);
}
