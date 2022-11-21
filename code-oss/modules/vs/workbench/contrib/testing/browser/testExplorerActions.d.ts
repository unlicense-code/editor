import { Action2, IAction2Options } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { ViewAction } from 'vs/workbench/browser/parts/views/viewPane';
import { IActionableTestTreeElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import type { TestingExplorerView } from 'vs/workbench/contrib/testing/browser/testingExplorerView';
import { InternalTestItem, TestRunProfileBitset } from 'vs/workbench/contrib/testing/common/testTypes';
import { ITestResult } from 'vs/workbench/contrib/testing/common/testResult';
import { IMainThreadTestCollection, ITestService } from 'vs/workbench/contrib/testing/common/testService';
export declare class HideTestAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...elements: IActionableTestTreeElement[]): Promise<void>;
}
export declare class UnhideTestAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...elements: InternalTestItem[]): Promise<void>;
}
export declare class UnhideAllTestsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class DebugAction extends Action2 {
    constructor();
    run(acessor: ServicesAccessor, ...elements: IActionableTestTreeElement[]): Promise<any>;
}
export declare class RunUsingProfileAction extends Action2 {
    constructor();
    run(acessor: ServicesAccessor, ...elements: IActionableTestTreeElement[]): Promise<any>;
}
export declare class RunAction extends Action2 {
    constructor();
    /**
     * @override
     */
    run(acessor: ServicesAccessor, ...elements: IActionableTestTreeElement[]): Promise<any>;
}
export declare class SelectDefaultTestProfiles extends Action2 {
    constructor();
    run(acessor: ServicesAccessor, onlyGroup: TestRunProfileBitset): Promise<void>;
}
export declare class ConfigureTestProfilesAction extends Action2 {
    constructor();
    run(acessor: ServicesAccessor, onlyGroup?: TestRunProfileBitset): Promise<void>;
}
declare abstract class ExecuteSelectedAction extends ViewAction<TestingExplorerView> {
    private readonly group;
    constructor(options: IAction2Options, group: TestRunProfileBitset);
    /**
     * @override
     */
    runInView(accessor: ServicesAccessor, view: TestingExplorerView): Promise<ITestResult | undefined>;
}
export declare class RunSelectedAction extends ExecuteSelectedAction {
    constructor();
}
export declare class DebugSelectedAction extends ExecuteSelectedAction {
    constructor();
}
declare abstract class RunOrDebugAllTestsAction extends Action2 {
    private readonly group;
    private noTestsFoundError;
    constructor(options: IAction2Options, group: TestRunProfileBitset, noTestsFoundError: string);
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class RunAllAction extends RunOrDebugAllTestsAction {
    constructor();
}
export declare class DebugAllAction extends RunOrDebugAllTestsAction {
    constructor();
}
export declare class CancelTestRunAction extends Action2 {
    constructor();
    /**
     * @override
     */
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class TestingViewAsListAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class TestingViewAsTreeAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class TestingSortByStatusAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class TestingSortByLocationAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class TestingSortByDurationAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class ShowMostRecentOutputAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class CollapseAllAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class ClearTestResultsAction extends Action2 {
    constructor();
    /**
     * @override
     */
    run(accessor: ServicesAccessor): void;
}
export declare class GoToTest extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, element?: IActionableTestTreeElement, preserveFocus?: boolean): Promise<void>;
}
declare abstract class ExecuteTestAtCursor extends Action2 {
    protected readonly group: TestRunProfileBitset;
    constructor(options: IAction2Options, group: TestRunProfileBitset);
    /**
     * @override
     */
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class RunAtCursor extends ExecuteTestAtCursor {
    constructor();
}
export declare class DebugAtCursor extends ExecuteTestAtCursor {
    constructor();
}
declare abstract class ExecuteTestsInCurrentFile extends Action2 {
    protected readonly group: TestRunProfileBitset;
    constructor(options: IAction2Options, group: TestRunProfileBitset);
    /**
     * @override
     */
    run(accessor: ServicesAccessor): Promise<ITestResult> | undefined;
}
export declare class RunCurrentFile extends ExecuteTestsInCurrentFile {
    constructor();
}
export declare class DebugCurrentFile extends ExecuteTestsInCurrentFile {
    constructor();
}
export declare const discoverAndRunTests: (collection: IMainThreadTestCollection, progress: IProgressService, ids: ReadonlyArray<string>, runTests: (tests: ReadonlyArray<InternalTestItem>) => Promise<ITestResult>) => Promise<ITestResult | undefined>;
declare abstract class RunOrDebugExtsByPath extends Action2 {
    /**
     * @override
     */
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
    protected abstract getTestExtIdsToRun(accessor: ServicesAccessor, ...args: unknown[]): Iterable<string>;
    protected abstract runTest(service: ITestService, node: readonly InternalTestItem[]): Promise<ITestResult>;
}
declare abstract class RunOrDebugFailedTests extends RunOrDebugExtsByPath {
    constructor(options: IAction2Options);
    /**
     * @inheritdoc
     */
    protected getTestExtIdsToRun(accessor: ServicesAccessor): Set<string>;
}
declare abstract class RunOrDebugLastRun extends RunOrDebugExtsByPath {
    constructor(options: IAction2Options);
    /**
     * @inheritdoc
     */
    protected getTestExtIdsToRun(accessor: ServicesAccessor, runId?: string): Iterable<string>;
}
export declare class ReRunFailedTests extends RunOrDebugFailedTests {
    constructor();
    protected runTest(service: ITestService, internalTests: InternalTestItem[]): Promise<ITestResult>;
}
export declare class DebugFailedTests extends RunOrDebugFailedTests {
    constructor();
    protected runTest(service: ITestService, internalTests: InternalTestItem[]): Promise<ITestResult>;
}
export declare class ReRunLastRun extends RunOrDebugLastRun {
    constructor();
    protected runTest(service: ITestService, internalTests: InternalTestItem[]): Promise<ITestResult>;
}
export declare class DebugLastRun extends RunOrDebugLastRun {
    constructor();
    protected runTest(service: ITestService, internalTests: InternalTestItem[]): Promise<ITestResult>;
}
export declare class SearchForTestExtension extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenOutputPeek extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleInlineTestOutput extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class RefreshTestsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...elements: IActionableTestTreeElement[]): Promise<void>;
}
export declare class CancelTestRefreshAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare const allTestActions: (typeof UnhideTestAction | typeof DebugAction | typeof SelectDefaultTestProfiles | typeof TestingViewAsListAction | typeof ShowMostRecentOutputAction | typeof GoToTest)[];
export {};
