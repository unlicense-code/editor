import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import * as languages from 'vs/editor/common/languages';
import { ITextModel } from 'vs/editor/common/model';
import { ILanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { InlayHintItem } from 'vs/editor/contrib/inlayHints/browser/inlayHints';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
declare class InlayHintsCache {
    readonly _serviceBrand: undefined;
    private readonly _entries;
    get(model: ITextModel): InlayHintItem[] | undefined;
    set(model: ITextModel, value: InlayHintItem[]): void;
    private static _key;
}
interface IInlayHintsCache extends InlayHintsCache {
}
declare const IInlayHintsCache: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IInlayHintsCache>;
export declare class RenderedInlayHintLabelPart {
    readonly item: InlayHintItem;
    readonly index: number;
    constructor(item: InlayHintItem, index: number);
    get part(): languages.InlayHintLabelPart;
}
export declare class InlayHintsController implements IEditorContribution {
    private readonly _editor;
    private readonly _languageFeaturesService;
    private readonly _inlayHintsCache;
    private readonly _commandService;
    private readonly _notificationService;
    private readonly _instaService;
    static readonly ID: string;
    private static readonly _MAX_DECORATORS;
    static get(editor: ICodeEditor): InlayHintsController | undefined;
    private readonly _disposables;
    private readonly _sessionDisposables;
    private readonly _debounceInfo;
    private readonly _decorationsMetadata;
    private readonly _ruleFactory;
    private _activeRenderMode;
    private _activeInlayHintPart?;
    constructor(_editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService, _featureDebounce: ILanguageFeatureDebounceService, _inlayHintsCache: IInlayHintsCache, _commandService: ICommandService, _notificationService: INotificationService, _instaService: IInstantiationService);
    dispose(): void;
    private _update;
    private _installLinkGesture;
    private _getInlineHintsForRange;
    private _installDblClickGesture;
    private _installContextMenu;
    private _getInlayHintLabelPart;
    private _invokeCommand;
    private _cacheHintsForFastRestore;
    private _copyInlayHintsWithCurrentAnchor;
    private _getHintsRanges;
    private _updateHintsDecorators;
    private _fillInColors;
    private _getLayoutInfo;
    private _removeAllDecorations;
    getInlayHintsForLine(line: number): InlayHintItem[];
}
export {};
