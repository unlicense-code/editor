import 'vs/base/browser/ui/codicons/codiconStyles';
import 'vs/editor/contrib/symbolIcons/browser/symbolIcons';
import { AbstractGotoSymbolQuickAccessProvider } from 'vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { Event } from 'vs/base/common/event';
import { EditorAction } from 'vs/editor/browser/editorExtensions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IOutlineModelService } from 'vs/editor/contrib/documentSymbols/browser/outlineModel';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export declare class StandaloneGotoSymbolQuickAccessProvider extends AbstractGotoSymbolQuickAccessProvider {
    private readonly editorService;
    protected readonly onDidActiveTextEditorControlChange: Event<any>;
    constructor(editorService: ICodeEditorService, languageFeaturesService: ILanguageFeaturesService, outlineModelService: IOutlineModelService);
    protected get activeTextEditorControl(): import("../../../browser/editorBrowser").ICodeEditor | undefined;
}
export declare class GotoSymbolAction extends EditorAction {
    static readonly ID = "editor.action.quickOutline";
    constructor();
    run(accessor: ServicesAccessor): void;
}
