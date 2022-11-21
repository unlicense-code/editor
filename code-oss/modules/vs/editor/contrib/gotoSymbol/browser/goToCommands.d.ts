import { CancellationToken } from 'vs/base/common/cancellation';
import { IActiveCodeEditor, ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction2, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { GoToLocationValues } from 'vs/editor/common/config/editorOptions';
import * as corePosition from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { ReferencesModel } from 'vs/editor/contrib/gotoSymbol/browser/referencesModel';
import { IAction2F1RequiredOptions, IAction2Options } from 'vs/platform/actions/common/actions';
import { IWordAtPosition } from 'vs/editor/common/core/wordHelper';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export interface SymbolNavigationActionConfig {
    openToSide: boolean;
    openInPeek: boolean;
    muteMessage: boolean;
}
export declare class SymbolNavigationAnchor {
    readonly model: ITextModel;
    readonly position: corePosition.Position;
    static is(thing: any): thing is SymbolNavigationAnchor;
    constructor(model: ITextModel, position: corePosition.Position);
}
export declare abstract class SymbolNavigationAction extends EditorAction2 {
    private static _allSymbolNavigationCommands;
    private static _activeAlternativeCommands;
    static all(): IterableIterator<SymbolNavigationAction>;
    private static _patchConfig;
    readonly configuration: SymbolNavigationActionConfig;
    constructor(configuration: SymbolNavigationActionConfig, opts: IAction2Options & IAction2F1RequiredOptions);
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, arg?: SymbolNavigationAnchor | unknown, range?: Range): Promise<void>;
    protected abstract _getLocationModel(languageFeaturesService: ILanguageFeaturesService, model: ITextModel, position: corePosition.Position, token: CancellationToken): Promise<ReferencesModel | undefined>;
    protected abstract _getNoResultFoundMessage(info: IWordAtPosition | null): string;
    protected abstract _getAlternativeCommand(editor: IActiveCodeEditor): string;
    protected abstract _getGoToPreference(editor: IActiveCodeEditor): GoToLocationValues;
    private _onResult;
    private _openReference;
    private _openInPeek;
}
export declare class DefinitionAction extends SymbolNavigationAction {
    protected _getLocationModel(languageFeaturesService: ILanguageFeaturesService, model: ITextModel, position: corePosition.Position, token: CancellationToken): Promise<ReferencesModel>;
    protected _getNoResultFoundMessage(info: IWordAtPosition | null): string;
    protected _getAlternativeCommand(editor: IActiveCodeEditor): string;
    protected _getGoToPreference(editor: IActiveCodeEditor): GoToLocationValues;
}
