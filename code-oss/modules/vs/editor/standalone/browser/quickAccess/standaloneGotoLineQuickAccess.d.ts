import { AbstractGotoLineQuickAccessProvider } from 'vs/editor/contrib/quickAccess/browser/gotoLineQuickAccess';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { Event } from 'vs/base/common/event';
import { EditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
export declare class StandaloneGotoLineQuickAccessProvider extends AbstractGotoLineQuickAccessProvider {
    private readonly editorService;
    protected readonly onDidActiveTextEditorControlChange: Event<any>;
    constructor(editorService: ICodeEditorService);
    protected get activeTextEditorControl(): import("../../../browser/editorBrowser").ICodeEditor | undefined;
}
export declare class GotoLineAction extends EditorAction {
    static readonly ID = "editor.action.gotoLine";
    constructor();
    run(accessor: ServicesAccessor): void;
}
