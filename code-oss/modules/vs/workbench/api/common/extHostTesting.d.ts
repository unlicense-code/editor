import { CancellationToken } from 'vs/base/common/cancellation';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ExtHostTestingShape, MainThreadTestingShape } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostCommands } from 'vs/workbench/api/common/extHostCommands';
import { ExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ExtHostTestItemCollection } from 'vs/workbench/api/common/extHostTestItem';
import { AbstractIncrementalTestCollection, CoverageDetails, IFileCoverage, IncrementalChangeCollector, IncrementalTestCollectionItem, InternalTestItem, ISerializedTestResults, RunTestForControllerRequest, RunTestForControllerResult, TestsDiffOp } from 'vs/workbench/contrib/testing/common/testTypes';
import type * as vscode from 'vscode';
export declare class ExtHostTesting implements ExtHostTestingShape {
    private readonly editors;
    private readonly resultsChangedEmitter;
    private readonly controllers;
    private readonly proxy;
    private readonly runTracker;
    private readonly observer;
    onResultsChanged: Event<void>;
    results: ReadonlyArray<vscode.TestRunResult>;
    constructor(rpc: IExtHostRpcService, commands: ExtHostCommands, editors: ExtHostDocumentsAndEditors);
    /**
     * Implements vscode.test.registerTestProvider
     */
    createTestController(controllerId: string, label: string, refreshHandler?: (token: CancellationToken) => Thenable<void> | void): vscode.TestController;
    /**
     * Implements vscode.test.createTestObserver
     */
    createTestObserver(): vscode.TestObserver;
    /**
     * Implements vscode.test.runTests
     */
    runTests(req: vscode.TestRunRequest, token?: Readonly<CancellationToken>): Promise<void>;
    /**
     * @inheritdoc
     */
    $syncTests(): Promise<void>;
    /**
     * @inheritdoc
     */
    $provideFileCoverage(runId: string, taskId: string, token: CancellationToken): Promise<IFileCoverage[]>;
    /**
     * @inheritdoc
     */
    $resolveFileCoverage(runId: string, taskId: string, fileIndex: number, token: CancellationToken): Promise<CoverageDetails[]>;
    /** @inheritdoc */
    $configureRunProfile(controllerId: string, profileId: number): void;
    /** @inheritdoc */
    $refreshTests(controllerId: string, token: CancellationToken): Promise<void>;
    /**
     * Updates test results shown to extensions.
     * @override
     */
    $publishTestResults(results: ISerializedTestResults[]): void;
    /**
     * Expands the nodes in the test tree. If levels is less than zero, it will
     * be treated as infinite.
     */
    $expandTest(testId: string, levels: number): Promise<void>;
    /**
     * Receives a test update from the main thread. Called (eventually) whenever
     * tests change.
     */
    $acceptDiff(diff: TestsDiffOp.Serialized[]): void;
    /**
     * Runs tests with the given set of IDs. Allows for test from multiple
     * providers to be run.
     * @override
     */
    $runControllerTests(reqs: RunTestForControllerRequest[], token: CancellationToken): Promise<RunTestForControllerResult[]>;
    runControllerTestRequest(req: RunTestForControllerRequest, token: CancellationToken): Promise<RunTestForControllerResult>;
    /**
     * Cancels an ongoing test run.
     */
    $cancelExtensionTestRun(runId: string | undefined): void;
}
declare class TestRunTracker extends Disposable {
    private readonly dto;
    private readonly proxy;
    private readonly tasks;
    private readonly sharedTestIds;
    private readonly cts;
    private readonly endEmitter;
    private disposed;
    /**
     * Fires when a test ends, and no more tests are left running.
     */
    readonly onEnd: Event<void>;
    /**
     * Gets whether there are any tests running.
     */
    get isRunning(): boolean;
    /**
     * Gets the run ID.
     */
    get id(): string;
    constructor(dto: TestRunDto, proxy: MainThreadTestingShape, parentToken?: CancellationToken);
    getCoverage(taskId: string): TestRunCoverageBearer | undefined;
    createRun(name: string | undefined): vscode.TestRun;
    dispose(): void;
    private ensureTestIsKnown;
}
/**
 * Queues runs for a single extension and provides the currently-executing
 * run so that `createTestRun` can be properly correlated.
 */
