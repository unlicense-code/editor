/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as dom from 'vs/base/browser/dom';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import * as aria from 'vs/base/browser/ui/aria/aria';
import { Delayer } from 'vs/base/common/async';
import { Color, RGBA } from 'vs/base/common/color';
import * as errors from 'vs/base/common/errors';
import { Event } from 'vs/base/common/event';
import { Iterable } from 'vs/base/common/iterator';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import * as env from 'vs/base/common/platform';
import * as strings from 'vs/base/common/strings';
import { withNullAsUndefined } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import 'vs/css!./media/searchview';
import { getCodeEditor, isCodeEditor, isDiffEditor } from 'vs/editor/browser/editorBrowser';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { EmbeddedCodeEditorWidget } from 'vs/editor/browser/widget/embeddedCodeEditorWidget';
import { Selection } from 'vs/editor/common/core/selection';
import { CommonFindController } from 'vs/editor/contrib/find/browser/findController';
import { MultiCursorSelectionController } from 'vs/editor/contrib/multicursor/browser/multicursor';
import * as nls from 'vs/nls';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { MenuId } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { getSelectionKeyboardEvent, WorkbenchCompressibleObjectTree } from 'vs/platform/list/browser/listService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService, withSelection } from 'vs/platform/opener/common/opener';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { diffInserted, diffInsertedOutline, diffRemoved, diffRemovedOutline, editorFindMatchHighlight, editorFindMatchHighlightBorder, foreground, listActiveSelectionForeground, textLinkActiveForeground, textLinkForeground, toolbarActiveBackground, toolbarHoverBackground } from 'vs/platform/theme/common/colorRegistry';
import { isHighContrast } from 'vs/platform/theme/common/theme';
import { IThemeService, registerThemingParticipant, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { OpenFileFolderAction, OpenFolderAction } from 'vs/workbench/browser/actions/workspaceActions';
import { ResourceListDnDHandler } from 'vs/workbench/browser/dnd';
import { ResourceLabels } from 'vs/workbench/browser/labels';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { Memento } from 'vs/workbench/common/memento';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { NotebookFindContrib } from 'vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget';
import { NotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookEditor';
import { ExcludePatternInputWidget, IncludePatternInputWidget } from 'vs/workbench/contrib/search/browser/patternInputWidget';
import { appendKeyBindingLabel } from 'vs/workbench/contrib/search/browser/searchActionsBase';
import { searchDetailsIcon } from 'vs/workbench/contrib/search/browser/searchIcons';
import { renderSearchMessage } from 'vs/workbench/contrib/search/browser/searchMessage';
import { FileMatchRenderer, FolderMatchRenderer, MatchRenderer, SearchAccessibilityProvider, SearchDelegate } from 'vs/workbench/contrib/search/browser/searchResultsView';
import { SearchWidget } from 'vs/workbench/contrib/search/browser/searchWidget';
import * as Constants from 'vs/workbench/contrib/search/common/constants';
import { IReplaceService } from 'vs/workbench/contrib/search/common/replace';
import { getOutOfWorkspaceEditorResources, SearchStateKey, SearchUIState } from 'vs/workbench/contrib/search/common/search';
import { ISearchHistoryService } from 'vs/workbench/contrib/search/common/searchHistoryService';
import { FileMatch, FolderMatch, FolderMatchWithResource, ISearchWorkbenchService, Match, searchMatchComparer, SearchResult } from 'vs/workbench/contrib/search/common/searchModel';
import { createEditorFromSearchResult } from 'vs/workbench/contrib/searchEditor/browser/searchEditorActions';
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { QueryBuilder } from 'vs/workbench/services/search/common/queryBuilder';
import { TextSearchCompleteMessageType } from 'vs/workbench/services/search/common/search';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
const $ = dom.$;
export var SearchViewPosition;
(function (SearchViewPosition) {
    SearchViewPosition[SearchViewPosition["SideBar"] = 0] = "SideBar";
    SearchViewPosition[SearchViewPosition["Panel"] = 1] = "Panel";
})(SearchViewPosition || (SearchViewPosition = {}));
const SEARCH_CANCELLED_MESSAGE = nls.localize('searchCanceled', "Search was canceled before any results could be found - ");
const DEBOUNCE_DELAY = 75;
let SearchView = class SearchView extends ViewPane {
    fileService;
    editorService;
    codeEditorService;
    progressService;
    notificationService;
    dialogService;
    commandService;
    contextViewService;
    contextService;
    searchWorkbenchService;
    replaceService;
    textFileService;
    preferencesService;
    searchHistoryService;
    accessibilityService;
    static ACTIONS_RIGHT_CLASS_NAME = 'actions-right';
    isDisposed = false;
    container;
    queryBuilder;
    viewModel;
    memento;
    viewletVisible;
    inputBoxFocused;
    inputPatternIncludesFocused;
    inputPatternExclusionsFocused;
    firstMatchFocused;
    fileMatchOrMatchFocused;
    fileMatchOrFolderMatchFocus;
    fileMatchOrFolderMatchWithResourceFocus;
    fileMatchFocused;
    folderMatchFocused;
    folderMatchWithResourceFocused;
    matchFocused;
    hasSearchResultsKey;
    lastFocusState = 'input';
    searchStateKey;
    hasSearchPatternKey;
    hasReplacePatternKey;
    hasFilePatternKey;
    hasSomeCollapsibleResultKey;
    tree;
    treeLabels;
    viewletState;
    messagesElement;
    messageDisposables = new DisposableStore();
    searchWidgetsContainerElement;
    searchWidget;
    size;
    queryDetails;
    toggleQueryDetailsButton;
    inputPatternExcludes;
    inputPatternIncludes;
    resultsElement;
    currentSelectedFileMatch;
    delayedRefresh;
    changedWhileHidden = false;
    searchWithoutFolderMessageElement;
    currentSearchQ = Promise.resolve();
    addToSearchHistoryDelayer;
    toggleCollapseStateDelayer;
    triggerQueryDelayer;
    pauseSearching = false;
    treeAccessibilityProvider;
    treeViewKey;
    _uiRefreshHandle;
    _visibleMatches = 0;
    constructor(options, fileService, editorService, codeEditorService, progressService, notificationService, dialogService, commandService, contextViewService, instantiationService, viewDescriptorService, configurationService, contextService, searchWorkbenchService, contextKeyService, replaceService, textFileService, preferencesService, themeService, searchHistoryService, contextMenuService, accessibilityService, keybindingService, storageService, openerService, telemetryService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        this.fileService = fileService;
        this.editorService = editorService;
        this.codeEditorService = codeEditorService;
        this.progressService = progressService;
        this.notificationService = notificationService;
        this.dialogService = dialogService;
        this.commandService = commandService;
        this.contextViewService = contextViewService;
        this.contextService = contextService;
        this.searchWorkbenchService = searchWorkbenchService;
        this.replaceService = replaceService;
        this.textFileService = textFileService;
        this.preferencesService = preferencesService;
        this.searchHistoryService = searchHistoryService;
        this.accessibilityService = accessibilityService;
        this.container = dom.$('.search-view');
        // globals
        this.viewletVisible = Constants.SearchViewVisibleKey.bindTo(this.contextKeyService);
        this.firstMatchFocused = Constants.FirstMatchFocusKey.bindTo(this.contextKeyService);
        this.fileMatchOrMatchFocused = Constants.FileMatchOrMatchFocusKey.bindTo(this.contextKeyService);
        this.fileMatchOrFolderMatchFocus = Constants.FileMatchOrFolderMatchFocusKey.bindTo(this.contextKeyService);
        this.fileMatchOrFolderMatchWithResourceFocus = Constants.FileMatchOrFolderMatchWithResourceFocusKey.bindTo(this.contextKeyService);
        this.fileMatchFocused = Constants.FileFocusKey.bindTo(this.contextKeyService);
        this.folderMatchFocused = Constants.FolderFocusKey.bindTo(this.contextKeyService);
        this.folderMatchWithResourceFocused = Constants.ResourceFolderFocusKey.bindTo(this.contextKeyService);
        this.hasSearchResultsKey = Constants.HasSearchResults.bindTo(this.contextKeyService);
        this.matchFocused = Constants.MatchFocusKey.bindTo(this.contextKeyService);
        this.searchStateKey = SearchStateKey.bindTo(this.contextKeyService);
        this.hasSearchPatternKey = Constants.ViewHasSearchPatternKey.bindTo(this.contextKeyService);
        this.hasReplacePatternKey = Constants.ViewHasReplacePatternKey.bindTo(this.contextKeyService);
        this.hasFilePatternKey = Constants.ViewHasFilePatternKey.bindTo(this.contextKeyService);
        this.hasSomeCollapsibleResultKey = Constants.ViewHasSomeCollapsibleKey.bindTo(this.contextKeyService);
        this.treeViewKey = Constants.InTreeViewKey.bindTo(this.contextKeyService);
        // scoped
        this.contextKeyService = this._register(this.contextKeyService.createScoped(this.container));
        Constants.SearchViewFocusedKey.bindTo(this.contextKeyService).set(true);
        this.inputBoxFocused = Constants.InputBoxFocusedKey.bindTo(this.contextKeyService);
        this.inputPatternIncludesFocused = Constants.PatternIncludesFocusedKey.bindTo(this.contextKeyService);
        this.inputPatternExclusionsFocused = Constants.PatternExcludesFocusedKey.bindTo(this.contextKeyService);
        this.instantiationService = this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.contextKeyService]));
        this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('search.sortOrder')) {
                if (this.searchConfig.sortOrder === "modified" /* SearchSortOrder.Modified */) {
                    // If changing away from modified, remove all fileStats
                    // so that updated files are re-retrieved next time.
                    this.removeFileStats();
                }
                this.refreshTree();
            }
        });
        this.viewModel = this._register(this.searchWorkbenchService.searchModel);
        this.queryBuilder = this.instantiationService.createInstance(QueryBuilder);
        this.memento = new Memento(this.id, storageService);
        this.viewletState = this.memento.getMemento(1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        this._register(this.fileService.onDidFilesChange(e => this.onFilesChanged(e)));
        this._register(this.textFileService.untitled.onWillDispose(model => this.onUntitledDidDispose(model.resource)));
        this._register(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));
        this._register(this.searchHistoryService.onDidClearHistory(() => this.clearHistory()));
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
        this.delayedRefresh = this._register(new Delayer(250));
        this.addToSearchHistoryDelayer = this._register(new Delayer(2000));
        this.toggleCollapseStateDelayer = this._register(new Delayer(100));
        this.triggerQueryDelayer = this._register(new Delayer(0));
        this.treeAccessibilityProvider = this.instantiationService.createInstance(SearchAccessibilityProvider, this.viewModel);
        this.isTreeLayoutViewVisible = this.viewletState['view.treeLayout'] ?? (this.searchConfig.defaultViewMode === "tree" /* ViewMode.Tree */);
    }
    get isTreeLayoutViewVisible() {
        return this.treeViewKey.get() ?? false;
    }
    set isTreeLayoutViewVisible(visible) {
        this.treeViewKey.set(visible);
    }
    setTreeView(visible) {
        if (visible === this.isTreeLayoutViewVisible) {
            return;
        }
        this.isTreeLayoutViewVisible = visible;
        this.refreshTree();
    }
    get state() {
        return this.searchStateKey.get() ?? SearchUIState.Idle;
    }
    set state(v) {
        this.searchStateKey.set(v);
    }
    getContainer() {
        return this.container;
    }
    get searchResult() {
        return this.viewModel && this.viewModel.searchResult;
    }
    onDidChangeWorkbenchState() {
        if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && this.searchWithoutFolderMessageElement) {
            dom.hide(this.searchWithoutFolderMessageElement);
        }
    }
    renderBody(parent) {
        super.renderBody(parent);
        this.container = dom.append(parent, dom.$('.search-view'));
        this.searchWidgetsContainerElement = dom.append(this.container, $('.search-widgets-container'));
        this.createSearchWidget(this.searchWidgetsContainerElement);
        const history = this.searchHistoryService.load();
        const filePatterns = this.viewletState['query.filePatterns'] || '';
        const patternExclusions = this.viewletState['query.folderExclusions'] || '';
        const patternExclusionsHistory = history.exclude || [];
        const patternIncludes = this.viewletState['query.folderIncludes'] || '';
        const patternIncludesHistory = history.include || [];
        const onlyOpenEditors = this.viewletState['query.onlyOpenEditors'] || false;
        const queryDetailsExpanded = this.viewletState['query.queryDetailsExpanded'] || '';
        const useExcludesAndIgnoreFiles = typeof this.viewletState['query.useExcludesAndIgnoreFiles'] === 'boolean' ?
            this.viewletState['query.useExcludesAndIgnoreFiles'] : true;
        this.queryDetails = dom.append(this.searchWidgetsContainerElement, $('.query-details'));
        // Toggle query details button
        this.toggleQueryDetailsButton = dom.append(this.queryDetails, $('.more' + ThemeIcon.asCSSSelector(searchDetailsIcon), { tabindex: 0, role: 'button', title: nls.localize('moreSearch', "Toggle Search Details") }));
        this._register(dom.addDisposableListener(this.toggleQueryDetailsButton, dom.EventType.CLICK, e => {
            dom.EventHelper.stop(e);
            this.toggleQueryDetails(!this.accessibilityService.isScreenReaderOptimized());
        }));
        this._register(dom.addDisposableListener(this.toggleQueryDetailsButton, dom.EventType.KEY_UP, (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                dom.EventHelper.stop(e);
                this.toggleQueryDetails(false);
            }
        }));
        this._register(dom.addDisposableListener(this.toggleQueryDetailsButton, dom.EventType.KEY_DOWN, (e) => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                if (this.searchWidget.isReplaceActive()) {
                    this.searchWidget.focusReplaceAllAction();
                }
                else {
                    this.searchWidget.isReplaceShown() ? this.searchWidget.replaceInput.focusOnPreserve() : this.searchWidget.focusRegexAction();
                }
                dom.EventHelper.stop(e);
            }
        }));
        // folder includes list
        const folderIncludesList = dom.append(this.queryDetails, $('.file-types.includes'));
        const filesToIncludeTitle = nls.localize('searchScope.includes', "files to include");
        dom.append(folderIncludesList, $('h4', undefined, filesToIncludeTitle));
        this.inputPatternIncludes = this._register(this.instantiationService.createInstance(IncludePatternInputWidget, folderIncludesList, this.contextViewService, {
            ariaLabel: filesToIncludeTitle,
            placeholder: nls.localize('placeholder.includes', "e.g. *.ts, src/**/include"),
            showPlaceholderOnFocus: true,
            history: patternIncludesHistory,
        }));
        this.inputPatternIncludes.setValue(patternIncludes);
        this.inputPatternIncludes.setOnlySearchInOpenEditors(onlyOpenEditors);
        this._register(this.inputPatternIncludes.onCancel(() => this.cancelSearch(false)));
        this._register(this.inputPatternIncludes.onChangeSearchInEditorsBox(() => this.triggerQueryChange()));
        this.trackInputBox(this.inputPatternIncludes.inputFocusTracker, this.inputPatternIncludesFocused);
        // excludes list
        const excludesList = dom.append(this.queryDetails, $('.file-types.excludes'));
        const excludesTitle = nls.localize('searchScope.excludes', "files to exclude");
        dom.append(excludesList, $('h4', undefined, excludesTitle));
        this.inputPatternExcludes = this._register(this.instantiationService.createInstance(ExcludePatternInputWidget, excludesList, this.contextViewService, {
            ariaLabel: excludesTitle,
            placeholder: nls.localize('placeholder.excludes', "e.g. *.ts, src/**/exclude"),
            showPlaceholderOnFocus: true,
            history: patternExclusionsHistory,
        }));
        this.inputPatternExcludes.setValue(patternExclusions);
        this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(useExcludesAndIgnoreFiles);
        this._register(this.inputPatternExcludes.onCancel(() => this.cancelSearch(false)));
        this._register(this.inputPatternExcludes.onChangeIgnoreBox(() => this.triggerQueryChange()));
        this.trackInputBox(this.inputPatternExcludes.inputFocusTracker, this.inputPatternExclusionsFocused);
        const updateHasFilePatternKey = () => this.hasFilePatternKey.set(this.inputPatternIncludes.getValue().length > 0 || this.inputPatternExcludes.getValue().length > 0);
        updateHasFilePatternKey();
        const onFilePatternSubmit = (triggeredOnType) => {
            this.triggerQueryChange({ triggeredOnType, delay: this.searchConfig.searchOnTypeDebouncePeriod });
            if (triggeredOnType) {
                updateHasFilePatternKey();
            }
        };
        this._register(this.inputPatternIncludes.onSubmit(onFilePatternSubmit));
        this._register(this.inputPatternExcludes.onSubmit(onFilePatternSubmit));
        this.messagesElement = dom.append(this.container, $('.messages.text-search-provider-messages'));
        if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
            this.showSearchWithoutFolderMessage();
        }
        this.createSearchResultsView(this.container);
        if (filePatterns !== '' || patternExclusions !== '' || patternIncludes !== '' || queryDetailsExpanded !== '' || !useExcludesAndIgnoreFiles) {
            this.toggleQueryDetails(true, true, true);
        }
        this._register(this.viewModel.searchResult.onChange((event) => this.onSearchResultsChanged(event)));
        this._register(this.onDidChangeBodyVisibility(visible => this.onVisibilityChanged(visible)));
    }
    onVisibilityChanged(visible) {
        this.viewletVisible.set(visible);
        if (visible) {
            if (this.changedWhileHidden) {
                // Render if results changed while viewlet was hidden - #37818
                this.refreshAndUpdateCount();
                this.changedWhileHidden = false;
            }
        }
        else {
            // Reset last focus to input to preserve opening the viewlet always focusing the query editor.
            this.lastFocusState = 'input';
        }
        // Enable highlights if there are searchresults
        this.viewModel?.searchResult.toggleHighlights(visible);
    }
    get searchAndReplaceWidget() {
        return this.searchWidget;
    }
    get searchIncludePattern() {
        return this.inputPatternIncludes;
    }
    get searchExcludePattern() {
        return this.inputPatternExcludes;
    }
    createSearchWidget(container) {
        const contentPattern = this.viewletState['query.contentPattern'] || '';
        const replaceText = this.viewletState['query.replaceText'] || '';
        const isRegex = this.viewletState['query.regex'] === true;
        const isWholeWords = this.viewletState['query.wholeWords'] === true;
        const isCaseSensitive = this.viewletState['query.caseSensitive'] === true;
        const history = this.searchHistoryService.load();
        const searchHistory = history.search || this.viewletState['query.searchHistory'] || [];
        const replaceHistory = history.replace || this.viewletState['query.replaceHistory'] || [];
        const showReplace = typeof this.viewletState['view.showReplace'] === 'boolean' ? this.viewletState['view.showReplace'] : true;
        const preserveCase = this.viewletState['query.preserveCase'] === true;
        this.searchWidget = this._register(this.instantiationService.createInstance(SearchWidget, container, {
            value: contentPattern,
            replaceValue: replaceText,
            isRegex: isRegex,
            isCaseSensitive: isCaseSensitive,
            isWholeWords: isWholeWords,
            searchHistory: searchHistory,
            replaceHistory: replaceHistory,
            preserveCase: preserveCase
        }));
        if (showReplace) {
            this.searchWidget.toggleReplace(true);
        }
        this._register(this.searchWidget.onSearchSubmit(options => this.triggerQueryChange(options)));
        this._register(this.searchWidget.onSearchCancel(({ focus }) => this.cancelSearch(focus)));
        this._register(this.searchWidget.searchInput.onDidOptionChange(() => this.triggerQueryChange()));
        const updateHasPatternKey = () => this.hasSearchPatternKey.set(this.searchWidget.searchInput.getValue().length > 0);
        updateHasPatternKey();
        this._register(this.searchWidget.searchInput.onDidChange(() => updateHasPatternKey()));
        const updateHasReplacePatternKey = () => this.hasReplacePatternKey.set(this.searchWidget.getReplaceValue().length > 0);
        updateHasReplacePatternKey();
        this._register(this.searchWidget.replaceInput.inputBox.onDidChange(() => updateHasReplacePatternKey()));
        this._register(this.searchWidget.onDidHeightChange(() => this.reLayout()));
        this._register(this.searchWidget.onReplaceToggled(() => this.reLayout()));
        this._register(this.searchWidget.onReplaceStateChange((state) => {
            this.viewModel.replaceActive = state;
            this.refreshTree();
        }));
        this._register(this.searchWidget.onPreserveCaseChange((state) => {
            this.viewModel.preserveCase = state;
            this.refreshTree();
        }));
        this._register(this.searchWidget.onReplaceValueChanged(() => {
            this.viewModel.replaceString = this.searchWidget.getReplaceValue();
            this.delayedRefresh.trigger(() => this.refreshTree());
        }));
        this._register(this.searchWidget.onBlur(() => {
            this.toggleQueryDetailsButton.focus();
        }));
        this._register(this.searchWidget.onReplaceAll(() => this.replaceAll()));
        this.trackInputBox(this.searchWidget.searchInputFocusTracker);
        this.trackInputBox(this.searchWidget.replaceInputFocusTracker);
    }
    onConfigurationUpdated(event) {
        if (event && (event.affectsConfiguration('search.decorations.colors') || event.affectsConfiguration('search.decorations.badges'))) {
            this.refreshTree();
        }
    }
    trackInputBox(inputFocusTracker, contextKey) {
        this._register(inputFocusTracker.onDidFocus(() => {
            this.lastFocusState = 'input';
            this.inputBoxFocused.set(true);
            contextKey?.set(true);
        }));
        this._register(inputFocusTracker.onDidBlur(() => {
            this.inputBoxFocused.set(this.searchWidget.searchInputHasFocus()
                || this.searchWidget.replaceInputHasFocus()
                || this.inputPatternIncludes.inputHasFocus()
                || this.inputPatternExcludes.inputHasFocus());
            contextKey?.set(false);
        }));
    }
    onSearchResultsChanged(event) {
        if (this.isVisible()) {
            return this.refreshAndUpdateCount(event);
        }
        else {
            this.changedWhileHidden = true;
        }
    }
    refreshAndUpdateCount(event) {
        this.searchWidget.setReplaceAllActionState(!this.viewModel.searchResult.isEmpty());
        this.updateSearchResultCount(this.viewModel.searchResult.query.userDisabledExcludesAndIgnoreFiles, this.viewModel.searchResult.query?.onlyOpenEditors, event?.clearingAll);
        return this.refreshTree(event);
    }
    refreshTree(event) {
        const collapseResults = this.searchConfig.collapseResults;
        if (!event || event.added || event.removed) {
            // Refresh whole tree
            if (this.searchConfig.sortOrder === "modified" /* SearchSortOrder.Modified */) {
                // Ensure all matches have retrieved their file stat
                this.retrieveFileStats()
                    .then(() => this.tree.setChildren(null, this.createResultIterator(collapseResults)));
            }
            else {
                this.tree.setChildren(null, this.createResultIterator(collapseResults));
            }
        }
        else {
            // If updated counts affect our search order, re-sort the view.
            if (this.searchConfig.sortOrder === "countAscending" /* SearchSortOrder.CountAscending */ ||
                this.searchConfig.sortOrder === "countDescending" /* SearchSortOrder.CountDescending */) {
                this.tree.setChildren(null, this.createResultIterator(collapseResults));
            }
            else {
                // FileMatch modified, refresh those elements
                event.elements.forEach(element => {
                    this.tree.setChildren(element, this.createIterator(element, collapseResults));
                    this.tree.rerender(element);
                });
            }
        }
    }
    createResultIterator(collapseResults) {
        const folderMatches = this.searchResult.folderMatches()
            .filter(fm => !fm.isEmpty())
            .sort(searchMatchComparer);
        if (folderMatches.length === 1) {
            return this.createFolderIterator(folderMatches[0], collapseResults, true);
        }
        return Iterable.map(folderMatches, folderMatch => {
            const children = this.createFolderIterator(folderMatch, collapseResults, true);
            return { element: folderMatch, children, incompressible: true }; // roots should always be incompressible
        });
    }
    createFolderIterator(folderMatch, collapseResults, childFolderIncompressible) {
        const sortOrder = this.searchConfig.sortOrder;
        const matchArray = this.isTreeLayoutViewVisible ? folderMatch.matches() : folderMatch.allDownstreamFileMatches();
        const matches = matchArray.sort((a, b) => searchMatchComparer(a, b, sortOrder));
        return Iterable.map(matches, match => {
            let children;
            if (match instanceof FileMatch) {
                children = this.createFileIterator(match);
            }
            else {
                children = this.createFolderIterator(match, collapseResults, false);
            }
            let nodeExists = true;
            try {
                this.tree.getNode(match);
            }
            catch (e) {
                nodeExists = false;
            }
            const collapsed = nodeExists ? undefined :
                (collapseResults === 'alwaysCollapse' || (match.count() > 10 && collapseResults !== 'alwaysExpand'));
            return { element: match, children, collapsed, incompressible: (match instanceof FileMatch) ? true : childFolderIncompressible };
        });
    }
    createFileIterator(fileMatch) {
        const matches = fileMatch.matches().sort(searchMatchComparer);
        return Iterable.map(matches, r => ({ element: r, incompressible: true }));
    }
    createIterator(match, collapseResults) {
        return match instanceof SearchResult ? this.createResultIterator(collapseResults) :
            match instanceof FolderMatch ? this.createFolderIterator(match, collapseResults, false) :
                this.createFileIterator(match);
    }
    replaceAll() {
        if (this.viewModel.searchResult.count() === 0) {
            return;
        }
        const occurrences = this.viewModel.searchResult.count();
        const fileCount = this.viewModel.searchResult.fileCount();
        const replaceValue = this.searchWidget.getReplaceValue() || '';
        const afterReplaceAllMessage = this.buildAfterReplaceAllMessage(occurrences, fileCount, replaceValue);
        let progressComplete;
        let progressReporter;
        this.progressService.withProgress({ location: this.getProgressLocation(), delay: 100, total: occurrences }, p => {
            progressReporter = p;
            return new Promise(resolve => progressComplete = resolve);
        });
        const confirmation = {
            title: nls.localize('replaceAll.confirmation.title', "Replace All"),
            message: this.buildReplaceAllConfirmationMessage(occurrences, fileCount, replaceValue),
            primaryButton: nls.localize('replaceAll.confirm.button', "&&Replace"),
            type: 'question'
        };
        this.dialogService.confirm(confirmation).then(res => {
            if (res.confirmed) {
                this.searchWidget.setReplaceAllActionState(false);
                this.viewModel.searchResult.replaceAll(progressReporter).then(() => {
                    progressComplete();
                    const messageEl = this.clearMessage();
                    dom.append(messageEl, afterReplaceAllMessage);
                    this.reLayout();
                }, (error) => {
                    progressComplete();
                    errors.isCancellationError(error);
                    this.notificationService.error(error);
                });
            }
        });
    }
    buildAfterReplaceAllMessage(occurrences, fileCount, replaceValue) {
        if (occurrences === 1) {
            if (fileCount === 1) {
                if (replaceValue) {
                    return nls.localize('replaceAll.occurrence.file.message', "Replaced {0} occurrence across {1} file with '{2}'.", occurrences, fileCount, replaceValue);
                }
                return nls.localize('removeAll.occurrence.file.message', "Replaced {0} occurrence across {1} file.", occurrences, fileCount);
            }
            if (replaceValue) {
                return nls.localize('replaceAll.occurrence.files.message', "Replaced {0} occurrence across {1} files with '{2}'.", occurrences, fileCount, replaceValue);
            }
            return nls.localize('removeAll.occurrence.files.message', "Replaced {0} occurrence across {1} files.", occurrences, fileCount);
        }
        if (fileCount === 1) {
            if (replaceValue) {
                return nls.localize('replaceAll.occurrences.file.message', "Replaced {0} occurrences across {1} file with '{2}'.", occurrences, fileCount, replaceValue);
            }
            return nls.localize('removeAll.occurrences.file.message', "Replaced {0} occurrences across {1} file.", occurrences, fileCount);
        }
        if (replaceValue) {
            return nls.localize('replaceAll.occurrences.files.message', "Replaced {0} occurrences across {1} files with '{2}'.", occurrences, fileCount, replaceValue);
        }
        return nls.localize('removeAll.occurrences.files.message', "Replaced {0} occurrences across {1} files.", occurrences, fileCount);
    }
    buildReplaceAllConfirmationMessage(occurrences, fileCount, replaceValue) {
        if (occurrences === 1) {
            if (fileCount === 1) {
                if (replaceValue) {
                    return nls.localize('removeAll.occurrence.file.confirmation.message', "Replace {0} occurrence across {1} file with '{2}'?", occurrences, fileCount, replaceValue);
                }
                return nls.localize('replaceAll.occurrence.file.confirmation.message', "Replace {0} occurrence across {1} file?", occurrences, fileCount);
            }
            if (replaceValue) {
                return nls.localize('removeAll.occurrence.files.confirmation.message', "Replace {0} occurrence across {1} files with '{2}'?", occurrences, fileCount, replaceValue);
            }
            return nls.localize('replaceAll.occurrence.files.confirmation.message', "Replace {0} occurrence across {1} files?", occurrences, fileCount);
        }
        if (fileCount === 1) {
            if (replaceValue) {
                return nls.localize('removeAll.occurrences.file.confirmation.message', "Replace {0} occurrences across {1} file with '{2}'?", occurrences, fileCount, replaceValue);
            }
            return nls.localize('replaceAll.occurrences.file.confirmation.message', "Replace {0} occurrences across {1} file?", occurrences, fileCount);
        }
        if (replaceValue) {
            return nls.localize('removeAll.occurrences.files.confirmation.message', "Replace {0} occurrences across {1} files with '{2}'?", occurrences, fileCount, replaceValue);
        }
        return nls.localize('replaceAll.occurrences.files.confirmation.message', "Replace {0} occurrences across {1} files?", occurrences, fileCount);
    }
    clearMessage() {
        this.searchWithoutFolderMessageElement = undefined;
        const wasHidden = this.messagesElement.style.display === 'none';
        dom.clearNode(this.messagesElement);
        dom.show(this.messagesElement);
        this.messageDisposables.clear();
        const newMessage = dom.append(this.messagesElement, $('.message'));
        if (wasHidden) {
            this.reLayout();
        }
        return newMessage;
    }
    createSearchResultsView(container) {
        this.resultsElement = dom.append(container, $('.results.show-file-icons'));
        const delegate = this.instantiationService.createInstance(SearchDelegate);
        const identityProvider = {
            getId(element) {
                return element.id();
            }
        };
        this.treeLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility }));
        this.tree = this._register(this.instantiationService.createInstance(WorkbenchCompressibleObjectTree, 'SearchView', this.resultsElement, delegate, [
            this._register(this.instantiationService.createInstance(FolderMatchRenderer, this, this.treeLabels)),
            this._register(this.instantiationService.createInstance(FileMatchRenderer, this, this.treeLabels)),
            this._register(this.instantiationService.createInstance(MatchRenderer, this.viewModel, this)),
        ], {
            identityProvider,
            accessibilityProvider: this.treeAccessibilityProvider,
            dnd: this.instantiationService.createInstance(ResourceListDnDHandler, element => {
                if (element instanceof FileMatch) {
                    return element.resource;
                }
                if (element instanceof Match) {
                    return withSelection(element.parent().resource, element.range());
                }
                return null;
            }),
            multipleSelectionSupport: true,
            selectionNavigation: true,
            overrideStyles: {
                listBackground: this.getBackgroundColor()
            },
            additionalScrollHeight: SearchDelegate.ITEM_HEIGHT
        }));
        this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
        const updateHasSomeCollapsible = () => this.toggleCollapseStateDelayer.trigger(() => this.hasSomeCollapsibleResultKey.set(this.hasSomeCollapsible()));
        updateHasSomeCollapsible();
        this._register(this.viewModel.searchResult.onChange(() => updateHasSomeCollapsible()));
        this._register(this.tree.onDidChangeCollapseState(() => updateHasSomeCollapsible()));
        this._register(Event.debounce(this.tree.onDidOpen, (last, event) => event, DEBOUNCE_DELAY, true)(options => {
            if (options.element instanceof Match) {
                const selectedMatch = options.element;
                this.currentSelectedFileMatch?.setSelectedMatch(null);
                this.currentSelectedFileMatch = selectedMatch.parent();
                this.currentSelectedFileMatch.setSelectedMatch(selectedMatch);
                this.onFocus(selectedMatch, options.editorOptions.preserveFocus, options.sideBySide, options.editorOptions.pinned);
            }
        }));
        this._register(Event.debounce(this.tree.onDidChangeFocus, (last, event) => event, DEBOUNCE_DELAY, true)(() => {
            const selection = this.tree.getSelection();
            const focus = this.tree.getFocus()[0];
            if (selection.length > 1 && focus instanceof Match) {
                this.onFocus(focus, true);
            }
        }));
        this._register(Event.any(this.tree.onDidFocus, this.tree.onDidChangeFocus)(() => {
            if (this.tree.isDOMFocused()) {
                const focus = this.tree.getFocus()[0];
                this.firstMatchFocused.set(this.tree.navigate().first() === focus);
                this.fileMatchOrMatchFocused.set(!!focus);
                this.fileMatchFocused.set(focus instanceof FileMatch);
                this.folderMatchFocused.set(focus instanceof FolderMatch);
                this.matchFocused.set(focus instanceof Match);
                this.fileMatchOrFolderMatchFocus.set(focus instanceof FileMatch || focus instanceof FolderMatch);
                this.fileMatchOrFolderMatchWithResourceFocus.set(focus instanceof FileMatch || focus instanceof FolderMatchWithResource);
                this.folderMatchWithResourceFocused.set(focus instanceof FolderMatchWithResource);
                this.lastFocusState = 'tree';
            }
        }));
        this._register(this.tree.onDidBlur(() => {
            this.firstMatchFocused.reset();
            this.fileMatchOrMatchFocused.reset();
            this.fileMatchFocused.reset();
            this.folderMatchFocused.reset();
            this.matchFocused.reset();
            this.fileMatchOrFolderMatchFocus.reset();
            this.fileMatchOrFolderMatchWithResourceFocus.reset();
            this.folderMatchWithResourceFocused.reset();
        }));
    }
    onContextMenu(e) {
        e.browserEvent.preventDefault();
        e.browserEvent.stopPropagation();
        this.contextMenuService.showContextMenu({
            menuId: MenuId.SearchContext,
            menuActionOptions: { shouldForwardArgs: true },
            contextKeyService: this.contextKeyService,
            getAnchor: () => e.anchor,
            getActionsContext: () => e.element,
        });
    }
    hasSomeCollapsible() {
        const viewer = this.getControl();
        const navigator = viewer.navigate();
        let node = navigator.first();
        do {
            if (!viewer.isCollapsed(node)) {
                return true;
            }
        } while (node = navigator.next());
        return false;
    }
    selectNextMatch() {
        if (!this.hasSearchResults()) {
            return;
        }
        const [selected] = this.tree.getSelection();
        // Expand the initial selected node, if needed
        if (selected && !(selected instanceof Match)) {
            if (this.tree.isCollapsed(selected)) {
                this.tree.expand(selected);
            }
        }
        const navigator = this.tree.navigate(selected);
        let next = navigator.next();
        if (!next) {
            next = navigator.first();
        }
        // Expand until first child is a Match
        while (next && !(next instanceof Match)) {
            if (this.tree.isCollapsed(next)) {
                this.tree.expand(next);
            }
            // Select the first child
            next = navigator.next();
        }
        // Reveal the newly selected element
        if (next) {
            if (next === selected) {
                this.tree.setFocus([]);
            }
            const event = getSelectionKeyboardEvent(undefined, false, false);
            this.tree.setFocus([next], event);
            this.tree.setSelection([next], event);
            this.tree.reveal(next);
            const ariaLabel = this.treeAccessibilityProvider.getAriaLabel(next);
            if (ariaLabel) {
                aria.alert(ariaLabel);
            }
        }
    }
    selectPreviousMatch() {
        if (!this.hasSearchResults()) {
            return;
        }
        const [selected] = this.tree.getSelection();
        let navigator = this.tree.navigate(selected);
        let prev = navigator.previous();
        // Select previous until find a Match or a collapsed item
        while (!prev || (!(prev instanceof Match) && !this.tree.isCollapsed(prev))) {
            const nextPrev = prev ? navigator.previous() : navigator.last();
            if (!prev && !nextPrev) {
                return;
            }
            prev = nextPrev;
        }
        // Expand until last child is a Match
        while (!(prev instanceof Match)) {
            const nextItem = navigator.next();
            this.tree.expand(prev);
            navigator = this.tree.navigate(nextItem); // recreate navigator because modifying the tree can invalidate it
            prev = nextItem ? navigator.previous() : navigator.last(); // select last child
        }
        // Reveal the newly selected element
        if (prev) {
            if (prev === selected) {
                this.tree.setFocus([]);
            }
            const event = getSelectionKeyboardEvent(undefined, false, false);
            this.tree.setFocus([prev], event);
            this.tree.setSelection([prev], event);
            this.tree.reveal(prev);
            const ariaLabel = this.treeAccessibilityProvider.getAriaLabel(prev);
            if (ariaLabel) {
                aria.alert(ariaLabel);
            }
        }
    }
    moveFocusToResults() {
        this.tree.domFocus();
    }
    focus() {
        super.focus();
        if (this.lastFocusState === 'input' || !this.hasSearchResults()) {
            const updatedText = this.searchConfig.seedOnFocus ? this.updateTextFromSelection({ allowSearchOnType: false }) : false;
            this.searchWidget.focus(undefined, undefined, updatedText);
        }
        else {
            this.tree.domFocus();
        }
    }
    updateTextFromFindWidgetOrSelection({ allowUnselectedWord = true, allowSearchOnType = true }) {
        let activeEditor = this.editorService.activeTextEditorControl;
        if (isCodeEditor(activeEditor) && !activeEditor?.hasTextFocus()) {
            const controller = CommonFindController.get(activeEditor);
            if (controller && controller.isFindInputFocused()) {
                return this.updateTextFromFindWidget(controller, { allowSearchOnType });
            }
            const editors = this.codeEditorService.listCodeEditors();
            activeEditor = editors.find(editor => editor instanceof EmbeddedCodeEditorWidget && editor.getParentEditor() === activeEditor && editor.hasTextFocus())
                ?? activeEditor;
        }
        return this.updateTextFromSelection({ allowUnselectedWord, allowSearchOnType }, activeEditor);
    }
    updateTextFromFindWidget(controller, { allowSearchOnType = true }) {
        if (!this.searchConfig.seedWithNearestWord && (window.getSelection()?.toString() ?? '') === '') {
            return false;
        }
        const searchString = controller.getState().searchString;
        if (searchString === '') {
            return false;
        }
        this.searchWidget.searchInput.setCaseSensitive(controller.getState().matchCase);
        this.searchWidget.searchInput.setWholeWords(controller.getState().wholeWord);
        this.searchWidget.searchInput.setRegex(controller.getState().isRegex);
        this.updateText(searchString, allowSearchOnType);
        return true;
    }
    updateTextFromSelection({ allowUnselectedWord = true, allowSearchOnType = true }, editor) {
        const seedSearchStringFromSelection = this.configurationService.getValue('editor').find.seedSearchStringFromSelection;
        if (!seedSearchStringFromSelection) {
            return false;
        }
        let selectedText = this.getSearchTextFromEditor(allowUnselectedWord, editor);
        if (selectedText === null) {
            return false;
        }
        if (this.searchWidget.searchInput.getRegex()) {
            selectedText = strings.escapeRegExpCharacters(selectedText);
        }
        this.updateText(selectedText, allowSearchOnType);
        return true;
    }
    updateText(text, allowSearchOnType = true) {
        if (allowSearchOnType && !this.viewModel.searchResult.isDirty) {
            this.searchWidget.setValue(text);
        }
        else {
            this.pauseSearching = true;
            this.searchWidget.setValue(text);
            this.pauseSearching = false;
        }
    }
    focusNextInputBox() {
        if (this.searchWidget.searchInputHasFocus()) {
            if (this.searchWidget.isReplaceShown()) {
                this.searchWidget.focus(true, true);
            }
            else {
                this.moveFocusFromSearchOrReplace();
            }
            return;
        }
        if (this.searchWidget.replaceInputHasFocus()) {
            this.moveFocusFromSearchOrReplace();
            return;
        }
        if (this.inputPatternIncludes.inputHasFocus()) {
            this.inputPatternExcludes.focus();
            this.inputPatternExcludes.select();
            return;
        }
        if (this.inputPatternExcludes.inputHasFocus()) {
            this.selectTreeIfNotSelected();
            return;
        }
    }
    moveFocusFromSearchOrReplace() {
        if (this.showsFileTypes()) {
            this.toggleQueryDetails(true, this.showsFileTypes());
        }
        else {
            this.selectTreeIfNotSelected();
        }
    }
    focusPreviousInputBox() {
        if (this.searchWidget.searchInputHasFocus()) {
            return;
        }
        if (this.searchWidget.replaceInputHasFocus()) {
            this.searchWidget.focus(true);
            return;
        }
        if (this.inputPatternIncludes.inputHasFocus()) {
            this.searchWidget.focus(true, true);
            return;
        }
        if (this.inputPatternExcludes.inputHasFocus()) {
            this.inputPatternIncludes.focus();
            this.inputPatternIncludes.select();
            return;
        }
        if (this.tree.isDOMFocused()) {
            this.moveFocusFromResults();
            return;
        }
    }
    moveFocusFromResults() {
        if (this.showsFileTypes()) {
            this.toggleQueryDetails(true, true, false, true);
        }
        else {
            this.searchWidget.focus(true, true);
        }
    }
    reLayout() {
        if (this.isDisposed || !this.size) {
            return;
        }
        const actionsPosition = this.searchConfig.actionsPosition;
        this.getContainer().classList.toggle(SearchView.ACTIONS_RIGHT_CLASS_NAME, actionsPosition === 'right');
        this.searchWidget.setWidth(this.size.width - 28 /* container margin */);
        this.inputPatternExcludes.setWidth(this.size.width - 28 /* container margin */);
        this.inputPatternIncludes.setWidth(this.size.width - 28 /* container margin */);
        const widgetHeight = dom.getTotalHeight(this.searchWidgetsContainerElement);
        const messagesHeight = dom.getTotalHeight(this.messagesElement);
        this.tree.layout(this.size.height - widgetHeight - messagesHeight, this.size.width - 28);
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.size = new dom.Dimension(width, height);
        this.reLayout();
    }
    getControl() {
        return this.tree;
    }
    allSearchFieldsClear() {
        return this.searchWidget.getReplaceValue() === '' &&
            this.searchWidget.searchInput.getValue() === '';
    }
    allFilePatternFieldsClear() {
        return this.searchExcludePattern.getValue() === '' &&
            this.searchIncludePattern.getValue() === '';
    }
    hasSearchResults() {
        return !this.viewModel.searchResult.isEmpty();
    }
    clearSearchResults(clearInput = true) {
        this.viewModel.searchResult.clear();
        this.showEmptyStage(true);
        if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
            this.showSearchWithoutFolderMessage();
        }
        if (clearInput) {
            if (this.allSearchFieldsClear()) {
                this.clearFilePatternFields();
            }
            this.searchWidget.clear();
        }
        this.viewModel.cancelSearch();
        this.tree.ariaLabel = nls.localize('emptySearch', "Empty Search");
        aria.status(nls.localize('ariaSearchResultsClearStatus', "The search results have been cleared"));
        this.reLayout();
    }
    clearFilePatternFields() {
        this.searchExcludePattern.clear();
        this.searchIncludePattern.clear();
    }
    cancelSearch(focus = true) {
        if (this.viewModel.cancelSearch()) {
            if (focus) {
                this.searchWidget.focus();
            }
            return true;
        }
        return false;
    }
    selectTreeIfNotSelected() {
        if (this.tree.getNode(null)) {
            this.tree.domFocus();
            const selection = this.tree.getSelection();
            if (selection.length === 0) {
                const event = getSelectionKeyboardEvent();
                this.tree.focusNext(undefined, undefined, event);
                this.tree.setSelection(this.tree.getFocus(), event);
            }
        }
    }
    getSearchTextFromEditor(allowUnselectedWord, editor) {
        if (dom.isAncestor(document.activeElement, this.getContainer())) {
            return null;
        }
        editor = editor ?? this.editorService.activeTextEditorControl;
        if (isDiffEditor(editor)) {
            if (editor.getOriginalEditor().hasTextFocus()) {
                editor = editor.getOriginalEditor();
            }
            else {
                editor = editor.getModifiedEditor();
            }
        }
        if (!isCodeEditor(editor) || !editor.hasModel()) {
            return null;
        }
        const range = editor.getSelection();
        if (!range) {
            return null;
        }
        if (range.isEmpty() && this.searchConfig.seedWithNearestWord && allowUnselectedWord) {
            const wordAtPosition = editor.getModel().getWordAtPosition(range.getStartPosition());
            if (wordAtPosition) {
                return wordAtPosition.word;
            }
        }
        if (!range.isEmpty()) {
            let searchText = '';
            for (let i = range.startLineNumber; i <= range.endLineNumber; i++) {
                let lineText = editor.getModel().getLineContent(i);
                if (i === range.endLineNumber) {
                    lineText = lineText.substring(0, range.endColumn - 1);
                }
                if (i === range.startLineNumber) {
                    lineText = lineText.substring(range.startColumn - 1);
                }
                if (i !== range.startLineNumber) {
                    lineText = '\n' + lineText;
                }
                searchText += lineText;
            }
            return searchText;
        }
        return null;
    }
    showsFileTypes() {
        return this.queryDetails.classList.contains('more');
    }
    toggleCaseSensitive() {
        this.searchWidget.searchInput.setCaseSensitive(!this.searchWidget.searchInput.getCaseSensitive());
        this.triggerQueryChange();
    }
    toggleWholeWords() {
        this.searchWidget.searchInput.setWholeWords(!this.searchWidget.searchInput.getWholeWords());
        this.triggerQueryChange();
    }
    toggleRegex() {
        this.searchWidget.searchInput.setRegex(!this.searchWidget.searchInput.getRegex());
        this.triggerQueryChange();
    }
    togglePreserveCase() {
        this.searchWidget.replaceInput.setPreserveCase(!this.searchWidget.replaceInput.getPreserveCase());
        this.triggerQueryChange();
    }
    setSearchParameters(args = {}) {
        if (typeof args.isCaseSensitive === 'boolean') {
            this.searchWidget.searchInput.setCaseSensitive(args.isCaseSensitive);
        }
        if (typeof args.matchWholeWord === 'boolean') {
            this.searchWidget.searchInput.setWholeWords(args.matchWholeWord);
        }
        if (typeof args.isRegex === 'boolean') {
            this.searchWidget.searchInput.setRegex(args.isRegex);
        }
        if (typeof args.filesToInclude === 'string') {
            this.searchIncludePattern.setValue(String(args.filesToInclude));
        }
        if (typeof args.filesToExclude === 'string') {
            this.searchExcludePattern.setValue(String(args.filesToExclude));
        }
        if (typeof args.query === 'string') {
            this.searchWidget.searchInput.setValue(args.query);
        }
        if (typeof args.replace === 'string') {
            this.searchWidget.replaceInput.setValue(args.replace);
        }
        else {
            if (this.searchWidget.replaceInput.getValue() !== '') {
                this.searchWidget.replaceInput.setValue('');
            }
        }
        if (typeof args.triggerSearch === 'boolean' && args.triggerSearch) {
            this.triggerQueryChange();
        }
        if (typeof args.preserveCase === 'boolean') {
            this.searchWidget.replaceInput.setPreserveCase(args.preserveCase);
        }
        if (typeof args.useExcludeSettingsAndIgnoreFiles === 'boolean') {
            this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(args.useExcludeSettingsAndIgnoreFiles);
        }
        if (typeof args.onlyOpenEditors === 'boolean') {
            this.searchIncludePattern.setOnlySearchInOpenEditors(args.onlyOpenEditors);
        }
    }
    toggleQueryDetails(moveFocus = true, show, skipLayout, reverse) {
        const cls = 'more';
        show = typeof show === 'undefined' ? !this.queryDetails.classList.contains(cls) : Boolean(show);
        this.viewletState['query.queryDetailsExpanded'] = show;
        skipLayout = Boolean(skipLayout);
        if (show) {
            this.toggleQueryDetailsButton.setAttribute('aria-expanded', 'true');
            this.queryDetails.classList.add(cls);
            if (moveFocus) {
                if (reverse) {
                    this.inputPatternExcludes.focus();
                    this.inputPatternExcludes.select();
                }
                else {
                    this.inputPatternIncludes.focus();
                    this.inputPatternIncludes.select();
                }
            }
        }
        else {
            this.toggleQueryDetailsButton.setAttribute('aria-expanded', 'false');
            this.queryDetails.classList.remove(cls);
            if (moveFocus) {
                this.searchWidget.focus();
            }
        }
        if (!skipLayout && this.size) {
            this.reLayout();
        }
    }
    searchInFolders(folderPaths = []) {
        this._searchWithIncludeOrExclude(true, folderPaths);
    }
    searchOutsideOfFolders(folderPaths = []) {
        this._searchWithIncludeOrExclude(false, folderPaths);
    }
    _searchWithIncludeOrExclude(include, folderPaths) {
        if (!folderPaths.length || folderPaths.some(folderPath => folderPath === '.')) {
            this.inputPatternIncludes.setValue('');
            this.searchWidget.focus();
            return;
        }
        // Show 'files to include' box
        if (!this.showsFileTypes()) {
            this.toggleQueryDetails(true, true);
        }
        (include ? this.inputPatternIncludes : this.inputPatternExcludes).setValue(folderPaths.join(', '));
        this.searchWidget.focus(false);
    }
    triggerQueryChange(_options) {
        const options = { preserveFocus: true, triggeredOnType: false, delay: 0, ..._options };
        if (options.triggeredOnType && !this.searchConfig.searchOnType) {
            return;
        }
        if (!this.pauseSearching) {
            this.triggerQueryDelayer.trigger(() => {
                this._onQueryChanged(options.preserveFocus, options.triggeredOnType);
            }, options.delay);
        }
    }
    _onQueryChanged(preserveFocus, triggeredOnType = false) {
        if (!this.searchWidget.searchInput.inputBox.isInputValid()) {
            return;
        }
        const isRegex = this.searchWidget.searchInput.getRegex();
        const isWholeWords = this.searchWidget.searchInput.getWholeWords();
        const isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
        const contentPattern = this.searchWidget.searchInput.getValue();
        const excludePatternText = this.inputPatternExcludes.getValue().trim();
        const includePatternText = this.inputPatternIncludes.getValue().trim();
        const useExcludesAndIgnoreFiles = this.inputPatternExcludes.useExcludesAndIgnoreFiles();
        const onlySearchInOpenEditors = this.inputPatternIncludes.onlySearchInOpenEditors();
        if (contentPattern.length === 0) {
            this.clearSearchResults(false);
            this.clearMessage();
            return;
        }
        const content = {
            pattern: contentPattern,
            isRegExp: isRegex,
            isCaseSensitive: isCaseSensitive,
            isWordMatch: isWholeWords
        };
        const excludePattern = this.inputPatternExcludes.getValue();
        const includePattern = this.inputPatternIncludes.getValue();
        // Need the full match line to correctly calculate replace text, if this is a search/replace with regex group references ($1, $2, ...).
        // 10000 chars is enough to avoid sending huge amounts of text around, if you do a replace with a longer match, it may or may not resolve the group refs correctly.
        // https://github.com/microsoft/vscode/issues/58374
        const charsPerLine = content.isRegExp ? 10000 : 1000;
        const options = {
            _reason: 'searchView',
            extraFileResources: this.instantiationService.invokeFunction(getOutOfWorkspaceEditorResources),
            maxResults: withNullAsUndefined(this.searchConfig.maxResults),
            disregardIgnoreFiles: !useExcludesAndIgnoreFiles || undefined,
            disregardExcludeSettings: !useExcludesAndIgnoreFiles || undefined,
            onlyOpenEditors: onlySearchInOpenEditors,
            excludePattern,
            includePattern,
            previewOptions: {
                matchLines: 1,
                charsPerLine
            },
            isSmartCase: this.searchConfig.smartCase,
            expandPatterns: true
        };
        const folderResources = this.contextService.getWorkspace().folders;
        const onQueryValidationError = (err) => {
            this.searchWidget.searchInput.showMessage({ content: err.message, type: 3 /* MessageType.ERROR */ });
            this.viewModel.searchResult.clear();
        };
        let query;
        try {
            query = this.queryBuilder.text(content, folderResources.map(folder => folder.uri), options);
        }
        catch (err) {
            onQueryValidationError(err);
            return;
        }
        this.validateQuery(query).then(() => {
            this.onQueryTriggered(query, options, excludePatternText, includePatternText, triggeredOnType);
            if (!preserveFocus) {
                this.searchWidget.focus(false, undefined, true); // focus back to input field
            }
        }, onQueryValidationError);
    }
    validateQuery(query) {
        // Validate folderQueries
        const folderQueriesExistP = query.folderQueries.map(fq => {
            return this.fileService.exists(fq.folder).catch(() => false);
        });
        return Promise.all(folderQueriesExistP).then(existResults => {
            // If no folders exist, show an error message about the first one
            const existingFolderQueries = query.folderQueries.filter((folderQuery, i) => existResults[i]);
            if (!query.folderQueries.length || existingFolderQueries.length) {
                query.folderQueries = existingFolderQueries;
            }
            else {
                const nonExistantPath = query.folderQueries[0].folder.fsPath;
                const searchPathNotFoundError = nls.localize('searchPathNotFoundError', "Search path not found: {0}", nonExistantPath);
                return Promise.reject(new Error(searchPathNotFoundError));
            }
            return undefined;
        });
    }
    onQueryTriggered(query, options, excludePatternText, includePatternText, triggeredOnType) {
        this.addToSearchHistoryDelayer.trigger(() => {
            this.searchWidget.searchInput.onSearchSubmit();
            this.inputPatternExcludes.onSearchSubmit();
            this.inputPatternIncludes.onSearchSubmit();
        });
        this.viewModel.cancelSearch(true);
        this.currentSearchQ = this.currentSearchQ
            .then(() => this.doSearch(query, excludePatternText, includePatternText, triggeredOnType))
            .then(() => undefined, () => undefined);
    }
    doSearch(query, excludePatternText, includePatternText, triggeredOnType) {
        let progressComplete;
        this.progressService.withProgress({ location: this.getProgressLocation(), delay: triggeredOnType ? 300 : 0 }, _progress => {
            return new Promise(resolve => progressComplete = resolve);
        });
        this.searchWidget.searchInput.clearMessage();
        this.state = SearchUIState.Searching;
        this.showEmptyStage();
        const slowTimer = setTimeout(() => {
            this.state = SearchUIState.SlowSearch;
        }, 2000);
        const onComplete = (completed) => {
            clearTimeout(slowTimer);
            this.state = SearchUIState.Idle;
            // Complete up to 100% as needed
            progressComplete();
            // Do final render, then expand if just 1 file with less than 50 matches
            this.onSearchResultsChanged();
            const collapseResults = this.searchConfig.collapseResults;
            if (collapseResults !== 'alwaysCollapse' && this.viewModel.searchResult.matches().length === 1) {
                const onlyMatch = this.viewModel.searchResult.matches()[0];
                if (onlyMatch.count() < 50) {
                    this.tree.expand(onlyMatch);
                }
            }
            this.viewModel.replaceString = this.searchWidget.getReplaceValue();
            const hasResults = !this.viewModel.searchResult.isEmpty();
            if (completed?.exit === 1 /* SearchCompletionExitCode.NewSearchStarted */) {
                return;
            }
            if (!hasResults) {
                const hasExcludes = !!excludePatternText;
                const hasIncludes = !!includePatternText;
                let message;
                if (!completed) {
                    message = SEARCH_CANCELLED_MESSAGE;
                }
                else if (this.inputPatternIncludes.onlySearchInOpenEditors()) {
                    if (hasIncludes && hasExcludes) {
                        message = nls.localize('noOpenEditorResultsIncludesExcludes', "No results found in open editors matching '{0}' excluding '{1}' - ", includePatternText, excludePatternText);
                    }
                    else if (hasIncludes) {
                        message = nls.localize('noOpenEditorResultsIncludes', "No results found in open editors matching '{0}' - ", includePatternText);
                    }
                    else if (hasExcludes) {
                        message = nls.localize('noOpenEditorResultsExcludes', "No results found in open editors excluding '{0}' - ", excludePatternText);
                    }
                    else {
                        message = nls.localize('noOpenEditorResultsFound', "No results found in open editors. Review your settings for configured exclusions and check your gitignore files - ");
                    }
                }
                else {
                    if (hasIncludes && hasExcludes) {
                        message = nls.localize('noResultsIncludesExcludes', "No results found in '{0}' excluding '{1}' - ", includePatternText, excludePatternText);
                    }
                    else if (hasIncludes) {
                        message = nls.localize('noResultsIncludes', "No results found in '{0}' - ", includePatternText);
                    }
                    else if (hasExcludes) {
                        message = nls.localize('noResultsExcludes', "No results found excluding '{0}' - ", excludePatternText);
                    }
                    else {
                        message = nls.localize('noResultsFound', "No results found. Review your settings for configured exclusions and check your gitignore files - ");
                    }
                }
                // Indicate as status to ARIA
                aria.status(message);
                const messageEl = this.clearMessage();
                dom.append(messageEl, message);
                if (!completed) {
                    const searchAgainButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('rerunSearch.message', "Search again"), () => this.triggerQueryChange({ preserveFocus: false })));
                    dom.append(messageEl, searchAgainButton.element);
                }
                else if (hasIncludes || hasExcludes) {
                    const searchAgainButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('rerunSearchInAll.message', "Search again in all files"), this.onSearchAgain.bind(this)));
                    dom.append(messageEl, searchAgainButton.element);
                }
                else {
                    const openSettingsButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openSettings.message', "Open Settings"), this.onOpenSettings.bind(this)));
                    dom.append(messageEl, openSettingsButton.element);
                }
                if (completed) {
                    dom.append(messageEl, $('span', undefined, ' - '));
                    const learnMoreButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openSettings.learnMore', "Learn More"), this.onLearnMore.bind(this)));
                    dom.append(messageEl, learnMoreButton.element);
                }
                if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
                    this.showSearchWithoutFolderMessage();
                }
                this.reLayout();
            }
            else {
                this.viewModel.searchResult.toggleHighlights(this.isVisible()); // show highlights
                // Indicate final search result count for ARIA
                aria.status(nls.localize('ariaSearchResultsStatus', "Search returned {0} results in {1} files", this.viewModel.searchResult.count(), this.viewModel.searchResult.fileCount()));
            }
            if (completed && completed.limitHit) {
                completed.messages.push({ type: TextSearchCompleteMessageType.Warning, text: nls.localize('searchMaxResultsWarning', "The result set only contains a subset of all matches. Be more specific in your search to narrow down the results.") });
            }
            if (completed && completed.messages) {
                for (const message of completed.messages) {
                    this.addMessage(message);
                }
            }
            this.reLayout();
        };
        const onError = (e) => {
            clearTimeout(slowTimer);
            this.state = SearchUIState.Idle;
            if (errors.isCancellationError(e)) {
                return onComplete(undefined);
            }
            else {
                progressComplete();
                this.searchWidget.searchInput.showMessage({ content: e.message, type: 3 /* MessageType.ERROR */ });
                this.viewModel.searchResult.clear();
                return Promise.resolve();
            }
        };
        this._visibleMatches = 0;
        // Handle UI updates in an interval to show frequent progress and results
        if (!this._uiRefreshHandle) {
            this._uiRefreshHandle = setInterval(() => {
                if (this.state === SearchUIState.Idle) {
                    window.clearInterval(this._uiRefreshHandle);
                    this._uiRefreshHandle = undefined;
                    return;
                }
                // Search result tree update
                const fileCount = this.viewModel.searchResult.fileCount();
                if (this._visibleMatches !== fileCount) {
                    this._visibleMatches = fileCount;
                    this.refreshAndUpdateCount();
                }
            }, 100);
        }
        this.searchWidget.setReplaceAllActionState(false);
        this.tree.setSelection([]);
        return this.viewModel.search(query)
            .then(onComplete, onError);
    }
    onOpenSettings(e) {
        dom.EventHelper.stop(e, false);
        this.openSettings('@id:files.exclude,search.exclude,search.useParentIgnoreFiles,search.useGlobalIgnoreFiles,search.useIgnoreFiles');
    }
    openSettings(query) {
        const options = { query };
        return this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ ?
            this.preferencesService.openWorkspaceSettings(options) :
            this.preferencesService.openUserSettings(options);
    }
    onLearnMore() {
        this.openerService.open(URI.parse('https://go.microsoft.com/fwlink/?linkid=853977'));
    }
    onSearchAgain() {
        this.inputPatternExcludes.setValue('');
        this.inputPatternIncludes.setValue('');
        this.inputPatternIncludes.setOnlySearchInOpenEditors(false);
        this.triggerQueryChange({ preserveFocus: false });
    }
    onEnableExcludes() {
        this.toggleQueryDetails(false, true);
        this.searchExcludePattern.setUseExcludesAndIgnoreFiles(true);
    }
    onDisableSearchInOpenEditors() {
        this.toggleQueryDetails(false, true);
        this.inputPatternIncludes.setOnlySearchInOpenEditors(false);
    }
    updateSearchResultCount(disregardExcludesAndIgnores, onlyOpenEditors, clear = false) {
        const fileCount = this.viewModel.searchResult.fileCount();
        this.hasSearchResultsKey.set(fileCount > 0);
        const msgWasHidden = this.messagesElement.style.display === 'none';
        const messageEl = this.clearMessage();
        const resultMsg = clear ? '' : this.buildResultCountMessage(this.viewModel.searchResult.count(), fileCount);
        this.tree.ariaLabel = resultMsg + nls.localize('forTerm', " - Search: {0}", this.searchResult.query?.contentPattern.pattern ?? '');
        dom.append(messageEl, resultMsg);
        if (fileCount > 0) {
            if (disregardExcludesAndIgnores) {
                const excludesDisabledMessage = ' - ' + nls.localize('useIgnoresAndExcludesDisabled', "exclude settings and ignore files are disabled") + ' ';
                const enableExcludesButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('excludes.enable', "enable"), this.onEnableExcludes.bind(this), nls.localize('useExcludesAndIgnoreFilesDescription', "Use Exclude Settings and Ignore Files")));
                dom.append(messageEl, $('span', undefined, excludesDisabledMessage, '(', enableExcludesButton.element, ')'));
            }
            if (onlyOpenEditors) {
                const searchingInOpenMessage = ' - ' + nls.localize('onlyOpenEditors', "searching only in open files") + ' ';
                const disableOpenEditorsButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openEditors.disable', "disable"), this.onDisableSearchInOpenEditors.bind(this), nls.localize('disableOpenEditors', "Search in entire workspace")));
                dom.append(messageEl, $('span', undefined, searchingInOpenMessage, '(', disableOpenEditorsButton.element, ')'));
            }
            dom.append(messageEl, ' - ');
            const openInEditorTooltip = appendKeyBindingLabel(nls.localize('openInEditor.tooltip', "Copy current search results to an editor"), this.keybindingService.lookupKeybinding(Constants.OpenInEditorCommandId), this.keybindingService);
            const openInEditorButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openInEditor.message', "Open in editor"), () => this.instantiationService.invokeFunction(createEditorFromSearchResult, this.searchResult, this.searchIncludePattern.getValue(), this.searchExcludePattern.getValue(), this.searchIncludePattern.onlySearchInOpenEditors()), openInEditorTooltip));
            dom.append(messageEl, openInEditorButton.element);
            this.reLayout();
        }
        else if (!msgWasHidden) {
            dom.hide(this.messagesElement);
        }
    }
    addMessage(message) {
        const messageBox = this.messagesElement.firstChild;
        if (!messageBox) {
            return;
        }
        dom.append(messageBox, renderSearchMessage(message, this.instantiationService, this.notificationService, this.openerService, this.commandService, this.messageDisposables, () => this.triggerQueryChange()));
    }
    buildResultCountMessage(resultCount, fileCount) {
        if (resultCount === 1 && fileCount === 1) {
            return nls.localize('search.file.result', "{0} result in {1} file", resultCount, fileCount);
        }
        else if (resultCount === 1) {
            return nls.localize('search.files.result', "{0} result in {1} files", resultCount, fileCount);
        }
        else if (fileCount === 1) {
            return nls.localize('search.file.results', "{0} results in {1} file", resultCount, fileCount);
        }
        else {
            return nls.localize('search.files.results', "{0} results in {1} files", resultCount, fileCount);
        }
    }
    showSearchWithoutFolderMessage() {
        this.searchWithoutFolderMessageElement = this.clearMessage();
        const textEl = dom.append(this.searchWithoutFolderMessageElement, $('p', undefined, nls.localize('searchWithoutFolder', "You have not opened or specified a folder. Only open files are currently searched - ")));
        const openFolderButton = this.messageDisposables.add(new SearchLinkButton(nls.localize('openFolder', "Open Folder"), () => {
            this.commandService.executeCommand(env.isMacintosh && env.isNative ? OpenFileFolderAction.ID : OpenFolderAction.ID).catch(err => errors.onUnexpectedError(err));
        }));
        dom.append(textEl, openFolderButton.element);
    }
    showEmptyStage(forceHideMessages = false) {
        const showingCancelled = (this.messagesElement.firstChild?.textContent?.indexOf(SEARCH_CANCELLED_MESSAGE) ?? -1) > -1;
        // clean up ui
        // this.replaceService.disposeAllReplacePreviews();
        if (showingCancelled || forceHideMessages || !this.configurationService.getValue().search.searchOnType) {
            // when in search to type, don't preemptively hide, as it causes flickering and shifting of the live results
            dom.hide(this.messagesElement);
        }
        dom.show(this.resultsElement);
        this.currentSelectedFileMatch = undefined;
    }
    onFocus(lineMatch, preserveFocus, sideBySide, pinned) {
        const useReplacePreview = this.configurationService.getValue().search.useReplacePreview;
        return (useReplacePreview && this.viewModel.isReplaceActive() && !!this.viewModel.replaceString) ?
            this.replaceService.openReplacePreview(lineMatch, preserveFocus, sideBySide, pinned) :
            this.open(lineMatch, preserveFocus, sideBySide, pinned);
    }
    async open(element, preserveFocus, sideBySide, pinned) {
        const selection = this.getSelectionFrom(element);
        const resource = element instanceof Match ? element.parent().resource : element.resource;
        let editor;
        try {
            editor = await this.editorService.openEditor({
                resource: resource,
                options: {
                    preserveFocus,
                    pinned,
                    selection,
                    revealIfVisible: true
                }
            }, sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
            const editorControl = editor?.getControl();
            if (element instanceof Match && preserveFocus && isCodeEditor(editorControl)) {
                this.viewModel.searchResult.rangeHighlightDecorations.highlightRange(editorControl.getModel(), element.range());
            }
            else {
                this.viewModel.searchResult.rangeHighlightDecorations.removeHighlightRange();
            }
        }
        catch (err) {
            errors.onUnexpectedError(err);
            return;
        }
        if (editor instanceof NotebookEditor) {
            const controller = editor.getControl()?.getContribution(NotebookFindContrib.id);
            const matchIndex = element instanceof Match ? element.parent().matches().findIndex(e => e.id() === element.id()) : undefined;
            controller?.show(this.searchWidget.searchInput.getValue(), { matchIndex, focus: false });
        }
    }
    openEditorWithMultiCursor(element) {
        const resource = element instanceof Match ? element.parent().resource : element.resource;
        return this.editorService.openEditor({
            resource: resource,
            options: {
                preserveFocus: false,
                pinned: true,
                revealIfVisible: true
            }
        }).then(editor => {
            if (editor) {
                let fileMatch = null;
                if (element instanceof FileMatch) {
                    fileMatch = element;
                }
                else if (element instanceof Match) {
                    fileMatch = element.parent();
                }
                if (fileMatch) {
                    const selections = fileMatch.matches().map(m => new Selection(m.range().startLineNumber, m.range().startColumn, m.range().endLineNumber, m.range().endColumn));
                    const codeEditor = getCodeEditor(editor.getControl());
                    if (codeEditor) {
                        const multiCursorController = MultiCursorSelectionController.get(codeEditor);
                        multiCursorController?.selectAllUsingSelections(selections);
                    }
                }
            }
            this.viewModel.searchResult.rangeHighlightDecorations.removeHighlightRange();
        }, errors.onUnexpectedError);
    }
    getSelectionFrom(element) {
        let match = null;
        if (element instanceof Match) {
            match = element;
        }
        if (element instanceof FileMatch && element.count() > 0) {
            match = element.matches()[element.matches().length - 1];
        }
        if (match) {
            const range = match.range();
            if (this.viewModel.isReplaceActive() && !!this.viewModel.replaceString) {
                const replaceString = match.replaceString;
                return {
                    startLineNumber: range.startLineNumber,
                    startColumn: range.startColumn,
                    endLineNumber: range.startLineNumber,
                    endColumn: range.startColumn + replaceString.length
                };
            }
            return range;
        }
        return undefined;
    }
    onUntitledDidDispose(resource) {
        if (!this.viewModel) {
            return;
        }
        // remove search results from this resource as it got disposed
        const matches = this.viewModel.searchResult.matches();
        for (let i = 0, len = matches.length; i < len; i++) {
            if (resource.toString() === matches[i].resource.toString()) {
                this.viewModel.searchResult.remove(matches[i]);
            }
        }
    }
    onFilesChanged(e) {
        if (!this.viewModel || (this.searchConfig.sortOrder !== "modified" /* SearchSortOrder.Modified */ && !e.gotDeleted())) {
            return;
        }
        const matches = this.viewModel.searchResult.matches();
        if (e.gotDeleted()) {
            const deletedMatches = matches.filter(m => e.contains(m.resource, 2 /* FileChangeType.DELETED */));
            this.viewModel.searchResult.remove(deletedMatches);
        }
        else {
            // Check if the changed file contained matches
            const changedMatches = matches.filter(m => e.contains(m.resource));
            if (changedMatches.length && this.searchConfig.sortOrder === "modified" /* SearchSortOrder.Modified */) {
                // No matches need to be removed, but modified files need to have their file stat updated.
                this.updateFileStats(changedMatches).then(() => this.refreshTree());
            }
        }
    }
    get searchConfig() {
        return this.configurationService.getValue('search');
    }
    clearHistory() {
        this.searchWidget.clearHistory();
        this.inputPatternExcludes.clearHistory();
        this.inputPatternIncludes.clearHistory();
    }
    saveState() {
        const isRegex = this.searchWidget.searchInput.getRegex();
        const isWholeWords = this.searchWidget.searchInput.getWholeWords();
        const isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
        const contentPattern = this.searchWidget.searchInput.getValue();
        const patternExcludes = this.inputPatternExcludes.getValue().trim();
        const patternIncludes = this.inputPatternIncludes.getValue().trim();
        const onlyOpenEditors = this.inputPatternIncludes.onlySearchInOpenEditors();
        const useExcludesAndIgnoreFiles = this.inputPatternExcludes.useExcludesAndIgnoreFiles();
        const preserveCase = this.viewModel.preserveCase;
        this.viewletState['query.contentPattern'] = contentPattern;
        this.viewletState['query.regex'] = isRegex;
        this.viewletState['query.wholeWords'] = isWholeWords;
        this.viewletState['query.caseSensitive'] = isCaseSensitive;
        this.viewletState['query.folderExclusions'] = patternExcludes;
        this.viewletState['query.folderIncludes'] = patternIncludes;
        this.viewletState['query.useExcludesAndIgnoreFiles'] = useExcludesAndIgnoreFiles;
        this.viewletState['query.preserveCase'] = preserveCase;
        this.viewletState['query.onlyOpenEditors'] = onlyOpenEditors;
        const isReplaceShown = this.searchAndReplaceWidget.isReplaceShown();
        this.viewletState['view.showReplace'] = isReplaceShown;
        this.viewletState['view.treeLayout'] = this.isTreeLayoutViewVisible;
        this.viewletState['query.replaceText'] = isReplaceShown && this.searchWidget.getReplaceValue();
        const history = Object.create(null);
        const searchHistory = this.searchWidget.getSearchHistory();
        if (searchHistory && searchHistory.length) {
            history.search = searchHistory;
        }
        const replaceHistory = this.searchWidget.getReplaceHistory();
        if (replaceHistory && replaceHistory.length) {
            history.replace = replaceHistory;
        }
        const patternExcludesHistory = this.inputPatternExcludes.getHistory();
        if (patternExcludesHistory && patternExcludesHistory.length) {
            history.exclude = patternExcludesHistory;
        }
        const patternIncludesHistory = this.inputPatternIncludes.getHistory();
        if (patternIncludesHistory && patternIncludesHistory.length) {
            history.include = patternIncludesHistory;
        }
        this.searchHistoryService.save(history);
        this.memento.saveMemento();
        super.saveState();
    }
    async retrieveFileStats() {
        const files = this.searchResult.matches().filter(f => !f.fileStat).map(f => f.resolveFileStat(this.fileService));
        await Promise.all(files);
    }
    async updateFileStats(elements) {
        const files = elements.map(f => f.resolveFileStat(this.fileService));
        await Promise.all(files);
    }
    removeFileStats() {
        for (const fileMatch of this.searchResult.matches()) {
            fileMatch.fileStat = undefined;
        }
    }
    dispose() {
        this.isDisposed = true;
        this.saveState();
        super.dispose();
    }
};
SearchView = __decorate([
    __param(1, IFileService),
    __param(2, IEditorService),
    __param(3, ICodeEditorService),
    __param(4, IProgressService),
    __param(5, INotificationService),
    __param(6, IDialogService),
    __param(7, ICommandService),
    __param(8, IContextViewService),
    __param(9, IInstantiationService),
    __param(10, IViewDescriptorService),
    __param(11, IConfigurationService),
    __param(12, IWorkspaceContextService),
    __param(13, ISearchWorkbenchService),
    __param(14, IContextKeyService),
    __param(15, IReplaceService),
    __param(16, ITextFileService),
    __param(17, IPreferencesService),
    __param(18, IThemeService),
    __param(19, ISearchHistoryService),
    __param(20, IContextMenuService),
    __param(21, IAccessibilityService),
    __param(22, IKeybindingService),
    __param(23, IStorageService),
    __param(24, IOpenerService),
    __param(25, ITelemetryService)
], SearchView);
export { SearchView };
registerThemingParticipant((theme, collector) => {
    const matchHighlightColor = theme.getColor(editorFindMatchHighlight);
    if (matchHighlightColor) {
        collector.addRule(`.monaco-workbench .search-view .findInFileMatch { background-color: ${matchHighlightColor}; }`);
    }
    const diffInsertedColor = theme.getColor(diffInserted);
    if (diffInsertedColor) {
        collector.addRule(`.monaco-workbench .search-view .replaceMatch { background-color: ${diffInsertedColor}; }`);
    }
    const diffRemovedColor = theme.getColor(diffRemoved);
    if (diffRemovedColor) {
        collector.addRule(`.monaco-workbench .search-view .replace.findInFileMatch { background-color: ${diffRemovedColor}; }`);
    }
    const diffInsertedOutlineColor = theme.getColor(diffInsertedOutline);
    if (diffInsertedOutlineColor) {
        collector.addRule(`.monaco-workbench .search-view .replaceMatch:not(:empty) { border: 1px ${isHighContrast(theme.type) ? 'dashed' : 'solid'} ${diffInsertedOutlineColor}; }`);
    }
    const diffRemovedOutlineColor = theme.getColor(diffRemovedOutline);
    if (diffRemovedOutlineColor) {
        collector.addRule(`.monaco-workbench .search-view .replace.findInFileMatch { border: 1px ${isHighContrast(theme.type) ? 'dashed' : 'solid'} ${diffRemovedOutlineColor}; }`);
    }
    const findMatchHighlightBorder = theme.getColor(editorFindMatchHighlightBorder);
    if (findMatchHighlightBorder) {
        collector.addRule(`.monaco-workbench .search-view .findInFileMatch { border: 1px ${isHighContrast(theme.type) ? 'dashed' : 'solid'} ${findMatchHighlightBorder}; }`);
    }
    const outlineSelectionColor = theme.getColor(listActiveSelectionForeground);
    if (outlineSelectionColor) {
        collector.addRule(`.monaco-workbench .search-view .monaco-list.element-focused .monaco-list-row.focused.selected:not(.highlighted) .action-label:focus { outline-color: ${outlineSelectionColor} }`);
    }
    if (theme.type === 'dark') {
        const foregroundColor = theme.getColor(foreground);
        if (foregroundColor) {
            const fgWithOpacity = new Color(new RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.65));
            collector.addRule(`.search-view .message { color: ${fgWithOpacity}; }`);
        }
    }
    const link = theme.getColor(textLinkForeground);
    if (link) {
        collector.addRule(`.monaco-workbench .search-view .message a { color: ${link}; }`);
    }
    const activeLink = theme.getColor(textLinkActiveForeground);
    if (activeLink) {
        collector.addRule(`.monaco-workbench .search-view .message a:hover,
			.monaco-workbench .search-view .message a:active { color: ${activeLink}; }`);
    }
    const toolbarHoverColor = theme.getColor(toolbarHoverBackground);
    if (toolbarHoverColor) {
        collector.addRule(`.monaco-workbench .search-view .search-widget .toggle-replace-button:hover { background-color: ${toolbarHoverColor} }`);
    }
    const toolbarActiveColor = theme.getColor(toolbarActiveBackground);
    if (toolbarActiveColor) {
        collector.addRule(`.monaco-workbench .search-view .search-widget .toggle-replace-button:active { background-color: ${toolbarActiveColor} }`);
    }
});
class SearchLinkButton extends Disposable {
    element;
    constructor(label, handler, tooltip) {
        super();
        this.element = $('a.pointer', { tabindex: 0, title: tooltip }, label);
        this.addEventHandlers(handler);
    }
    addEventHandlers(handler) {
        const wrappedHandler = (e) => {
            dom.EventHelper.stop(e, false);
            handler(e);
        };
        this._register(dom.addDisposableListener(this.element, dom.EventType.CLICK, wrappedHandler));
        this._register(dom.addDisposableListener(this.element, dom.EventType.KEY_DOWN, e => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                wrappedHandler(e);
                event.preventDefault();
                event.stopPropagation();
            }
        }));
    }
}
