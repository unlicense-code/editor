import 'vs/css!./media/searchview';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { WorkbenchCompressibleObjectTree } from 'vs/platform/list/browser/listService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IViewPaneOptions, ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { ExcludePatternInputWidget, IncludePatternInputWidget } from 'vs/workbench/contrib/search/browser/patternInputWidget';
import { IFindInFilesArgs } from 'vs/workbench/contrib/search/browser/searchActionsFind';
import { SearchWidget } from 'vs/workbench/contrib/search/browser/searchWidget';
import { IReplaceService } from 'vs/workbench/contrib/search/common/replace';
import { ISearchHistoryService } from 'vs/workbench/contrib/search/common/searchHistoryService';
import { FileMatchOrMatch, IChangeEvent, ISearchWorkbenchService, RenderableMatch, SearchResult } from 'vs/workbench/contrib/search/common/searchModel';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
export declare enum SearchViewPosition {
    SideBar = 0,
    Panel = 1
}
export declare class SearchView extends ViewPane {
    private readonly fileService;
    private readonly editorService;
    private readonly codeEditorService;
    private readonly progressService;
    private readonly notificationService;
    private readonly dialogService;
    private readonly commandService;
    private readonly contextViewService;
    private readonly contextService;
    private readonly searchWorkbenchService;
    private readonly replaceService;
    private readonly textFileService;
    private readonly preferencesService;
    private readonly searchHistoryService;
    private readonly accessibilityService;
    private static readonly ACTIONS_RIGHT_CLASS_NAME;
    private isDisposed;
    private container;
    private queryBuilder;
    private viewModel;
    private memento;
    private viewletVisible;
    private inputBoxFocused;
    private inputPatternIncludesFocused;
    private inputPatternExclusionsFocused;
    private firstMatchFocused;
    private fileMatchOrMatchFocused;
    private fileMatchOrFolderMatchFocus;
    private fileMatchOrFolderMatchWithResourceFocus;
    private fileMatchFocused;
    private folderMatchFocused;
    private folderMatchWithResourceFocused;
    private matchFocused;
    private hasSearchResultsKey;
    private lastFocusState;
    private searchStateKey;
    private hasSearchPatternKey;
    private hasReplacePatternKey;
    private hasFilePatternKey;
    private hasSomeCollapsibleResultKey;
    private tree;
    private treeLabels;
    private viewletState;
    private messagesElement;
    private readonly messageDisposables;
    private searchWidgetsContainerElement;
    private searchWidget;
    private size;
    private queryDetails;
    private toggleQueryDetailsButton;
    private inputPatternExcludes;
    private inputPatternIncludes;
    private resultsElement;
    private currentSelectedFileMatch;
    private delayedRefresh;
    private changedWhileHidden;
    private searchWithoutFolderMessageElement;
    private currentSearchQ;
    private addToSearchHistoryDelayer;
    private toggleCollapseStateDelayer;
    private triggerQueryDelayer;
    private pauseSearching;
    private treeAccessibilityProvider;
    private treeViewKey;
    private _uiRefreshHandle;
    private _visibleMatches;
    constructor(options: IViewPaneOptions, fileService: IFileService, editorService: IEditorService, codeEditorService: ICodeEditorService, progressService: IProgressService, notificationService: INotificationService, dialogService: IDialogService, commandService: ICommandService, contextViewService: IContextViewService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, searchWorkbenchService: ISearchWorkbenchService, contextKeyService: IContextKeyService, replaceService: IReplaceService, textFileService: ITextFileService, preferencesService: IPreferencesService, themeService: IThemeService, searchHistoryService: ISearchHistoryService, contextMenuService: IContextMenuService, accessibilityService: IAccessibilityService, keybindingService: IKeybindingService, storageService: IStorageService, openerService: IOpenerService, telemetryService: ITelemetryService);
    get isTreeLayoutViewVisible(): boolean;
    private set isTreeLayoutViewVisible(value);
    setTreeView(visible: boolean): void;
    private get state();
    private set state(value);
    getContainer(): HTMLElement;
    get searchResult(): SearchResult;
    private onDidChangeWorkbenchState;
    renderBody(parent: HTMLElement): void;
    private onVisibilityChanged;
    get searchAndReplaceWidget(): SearchWidget;
    get searchIncludePattern(): IncludePatternInputWidget;
    get searchExcludePattern(): ExcludePatternInputWidget;
    private createSearchWidget;
    private onConfigurationUpdated;
    private trackInputBox;
    private onSearchResultsChanged;
    private refreshAndUpdateCount;
    refreshTree(event?: IChangeEvent): void;
    private createResultIterator;
    private createFolderIterator;
    private createFileIterator;
    private createIterator;
    private replaceAll;
    private buildAfterReplaceAllMessage;
    private buildReplaceAllConfirmationMessage;
    private clearMessage;
    private createSearchResultsView;
    private onContextMenu;
    private hasSomeCollapsible;
    selectNextMatch(): void;
    selectPreviousMatch(): void;
    moveFocusToResults(): void;
    focus(): void;
    updateTextFromFindWidgetOrSelection({ allowUnselectedWord, allowSearchOnType }: {
        allowUnselectedWord?: boolean | undefined;
        allowSearchOnType?: boolean | undefined;
    }): boolean;
    private updateTextFromFindWidget;
    private updateTextFromSelection;
    private updateText;
    focusNextInputBox(): void;
    private moveFocusFromSearchOrReplace;
    focusPreviousInputBox(): void;
    private moveFocusFromResults;
    private reLayout;
    protected layoutBody(height: number, width: number): void;
    getControl(): WorkbenchCompressibleObjectTree<RenderableMatch, void>;
    allSearchFieldsClear(): boolean;
    allFilePatternFieldsClear(): boolean;
    hasSearchResults(): boolean;
    clearSearchResults(clearInput?: boolean): void;
    clearFilePatternFields(): void;
    cancelSearch(focus?: boolean): boolean;
    private selectTreeIfNotSelected;
    private getSearchTextFromEditor;
    private showsFileTypes;
    toggleCaseSensitive(): void;
    toggleWholeWords(): void;
    toggleRegex(): void;
    togglePreserveCase(): void;
    setSearchParameters(args?: IFindInFilesArgs): void;
    toggleQueryDetails(moveFocus?: boolean, show?: boolean, skipLayout?: boolean, reverse?: boolean): void;
    searchInFolders(folderPaths?: string[]): void;
    searchOutsideOfFolders(folderPaths?: string[]): void;
    private _searchWithIncludeOrExclude;
    triggerQueryChange(_options?: {
        preserveFocus?: boolean;
        triggeredOnType?: boolean;
        delay?: number;
    }): void;
    private _onQueryChanged;
    private validateQuery;
    private onQueryTriggered;
    private doSearch;
    private onOpenSettings;
    private openSettings;
    private onLearnMore;
    private onSearchAgain;
    private onEnableExcludes;
    private onDisableSearchInOpenEditors;
    private updateSearchResultCount;
    private addMessage;
    private buildResultCountMessage;
    private showSearchWithoutFolderMessage;
    private showEmptyStage;
    private onFocus;
    open(element: FileMatchOrMatch, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<void>;
    openEditorWithMultiCursor(element: FileMatchOrMatch): Promise<void>;
    private getSelectionFrom;
    private onUntitledDidDispose;
    private onFilesChanged;
    private get searchConfig();
    private clearHistory;
    saveState(): void;
    private retrieveFileStats;
    private updateFileStats;
    private removeFileStats;
    dispose(): void;
}