import { VSBuffer, VSBufferReadableStream, VSBufferWriteableStream } from 'vs/base/common/buffer';
import { Lazy } from 'vs/base/common/lazy';
import { IObservableValue } from 'vs/workbench/contrib/testing/common/observableValue';
import { IRichLocation, ISerializedTestResults, ITestItem, ITestMessage, ITestOutputMessage, ITestRunTask, ITestTaskState, ResolvedTestRunRequest, TestResultItem, TestResultState } from 'vs/workbench/contrib/testing/common/testTypes';
import { TestCoverage } from 'vs/workbench/contrib/testing/common/testCoverage';
export interface ITestRunTaskResults extends ITestRunTask {
    /**
     * Contains test coverage for the result, if it's available.
     */
    readonly coverage: IObservableValue<TestCoverage | undefined>;
    /**
     * Messages from the task not associated with any specific test.
     */
    readonly otherMessages: ITestOutputMessage[];
}
export interface ITestResult {
    /**
     * Count of the number of tests in each run state.
     */
    readonly counts: Readonly<TestStateCount>;
    /**
     * Unique ID of this set of test results.
     */
    readonly id: string;
    /**
     * If the test is completed, the unix milliseconds time at which it was
     * completed. If undefined, the test is still running.
     */
    readonly completedAt: number | undefined;
    /**
     * Whether this test result is triggered from an auto run.
     */
    readonly request: ResolvedTestRunRequest;
    /**
     * Human-readable name of the test result.
     */
    readonly name: string;
    /**
     * Gets all tests involved in the run.
     */
    tests: IterableIterator<TestResultItem>;
    /**
     * List of this result's subtasks.
     */
    tasks: ReadonlyArray<ITestRunTaskResults>;
    /**
     * Gets the state of the test by its extension-assigned ID.
     */
    getStateById(testExtId: string): TestResultItem | undefined;
    /**
     * Loads the output of the result as a stream.
     */
    getOutput(): Promise<VSBufferReadableStream>;
    /**
     * Loads an output of the result.
     */
    getOutputRange(offset: number, length: number): Promise<VSBuffer>;
    /**
     * Serializes the test result. Used to save and restore results
     * in the workspace.
     */
    toJSON(): ISerializedTestResults | undefined;
}
export declare const resultItemParents: (results: ITestResult, item: TestResultItem) => Generator<TestResultItem, void, unknown>;
/**
 * Count of the number of tests in each run state.
 */
export declare type TestStateCount = {
    [K in TestResultState]: number;
};
export declare const makeEmptyCounts: () => TestStateCount;
export declare const sumCounts: (counts: Iterable<TestStateCount>) => TestStateCount;
export declare const maxCountPriority: (counts: Readonly<TestStateCount>) => TestResultState;
/**
 * Deals with output of a {@link LiveTestResult}. By default we pass-through
 * data into the underlying write stream, but if a client requests to read it
 * we splice in the written data and then continue streaming incoming data.
 */
export declare class LiveOutputController {
    private readonly writer;
    private readonly reader;
    private readonly rangeReader;
    /** Set on close() to a promise that is resolved once closing is complete */
    private closed?;
    /** Data written so far. This is available until the file closes. */
    private previouslyWritten;
    private readonly dataEmitter;
    private readonly endEmitter;
    private _offset;
    /**
     * Gets the number of written bytes.
     */
    get offset(): number;
    constructor(writer: Lazy<[VSBufferWriteableStream, Promise<void>]>, reader: () => Promise<VSBufferReadableStream>, rangeReader: (offset: number, length: number) => Promise<VSBuffer>);
    /**
     * Appends data to the output.
     */
    append(data: VSBuffer, marker?: number): Promise<void> | void;
    /**
     * Reads a range of data from the output.
     */
    getRange(offset: number, length: number): Promise<VSBuffer>;
    /**
     * Reads the value of the stream.
     */
    read(): Promise<VSBufferReadableStream>;
    /**
     * Closes the output, signalling no more writes will be made.
     * @returns a promise that resolves when the output is written
     */
    close(): Promise<void>;
}
interface TestResultItemWithChildren extends TestResultItem {
    /** Children in the run */
    children: TestResultItemWithChildren[];
}
export declare const enum TestResultItemChangeReason {
    ComputedStateChange = 0,
    OwnStateChange = 1
}
export declare type TestResultItemChange = {
    item: TestResultItem;
    result: ITestResult;
} & ({
    reason: TestResultItemChangeReason.ComputedStateChange;
} | {
    reason: TestResultItemChangeReason.OwnStateChange;
    previousState: TestResultState;
    previousOwnDuration: number | undefined;
});
/**
 * Results of a test. These are created when the test initially started running
 * and marked as "complete" when the run finishes.
 */