export declare class TestRunCoordinator {
    private readonly proxy;
    private tracked;
    get trackers(): IterableIterator<TestRunTracker>;
    constructor(proxy: MainThreadTestingShape);
    /**
     * Registers a request as being invoked by the main thread, so
     * `$startedExtensionTestRun` is not invoked. The run must eventually
     * be cancelled manually.
     */
    prepareForMainThreadTestRun(req: vscode.TestRunRequest, dto: TestRunDto, token: CancellationToken): TestRunTracker;
    /**
     * Cancels an existing test run via its cancellation token.
     */
    cancelRunById(runId: string): void;
    /**
     * Cancels an existing test run via its cancellation token.
     */
    cancelAllRuns(): void;
    /**
     * Implements the public `createTestRun` API.
     */
    createTestRun(controllerId: string, collection: ExtHostTestItemCollection, request: vscode.TestRunRequest, name: string | undefined, persist: boolean): vscode.TestRun;
    private getTracker;
}
export declare class TestRunDto {
    readonly controllerId: string;
    readonly id: string;
    readonly isPersisted: boolean;
    readonly colllection: ExtHostTestItemCollection;
    private readonly includePrefix;
    private readonly excludePrefix;
    static fromPublic(controllerId: string, collection: ExtHostTestItemCollection, request: vscode.TestRunRequest, persist: boolean): TestRunDto;
    static fromInternal(request: RunTestForControllerRequest, collection: ExtHostTestItemCollection): TestRunDto;
    constructor(controllerId: string, id: string, include: string[], exclude: string[], isPersisted: boolean, colllection: ExtHostTestItemCollection);
    isIncluded(test: vscode.TestItem): boolean;
}
declare class TestRunCoverageBearer {
    private readonly proxy;
    private readonly runId;
    private readonly taskId;
    private _coverageProvider?;
    private fileCoverage?;
    set coverageProvider(provider: vscode.TestCoverageProvider | undefined);
    get coverageProvider(): vscode.TestCoverageProvider | undefined;
    constructor(proxy: MainThreadTestingShape, runId: string, taskId: string);
    provideFileCoverage(token: CancellationToken): Promise<IFileCoverage[]>;
    resolveFileCoverage(index: number, token: CancellationToken): Promise<CoverageDetails[]>;
}
/**
 * @private
 */
interface MirroredCollectionTestItem extends IncrementalTestCollectionItem {
    revived: vscode.TestItem;
    depth: number;
}
declare class MirroredChangeCollector extends IncrementalChangeCollector<MirroredCollectionTestItem> {
    private readonly emitter;
    private readonly added;
    private readonly updated;
    private readonly removed;
    private readonly alreadyRemoved;
    get isEmpty(): boolean;
    constructor(emitter: Emitter<vscode.TestsChangeEvent>);
    /**
     * @override
     */
    add(node: MirroredCollectionTestItem): void;
    /**
     * @override
     */
    update(node: MirroredCollectionTestItem): void;
    /**
     * @override
     */
    remove(node: MirroredCollectionTestItem): void;
    /**
     * @override
     */
    getChangeEvent(): vscode.TestsChangeEvent;
    complete(): void;
}
/**
 * Maintains tests in this extension host sent from the main thread.
 * @private
 */
export declare class MirroredTestCollection extends AbstractIncrementalTestCollection<MirroredCollectionTestItem> {
    private changeEmitter;
    /**
     * Change emitter that fires with the same semantics as `TestObserver.onDidChangeTests`.
     */
    readonly onDidChangeTests: Event<vscode.TestsChangeEvent>;
    /**
     * Gets a list of root test items.
     */
    get rootTests(): Set<MirroredCollectionTestItem>;
    /**
     *
     * If the test ID exists, returns its underlying ID.
     */
    getMirroredTestDataById(itemId: string): MirroredCollectionTestItem | undefined;
    /**
     * If the test item is a mirrored test item, returns its underlying ID.
     */
    getMirroredTestDataByReference(item: vscode.TestItem): MirroredCollectionTestItem | undefined;
    /**
     * @override
     */
    protected createItem(item: InternalTestItem, parent?: MirroredCollectionTestItem): MirroredCollectionTestItem;
    /**
     * @override
     */
    protected createChangeCollector(): MirroredChangeCollector;
}
export declare class TestRunProfileImpl implements vscode.TestRunProfile {
    #private;
    readonly controllerId: string;
    readonly profileId: number;
    private _label;
    readonly kind: vscode.TestRunProfileKind;
    runHandler: (request: vscode.TestRunRequest, token: vscode.CancellationToken) => Thenable<void> | void;
    private _isDefault;
    _tag: vscode.TestTag | undefined;
    private _configureHandler?;
    get label(): string;
    set label(label: string);
    get isDefault(): boolean;
    set isDefault(isDefault: boolean);
    get tag(): vscode.TestTag | undefined;
    set tag(tag: vscode.TestTag | undefined);
    get configureHandler(): undefined | (() => void);
    set configureHandler(handler: undefined | (() => void));
    constructor(proxy: MainThreadTestingShape, profiles: Map<number, vscode.TestRunProfile>, controllerId: string, profileId: number, _label: string, kind: vscode.TestRunProfileKind, runHandler: (request: vscode.TestRunRequest, token: vscode.CancellationToken) => Thenable<void> | void, _isDefault?: boolean, _tag?: vscode.TestTag | undefined);
    dispose(): void;
}
export {};
