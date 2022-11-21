import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { OneReference } from 'vs/editor/contrib/gotoSymbol/browser/referencesModel';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export declare const ctxHasSymbols: RawContextKey<false>;
export declare const ISymbolNavigationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISymbolNavigationService>;
export interface ISymbolNavigationService {
    readonly _serviceBrand: undefined;
    reset(): void;
    put(anchor: OneReference): void;
    revealNext(source: ICodeEditor): Promise<any>;
}
