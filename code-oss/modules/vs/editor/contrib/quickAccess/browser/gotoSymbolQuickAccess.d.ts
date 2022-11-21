import { CancellationToken } from 'vs/base/common/cancellation';
import { IPreparedQuery } from 'vs/base/common/fuzzyScorer';
import { DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { IRange } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { DocumentSymbol, SymbolKind } from 'vs/editor/common/languages';
import { IOutlineModelService } from 'vs/editor/contrib/documentSymbols/browser/outlineModel';
import { AbstractEditorNavigationQuickAccessProvider, IEditorNavigationQuickAccessOptions, IQuickAccessTextEditorContext } from 'vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess';
import { IQuickPick, IQuickPickItem, IQuickPickSeparator } from 'vs/platform/quickinput/common/quickInput';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export interface IGotoSymbolQuickPickItem extends IQuickPickItem {
    kind: SymbolKind;
    index: number;
    score?: number;
    range?: {
        decoration: IRange;
        selection: IRange;
    };
}
export interface IGotoSymbolQuickAccessProviderOptions extends IEditorNavigationQuickAccessOptions {
    openSideBySideDirection?: () => undefined | 'right' | 'down';
}
export declare abstract class AbstractGotoSymbolQuickAccessProvider extends AbstractEditorNavigationQuickAccessProvider {
    private readonly _languageFeaturesService;
    private readonly _outlineModelService;
    static PREFIX: string;
    static SCOPE_PREFIX: string;
    static PREFIX_BY_CATEGORY: string;
    protected readonly options: IGotoSymbolQuickAccessProviderOptions;
    constructor(_languageFeaturesService: ILanguageFeaturesService, _outlineModelService: IOutlineModelService, options?: IGotoSymbolQuickAccessProviderOptions);
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoSymbolQuickPickItem>): IDisposable;
    protected provideWithTextEditor(context: IQuickAccessTextEditorContext, picker: IQuickPick<IGotoSymbolQuickPickItem>, token: CancellationToken): IDisposable;
    private doProvideWithoutEditorSymbols;
    private provideLabelPick;
    protected waitForLanguageSymbolRegistry(model: ITextModel, disposables: DisposableStore): Promise<boolean>;
    private doProvideWithEditorSymbols;
    protected doGetSymbolPicks(symbolsPromise: Promise<DocumentSymbol[]>, query: IPreparedQuery, options: {
        extraContainerLabel?: string;
    } | undefined, token: CancellationToken): Promise<Array<IGotoSymbolQuickPickItem | IQuickPickSeparator>>;
    private compareByScore;
    private compareByKindAndScore;
    protected getDocumentSymbols(document: ITextModel, token: CancellationToken): Promise<DocumentSymbol[]>;
}
