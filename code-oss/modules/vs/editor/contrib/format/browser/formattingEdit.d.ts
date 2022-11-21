import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { TextEdit } from 'vs/editor/common/languages';
export declare class FormattingEdit {
    private static _handleEolEdits;
    private static _isFullModelReplaceEdit;
    static execute(editor: ICodeEditor, _edits: TextEdit[], addUndoStops: boolean): void;
}