export declare class LiveTestResult implements ITestResult {
    readonly id: string;
    readonly output: LiveOutputController;
    readonly persist: boolean;
    readonly request: ResolvedTestRunRequest;
    private readonly completeEmitter;
    private readonly changeEmitter;
    private readonly testById;
    private testMarkerCounter;
    private _completedAt?;
    readonly onChange: import("vs/base/common/event").Event<TestResultItemChange>;
    readonly onComplete: import("vs/base/common/event").Event<void>;
    readonly tasks: ITestRunTaskResults[];
    readonly name: string;
    /**
     * @inheritdoc
     */
    get completedAt(): number | undefined;
    /**
     * @inheritdoc
     */
    readonly counts: {
        [K in TestResultState]: number;
    };
    /**
     * @inheritdoc
     */
    get tests(): IterableIterator<TestResultItemWithChildren>;
    private readonly computedStateAccessor;
    constructor(id: string, output: LiveOutputController, persist: boolean, request: ResolvedTestRunRequest);
    /**
     * @inheritdoc
     */
    getStateById(extTestId: string): TestResultItemWithChildren | undefined;
    /**
     * Appends output that occurred during the test run.
     */
    appendOutput(output: VSBuffer, taskId: string, location?: IRichLocation, testId?: string): void;
    /**
     * Adds a new run task to the results.
     */
    addTask(task: ITestRunTask): void;
    /**
     * Add the chain of tests to the run. The first test in the chain should
     * be either a test root, or a previously-known test.
     */
    addTestChainToRun(controllerId: string, chain: ReadonlyArray<ITestItem>): undefined;
    /**
     * Updates the state of the test by its internal ID.
     */
    updateState(testId: string, taskId: string, state: TestResultState, duration?: number): void;
    /**
     * Appends a message for the test in the run.
     */
    appendMessage(testId: string, taskId: string, message: ITestMessage): void;
    /**
     * @inheritdoc
     */
    getOutput(): Promise<VSBufferReadableStream>;
    /**
     * @inheritdoc
     */
    getOutputRange(offset: number, bytes: number): Promise<VSBuffer>;
    /**
     * Marks the task in the test run complete.
     */
    markTaskComplete(taskId: string): void;
    /**
     * Notifies the service that all tests are complete.
     */
    markComplete(): void;
    /**
     * @inheritdoc
     */
    toJSON(): ISerializedTestResults | undefined;
    /**
     * Updates all tests in the collection to the given state.
     */
    protected setAllToState(state: TestResultState, taskId: string, when: (task: ITestTaskState, item: TestResultItem) => boolean): void;
    private fireUpdateAndRefresh;
    private addTestToRun;
    private mustGetTaskIndex;
    private readonly doSerialize;
}
/**
 * Test results hydrated from a previously-serialized test run.
 */
export declare class HydratedTestResult implements ITestResult {
    private readonly serialized;
    private readonly outputLoader;
    private readonly outputRangeLoader;
    private readonly persist;
    /**
     * @inheritdoc
     */
    readonly counts: TestStateCount;
    /**
     * @inheritdoc
     */
    readonly id: string;
    /**
     * @inheritdoc
     */
    readonly completedAt: number;
    /**
     * @inheritdoc
     */
    readonly tasks: ITestRunTaskResults[];
    /**
     * @inheritdoc
     */
    get tests(): IterableIterator<TestResultItem>;
    /**
     * @inheritdoc
     */
    readonly name: string;
    /**
     * @inheritdoc
     */
    readonly request: ResolvedTestRunRequest;
    private readonly testById;
    constructor(serialized: ISerializedTestResults, outputLoader: () => Promise<VSBufferReadableStream>, outputRangeLoader: (offset: number, length: number) => Promise<VSBuffer>, persist?: boolean);
    /**
     * @inheritdoc
     */
    getOutputRange(offset: number, bytes: number): Promise<VSBuffer>;
    /**
     * @inheritdoc
     */
    getStateById(extTestId: string): TestResultItem | undefined;
    /**
     * @inheritdoc
     */
    getOutput(): Promise<VSBufferReadableStream>;
    /**
     * @inheritdoc
     */
    toJSON(): ISerializedTestResults | undefined;
}
export {};
