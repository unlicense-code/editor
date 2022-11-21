import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import 'vs/css!./folding';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IPosition } from 'vs/editor/common/core/position';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ITextModel } from 'vs/editor/common/model';
import { FoldingRangeProvider } from 'vs/editor/common/languages';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { CollapseMemento, FoldingModel } from 'vs/editor/contrib/folding/browser/foldingModel';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { FoldingRegions } from './foldingRanges';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ILanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { Event } from 'vs/base/common/event';
export interface RangeProvider {
    readonly id: string;
    compute(cancelationToken: CancellationToken): Promise<FoldingRegions | null>;
    dispose(): void;
}
interface FoldingStateMemento {
    collapsedRegions?: CollapseMemento;
    lineCount?: number;
    provider?: string;
    foldedImports?: boolean;
}
export interface FoldingLimitReporter {
    readonly limit: number;
    report(limitInfo: FoldingLimitInfo): void;
}
export interface FoldingLimitInfo {
    computed: number;
    limited: number | false;
}
export declare type FoldingRangeProviderSelector = (formatter: FoldingRangeProvider[], document: ITextModel) => FoldingRangeProvider[] | undefined;
export declare class FoldingController extends Disposable implements IEditorContribution {
    private readonly contextKeyService;
    private readonly languageConfigurationService;
    private readonly languageFeaturesService;
    static readonly ID = "editor.contrib.folding";
    static get(editor: ICodeEditor): FoldingController | null;
    private static _foldingRangeSelector;
    static setFoldingRangeProviderSelector(foldingRangeSelector: FoldingRangeProviderSelector): IDisposable;
    private readonly editor;
    private _isEnabled;
    private _useFoldingProviders;
    private _unfoldOnClickAfterEndOfLine;
    private _restoringViewState;
    private _foldingImportsByDefault;
    private _currentModelHasFoldedImports;
    private _foldingLimitReporter;
    private readonly foldingDecorationProvider;
    private foldingModel;
    private hiddenRangeModel;
    private rangeProvider;
    private foldingRegionPromise;
    private foldingModelPromise;
    private updateScheduler;
    private readonly updateDebounceInfo;
    private foldingEnabled;
    private cursorChangedScheduler;
    private readonly localToDispose;
    private mouseDownInfo;
    private _onDidChangeFoldingLimit;
    readonly onDidChangeFoldingLimit: Event<FoldingLimitInfo>;
    private _foldingLimitInfo;
    get foldingLimitInfo(): FoldingLimitInfo | undefined;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, languageConfigurationService: ILanguageConfigurationService, notificationService: INotificationService, languageFeatureDebounceService: ILanguageFeatureDebounceService, languageFeaturesService: ILanguageFeaturesService);
    /**
     * Store view state.
     */
    saveViewState(): FoldingStateMemento | undefined;
    /**
     * Restore view state.
     */
    restoreViewState(state: FoldingStateMemento): void;
    private onModelChanged;
    private onFoldingStrategyChanged;
    private getRangeProvider;
    getFoldingModel(): Promise<FoldingModel | null> | null;
    private onDidChangeModelContent;
    triggerFoldingModelChanged(): void;
    private onHiddenRangesChanges;
    private onCursorPositionChanged;
    private revealCursor;
    private onEditorMouseDown;
    private onEditorMouseUp;
    reveal(position: IPosition): void;
}
export declare const foldBackgroundBackground: string;
export declare const editorFoldForeground: string;
export {};
