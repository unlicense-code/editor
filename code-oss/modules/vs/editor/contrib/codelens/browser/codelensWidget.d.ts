import 'vs/css!./codelensWidget';
import { IActiveCodeEditor, IViewZoneChangeAccessor } from 'vs/editor/browser/editorBrowser';
import { IModelDecorationsChangeAccessor, IModelDeltaDecoration, ITextModel } from 'vs/editor/common/model';
import { CodeLens, Command } from 'vs/editor/common/languages';
import { CodeLensItem } from 'vs/editor/contrib/codelens/browser/codelens';
export interface IDecorationIdCallback {
    (decorationId: string): void;
}
export declare class CodeLensHelper {
    private readonly _removeDecorations;
    private readonly _addDecorations;
    private readonly _addDecorationsCallbacks;
    constructor();
    addDecoration(decoration: IModelDeltaDecoration, callback: IDecorationIdCallback): void;
    removeDecoration(decorationId: string): void;
    commit(changeAccessor: IModelDecorationsChangeAccessor): void;
}
export declare class CodeLensWidget {
    private readonly _editor;
    private readonly _className;
    private readonly _viewZone;
    private readonly _viewZoneId;
    private _contentWidget?;
    private _decorationIds;
    private _data;
    private _isDisposed;
    constructor(data: CodeLensItem[], editor: IActiveCodeEditor, className: string, helper: CodeLensHelper, viewZoneChangeAccessor: IViewZoneChangeAccessor, heightInPx: number, updateCallback: () => void);
    private _createContentWidgetIfNecessary;
    dispose(helper: CodeLensHelper, viewZoneChangeAccessor?: IViewZoneChangeAccessor): void;
    isDisposed(): boolean;
    isValid(): boolean;
    updateCodeLensSymbols(data: CodeLensItem[], helper: CodeLensHelper): void;
    updateHeight(height: number, viewZoneChangeAccessor: IViewZoneChangeAccessor): void;
    computeIfNecessary(model: ITextModel): CodeLensItem[] | null;
    updateCommands(symbols: Array<CodeLens | undefined | null>): void;
    getCommand(link: HTMLLinkElement): Command | undefined;
    getLineNumber(): number;
    update(viewZoneChangeAccessor: IViewZoneChangeAccessor): void;
    getItems(): CodeLensItem[];
}
