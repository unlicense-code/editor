import { Event } from 'vs/base/common/event';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IRange, Range } from 'vs/editor/common/core/range';
import { ISelection, Selection } from 'vs/editor/common/core/selection';
import { IDecorationOptions } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
import { IModelService } from 'vs/editor/common/services/model';
import { IApplyEditsOptions, IEditorPropertiesChangeData, IResolvedTextEditorConfiguration, ITextEditorConfigurationUpdate, IUndoStopOptions, TextEditorRevealType } from 'vs/workbench/api/common/extHost.protocol';
import { IEditorPane } from 'vs/workbench/common/editor';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { MainThreadDocuments } from 'vs/workbench/api/browser/mainThreadDocuments';
export interface IFocusTracker {
    onGainedFocus(): void;
    onLostFocus(): void;
}
export declare class MainThreadTextEditorProperties {
    readonly selections: Selection[];
    readonly options: IResolvedTextEditorConfiguration;
    readonly visibleRanges: Range[];
    static readFromEditor(previousProperties: MainThreadTextEditorProperties | null, model: ITextModel, codeEditor: ICodeEditor | null): MainThreadTextEditorProperties;
    private static _readSelectionsFromCodeEditor;
    private static _readOptionsFromCodeEditor;
    private static _readVisibleRangesFromCodeEditor;
    constructor(selections: Selection[], options: IResolvedTextEditorConfiguration, visibleRanges: Range[]);
    generateDelta(oldProps: MainThreadTextEditorProperties | null, selectionChangeSource: string | null): IEditorPropertiesChangeData | null;
    private static _selectionsEqual;
    private static _rangesEqual;
    private static _optionsEqual;
}
/**
 * Text Editor that is permanently bound to the same model.
 * It can be bound or not to a CodeEditor.
 */
export declare class MainThreadTextEditor {
    private readonly _id;
    private readonly _model;
    private readonly _mainThreadDocuments;
    private readonly _modelService;
    private readonly _clipboardService;
    private readonly _modelListeners;
    private _codeEditor;
    private readonly _focusTracker;
    private readonly _codeEditorListeners;
    private _properties;
    private readonly _onPropertiesChanged;
    constructor(id: string, model: ITextModel, codeEditor: ICodeEditor, focusTracker: IFocusTracker, mainThreadDocuments: MainThreadDocuments, modelService: IModelService, clipboardService: IClipboardService);
    dispose(): void;
    private _updatePropertiesNow;
    private _setProperties;
    getId(): string;
    getModel(): ITextModel;
    getCodeEditor(): ICodeEditor | null;
    hasCodeEditor(codeEditor: ICodeEditor | null): boolean;
    setCodeEditor(codeEditor: ICodeEditor | null): void;
    isVisible(): boolean;
    getProperties(): MainThreadTextEditorProperties;
    get onPropertiesChanged(): Event<IEditorPropertiesChangeData>;
    setSelections(selections: ISelection[]): void;
    private _setIndentConfiguration;
    setConfiguration(newConfiguration: ITextEditorConfigurationUpdate): void;
    setDecorations(key: string, ranges: IDecorationOptions[]): void;
    setDecorationsFast(key: string, _ranges: number[]): void;
    revealRange(range: IRange, revealType: TextEditorRevealType): void;
    isFocused(): boolean;
    matches(editor: IEditorPane): boolean;
    applyEdits(versionIdCheck: number, edits: ISingleEditOperation[], opts: IApplyEditsOptions): boolean;
    insertSnippet(modelVersionId: number, template: string, ranges: readonly IRange[], opts: IUndoStopOptions): Promise<boolean>;
}
