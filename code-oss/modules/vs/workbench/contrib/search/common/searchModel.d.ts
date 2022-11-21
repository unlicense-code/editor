import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { URI } from 'vs/base/common/uri';
import { Range } from 'vs/editor/common/core/range';
import { ITextModel } from 'vs/editor/common/model';
import { IModelService } from 'vs/editor/common/services/model';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService, IFileStatWithPartialMetadata } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { IProgress, IProgressStep } from 'vs/platform/progress/common/progress';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IReplaceService } from 'vs/workbench/contrib/search/common/replace';
import { ReplacePattern } from 'vs/workbench/services/search/common/replace';
import { IFileMatch, IPatternInfo, ISearchComplete, ISearchProgressItem, ISearchRange, ISearchService, ITextQuery, ITextSearchPreviewOptions, ITextSearchResult, SearchSortOrder } from 'vs/workbench/services/search/common/search';
export declare class Match {
    private _parent;
    private _fullPreviewLines;
    private static readonly MAX_PREVIEW_CHARS;
    private _id;
    private _range;
    private _oneLinePreviewText;
    private _rangeInPreviewText;
    private _fullPreviewRange;
    constructor(_parent: FileMatch, _fullPreviewLines: string[], _fullPreviewRange: ISearchRange, _documentRange: ISearchRange);
    id(): string;
    parent(): FileMatch;
    text(): string;
    range(): Range;
    preview(): {
        before: string;
        inside: string;
        after: string;
    };
    get replaceString(): string;
    fullMatchText(includeSurrounding?: boolean): string;
    rangeInPreview(): {
        startColumn: number;
        endColumn: number;
        startLineNumber: number;
        endLineNumber: number;
    };
    fullPreviewLines(): string[];
    getMatchString(): string;
}
export declare class FileMatch extends Disposable implements IFileMatch {
    private _query;
    private _previewOptions;
    private _maxResults;
    private _parent;
    private rawMatch;
    private _closestRoot;
    private readonly modelService;
    private readonly replaceService;
    readonly labelService: ILabelService;
    private static readonly _CURRENT_FIND_MATCH;
    private static readonly _FIND_MATCH;
    private static getDecorationOption;
    private _onChange;
    readonly onChange: Event<{
        didRemove?: boolean;
        forceUpdateModel?: boolean;
    }>;
    private _onDispose;
    readonly onDispose: Event<void>;
    private _resource;
    private _fileStat?;
    private _model;
    private _modelListener;
    private _matches;
    private _removedMatches;
    private _selectedMatch;
    private _name;
    private _updateScheduler;
    private _modelDecorations;
    private _context;
    get context(): Map<number, string>;
    constructor(_query: IPatternInfo, _previewOptions: ITextSearchPreviewOptions | undefined, _maxResults: number | undefined, _parent: FolderMatch, rawMatch: IFileMatch, _closestRoot: FolderMatchWorkspaceRoot | null, modelService: IModelService, replaceService: IReplaceService, labelService: ILabelService);
    get closestRoot(): FolderMatchWorkspaceRoot | null;
    private createMatches;
    bindModel(model: ITextModel): void;
    private onModelWillDispose;
    private unbindModel;
    private updateMatchesForModel;
    private updatesMatchesForLineAfterReplace;
    private updateMatches;
    updateHighlights(): void;
    id(): string;
    parent(): FolderMatch;
    matches(): Match[];
    remove(matches: Match | Match[]): void;
    private replaceQ;
    replace(toReplace: Match): Promise<void>;
    setSelectedMatch(match: Match | null): void;
    getSelectedMatch(): Match | null;
    isMatchSelected(match: Match): boolean;
    count(): number;
    get resource(): URI;
    name(): string;
    addContext(results: ITextSearchResult[] | undefined): void;
    add(match: Match, trigger?: boolean): void;
    private removeMatch;
    resolveFileStat(fileService: IFileService): Promise<void>;
    get fileStat(): IFileStatWithPartialMetadata | undefined;
    set fileStat(stat: IFileStatWithPartialMetadata | undefined);
    dispose(): void;
}
export interface IChangeEvent {
    elements: FileMatch[];
    added?: boolean;
    removed?: boolean;
    clearingAll?: boolean;
}
export declare class FolderMatch extends Disposable {
    protected _resource: URI | null;
    private _id;
    protected _index: number;
    protected _query: ITextQuery;
    private _parent;
    private _searchModel;
    private _closestRoot;
    private readonly replaceService;
    protected readonly instantiationService: IInstantiationService;
    readonly labelService: ILabelService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected _onChange: Emitter<IChangeEvent>;
    readonly onChange: Event<IChangeEvent>;
    private _onDispose;
    readonly onDispose: Event<void>;
    protected _fileMatches: ResourceMap<FileMatch>;
    protected _folderMatches: ResourceMap<FolderMatchWithResource>;
    protected _folderMatchesMap: TernarySearchTree<URI, FolderMatchWithResource>;
    protected _unDisposedFileMatches: ResourceMap<FileMatch>;
    protected _unDisposedFolderMatches: ResourceMap<FolderMatchWithResource>;
    private _replacingAll;
    private _name;
    compressionStartParent: FolderMatch | undefined;
    constructor(_resource: URI | null, _id: string, _index: number, _query: ITextQuery, _parent: SearchResult | FolderMatch, _searchModel: SearchModel, _closestRoot: FolderMatchWorkspaceRoot | null, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    get searchModel(): SearchModel;
    get showHighlights(): boolean;
    get closestRoot(): FolderMatchWorkspaceRoot | null;
    set replacingAll(b: boolean);
    id(): string;
    get resource(): URI | null;
    index(): number;
    name(): string;
    parent(): SearchResult | FolderMatch;
    bindModel(model: ITextModel): void;
    createIntermediateFolderMatch(resource: URI, id: string, index: number, query: ITextQuery, baseWorkspaceFolder: FolderMatchWorkspaceRoot): FolderMatchWithResource;
    configureIntermediateMatch(folderMatch: FolderMatchWithResource): void;
    clear(clearingAll?: boolean): void;
    remove(matches: FileMatch | FolderMatchWithResource | (FileMatch | FolderMatchWithResource)[]): void;
    replace(match: FileMatch): Promise<any>;
    replaceAll(): Promise<any>;
    matches(): (FileMatch | FolderMatchWithResource)[];
    fileMatchesIterator(): IterableIterator<FileMatch>;
    folderMatchesIterator(): IterableIterator<FolderMatchWithResource>;
    isEmpty(): boolean;
    getDownstreamFileMatch(uri: URI): FileMatch | null;
    allDownstreamFileMatches(): FileMatch[];
    private fileCount;
    private folderCount;
    count(): number;
    recursiveFileCount(): number;
    recursiveMatchCount(): number;
    get query(): ITextQuery | null;
    addFileMatch(raw: IFileMatch[], silent: boolean): void;
    doAddFile(fileMatch: FileMatch): void;
    protected uriHasParent(parent: URI, child: URI): boolean;
    private isInParentChain;
    getFolderMatch(resource: URI): FolderMatchWithResource | undefined;
    doAddFolder(folderMatch: FolderMatchWithResource): void;
    private batchReplace;
    onFileChange(fileMatch: FileMatch, removed?: boolean): void;
    onFolderChange(folderMatch: FolderMatchWithResource, event: IChangeEvent): void;
    private doRemoveFile;
    private disposeMatches;
    dispose(): void;
}
export declare class FolderMatchWithResource extends FolderMatch {
    constructor(_resource: URI, _id: string, _index: number, _query: ITextQuery, _parent: SearchResult | FolderMatch, _searchModel: SearchModel, _closestRoot: FolderMatchWorkspaceRoot | null, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    get resource(): URI;
}
/**
 * FolderMatchWorkspaceRoot => folder for workspace root
 */
export declare class FolderMatchWorkspaceRoot extends FolderMatchWithResource {
    constructor(_resource: URI, _id: string, _index: number, _query: ITextQuery, _parent: SearchResult, _searchModel: SearchModel, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    private normalizedUriParent;
    private uriEquals;
    private createFileMatch;
    createAndConfigureFileMatch(rawFileMatch: IFileMatch<URI>): FileMatch;
}
/**
 * BaseFolderMatch => optional resource ("other files" node)
 * FolderMatch => required resource (normal folder node)
 */
export declare class FolderMatchNoRoot extends FolderMatch {
    constructor(_id: string, _index: number, _query: ITextQuery, _parent: SearchResult | FolderMatch, _searchModel: SearchModel, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    createAndConfigureFileMatch(rawFileMatch: IFileMatch): FileMatch;
}
/**
 * Compares instances of the same match type. Different match types should not be siblings
 * and their sort order is undefined.
 */
export declare function searchMatchComparer(elementA: RenderableMatch, elementB: RenderableMatch, sortOrder?: SearchSortOrder): number;
export declare function searchComparer(elementA: RenderableMatch, elementB: RenderableMatch, sortOrder?: SearchSortOrder): number;
export declare class SearchResult extends Disposable {
    private _searchModel;
    private readonly replaceService;
    private readonly instantiationService;
    private readonly modelService;
    private readonly uriIdentityService;
    private _onChange;
    readonly onChange: Event<IChangeEvent>;
    private _folderMatches;
    private _otherFilesMatch;
    private _folderMatchesMap;
    private _showHighlights;
    private _query;
    private _rangeHighlightDecorations;
    private disposePastResults;
    private _isDirty;
    constructor(_searchModel: SearchModel, replaceService: IReplaceService, instantiationService: IInstantiationService, modelService: IModelService, uriIdentityService: IUriIdentityService);
    batchReplace(elementsToReplace: RenderableMatch[]): Promise<void>;
    batchRemove(elementsToRemove: RenderableMatch[]): void;
    get isDirty(): boolean;
    get query(): ITextQuery | null;
    set query(query: ITextQuery | null);
    private mergeEvents;
    private onModelAdded;
    private _createBaseFolderMatch;
    get searchModel(): SearchModel;
    add(allRaw: IFileMatch[], silent?: boolean): void;
    clear(): void;
    remove(matches: FileMatch | FolderMatch | (FileMatch | FolderMatch)[]): void;
    replace(match: FileMatch): Promise<any>;
    replaceAll(progress: IProgress<IProgressStep>): Promise<any>;
    folderMatches(): FolderMatch[];
    matches(): FileMatch[];
    isEmpty(): boolean;
    fileCount(): number;
    count(): number;
    get showHighlights(): boolean;
    toggleHighlights(value: boolean): void;
    get rangeHighlightDecorations(): RangeHighlightDecorations;
    private getFolderMatch;
    private set replacingAll(value);
    private groupFilesByFolder;
    private disposeMatches;
    dispose(): void;
}
export declare class SearchModel extends Disposable {
    private readonly searchService;
    private readonly telemetryService;
    private readonly configurationService;
    private readonly instantiationService;
    private _searchResult;
    private _searchQuery;
    private _replaceActive;
    private _replaceString;
    private _replacePattern;
    private _preserveCase;
    private _startStreamDelay;
    private readonly _resultQueue;
    private readonly _onReplaceTermChanged;
    readonly onReplaceTermChanged: Event<void>;
    private currentCancelTokenSource;
    private searchCancelledForNewSearch;
    constructor(searchService: ISearchService, telemetryService: ITelemetryService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    isReplaceActive(): boolean;
    set replaceActive(replaceActive: boolean);
    get replacePattern(): ReplacePattern | null;
    get replaceString(): string;
    set preserveCase(value: boolean);
    get preserveCase(): boolean;
    set replaceString(replaceString: string);
    get searchResult(): SearchResult;
    search(query: ITextQuery, onProgress?: (result: ISearchProgressItem) => void): Promise<ISearchComplete>;
    private onSearchCompleted;
    private onSearchError;
    private onSearchProgress;
    private get searchConfig();
    cancelSearch(cancelledForNewSearch?: boolean): boolean;
    dispose(): void;
}
export declare type FileMatchOrMatch = FileMatch | Match;
export declare type RenderableMatch = FolderMatch | FolderMatchWithResource | FileMatch | Match;
export declare class SearchWorkbenchService implements ISearchWorkbenchService {
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private _searchModel;
    constructor(instantiationService: IInstantiationService);
    get searchModel(): SearchModel;
}
export declare const ISearchWorkbenchService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ISearchWorkbenchService>;
export interface ISearchWorkbenchService {
    readonly _serviceBrand: undefined;
    readonly searchModel: SearchModel;
}
/**
 * Can add a range highlight decoration to a model.
 * It will automatically remove it when the model has its decorations changed.
 */
export declare class RangeHighlightDecorations implements IDisposable {
    private readonly _modelService;
    private _decorationId;
    private _model;
    private readonly _modelDisposables;
    constructor(_modelService: IModelService);
    removeHighlightRange(): void;
    highlightRange(resource: URI | ITextModel, range: Range, ownerId?: number): void;
    private doHighlightRange;
    private setModel;
    private clearModelListeners;
    dispose(): void;
    private static readonly _RANGE_HIGHLIGHT_DECORATION;
}
export declare function arrayContainsElementOrParent(element: RenderableMatch, testArray: RenderableMatch[]): boolean;
