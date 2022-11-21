import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
export declare class ColorContribution extends Disposable implements IEditorContribution {
    private readonly _editor;
    static readonly ID: string;
    static readonly RECOMPUTE_TIME = 1000;
    constructor(_editor: ICodeEditor);
    dispose(): void;
    private onMouseDown;
}
