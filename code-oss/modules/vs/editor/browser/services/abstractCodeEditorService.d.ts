import { Emitter, Event } from 'vs/base/common/event';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ICodeEditor, IDiffEditor } from 'vs/editor/browser/editorBrowser';
import { ICodeEditorOpenHandler, ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IDecorationRenderOptions } from 'vs/editor/common/editorCommon';
import { IModelDecorationOptions, ITextModel } from 'vs/editor/common/model';
import { IResourceEditorInput } from 'vs/platform/editor/common/editor';
import { IThemeService } from 'vs/platform/theme/common/themeService';
export declare abstract class AbstractCodeEditorService extends Disposable implements ICodeEditorService {
    private readonly _themeService;
    readonly _serviceBrand: undefined;
    private readonly _onCodeEditorAdd;
    readonly onCodeEditorAdd: Event<ICodeEditor>;
    private readonly _onCodeEditorRemove;
    readonly onCodeEditorRemove: Event<ICodeEditor>;
    private readonly _onDiffEditorAdd;
    readonly onDiffEditorAdd: Event<IDiffEditor>;
    private readonly _onDiffEditorRemove;
    readonly onDiffEditorRemove: Event<IDiffEditor>;
    private readonly _onDidChangeTransientModelProperty;
    readonly onDidChangeTransientModelProperty: Event<ITextModel>;
    protected readonly _onDecorationTypeRegistered: Emitter<string>;
    onDecorationTypeRegistered: Event<string>;
    private readonly _codeEditors;
    private readonly _diffEditors;
    protected _globalStyleSheet: GlobalStyleSheet | null;
    private readonly _decorationOptionProviders;
    private readonly _editorStyleSheets;
    private readonly _codeEditorOpenHandlers;
    constructor(_themeService: IThemeService);
    addCodeEditor(editor: ICodeEditor): void;
    removeCodeEditor(editor: ICodeEditor): void;
    listCodeEditors(): ICodeEditor[];
    addDiffEditor(editor: IDiffEditor): void;
    removeDiffEditor(editor: IDiffEditor): void;
    listDiffEditors(): IDiffEditor[];
    getFocusedCodeEditor(): ICodeEditor | null;
    private _getOrCreateGlobalStyleSheet;
    protected _createGlobalStyleSheet(): GlobalStyleSheet;
    private _getOrCreateStyleSheet;
    _removeEditorStyleSheets(editorId: string): void;
    registerDecorationType(description: string, key: string, options: IDecorationRenderOptions, parentTypeKey?: string, editor?: ICodeEditor): void;
    listDecorationTypes(): string[];
    removeDecorationType(key: string): void;
    resolveDecorationOptions(decorationTypeKey: string, writable: boolean): IModelDecorationOptions;
    resolveDecorationCSSRules(decorationTypeKey: string): CSSRuleList | null;
    private readonly _transientWatchers;
    private readonly _modelProperties;
    setModelProperty(resource: URI, key: string, value: any): void;
    getModelProperty(resource: URI, key: string): any;
    setTransientModelProperty(model: ITextModel, key: string, value: any): void;
    getTransientModelProperty(model: ITextModel, key: string): any;
    getTransientModelProperties(model: ITextModel): [string, any][] | undefined;
    _removeWatcher(w: ModelTransientSettingWatcher): void;
    abstract getActiveCodeEditor(): ICodeEditor | null;
    openCodeEditor(input: IResourceEditorInput, source: ICodeEditor | null, sideBySide?: boolean): Promise<ICodeEditor | null>;
    registerCodeEditorOpenHandler(handler: ICodeEditorOpenHandler): IDisposable;
}
export declare class ModelTransientSettingWatcher {
    readonly uri: string;
    private readonly _values;
    constructor(uri: string, model: ITextModel, owner: AbstractCodeEditorService);
    set(key: string, value: any): void;
    get(key: string): any;
    keys(): string[];
}
export declare class GlobalStyleSheet {
    private readonly _styleSheet;
    get sheet(): CSSStyleSheet;
    constructor(styleSheet: HTMLStyleElement);
    ref(): void;
    unref(): void;
    insertRule(rule: string, index?: number): void;
    removeRulesContainingSelector(ruleName: string): void;
}
export declare const _CSS_MAP: {
    [prop: string]: string;
};
