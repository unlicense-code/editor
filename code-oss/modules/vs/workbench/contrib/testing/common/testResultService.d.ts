import { RunOnceScheduler } from 'vs/base/common/async';
import { Event } from 'vs/base/common/event';
import { Iterable } from 'vs/base/common/iterator';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ExtensionRunTestsRequest, ResolvedTestRunRequest, TestResultItem } from 'vs/workbench/contrib/testing/common/testTypes';
import { ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { ITestResult, LiveTestResult, TestResultItemChange } from 'vs/workbench/contrib/testing/common/testResult';
import { ITestResultStorage } from 'vs/workbench/contrib/testing/common/testResultStorage';
export declare type ResultChangeEvent = {
    completed: LiveTestResult;
} | {
    started: LiveTestResult;
} | {
    inserted: ITestResult;
} | {
    removed: ITestResult[];
};
export declare const allChangedResults: (evt: ResultChangeEvent) => Iterable<ITestResult>;
export interface ITestResultService {
    readonly _serviceBrand: undefined;
    /**
     * Fired after any results are added, removed, or completed.
     */
    readonly onResultsChanged: Event<ResultChangeEvent>;
    /**
     * Fired when a test changed it state, or its computed state is updated.
     */
    readonly onTestChanged: Event<TestResultItemChange>;
    /**
     * List of known test results.
     */
    readonly results: ReadonlyArray<ITestResult>;
    /**
     * Discards all completed test results.
     */
    clear(): void;
    /**
     * Creates a new, live test result.
     */
    createLiveResult(req: ResolvedTestRunRequest | ExtensionRunTestsRequest): LiveTestResult;
    /**
     * Adds a new test result to the collection.
     */
    push<T extends ITestResult>(result: T): T;
    /**
     * Looks up a set of test results by ID.
     */
    getResult(resultId: string): ITestResult | undefined;
    /**
     * Looks up a test's most recent state, by its extension-assigned ID.
     */
    getStateById(extId: string): [results: ITestResult, item: TestResultItem] | undefined;
}
export declare const isRunningTests: (service: ITestResultService) => boolean;
export declare const ITestResultService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITestResultService>;
export declare class TestResultService implements ITestResultService {
    private readonly storage;
    private readonly testProfiles;
    _serviceBrand: undefined;
    private changeResultEmitter;
    private _results;
    private testChangeEmitter;
    /**
     * @inheritdoc
     */
    get results(): ITestResult[];
    /**
     * @inheritdoc
     */
    readonly onResultsChanged: Event<ResultChangeEvent>;
    /**
     * @inheritdoc
     */
    readonly onTestChanged: Event<TestResultItemChange>;
    private readonly isRunning;
    private readonly hasAnyResults;
    private readonly loadResults;
    protected readonly persistScheduler: RunOnceScheduler;
    constructor(contextKeyService: IContextKeyService, storage: ITestResultStorage, testProfiles: ITestProfileService);
    /**
     * @inheritdoc
     */
    getStateById(extId: string): [results: ITestResult, item: TestResultItem] | undefined;
    /**
     * @inheritdoc
     */
    createLiveResult(req: ResolvedTestRunRequest | ExtensionRunTestsRequest): LiveTestResult;
    /**
     * @inheritdoc
     */
    push<T extends ITestResult>(result: T): T;
    /**
     * @inheritdoc
     */
    getResult(id: string): ITestResult | undefined;
    /**
     * @inheritdoc
     */
    clear(): void;
    private onComplete;
    private resort;
    private updateIsRunning;
    protected persistImmediately(): Promise<void>;
}
