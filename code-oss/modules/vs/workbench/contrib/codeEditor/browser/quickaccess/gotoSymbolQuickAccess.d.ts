import { IKeyMods, IQuickPickSeparator, IQuickPick } from 'vs/platform/quickinput/common/quickInput';
import { IEditor } from 'vs/editor/common/editorCommon';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IRange } from 'vs/editor/common/core/range';
import { AbstractGotoSymbolQuickAccessProvider, IGotoSymbolQuickPickItem } from 'vs/editor/contrib/quickAccess/browser/gotoSymbolQuickAccess';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITextModel } from 'vs/editor/common/model';
import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IQuickAccessTextEditorContext } from 'vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess';
import { IOutlineService } from 'vs/workbench/services/outline/browser/outline';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IOutlineModelService } from 'vs/editor/contrib/documentSymbols/browser/outlineModel';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export declare class GotoSymbolQuickAccessProvider extends AbstractGotoSymbolQuickAccessProvider {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly configurationService;
    private readonly outlineService;
    protected readonly onDidActiveTextEditorControlChange: import("../../../../workbench.web.main").Event<void>;
    constructor(editorService: IEditorService, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService, languageFeaturesService: ILanguageFeaturesService, outlineService: IOutlineService, outlineModelService: IOutlineModelService);
    private get configuration();
    protected get activeTextEditorControl(): IEditor | undefined;
    protected gotoLocation(context: IQuickAccessTextEditorContext, options: {
        range: IRange;
        keyMods: IKeyMods;
        forceSideBySide?: boolean;
        preserveFocus?: boolean;
    }): void;
    private static readonly SYMBOL_PICKS_TIMEOUT;
    getSymbolPicks(model: ITextModel, filter: string, options: {
        extraContainerLabel?: string;
    }, disposables: DisposableStore, token: CancellationToken): Promise<Array<IGotoSymbolQuickPickItem | IQuickPickSeparator>>;
    addDecorations(editor: IEditor, range: IRange): void;
    clearDecorations(editor: IEditor): void;
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoSymbolQuickPickItem>): IDisposable;
    private canPickWithOutlineService;
    private doGetOutlinePicks;
}
