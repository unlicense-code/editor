import 'vs/css!./iPadShowKeyboard';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
export declare class IPadShowKeyboard extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.iPadShowKeyboard";
    private readonly editor;
    private widget;
    constructor(editor: ICodeEditor);
    private update;
    dispose(): void;
}
