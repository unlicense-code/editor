import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IRequestHandler } from 'vs/base/common/worker/simpleWorker';
import { IPosition } from 'vs/editor/common/core/position';
import { IRange, Range } from 'vs/editor/common/core/range';
import { IMirrorTextModel, IModelChangedEvent } from 'vs/editor/common/model/mirrorTextModel';
import { IWordAtPosition } from 'vs/editor/common/core/wordHelper';
import { IInplaceReplaceSupportResult, ILink, TextEdit } from 'vs/editor/common/languages';
import { ILinkComputerTarget } from 'vs/editor/common/languages/linkComputer';
import { DiffAlgorithmName, IDiffComputationResult, IUnicodeHighlightsResult } from 'vs/editor/common/services/editorWorker';
import { IEditorWorkerHost } from 'vs/editor/common/services/editorWorkerHost';
import { UnicodeHighlighterOptions } from 'vs/editor/common/services/unicodeTextModelHighlighter';
import { IChange } from 'vs/editor/common/diff/smartLinesDiffComputer';
import { IDocumentDiffProviderOptions } from 'vs/editor/common/diff/documentDiffProvider';
export interface IMirrorModel extends IMirrorTextModel {
    readonly uri: URI;
    readonly version: number;
    getValue(): string;
}
export interface IWorkerContext<H = undefined> {
    /**
     * A proxy to the main thread host object.
     */
    host: H;
    /**
     * Get all available mirror models in this worker.
     */
    getMirrorModels(): IMirrorModel[];
}
/**
 * @internal
 */
export interface IRawModelData {
    url: string;
    versionId: number;
    lines: string[];
    EOL: string;
}
/**
 * @internal
 */
export interface ICommonModel extends ILinkComputerTarget, IMirrorModel {
    uri: URI;
    version: number;
    eol: string;
    getValue(): string;
    getLinesContent(): string[];
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineWords(lineNumber: number, wordDefinition: RegExp): IWordAtPosition[];
    words(wordDefinition: RegExp): Iterable<string>;
    getWordUntilPosition(position: IPosition, wordDefinition: RegExp): IWordAtPosition;
    getValueInRange(range: IRange): string;
    getWordAtPosition(position: IPosition, wordDefinition: RegExp): Range | null;
    offsetAt(position: IPosition): number;
    positionAt(offset: number): IPosition;
}
/**
 * @internal
 */
export interface IForeignModuleFactory {
    (ctx: IWorkerContext, createData: any): any;
}
/**
 * @internal
 */
export declare class EditorSimpleWorker implements IRequestHandler, IDisposable {
    _requestHandlerBrand: any;
    protected readonly _host: IEditorWorkerHost;
    private _models;
    private readonly _foreignModuleFactory;
    private _foreignModule;
    constructor(host: IEditorWorkerHost, foreignModuleFactory: IForeignModuleFactory | null);
    dispose(): void;
    protected _getModel(uri: string): ICommonModel;
    private _getModels;
    acceptNewModel(data: IRawModelData): void;
    acceptModelChanged(strURL: string, e: IModelChangedEvent): void;
    acceptRemovedModel(strURL: string): void;
    computeUnicodeHighlights(url: string, options: UnicodeHighlighterOptions, range?: IRange): Promise<IUnicodeHighlightsResult>;
    computeDiff(originalUrl: string, modifiedUrl: string, options: IDocumentDiffProviderOptions, algorithm: DiffAlgorithmName): Promise<IDiffComputationResult | null>;
    private static computeDiff;
    private static _modelsAreIdentical;
    computeDirtyDiff(originalUrl: string, modifiedUrl: string, ignoreTrimWhitespace: boolean): Promise<IChange[] | null>;
    private static readonly _diffLimit;
    computeMoreMinimalEdits(modelUrl: string, edits: TextEdit[]): Promise<TextEdit[]>;
    computeLinks(modelUrl: string): Promise<ILink[] | null>;
    private static readonly _suggestionsLimit;
    textualSuggest(modelUrls: string[], leadingWord: string | undefined, wordDef: string, wordDefFlags: string): Promise<{
        words: string[];
        duration: number;
    } | null>;
    computeWordRanges(modelUrl: string, range: IRange, wordDef: string, wordDefFlags: string): Promise<{
        [word: string]: IRange[];
    }>;
    navigateValueSet(modelUrl: string, range: IRange, up: boolean, wordDef: string, wordDefFlags: string): Promise<IInplaceReplaceSupportResult | null>;
    loadForeignModule(moduleId: string, createData: any, foreignHostMethods: string[]): Promise<string[]>;
    fmr(method: string, args: any[]): Promise<any>;
}
/**
 * Called on the worker side
 * @internal
 */
export declare function create(host: IEditorWorkerHost): IRequestHandler;
