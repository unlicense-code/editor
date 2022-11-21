import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { CancellationTokenSource, CancellationToken } from 'vs/base/common/cancellation';
export declare class EditorKeybindingCancellationTokenSource extends CancellationTokenSource {
    readonly editor: ICodeEditor;
    private readonly _unregister;
    constructor(editor: ICodeEditor, parent?: CancellationToken);
    dispose(): void;
}
