import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
export declare class ReadOnlyMessageController extends Disposable implements IEditorContribution {
    private readonly editor;
    static readonly ID = "editor.contrib.readOnlyMessageController";
    constructor(editor: ICodeEditor);
    private _onDidAttemptReadOnlyEdit;
}
