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
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { Button } from 'vs/base/browser/ui/button/button';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { DefaultKeyboardNavigationDelegate } from 'vs/base/browser/ui/list/listWidget';
import { AbstractTreeViewState } from 'vs/base/browser/ui/tree/abstractTree';
import { Action, ActionRunner, Separator } from 'vs/base/common/actions';
import { disposableTimeout, RunOnceScheduler } from 'vs/base/common/async';
import { Color, RGBA } from 'vs/base/common/color';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, dispose, MutableDisposable } from 'vs/base/common/lifecycle';
import { fuzzyContains } from 'vs/base/common/strings';
import { isDefined } from 'vs/base/common/types';
import 'vs/css!./media/testing';
import { MarkdownRenderer } from 'vs/editor/contrib/markdownRenderer/browser/markdownRenderer';
import { localize } from 'vs/nls';
import { DropdownWithPrimaryActionViewItem } from 'vs/platform/actions/browser/dropdownWithPrimaryActionViewItem';
import { createAndFillInActionBarActions, MenuEntryActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IMenuService, MenuId, MenuItemAction } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { WorkbenchObjectTree } from 'vs/platform/list/browser/listService';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { UnmanagedProgress } from 'vs/platform/progress/common/progress';
import { IStorageService, WillSaveStateReason } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { defaultButtonStyles } from 'vs/platform/theme/browser/defaultStyles';
import { foreground } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService, registerThemingParticipant, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { DiffEditorInput } from 'vs/workbench/common/editor/diffEditorInput';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { HierarchicalByLocationProjection } from 'vs/workbench/contrib/testing/browser/explorerProjections/hierarchalByLocation';
import { ByNameTestItemElement, HierarchicalByNameProjection } from 'vs/workbench/contrib/testing/browser/explorerProjections/hierarchalByName';
import { TestItemTreeElement, TestTreeErrorMessage } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import { getTestItemContextOverlay } from 'vs/workbench/contrib/testing/browser/explorerProjections/testItemContextOverlay';
import * as icons from 'vs/workbench/contrib/testing/browser/icons';
import { TestingExplorerFilter } from 'vs/workbench/contrib/testing/browser/testingExplorerFilter';
import { ITestingProgressUiService } from 'vs/workbench/contrib/testing/browser/testingProgressUiService';
import { getTestingConfiguration } from 'vs/workbench/contrib/testing/common/configuration';
import { labelForTestInState } from 'vs/workbench/contrib/testing/common/constants';
import { StoredValue } from 'vs/workbench/contrib/testing/common/storedValue';
import { ITestExplorerFilterState } from 'vs/workbench/contrib/testing/common/testExplorerFilterState';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
import { TestingContextKeys } from 'vs/workbench/contrib/testing/common/testingContextKeys';
import { ITestingPeekOpener } from 'vs/workbench/contrib/testing/common/testingPeekOpener';
import { cmpPriority, isFailedState, isStateWithResult } from 'vs/workbench/contrib/testing/common/testingStates';
import { canUseProfileWithTest, ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestService, testCollectionIsEmpty } from 'vs/workbench/contrib/testing/common/testService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
var LastFocusState;
(function (LastFocusState) {
    LastFocusState[LastFocusState["Input"] = 0] = "Input";
    LastFocusState[LastFocusState["Tree"] = 1] = "Tree";
})(LastFocusState || (LastFocusState = {}));
let TestingExplorerView = class TestingExplorerView extends ViewPane {
    testService;
    testProgressService;
    testProfileService;
    commandService;
    viewModel;
    filterActionBar = this._register(new MutableDisposable());
    container;
    treeHeader;
    discoveryProgress = this._register(new MutableDisposable());
    filter = this._register(new MutableDisposable());
    filterFocusListener = this._register(new MutableDisposable());
    dimensions = { width: 0, height: 0 };
    lastFocusState = 0 /* LastFocusState.Input */;
    constructor(options, contextMenuService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, testService, telemetryService, testProgressService, testProfileService, commandService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        this.testService = testService;
        this.testProgressService = testProgressService;
        this.testProfileService = testProfileService;
        this.commandService = commandService;
        const relayout = this._register(new RunOnceScheduler(() => this.layoutBody(), 1));
        this._register(this.onDidChangeViewWelcomeState(() => {
            if (!this.shouldShowWelcome()) {
                relayout.schedule();
            }
        }));
        this._register(testService.collection.onBusyProvidersChange(busy => {
            this.updateDiscoveryProgress(busy);
        }));
        this._register(testProfileService.onDidChange(() => this.updateActions()));
    }
    shouldShowWelcome() {
        return this.viewModel?.welcomeExperience === 1 /* WelcomeExperience.ForWorkspace */ ?? true;
    }
    focus() {
        super.focus();
        if (this.lastFocusState === 1 /* LastFocusState.Tree */) {
            this.viewModel.tree.domFocus();
        }
        else {
            this.filter.value?.focus();
        }
    }
    getSelectedOrVisibleItems(profile) {
        const projection = this.viewModel.projection.value;
        if (!projection) {
            return { include: [], exclude: [] };
        }
        if (projection instanceof ByNameTestItemElement) {
            return {
                include: [...this.testService.collection.rootItems],
                exclude: [],
            };
        }
        // To calculate includes and excludes, we include the first children that
        // have a majority of their items included too, and then apply exclusions.
        const include = [];
        const exclude = [];
        const attempt = (element, alreadyIncluded) => {
            // sanity check hasElement since updates are debounced and they may exist
            // but not be rendered yet
            if (!(element instanceof TestItemTreeElement) || !this.viewModel.tree.hasElement(element)) {
                return;
            }
            // If the current node is not visible or runnable in the current profile, it's excluded
            const inTree = this.viewModel.tree.getNode(element);
            if (!inTree.visible) {
                if (alreadyIncluded) {
                    exclude.push(element.test);
                }
                return;
            }
            // If it's not already included but most of its children are, then add it
            // if it can be run under the current profile (when specified)
            if (
            // If it's not already included...
            !alreadyIncluded
                // And it can be run using the current profile (if any)
                && (!profile || canUseProfileWithTest(profile, element.test))
                // And either it's a leaf node or most children are included, the  include it.
                && (inTree.children.length === 0 || inTree.visibleChildrenCount * 2 >= inTree.children.length)
                // And not if we're only showing a single of its children, since it
                // probably fans out later. (Worse case we'll directly include its single child)
                && inTree.visibleChildrenCount !== 1) {
                include.push(element.test);
                alreadyIncluded = true;
            }
            // Recurse ✨
            for (const child of element.children) {
                attempt(child, alreadyIncluded);
            }
        };
        for (const root of this.testService.collection.rootItems) {
            const element = projection.getElementByTestId(root.item.extId);
            if (!element) {
                continue;
            }
            if (profile && !canUseProfileWithTest(profile, root)) {
                continue;
            }
            // single controllers won't have visible root ID nodes, handle that  case specially
            if (!this.viewModel.tree.hasElement(element)) {
                const visibleChildren = [...element.children].reduce((acc, c) => this.viewModel.tree.hasElement(c) && this.viewModel.tree.getNode(c).visible ? acc + 1 : acc, 0);
                // note we intentionally check children > 0 here, unlike above, since
                // we don't want to bother dispatching to controllers who have no discovered tests
                if (element.children.size > 0 && visibleChildren * 2 >= element.children.size) {
                    include.push(element.test);
                    element.children.forEach(c => attempt(c, true));
                }
                else {
                    element.children.forEach(c => attempt(c, false));
                }
            }
            else {
                attempt(element, false);
            }
        }
        return { include, exclude };
    }
    /**
     * @override
     */
    renderBody(container) {
        super.renderBody(container);
        this.container = dom.append(container, dom.$('.test-explorer'));
        this.treeHeader = dom.append(this.container, dom.$('.test-explorer-header'));
        this.filterActionBar.value = this.createFilterActionBar();
        const messagesContainer = dom.append(this.treeHeader, dom.$('.test-explorer-messages'));
        this._register(this.testProgressService.onTextChange(text => {
            const hadText = !!messagesContainer.innerText;
            const hasText = !!text;
            messagesContainer.innerText = text;
            if (hadText !== hasText) {
                this.layoutBody();
            }
        }));
        const listContainer = dom.append(this.container, dom.$('.test-explorer-tree'));
        this.viewModel = this.instantiationService.createInstance(TestingExplorerViewModel, listContainer, this.onDidChangeBodyVisibility);
        this._register(this.viewModel.tree.onDidFocus(() => this.lastFocusState = 1 /* LastFocusState.Tree */));
        this._register(this.viewModel.onChangeWelcomeVisibility(() => this._onDidChangeViewWelcomeState.fire()));
        this._register(this.viewModel);
        this._onDidChangeViewWelcomeState.fire();
    }
    /** @override  */
    getActionViewItem(action) {
        switch (action.id) {
            case "workbench.actions.treeView.testExplorer.filter" /* TestCommandId.FilterAction */:
                this.filter.value = this.instantiationService.createInstance(TestingExplorerFilter, action);
                this.filterFocusListener.value = this.filter.value.onDidFocus(() => this.lastFocusState = 0 /* LastFocusState.Input */);
                return this.filter.value;
            case "testing.runSelected" /* TestCommandId.RunSelectedAction */:
                return this.getRunGroupDropdown(2 /* TestRunProfileBitset.Run */, action);
            case "testing.debugSelected" /* TestCommandId.DebugSelectedAction */:
                return this.getRunGroupDropdown(4 /* TestRunProfileBitset.Debug */, action);
            default:
                return super.getActionViewItem(action);
        }
    }
    /** @inheritdoc */
    getTestConfigGroupActions(group) {
        const profileActions = [];
        let participatingGroups = 0;
        let hasConfigurable = false;
        const defaults = this.testProfileService.getGroupDefaultProfiles(group);
        for (const { profiles, controller } of this.testProfileService.all()) {
            let hasAdded = false;
            for (const profile of profiles) {
                if (profile.group !== group) {
                    continue;
                }
                if (!hasAdded) {
                    hasAdded = true;
                    participatingGroups++;
                    profileActions.push(new Action(`${controller.id}.$root`, controller.label.value, undefined, false));
                }
                hasConfigurable = hasConfigurable || profile.hasConfigurationHandler;
                profileActions.push(new Action(`${controller.id}.${profile.profileId}`, defaults.includes(profile) ? localize('defaultTestProfile', '{0} (Default)', profile.label) : profile.label, undefined, undefined, () => {
                    const { include, exclude } = this.getSelectedOrVisibleItems(profile);
                    this.testService.runResolvedTests({
                        exclude: exclude.map(e => e.item.extId),
                        targets: [{
                                profileGroup: profile.group,
                                profileId: profile.profileId,
                                controllerId: profile.controllerId,
                                testIds: include.map(i => i.item.extId),
                            }]
                    });
                }));
            }
        }
        // If there's only one group, don't add a heading for it in the dropdown.
        if (participatingGroups === 1) {
            profileActions.shift();
        }
        const postActions = [];
        if (profileActions.length > 1) {
            postActions.push(new Action('selectDefaultTestConfigurations', localize('selectDefaultConfigs', 'Select Default Profile'), undefined, undefined, () => this.commandService.executeCommand("testing.selectDefaultTestProfiles" /* TestCommandId.SelectDefaultTestProfiles */, group)));
        }
        if (hasConfigurable) {
            postActions.push(new Action('configureTestProfiles', localize('configureTestProfiles', 'Configure Test Profiles'), undefined, undefined, () => this.commandService.executeCommand("testing.configureProfile" /* TestCommandId.ConfigureTestProfilesAction */, group)));
        }
        return Separator.join(profileActions, postActions);
    }
    /**
     * @override
     */
    saveState() {
        this.filter.value?.saveState();
        super.saveState();
    }
    getRunGroupDropdown(group, defaultAction) {
        const dropdownActions = this.getTestConfigGroupActions(group);
        if (dropdownActions.length < 2) {
            return super.getActionViewItem(defaultAction);
        }
        const primaryAction = this.instantiationService.createInstance(MenuItemAction, {
            id: defaultAction.id,
            title: defaultAction.label,
            icon: group === 2 /* TestRunProfileBitset.Run */
                ? icons.testingRunAllIcon
                : icons.testingDebugAllIcon,
        }, undefined, undefined, undefined);
        const dropdownAction = new Action('selectRunConfig', 'Select Configuration...', 'codicon-chevron-down', true);
        return this.instantiationService.createInstance(DropdownWithPrimaryActionViewItem, primaryAction, dropdownAction, dropdownActions, '', this.contextMenuService, {});
    }
    createFilterActionBar() {
        const bar = new ActionBar(this.treeHeader, {
            actionViewItemProvider: action => this.getActionViewItem(action),
            triggerKeys: { keyDown: false, keys: [] },
        });
        bar.push(new Action("workbench.actions.treeView.testExplorer.filter" /* TestCommandId.FilterAction */));
        bar.getContainer().classList.add('testing-filter-action-bar');
        return bar;
    }
    updateDiscoveryProgress(busy) {
        if (!busy && this.discoveryProgress) {
            this.discoveryProgress.clear();
        }
        else if (busy && !this.discoveryProgress.value) {
            this.discoveryProgress.value = this.instantiationService.createInstance(UnmanagedProgress, { location: this.getProgressLocation() });
        }
    }
    /**
     * @override
     */
    layoutBody(height = this.dimensions.height, width = this.dimensions.width) {
        super.layoutBody(height, width);
        this.dimensions.height = height;
        this.dimensions.width = width;
        this.container.style.height = `${height}px`;
        this.viewModel.layout(height - this.treeHeader.clientHeight, width);
        this.filter.value?.layout(width);
    }
};
TestingExplorerView = __decorate([
    __param(1, IContextMenuService),
    __param(2, IKeybindingService),
    __param(3, IConfigurationService),
    __param(4, IInstantiationService),
    __param(5, IViewDescriptorService),
    __param(6, IContextKeyService),
    __param(7, IOpenerService),
    __param(8, IThemeService),
    __param(9, ITestService),
    __param(10, ITelemetryService),
    __param(11, ITestingProgressUiService),
    __param(12, ITestProfileService),
    __param(13, ICommandService)
], TestingExplorerView);
export { TestingExplorerView };
var WelcomeExperience;
(function (WelcomeExperience) {
    WelcomeExperience[WelcomeExperience["None"] = 0] = "None";
    WelcomeExperience[WelcomeExperience["ForWorkspace"] = 1] = "ForWorkspace";
    WelcomeExperience[WelcomeExperience["ForDocument"] = 2] = "ForDocument";
})(WelcomeExperience || (WelcomeExperience = {}));
let TestingExplorerViewModel = class TestingExplorerViewModel extends Disposable {
    menuService;
    contextMenuService;
    testService;
    filterState;
    instantiationService;
    storageService;
    contextKeyService;
    testResults;
    peekOpener;
    testProfileService;
    tree;
    filter;
    projection = this._register(new MutableDisposable());
    revealTimeout = new MutableDisposable();
    _viewMode = TestingContextKeys.viewMode.bindTo(this.contextKeyService);
    _viewSorting = TestingContextKeys.viewSorting.bindTo(this.contextKeyService);
    welcomeVisibilityEmitter = new Emitter();
    actionRunner = new TestExplorerActionRunner(() => this.tree.getSelection().filter(isDefined));
    lastViewState = new StoredValue({
        key: 'testing.treeState',
        scope: 1 /* StorageScope.WORKSPACE */,
        target: 1 /* StorageTarget.MACHINE */,
    }, this.storageService);
    noTestForDocumentWidget;
    /**
     * Whether there's a reveal request which has not yet been delivered. This
     * can happen if the user asks to reveal before the test tree is loaded.
     * We check to see if the reveal request is present on each tree update,
     * and do it then if so.
     */
    hasPendingReveal = false;
    /**
     * Fires when the visibility of the placeholder state changes.
     */
    onChangeWelcomeVisibility = this.welcomeVisibilityEmitter.event;
    /**
     * Gets whether the welcome should be visible.
     */
    welcomeExperience = 0 /* WelcomeExperience.None */;
    get viewMode() {
        return this._viewMode.get() ?? "true" /* TestExplorerViewMode.Tree */;
    }
    set viewMode(newMode) {
        if (newMode === this._viewMode.get()) {
            return;
        }
        this._viewMode.set(newMode);
        this.updatePreferredProjection();
        this.storageService.store('testing.viewMode', newMode, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
    }
    get viewSorting() {
        return this._viewSorting.get() ?? "status" /* TestExplorerViewSorting.ByStatus */;
    }
    set viewSorting(newSorting) {
        if (newSorting === this._viewSorting.get()) {
            return;
        }
        this._viewSorting.set(newSorting);
        this.tree.resort(null);
        this.storageService.store('testing.viewSorting', newSorting, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
    }
    constructor(listContainer, onDidChangeVisibility, configurationService, editorService, menuService, contextMenuService, testService, filterState, instantiationService, storageService, contextKeyService, testResults, peekOpener, testProfileService) {
        super();
        this.menuService = menuService;
        this.contextMenuService = contextMenuService;
        this.testService = testService;
        this.filterState = filterState;
        this.instantiationService = instantiationService;
        this.storageService = storageService;
        this.contextKeyService = contextKeyService;
        this.testResults = testResults;
        this.peekOpener = peekOpener;
        this.testProfileService = testProfileService;
        this.hasPendingReveal = !!filterState.reveal.value;
        this.noTestForDocumentWidget = this._register(instantiationService.createInstance(NoTestsForDocumentWidget, listContainer));
        this._viewMode.set(this.storageService.get('testing.viewMode', 1 /* StorageScope.WORKSPACE */, "true" /* TestExplorerViewMode.Tree */));
        this._viewSorting.set(this.storageService.get('testing.viewSorting', 1 /* StorageScope.WORKSPACE */, "location" /* TestExplorerViewSorting.ByLocation */));
        this.reevaluateWelcomeState();
        this.filter = this.instantiationService.createInstance(TestsFilter, testService.collection);
        this.tree = instantiationService.createInstance(WorkbenchObjectTree, 'Test Explorer List', listContainer, new ListDelegate(), [
            instantiationService.createInstance(TestItemRenderer, this.actionRunner),
            instantiationService.createInstance(ErrorRenderer),
        ], {
            identityProvider: instantiationService.createInstance(IdentityProvider),
            hideTwistiesOfChildlessElements: false,
            sorter: instantiationService.createInstance(TreeSorter, this),
            keyboardNavigationLabelProvider: instantiationService.createInstance(TreeKeyboardNavigationLabelProvider),
            accessibilityProvider: instantiationService.createInstance(ListAccessibilityProvider),
            filter: this.filter,
            findWidgetEnabled: false
        });
        this._register(this.tree.onDidChangeCollapseState(evt => {
            if (evt.node.element instanceof TestItemTreeElement) {
                this.projection.value?.expandElement(evt.node.element, evt.deep ? Infinity : 0);
            }
        }));
        this._register(onDidChangeVisibility(visible => {
            if (visible) {
                this.ensureProjection();
            }
        }));
        this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
        this._register(Event.any(filterState.text.onDidChange, filterState.fuzzy.onDidChange, testService.excluded.onTestExclusionsChanged)(this.tree.refilter, this.tree));
        this._register(this.tree);
        this._register(this.onChangeWelcomeVisibility(e => {
            this.noTestForDocumentWidget.setVisible(e === 2 /* WelcomeExperience.ForDocument */);
        }));
        this._register(dom.addStandardDisposableListener(this.tree.getHTMLElement(), 'keydown', evt => {
            if (evt.equals(3 /* KeyCode.Enter */)) {
                this.handleExecuteKeypress(evt);
            }
            else if (DefaultKeyboardNavigationDelegate.mightProducePrintableCharacter(evt)) {
                filterState.text.value = evt.browserEvent.key;
                filterState.focusInput();
            }
        }));
        this._register(filterState.reveal.onDidChange(id => this.revealById(id, undefined, false)));
        this._register(onDidChangeVisibility(visible => {
            if (visible) {
                filterState.focusInput();
            }
        }));
        this._register(this.tree.onDidChangeSelection(evt => {
            if (evt.browserEvent instanceof MouseEvent && (evt.browserEvent.altKey || evt.browserEvent.shiftKey)) {
                return; // don't focus when alt-clicking to multi select
            }
            const selected = evt.elements[0];
            if (selected && evt.browserEvent && selected instanceof TestItemTreeElement
                && selected.children.size === 0 && selected.test.expand === 0 /* TestItemExpandState.NotExpandable */) {
                this.tryPeekError(selected);
            }
        }));
        let followRunningTests = getTestingConfiguration(configurationService, "testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */);
        this._register(configurationService.onDidChangeConfiguration(() => {
            followRunningTests = getTestingConfiguration(configurationService, "testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */);
        }));
        let alwaysRevealTestAfterStateChange = getTestingConfiguration(configurationService, "testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */);
        this._register(configurationService.onDidChangeConfiguration(() => {
            alwaysRevealTestAfterStateChange = getTestingConfiguration(configurationService, "testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */);
        }));
        this._register(testResults.onTestChanged(evt => {
            if (!followRunningTests) {
                return;
            }
            if (evt.reason !== 1 /* TestResultItemChangeReason.OwnStateChange */) {
                return;
            }
            // follow running tests, or tests whose state changed. Tests that
            // complete very fast may not enter the running state at all.
            if (evt.item.ownComputedState !== 2 /* TestResultState.Running */ && !(evt.previousState === 1 /* TestResultState.Queued */ && isStateWithResult(evt.item.ownComputedState))) {
                return;
            }
            this.revealById(evt.item.item.extId, alwaysRevealTestAfterStateChange, false);
        }));
        this._register(testResults.onResultsChanged(() => {
            this.tree.resort(null);
        }));
        this._register(this.testProfileService.onDidChange(() => {
            this.tree.rerender();
        }));
        const onEditorChange = () => {
            if (editorService.activeEditor instanceof DiffEditorInput) {
                this.filter.filterToDocumentUri(editorService.activeEditor.primary.resource);
            }
            else {
                this.filter.filterToDocumentUri(editorService.activeEditor?.resource);
            }
            if (this.filterState.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */)) {
                this.tree.refilter();
            }
        };
        this._register(editorService.onDidActiveEditorChange(onEditorChange));
        this._register(this.storageService.onWillSaveState(({ reason }) => {
            if (reason === WillSaveStateReason.SHUTDOWN) {
                this.lastViewState.store(this.tree.getViewState({
                    getId: e => e instanceof TestItemTreeElement ? e.test.item.extId : '',
                }));
            }
        }));
        onEditorChange();
    }
    /**
     * Re-layout the tree.
     */
    layout(height, width) {
        this.tree.layout(height, width);
    }
    /**
     * Tries to reveal by extension ID. Queues the request if the extension
     * ID is not currently available.
     */
    revealById(id, expand = true, focus = true) {
        if (!id) {
            this.hasPendingReveal = false;
            return;
        }
        const projection = this.ensureProjection();
        // If the item itself is visible in the tree, show it. Otherwise, expand
        // its closest parent.
        let expandToLevel = 0;
        const idPath = [...TestId.fromString(id).idsFromRoot()];
        for (let i = idPath.length - 1; i >= expandToLevel; i--) {
            const element = projection.getElementByTestId(idPath[i].toString());
            // Skip all elements that aren't in the tree.
            if (!element || !this.tree.hasElement(element)) {
                continue;
            }
            // If this 'if' is true, we're at the closest-visible parent to the node
            // we want to expand. Expand that, and then start the loop again because
            // we might already have children for it.
            if (i < idPath.length - 1) {
                if (expand) {
                    this.tree.expand(element);
                    expandToLevel = i + 1; // avoid an infinite loop if the test does not exist
                    i = idPath.length - 1; // restart the loop since new children may now be visible
                    continue;
                }
            }
            // Otherwise, we've arrived!
            // If the node or any of its children are excluded, flip on the 'show
            // excluded tests' checkbox automatically. If we didn't expand, then set
            // target focus target to the first collapsed element.
            let focusTarget = element;
            for (let n = element; n instanceof TestItemTreeElement; n = n.parent) {
                if (n.test && this.testService.excluded.contains(n.test)) {
                    this.filterState.toggleFilteringFor("@hidden" /* TestFilterTerm.Hidden */, true);
                    break;
                }
                if (!expand && (this.tree.hasElement(n) && this.tree.isCollapsed(n))) {
                    focusTarget = n;
                }
            }
            this.filterState.reveal.value = undefined;
            this.hasPendingReveal = false;
            if (focus) {
                this.tree.domFocus();
            }
            if (this.tree.getRelativeTop(focusTarget) === null) {
                this.tree.reveal(focusTarget, 0.5);
            }
            this.revealTimeout.value = disposableTimeout(() => {
                this.tree.setFocus([focusTarget]);
                this.tree.setSelection([focusTarget]);
            }, 1);
            return;
        }
        // If here, we've expanded all parents we can. Waiting on data to come
        // in to possibly show the revealed test.
        this.hasPendingReveal = true;
    }
    /**
     * Collapse all items in the tree.
     */
    async collapseAll() {
        this.tree.collapseAll();
    }
    /**
     * Tries to peek the first test error, if the item is in a failed state.
     */
    tryPeekError(item) {
        const lookup = item.test && this.testResults.getStateById(item.test.item.extId);
        return lookup && lookup[1].tasks.some(s => isFailedState(s.state))
            ? this.peekOpener.tryPeekFirstError(lookup[0], lookup[1], { preserveFocus: true })
            : false;
    }
    onContextMenu(evt) {
        const element = evt.element;
        if (!(element instanceof TestItemTreeElement)) {
            return;
        }
        const actions = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.testProfileService, element);
        this.contextMenuService.showContextMenu({
            getAnchor: () => evt.anchor,
            getActions: () => actions.secondary,
            getActionsContext: () => element,
            actionRunner: this.actionRunner,
        });
    }
    handleExecuteKeypress(evt) {
        const focused = this.tree.getFocus();
        const selected = this.tree.getSelection();
        let targeted;
        if (focused.length === 1 && selected.includes(focused[0])) {
            evt.browserEvent?.preventDefault();
            targeted = selected;
        }
        else {
            targeted = focused;
        }
        const toRun = targeted
            .filter((e) => e instanceof TestItemTreeElement);
        if (toRun.length) {
            this.testService.runTests({
                group: 2 /* TestRunProfileBitset.Run */,
                tests: toRun.map(t => t.test),
            });
        }
    }
    reevaluateWelcomeState() {
        const shouldShowWelcome = this.testService.collection.busyProviders === 0 && testCollectionIsEmpty(this.testService.collection);
        const welcomeExperience = shouldShowWelcome
            ? (this.filterState.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */) ? 2 /* WelcomeExperience.ForDocument */ : 1 /* WelcomeExperience.ForWorkspace */)
            : 0 /* WelcomeExperience.None */;
        if (welcomeExperience !== this.welcomeExperience) {
            this.welcomeExperience = welcomeExperience;
            this.welcomeVisibilityEmitter.fire(welcomeExperience);
        }
    }
    ensureProjection() {
        return this.projection.value ?? this.updatePreferredProjection();
    }
    updatePreferredProjection() {
        this.projection.clear();
        const lastState = AbstractTreeViewState.lift(this.lastViewState.get() ?? AbstractTreeViewState.empty());
        if (this._viewMode.get() === "list" /* TestExplorerViewMode.List */) {
            this.projection.value = this.instantiationService.createInstance(HierarchicalByNameProjection, lastState);
        }
        else {
            this.projection.value = this.instantiationService.createInstance(HierarchicalByLocationProjection, lastState);
        }
        const scheduler = new RunOnceScheduler(() => this.applyProjectionChanges(), 200);
        this.projection.value.onUpdate(() => {
            if (!scheduler.isScheduled()) {
                scheduler.schedule();
            }
        });
        this.applyProjectionChanges();
        return this.projection.value;
    }
    applyProjectionChanges() {
        this.reevaluateWelcomeState();
        this.projection.value?.applyTo(this.tree);
        this.tree.refilter();
        if (this.hasPendingReveal) {
            this.revealById(this.filterState.reveal.value);
        }
    }
    /**
     * Gets the selected tests from the tree.
     */
    getSelectedTests() {
        return this.tree.getSelection();
    }
};
TestingExplorerViewModel = __decorate([
    __param(2, IConfigurationService),
    __param(3, IEditorService),
    __param(4, IMenuService),
    __param(5, IContextMenuService),
    __param(6, ITestService),
    __param(7, ITestExplorerFilterState),
    __param(8, IInstantiationService),
    __param(9, IStorageService),
    __param(10, IContextKeyService),
    __param(11, ITestResultService),
    __param(12, ITestingPeekOpener),
    __param(13, ITestProfileService)
], TestingExplorerViewModel);
export { TestingExplorerViewModel };
var FilterResult;
(function (FilterResult) {
    FilterResult[FilterResult["Exclude"] = 0] = "Exclude";
    FilterResult[FilterResult["Inherit"] = 1] = "Inherit";
    FilterResult[FilterResult["Include"] = 2] = "Include";
})(FilterResult || (FilterResult = {}));
const hasNodeInOrParentOfUri = (collection, ident, testUri, fromNode) => {
    const queue = [fromNode ? [fromNode] : collection.rootIds];
    while (queue.length) {
        for (const id of queue.pop()) {
            const node = collection.getNodeById(id);
            if (!node) {
                continue;
            }
            if (!node.item.uri || !ident.extUri.isEqualOrParent(testUri, node.item.uri)) {
                continue;
            }
            // Only show nodes that can be expanded (and might have a child with
            // a range) or ones that have a physical location.
            if (node.item.range || node.expand === 1 /* TestItemExpandState.Expandable */) {
                return true;
            }
            queue.push(node.children);
        }
    }
    return false;
};
let TestsFilter = class TestsFilter {
    collection;
    state;
    testService;
    uriIdentityService;
    documentUri;
    constructor(collection, state, testService, uriIdentityService) {
        this.collection = collection;
        this.state = state;
        this.testService = testService;
        this.uriIdentityService = uriIdentityService;
    }
    /**
     * @inheritdoc
     */
    filter(element) {
        if (element instanceof TestTreeErrorMessage) {
            return 1 /* TreeVisibility.Visible */;
        }
        if (element.test
            && !this.state.isFilteringFor("@hidden" /* TestFilterTerm.Hidden */)
            && this.testService.excluded.contains(element.test)) {
            return 0 /* TreeVisibility.Hidden */;
        }
        switch (Math.min(this.testFilterText(element), this.testLocation(element), this.testState(element), this.testTags(element))) {
            case 0 /* FilterResult.Exclude */:
                return 0 /* TreeVisibility.Hidden */;
            case 2 /* FilterResult.Include */:
                return 1 /* TreeVisibility.Visible */;
            default:
                return 2 /* TreeVisibility.Recurse */;
        }
    }
    filterToDocumentUri(uri) {
        this.documentUri = uri;
    }
    testTags(element) {
        if (!this.state.includeTags.size && !this.state.excludeTags.size) {
            return 2 /* FilterResult.Include */;
        }
        return (this.state.includeTags.size ?
            element.test.item.tags.some(t => this.state.includeTags.has(t)) :
            true) && element.test.item.tags.every(t => !this.state.excludeTags.has(t))
            ? 2 /* FilterResult.Include */
            : 1 /* FilterResult.Inherit */;
    }
    testState(element) {
        if (this.state.isFilteringFor("@failed" /* TestFilterTerm.Failed */)) {
            return isFailedState(element.state) ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
        }
        if (this.state.isFilteringFor("@executed" /* TestFilterTerm.Executed */)) {
            return element.state !== 0 /* TestResultState.Unset */ ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
        }
        return 2 /* FilterResult.Include */;
    }
    testLocation(element) {
        if (!this.documentUri) {
            return 2 /* FilterResult.Include */;
        }
        if (!this.state.isFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */) || !(element instanceof TestItemTreeElement)) {
            return 2 /* FilterResult.Include */;
        }
        if (hasNodeInOrParentOfUri(this.collection, this.uriIdentityService, this.documentUri, element.test.item.extId)) {
            return 2 /* FilterResult.Include */;
        }
        return 1 /* FilterResult.Inherit */;
    }
    testFilterText(element) {
        if (this.state.globList.length === 0) {
            return 2 /* FilterResult.Include */;
        }
        const fuzzy = this.state.fuzzy.value;
        for (let e = element; e; e = e.parent) {
            // start as included if the first glob is a negation
            let included = this.state.globList[0].include === false ? 2 /* FilterResult.Include */ : 1 /* FilterResult.Inherit */;
            const data = e.label.toLowerCase();
            for (const { include, text } of this.state.globList) {
                if (fuzzy ? fuzzyContains(data, text) : data.includes(text)) {
                    included = include ? 2 /* FilterResult.Include */ : 0 /* FilterResult.Exclude */;
                }
            }
            if (included !== 1 /* FilterResult.Inherit */) {
                return included;
            }
        }
        return 1 /* FilterResult.Inherit */;
    }
};
TestsFilter = __decorate([
    __param(1, ITestExplorerFilterState),
    __param(2, ITestService),
    __param(3, IUriIdentityService)
], TestsFilter);
class TreeSorter {
    viewModel;
    constructor(viewModel) {
        this.viewModel = viewModel;
    }
    compare(a, b) {
        if (a instanceof TestTreeErrorMessage || b instanceof TestTreeErrorMessage) {
            return (a instanceof TestTreeErrorMessage ? -1 : 0) + (b instanceof TestTreeErrorMessage ? 1 : 0);
        }
        const durationDelta = (b.duration || 0) - (a.duration || 0);
        if (this.viewModel.viewSorting === "duration" /* TestExplorerViewSorting.ByDuration */ && durationDelta !== 0) {
            return durationDelta;
        }
        const stateDelta = cmpPriority(a.state, b.state);
        if (this.viewModel.viewSorting === "status" /* TestExplorerViewSorting.ByStatus */ && stateDelta !== 0) {
            return stateDelta;
        }
        if (a instanceof TestItemTreeElement && b instanceof TestItemTreeElement && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
            const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
            if (delta !== 0) {
                return delta;
            }
        }
        return (a.sortText || a.label).localeCompare(b.sortText || b.label);
    }
}
let NoTestsForDocumentWidget = class NoTestsForDocumentWidget extends Disposable {
    el;
    constructor(container, filterState) {
        super();
        const el = this.el = dom.append(container, dom.$('.testing-no-test-placeholder'));
        const emptyParagraph = dom.append(el, dom.$('p'));
        emptyParagraph.innerText = localize('testingNoTest', 'No tests were found in this file.');
        const buttonLabel = localize('testingFindExtension', 'Show Workspace Tests');
        const button = this._register(new Button(el, { title: buttonLabel, ...defaultButtonStyles }));
        button.label = buttonLabel;
        this._register(button.onDidClick(() => filterState.toggleFilteringFor("@doc" /* TestFilterTerm.CurrentDoc */, false)));
    }
    setVisible(isVisible) {
        this.el.classList.toggle('visible', isVisible);
    }
};
NoTestsForDocumentWidget = __decorate([
    __param(1, ITestExplorerFilterState)
], NoTestsForDocumentWidget);
class TestExplorerActionRunner extends ActionRunner {
    getSelectedTests;
    constructor(getSelectedTests) {
        super();
        this.getSelectedTests = getSelectedTests;
    }
    async runAction(action, context) {
        if (!(action instanceof MenuItemAction)) {
            return super.runAction(action, context);
        }
        const selection = this.getSelectedTests();
        const contextIsSelected = selection.some(s => s === context);
        const actualContext = contextIsSelected ? selection : [context];
        const actionable = actualContext.filter((t) => t instanceof TestItemTreeElement);
        await action.run(...actionable);
    }
}
const getLabelForTestTreeElement = (element) => {
    let label = labelForTestInState(element.label, element.state);
    if (element instanceof TestItemTreeElement) {
        if (element.duration !== undefined) {
            label = localize({
                key: 'testing.treeElementLabelDuration',
                comment: ['{0} is the original label in testing.treeElementLabel, {1} is a duration'],
            }, '{0}, in {1}', label, formatDuration(element.duration));
        }
        if (element.retired) {
            label = localize({
                key: 'testing.treeElementLabelOutdated',
                comment: ['{0} is the original label in testing.treeElementLabel'],
            }, '{0}, outdated result', label);
        }
    }
    return label;
};
class ListAccessibilityProvider {
    getWidgetAriaLabel() {
        return localize('testExplorer', "Test Explorer");
    }
    getAriaLabel(element) {
        return element instanceof TestTreeErrorMessage
            ? element.description
            : getLabelForTestTreeElement(element);
    }
}
class TreeKeyboardNavigationLabelProvider {
    getKeyboardNavigationLabel(element) {
        return element instanceof TestTreeErrorMessage ? element.message : element.label;
    }
}
class ListDelegate {
    getHeight(_element) {
        return 22;
    }
    getTemplateId(element) {
        if (element instanceof TestTreeErrorMessage) {
            return ErrorRenderer.ID;
        }
        return TestItemRenderer.ID;
    }
}
class IdentityProvider {
    getId(element) {
        return element.treeId;
    }
}
let ErrorRenderer = class ErrorRenderer {
    static ID = 'error';
    renderer;
    constructor(instantionService) {
        this.renderer = instantionService.createInstance(MarkdownRenderer, {});
    }
    get templateId() {
        return ErrorRenderer.ID;
    }
    renderTemplate(container) {
        const label = dom.append(container, dom.$('.error'));
        return { label };
    }
    renderElement({ element }, _, data) {
        if (typeof element.message === 'string') {
            data.label.innerText = element.message;
        }
        else {
            const result = this.renderer.render(element.message, { inline: true });
            data.label.appendChild(result.element);
        }
        data.label.title = element.description;
    }
    disposeTemplate() {
        // noop
    }
};
ErrorRenderer = __decorate([
    __param(0, IInstantiationService)
], ErrorRenderer);
let ActionableItemTemplateData = class ActionableItemTemplateData extends Disposable {
    actionRunner;
    menuService;
    testService;
    profiles;
    contextKeyService;
    instantiationService;
    constructor(actionRunner, menuService, testService, profiles, contextKeyService, instantiationService) {
        super();
        this.actionRunner = actionRunner;
        this.menuService = menuService;
        this.testService = testService;
        this.profiles = profiles;
        this.contextKeyService = contextKeyService;
        this.instantiationService = instantiationService;
    }
    /**
     * @inheritdoc
     */
    renderTemplate(container) {
        const wrapper = dom.append(container, dom.$('.test-item'));
        const icon = dom.append(wrapper, dom.$('.computed-state'));
        const label = dom.append(wrapper, dom.$('.label'));
        dom.append(wrapper, dom.$(ThemeIcon.asCSSSelector(icons.testingHiddenIcon)));
        const actionBar = new ActionBar(wrapper, {
            actionRunner: this.actionRunner,
            actionViewItemProvider: action => action instanceof MenuItemAction
                ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, undefined)
                : undefined
        });
        return { wrapper, label, actionBar, icon, elementDisposable: [], templateDisposable: [actionBar] };
    }
    /**
     * @inheritdoc
     */
    renderElement({ element }, _, data) {
        this.fillActionBar(element, data);
    }
    /**
     * @inheritdoc
     */
    disposeTemplate(templateData) {
        dispose(templateData.templateDisposable);
        templateData.templateDisposable = [];
    }
    /**
     * @inheritdoc
     */
    disposeElement(_element, _, templateData) {
        dispose(templateData.elementDisposable);
        templateData.elementDisposable = [];
    }
    fillActionBar(element, data) {
        const actions = getActionableElementActions(this.contextKeyService, this.menuService, this.testService, this.profiles, element);
        data.actionBar.clear();
        data.actionBar.context = element;
        data.actionBar.push(actions.primary, { icon: true, label: false });
    }
};
ActionableItemTemplateData = __decorate([
    __param(1, IMenuService),
    __param(2, ITestService),
    __param(3, ITestProfileService),
    __param(4, IContextKeyService),
    __param(5, IInstantiationService)
], ActionableItemTemplateData);
class TestItemRenderer extends ActionableItemTemplateData {
    static ID = 'testItem';
    /**
     * @inheritdoc
     */
    get templateId() {
        return TestItemRenderer.ID;
    }
    /**
     * @inheritdoc
     */
    renderElement(node, depth, data) {
        super.renderElement(node, depth, data);
        const testHidden = this.testService.excluded.contains(node.element.test);
        data.wrapper.classList.toggle('test-is-hidden', testHidden);
        const icon = icons.testingStatesToIcons.get(node.element.test.expand === 2 /* TestItemExpandState.BusyExpanding */ || node.element.test.item.busy
            ? 2 /* TestResultState.Running */
            : node.element.state);
        data.icon.className = 'computed-state ' + (icon ? ThemeIcon.asClassName(icon) : '');
        if (node.element.retired) {
            data.icon.className += ' retired';
        }
        data.label.title = getLabelForTestTreeElement(node.element);
        dom.reset(data.label, ...renderLabelWithIcons(node.element.label));
        let description = node.element.description;
        if (node.element.duration !== undefined) {
            description = description
                ? `${description}: ${formatDuration(node.element.duration)}`
                : formatDuration(node.element.duration);
        }
        if (description) {
            dom.append(data.label, dom.$('span.test-label-description', {}, description));
        }
    }
}
const formatDuration = (ms) => {
    if (ms < 10) {
        return `${ms.toFixed(1)}ms`;
    }
    if (ms < 1000) {
        return `${ms.toFixed(0)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
};
const getActionableElementActions = (contextKeyService, menuService, testService, profiles, element) => {
    const test = element instanceof TestItemTreeElement ? element.test : undefined;
    const contextKeys = getTestItemContextOverlay(test, test ? profiles.capabilitiesForTest(test) : 0);
    contextKeys.push(['view', "workbench.view.testing" /* Testing.ExplorerViewId */]);
    if (test) {
        contextKeys.push([
            TestingContextKeys.canRefreshTests.key,
            TestId.isRoot(test.item.extId) && testService.getTestController(test.item.extId)?.canRefresh.value
        ]);
        contextKeys.push([
            TestingContextKeys.testItemIsHidden.key,
            testService.excluded.contains(test)
        ]);
    }
    const contextOverlay = contextKeyService.createOverlay(contextKeys);
    const menu = menuService.createMenu(MenuId.TestItem, contextOverlay);
    try {
        const primary = [];
        const secondary = [];
        const result = { primary, secondary };
        createAndFillInActionBarActions(menu, {
            shouldForwardArgs: true,
        }, result, 'inline');
        return result;
    }
    finally {
        menu.dispose();
    }
};
registerThemingParticipant((theme, collector) => {
    if (theme.type === 'dark') {
        const foregroundColor = theme.getColor(foreground);
        if (foregroundColor) {
            const fgWithOpacity = new Color(new RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.65));
            collector.addRule(`.test-explorer .test-explorer-messages { color: ${fgWithOpacity}; }`);
        }
    }
});
