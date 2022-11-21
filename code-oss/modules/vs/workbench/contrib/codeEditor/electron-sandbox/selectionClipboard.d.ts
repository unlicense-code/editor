import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
export declare class SelectionClipboard extends Disposable implements IEditorContribution {
    private static readonly SELECTION_LENGTH_LIMIT;
    constructor(editor: ICodeEditor, clipboardService: IClipboardService);
    dispose(): void;
}
