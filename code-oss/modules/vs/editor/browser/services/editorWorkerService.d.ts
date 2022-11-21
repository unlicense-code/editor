import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IWorkerClient } from 'vs/base/common/worker/simpleWorker';
import { DefaultWorkerFactory } from 'vs/base/browser/defaultWorkerFactory';
import { IRange } from 'vs/editor/common/core/range';
import * as languages from 'vs/editor/common/languages';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { EditorSimpleWorker } from 'vs/editor/common/services/editorSimpleWorker';
import { DiffAlgorithmName, IDiffComputationResult, IEditorWorkerService, IUnicodeHighlightsResult } from 'vs/editor/common/services/editorWorker';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { ILogService } from 'vs/platform/log/common/log';
import { UnicodeHighlighterOptions } from 'vs/editor/common/services/unicodeTextModelHighlighter';
import { IEditorWorkerHost } from 'vs/editor/common/services/editorWorkerHost';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IChange } from 'vs/editor/common/diff/smartLinesDiffComputer';
import { IDocumentDiff, IDocumentDiffProviderOptions } from 'vs/editor/common/diff/documentDiffProvider';
export declare class EditorWorkerService extends Disposable implements IEditorWorkerService {
    readonly _serviceBrand: undefined;
    private readonly _modelService;
    private readonly _workerManager;
    private readonly _logService;
    constructor(modelService: IModelService, configurationService: ITextResourceConfigurationService, logService: ILogService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    canComputeUnicodeHighlights(uri: URI): boolean;
    computedUnicodeHighlights(uri: URI, options: UnicodeHighlighterOptions, range?: IRange): Promise<IUnicodeHighlightsResult>;
    computeDiff(original: URI, modified: URI, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDocumentDiff | null>;
    canComputeDirtyDiff(original: URI, modified: URI): boolean;
    computeDirtyDiff(original: URI, modified: URI, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    computeMoreMinimalEdits(resource: URI, edits: languages.TextEdit[] | null | undefined): Promise<languages.TextEdit[] | undefined>;
    canNavigateValueSet(resource: URI): boolean;
    navigateValueSet(resource: URI, range: IRange, up: boolean): Promise<languages.IInplaceReplaceSupportResult | null>;
    canComputeWordRanges(resource: URI): boolean;
    computeWordRanges(resource: URI, range: IRange): Promise<{
        [word: string]: IRange[];
    } | null>;
}
export interface IEditorWorkerClient {
    fhr(method: string, args: any[]): Promise<any>;
}
export declare class EditorWorkerHost implements IEditorWorkerHost {
    private readonly _workerClient;
    constructor(workerClient: IEditorWorkerClient);
    fhr(method: string, args: any[]): Promise<any>;
}
export declare class EditorWorkerClient extends Disposable implements IEditorWorkerClient {
    private readonly languageConfigurationService;
    private readonly _modelService;
    private readonly _keepIdleModels;
    protected _worker: IWorkerClient<EditorSimpleWorker> | null;
    protected readonly _workerFactory: DefaultWorkerFactory;
    private _modelManager;
    private _disposed;
    constructor(modelService: IModelService, keepIdleModels: boolean, label: string | undefined, languageConfigurationService: ILanguageConfigurationService);
    fhr(method: string, args: any[]): Promise<any>;
    private _getOrCreateWorker;
    protected _getProxy(): Promise<EditorSimpleWorker>;
    private _getOrCreateModelManager;
    protected _withSyncedResources(resources: URI[], forceLargeModels?: boolean): Promise<EditorSimpleWorker>;
    computedUnicodeHighlights(uri: URI, options: UnicodeHighlighterOptions, range?: IRange): Promise<IUnicodeHighlightsResult>;
    computeDiff(original: URI, modified: URI, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDiffComputationResult | null>;
    computeDirtyDiff(original: URI, modified: URI, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    computeMoreMinimalEdits(resource: URI, edits: languages.TextEdit[]): Promise<languages.TextEdit[]>;
    computeLinks(resource: URI): Promise<languages.ILink[] | null>;
    textualSuggest(resources: URI[], leadingWord: string | undefined, wordDefRegExp: RegExp): Promise<{
        words: string[];
        duration: number;
    } | null>;
    computeWordRanges(resource: URI, range: IRange): Promise<{
        [word: string]: IRange[];
    } | null>;
    navigateValueSet(resource: URI, range: IRange, up: boolean): Promise<languages.IInplaceReplaceSupportResult | null>;
    dispose(): void;
}
