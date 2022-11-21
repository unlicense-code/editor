import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
export declare class UnusualLineTerminatorsDetector extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _dialogService;
    private readonly _codeEditorService;
    static readonly ID = "editor.contrib.unusualLineTerminatorsDetector";
    private _config;
    private _isPresentingDialog;
    constructor(_editor: ICodeEditor, _dialogService: IDialogService, _codeEditorService: ICodeEditorService);
    private _checkForUnusualLineTerminators;
}
