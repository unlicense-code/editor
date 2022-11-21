import 'vs/css!./accessibility';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class AccessibilityHelpController extends Disposable implements IEditorContribution {
    private readonly instantiationService;
    static readonly ID = "editor.contrib.accessibilityHelpController";
    static get(editor: ICodeEditor): AccessibilityHelpController | null;
    private _editor;
    private _widget?;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService);
    show(): void;
    hide(): void;
}
