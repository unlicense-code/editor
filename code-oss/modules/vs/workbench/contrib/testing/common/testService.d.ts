import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IObservableValue, MutableObservableValue } from 'vs/workbench/contrib/testing/common/observableValue';
import { AbstractIncrementalTestCollection, IncrementalTestCollectionItem, InternalTestItem, ITestItemContext, ResolvedTestRunRequest, RunTestForControllerRequest, RunTestForControllerResult, TestRunProfileBitset, TestsDiff } from 'vs/workbench/contrib/testing/common/testTypes';
import { TestExclusions } from 'vs/workbench/contrib/testing/common/testExclusions';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
import { ITestResult } from 'vs/workbench/contrib/testing/common/testResult';
export declare const ITestService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITestService>;
export interface IMainThreadTestController {
    readonly id: string;
    readonly label: IObservableValue<string>;
    readonly canRefresh: IObservableValue<boolean>;
    syncTests(token: CancellationToken): Promise<void>;
    refreshTests(token: CancellationToken): Promise<void>;
    configureRunProfile(profileId: number): void;
    expandTest(id: string, levels: number): Promise<void>;
    runTests(request: RunTestForControllerRequest[], token: CancellationToken): Promise<RunTestForControllerResult[]>;
}
export declare type TestDiffListener = (diff: TestsDiff) => void;
export interface IMainThreadTestCollection extends AbstractIncrementalTestCollection<IncrementalTestCollectionItem> {
    onBusyProvidersChange: Event<number>;
    /**
     * Number of providers working to discover tests.
     */
    busyProviders: number;
    /**
     * Root item IDs.
     */
    rootIds: Iterable<string>;
    /**
     * Root items, correspond to registered controllers.
     */
    rootItems: Iterable<IncrementalTestCollectionItem>;
    /**
     * Iterates over every test in the collection, in strictly descending
     * order of depth.
     */
    all: Iterable<IncrementalTestCollectionItem>;
    /**
     * Gets a node in the collection by ID.
     */
    getNodeById(id: string): IncrementalTestCollectionItem | undefined;
    /**
     * Requests that children be revealed for the given test. "Levels" may
     * be infinite.
     */
    expand(testId: string, levels: number): Promise<void>;
    /**
     * Gets a diff that adds all items currently in the tree to a new collection,
     * allowing it to fully hydrate.
     */
    getReviverDiff(): TestsDiff;
}
/**
 * Iterates through the item and its parents to the root.
 */
export declare const getCollectionItemParents: (collection: IMainThreadTestCollection, item: InternalTestItem) => Generator<IncrementalTestCollectionItem, void, unknown>;
export declare const testCollectionIsEmpty: (collection: IMainThreadTestCollection) => boolean;
export declare const getContextForTestItem: (collection: IMainThreadTestCollection, id: string | TestId) => ITestItemContext | {
    controller: string;
};
/**
 * Ensures the test with the given ID exists in the collection, if possible.
 * If cancellation is requested, or the test cannot be found, it will return
 * undefined.
 */
export declare const expandAndGetTestById: (collection: IMainThreadTestCollection, id: string, ct?: Readonly<CancellationToken>) => Promise<IncrementalTestCollectionItem | undefined>;
/**
 * Waits for all test in the hierarchy to be fulfilled before returning.
 * If cancellation is requested, it will return early.
 */
export declare const getAllTestsInHierarchy: (collection: IMainThreadTestCollection, ct?: Readonly<CancellationToken>) => Promise<void>;
/**
 * Waits for the test to no longer be in the "busy" state.
 */
export declare const waitForTestToBeIdle: (testService: ITestService, test: IncrementalTestCollectionItem) => Promise<void> | undefined;
/**
 * Iterator that expands to and iterates through tests in the file. Iterates
 * in strictly descending order.
 */
export declare const testsInFile: (testService: ITestService, ident: IUriIdentityService, uri: URI, waitForIdle?: boolean) => AsyncIterable<IncrementalTestCollectionItem>;
/**
 * An instance of the RootProvider should be registered for each extension
 * host.
 */
export interface ITestRootProvider {
}
/**
 * A run request that expresses the intent of the request and allows the
 * test service to resolve the specifics of the group.
 */
export interface AmbiguousRunTestsRequest {
    /** Group to run */
    group: TestRunProfileBitset;
    /** Tests to run. Allowed to be from different controllers */
    tests: readonly InternalTestItem[];
    /** Tests to exclude. If not given, the current UI excluded tests are used */
    exclude?: InternalTestItem[];
    /** Whether this was triggered from an auto run. */
    isAutoRun?: boolean;
}
export interface ITestService {
    readonly _serviceBrand: undefined;
    /**
     * Fires when the user requests to cancel a test run -- or all runs, if no
     * runId is given.
     */
    readonly onDidCancelTestRun: Event<{
        runId: string | undefined;
    }>;
    /**
     * Event that fires when the excluded tests change.
     */
    readonly excluded: TestExclusions;
    /**
     * Test collection instance.
     */
    readonly collection: IMainThreadTestCollection;
    /**
     * Event that fires immediately before a diff is processed.
     */
    readonly onWillProcessDiff: Event<TestsDiff>;
    /**
     * Event that fires after a diff is processed.
     */
    readonly onDidProcessDiff: Event<TestsDiff>;
    /**
     * Whether inline editor decorations should be visible.
     */
    readonly showInlineOutput: MutableObservableValue<boolean>;
    /**
     * Registers an interface that runs tests for the given provider ID.
     */
    registerTestController(providerId: string, controller: IMainThreadTestController): IDisposable;
    /**
     * Gets a registered test controller by ID.
     */
    getTestController(controllerId: string): IMainThreadTestController | undefined;
    /**
     * Refreshes tests for the controller, or all controllers if no ID is given.
     */
    refreshTests(controllerId?: string): Promise<void>;
    /**
     * Cancels any ongoing test refreshes.
     */
    cancelRefreshTests(): void;
    /**
     * Requests that tests be executed.
     */
    runTests(req: AmbiguousRunTestsRequest, token?: CancellationToken): Promise<ITestResult>;
    /**
     * Requests that tests be executed.
     */
    runResolvedTests(req: ResolvedTestRunRequest, token?: CancellationToken): Promise<ITestResult>;
    /**
     * Ensures the test diff from the remote ext host is flushed and waits for
     * any "busy" tests to become idle before resolving.
     */
    syncTests(): Promise<void>;
    /**
     * Cancels an ongoing test run by its ID, or all runs if no ID is given.
     */
    cancelTestRun(runId?: string): void;
    /**
     * Publishes a test diff for a controller.
     */
    publishDiff(controllerId: string, diff: TestsDiff): void;
}
