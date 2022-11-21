import { IPickerQuickAccessItem, PickerQuickAccessProvider } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { CancellationToken } from 'vs/base/common/cancellation';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IWorkspaceSymbol } from 'vs/workbench/contrib/search/common/search';
import { ILabelService } from 'vs/platform/label/common/label';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IQuickPickItemWithResource } from 'vs/platform/quickinput/common/quickInput';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
interface ISymbolQuickPickItem extends IPickerQuickAccessItem, IQuickPickItemWithResource {
    score?: number;
    symbol?: IWorkspaceSymbol;
}
export declare class SymbolsQuickAccessProvider extends PickerQuickAccessProvider<ISymbolQuickPickItem> {
    private readonly labelService;
    private readonly openerService;
    private readonly editorService;
    private readonly configurationService;
    private readonly codeEditorService;
    static PREFIX: string;
    private static readonly TYPING_SEARCH_DELAY;
    private static TREAT_AS_GLOBAL_SYMBOL_TYPES;
    private delayer;
    get defaultFilterValue(): string | undefined;
    constructor(labelService: ILabelService, openerService: IOpenerService, editorService: IEditorService, configurationService: IConfigurationService, codeEditorService: ICodeEditorService);
    private get configuration();
    protected _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken): Promise<Array<ISymbolQuickPickItem>>;
    getSymbolPicks(filter: string, options: {
        skipLocal?: boolean;
        skipSorting?: boolean;
        delay?: number;
    } | undefined, token: CancellationToken): Promise<Array<ISymbolQuickPickItem>>;
    private doGetSymbolPicks;
    private openSymbol;
    private compareSymbols;
}
export {};
