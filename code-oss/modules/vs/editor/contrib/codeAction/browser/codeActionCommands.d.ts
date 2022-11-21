import { IAnchor } from 'vs/base/browser/ui/contextview/contextview';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, EditorCommand, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { IPosition } from 'vs/editor/common/core/position';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { IEditorProgressService } from 'vs/platform/progress/common/progress';
import { CodeActionAutoApply, CodeActionFilter, CodeActionSet, CodeActionTrigger, CodeActionTriggerSource } from '../common/types';
export declare class CodeActionController extends Disposable implements IEditorContribution {
    private readonly _instantiationService;
    static readonly ID = "editor.contrib.codeActionController";
    static get(editor: ICodeEditor): CodeActionController | null;
    private readonly _editor;
    private readonly _model;
    private readonly _ui;
    constructor(editor: ICodeEditor, markerService: IMarkerService, contextKeyService: IContextKeyService, progressService: IEditorProgressService, _instantiationService: IInstantiationService, languageFeaturesService: ILanguageFeaturesService);
    private update;
    showCodeActions(trigger: CodeActionTrigger, actions: CodeActionSet, at: IAnchor | IPosition): Promise<void>;
    manualTriggerAtCurrentPosition(notAvailableMessage: string, triggerAction: CodeActionTriggerSource, filter?: CodeActionFilter, autoApply?: CodeActionAutoApply, preview?: boolean): void;
    private _trigger;
    private _applyCodeAction;
}
export declare class QuickFixAction extends EditorAction {
    static readonly Id = "editor.action.quickFix";
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class CodeActionCommand extends EditorCommand {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs: any): void;
}
export declare class RefactorAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs: any): void;
}
export declare class RefactorPreview extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs: any): void;
}
export declare class SourceAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs: any): void;
}
export declare class OrganizeImportsAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class FixAllAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class AutoFixAction extends EditorAction {
    static readonly Id = "editor.action.autoFix";
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
