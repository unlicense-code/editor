import { IActionViewItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { ObjectTree } from 'vs/base/browser/ui/tree/objectTree';
import { IAction } from 'vs/base/common/actions';
import { Event } from 'vs/base/common/event';
import { FuzzyScore } from 'vs/base/common/filters';
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import 'vs/css!./media/testing';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { ITestTreeProjection, TestExplorerTreeElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import { ITestingProgressUiService } from 'vs/workbench/contrib/testing/browser/testingProgressUiService';
import { TestExplorerViewMode, TestExplorerViewSorting } from 'vs/workbench/contrib/testing/common/constants';
import { TestExplorerFilterState } from 'vs/workbench/contrib/testing/common/testExplorerFilterState';
import { ITestingPeekOpener } from 'vs/workbench/contrib/testing/common/testingPeekOpener';
import { ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
import { InternalTestItem, ITestRunProfile } from 'vs/workbench/contrib/testing/common/testTypes';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export declare class TestingExplorerView extends ViewPane {
    private readonly testService;
    private readonly testProgressService;
    private readonly testProfileService;
    private readonly commandService;
    viewModel: TestingExplorerViewModel;
    private filterActionBar;
    private container;
    private treeHeader;
    private discoveryProgress;
    private readonly filter;
    private readonly filterFocusListener;
    private readonly dimensions;
    private lastFocusState;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, configurationService: IConfigurationService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, openerService: IOpenerService, themeService: IThemeService, testService: ITestService, telemetryService: ITelemetryService, testProgressService: ITestingProgressUiService, testProfileService: ITestProfileService, commandService: ICommandService);
    shouldShowWelcome(): boolean;
    focus(): void;
    getSelectedOrVisibleItems(profile?: ITestRunProfile): {
        include: InternalTestItem[];
        exclude: InternalTestItem[];
    };
    /**
     * @override
     */
    protected renderBody(container: HTMLElement): void;
    /** @override  */
    getActionViewItem(action: IAction): IActionViewItem | undefined;
    /** @inheritdoc */
    private getTestConfigGroupActions;
    /**
     * @override
     */
    saveState(): void;
    private getRunGroupDropdown;
    private createFilterActionBar;
    private updateDiscoveryProgress;
    /**
     * @override
     */
    protected layoutBody(height?: number, width?: number): void;
}
declare const enum WelcomeExperience {
    None = 0,
    ForWorkspace = 1,
    ForDocument = 2
}
export declare class TestingExplorerViewModel extends Disposable {
    private readonly menuService;
    private readonly contextMenuService;
    private readonly testService;
    private readonly filterState;
    private readonly instantiationService;
    private readonly storageService;
    private readonly contextKeyService;
    private readonly testResults;
    private readonly peekOpener;
    private readonly testProfileService;
    tree: ObjectTree<TestExplorerTreeElement, FuzzyScore>;
    private filter;
    projection: MutableDisposable<ITestTreeProjection>;
    private readonly revealTimeout;
    private readonly _viewMode;
    private readonly _viewSorting;
    private readonly welcomeVisibilityEmitter;
    private readonly actionRunner;
    private readonly lastViewState;
    private readonly noTestForDocumentWidget;
    /**
     * Whether there's a reveal request which has not yet been delivered. This
     * can happen if the user asks to reveal before the test tree is loaded.
     * We check to see if the reveal request is present on each tree update,
     * and do it then if so.
     */
    private hasPendingReveal;
    /**
     * Fires when the visibility of the placeholder state changes.
     */
    readonly onChangeWelcomeVisibility: Event<WelcomeExperience>;
    /**
     * Gets whether the welcome should be visible.
     */
    welcomeExperience: WelcomeExperience;
    get viewMode(): TestExplorerViewMode;
    set viewMode(newMode: TestExplorerViewMode);
    get viewSorting(): TestExplorerViewSorting;
    set viewSorting(newSorting: TestExplorerViewSorting);
    constructor(listContainer: HTMLElement, onDidChangeVisibility: Event<boolean>, configurationService: IConfigurationService, editorService: IEditorService, menuService: IMenuService, contextMenuService: IContextMenuService, testService: ITestService, filterState: TestExplorerFilterState, instantiationService: IInstantiationService, storageService: IStorageService, contextKeyService: IContextKeyService, testResults: ITestResultService, peekOpener: ITestingPeekOpener, testProfileService: ITestProfileService);
    /**
     * Re-layout the tree.
     */
    layout(height?: number, width?: number): void;
    /**
     * Tries to reveal by extension ID. Queues the request if the extension
     * ID is not currently available.
     */
    private revealById;
    /**
     * Collapse all items in the tree.
     */
    collapseAll(): Promise<void>;
    /**
     * Tries to peek the first test error, if the item is in a failed state.
     */
    private tryPeekError;
    private onContextMenu;
    private handleExecuteKeypress;
    private reevaluateWelcomeState;
    private ensureProjection;
    private updatePreferredProjection;
    private applyProjectionChanges;
    /**
     * Gets the selected tests from the tree.
     */
    getSelectedTests(): (TestExplorerTreeElement | null)[];
}
export {};
