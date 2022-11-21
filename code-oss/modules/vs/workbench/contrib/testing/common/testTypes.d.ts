import { IMarkdownString } from 'vs/base/common/htmlContent';
import { MarshalledId } from 'vs/base/common/marshallingIds';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IPosition } from 'vs/editor/common/core/position';
import { IRange, Range } from 'vs/editor/common/core/range';
export declare const enum TestResultState {
    Unset = 0,
    Queued = 1,
    Running = 2,
    Passed = 3,
    Failed = 4,
    Skipped = 5,
    Errored = 6
}
export declare const enum TestRunProfileBitset {
    Run = 2,
    Debug = 4,
    Coverage = 8,
    HasNonDefaultProfile = 16,
    HasConfigurable = 32
}
/**
 * List of all test run profile bitset values.
 */
export declare const testRunProfileBitsetList: TestRunProfileBitset[];
/**
 * DTO for a controller's run profiles.
 */
export interface ITestRunProfile {
    controllerId: string;
    profileId: number;
    label: string;
    group: TestRunProfileBitset;
    isDefault: boolean;
    tag: string | null;
    hasConfigurationHandler: boolean;
}
/**
 * A fully-resolved request to run tests, passsed between the main thread
 * and extension host.
 */
export interface ResolvedTestRunRequest {
    targets: {
        testIds: string[];
        controllerId: string;
        profileGroup: TestRunProfileBitset;
        profileId: number;
    }[];
    exclude?: string[];
    isAutoRun?: boolean;
    /** Whether this was trigged by a user action in UI. Default=true */
    isUiTriggered?: boolean;
}
/**
 * Request to the main thread to run a set of tests.
 */
export interface ExtensionRunTestsRequest {
    id: string;
    include: string[];
    exclude: string[];
    controllerId: string;
    profile?: {
        group: TestRunProfileBitset;
        id: number;
    };
    persist: boolean;
}
/**
 * Request from the main thread to run tests for a single controller.
 */
export interface RunTestForControllerRequest {
    runId: string;
    controllerId: string;
    profileId: number;
    excludeExtIds: string[];
    testIds: string[];
}
export interface RunTestForControllerResult {
    error?: string;
}
/**
 * Location with a fully-instantiated Range and URI.
 */
export interface IRichLocation {
    range: Range;
    uri: URI;
}
export declare namespace IRichLocation {
    interface Serialize {
        range: IRange;
        uri: UriComponents;
    }
    const serialize: (location: IRichLocation) => Serialize;
    const deserialize: (location: Serialize) => IRichLocation;
}
export declare const enum TestMessageType {
    Error = 0,
    Output = 1
}
export interface ITestErrorMessage {
    message: string | IMarkdownString;
    type: TestMessageType.Error;
    expected: string | undefined;
    actual: string | undefined;
    location: IRichLocation | undefined;
}
export declare namespace ITestErrorMessage {
    interface Serialized {
        message: string | IMarkdownString;
        type: TestMessageType.Error;
        expected: string | undefined;
        actual: string | undefined;
        location: IRichLocation.Serialize | undefined;
    }
    const serialize: (message: ITestErrorMessage) => Serialized;
    const deserialize: (message: Serialized) => ITestErrorMessage;
}
export interface ITestOutputMessage {
    message: string;
    type: TestMessageType.Output;
    offset: number;
    length: number;
    marker?: number;
    location: IRichLocation | undefined;
}
/**
 * Gets the TTY marker ID for either starting or ending
 * an ITestOutputMessage.marker of the given ID.
 */
export declare const getMarkId: (marker: number, start: boolean) => string;
export declare namespace ITestOutputMessage {
    interface Serialized {
        message: string;
        offset: number;
        length: number;
        type: TestMessageType.Output;
        location: IRichLocation.Serialize | undefined;
    }
    const serialize: (message: ITestOutputMessage) => Serialized;
    const deserialize: (message: Serialized) => ITestOutputMessage;
}
export declare type ITestMessage = ITestErrorMessage | ITestOutputMessage;
export declare namespace ITestMessage {
    type Serialized = ITestErrorMessage.Serialized | ITestOutputMessage.Serialized;
    const serialize: (message: ITestMessage) => Serialized;
    const deserialize: (message: Serialized) => ITestMessage;
}
export interface ITestTaskState {
    state: TestResultState;
    duration: number | undefined;
    messages: ITestMessage[];
}
export declare namespace ITestTaskState {
    interface Serialized {
        state: TestResultState;
        duration: number | undefined;
        messages: ITestMessage.Serialized[];
    }
    const serializeWithoutMessages: (state: ITestTaskState) => Serialized;
    const serialize: (state: ITestTaskState) => Serialized;
    const deserialize: (state: Serialized) => ITestTaskState;
}
export interface ITestRunTask {
    id: string;
    name: string | undefined;
    running: boolean;
}
export interface ITestTag {
    readonly id: string;
}
export declare const namespaceTestTag: (ctrlId: string, tagId: string) => string;
export declare const denamespaceTestTag: (namespaced: string) => {
    ctrlId: string;
    tagId: string;
};
export interface ITestTagDisplayInfo {
    id: string;
}
/**
 * The TestItem from .d.ts, as a plain object without children.
 */
export interface ITestItem {
    /** ID of the test given by the test controller */
    extId: string;
    label: string;
    tags: string[];
    busy: boolean;
    children?: never;
    uri: URI | undefined;
    range: Range | null;
    description: string | null;
    error: string | IMarkdownString | null;
    sortText: string | null;
}
export declare namespace ITestItem {
    interface Serialized {
        extId: string;
        label: string;
        tags: string[];
        busy: boolean;
        children?: never;
        uri: UriComponents | undefined;
        range: IRange | null;
        description: string | null;
        error: string | IMarkdownString | null;
        sortText: string | null;
    }
    const serialize: (item: ITestItem) => Serialized;
    const deserialize: (serialized: Serialized) => ITestItem;
}
export declare const enum TestItemExpandState {
    NotExpandable = 0,
    Expandable = 1,
    BusyExpanding = 2,
    Expanded = 3
}
/**
 * TestItem-like shape, but with an ID and children as strings.
 */
export interface InternalTestItem {
    /** Controller ID from whence this test came */
    controllerId: string;
    /** Expandability state */
    expand: TestItemExpandState;
    /** Raw test item properties */
    item: ITestItem;
}
export declare namespace InternalTestItem {
    interface Serialized {
        expand: TestItemExpandState;
        item: ITestItem.Serialized;
    }
    const serialize: (item: InternalTestItem) => Serialized;
    const deserialize: (serialized: Serialized) => InternalTestItem;
}
/**
 * A partial update made to an existing InternalTestItem.
 */
export interface ITestItemUpdate {
    extId: string;
    expand?: TestItemExpandState;
    item?: Partial<ITestItem>;
}
export declare namespace ITestItemUpdate {
    interface Serialized {
        extId: string;
        expand?: TestItemExpandState;
        item?: Partial<ITestItem.Serialized>;
    }
    const serialize: (u: ITestItemUpdate) => Serialized;
    const deserialize: (u: Serialized) => ITestItemUpdate;
}
export declare const applyTestItemUpdate: (internal: InternalTestItem | ITestItemUpdate, patch: ITestItemUpdate) => void;
/**
 * Test result item used in the main thread.
 */
export interface TestResultItem extends InternalTestItem {
    /** State of this test in various tasks */
    tasks: ITestTaskState[];
    /** State of this test as a computation of its tasks */
    ownComputedState: TestResultState;
    /** Computed state based on children */
    computedState: TestResultState;
    /** Max duration of the item's tasks (if run directly) */
    ownDuration?: number;
    /** Whether this test item is outdated */
    retired?: boolean;
}
export declare namespace TestResultItem {
    /** Serialized version of the TestResultItem */
    interface Serialized extends InternalTestItem.Serialized {
        tasks: ITestTaskState.Serialized[];
        ownComputedState: TestResultState;
        computedState: TestResultState;
        retired?: boolean;
    }
    const serializeWithoutMessages: (original: TestResultItem) => Serialized;
    const serialize: (original: TestResultItem) => Serialized;
    const deserialize: (serialized: Serialized) => TestResultItem;
}
export interface ISerializedTestResults {
    /** ID of these test results */
    id: string;
    /** Time the results were compelted */
    completedAt: number;
    /** Subset of test result items */
    items: TestResultItem.Serialized[];
    /** Tasks involved in the run. */
    tasks: {
        id: string;
        name: string | undefined;
    }[];
    /** Human-readable name of the test run. */
    name: string;
    /** Test trigger informaton */
    request: ResolvedTestRunRequest;
}
export interface ITestCoverage {
    files: IFileCoverage[];
}
export interface ICoveredCount {
    covered: number;
    total: number;
}
export interface IFileCoverage {
    uri: URI;
    statement: ICoveredCount;
    branch?: ICoveredCount;
    function?: ICoveredCount;
    details?: CoverageDetails[];
}
export declare const enum DetailType {
    Function = 0,
    Statement = 1
}
export declare type CoverageDetails = IFunctionCoverage | IStatementCoverage;
export interface IBranchCoverage {
    count: number;
    location?: IRange | IPosition;
}
export interface IFunctionCoverage {
    type: DetailType.Function;
    count: number;
    location?: IRange | IPosition;
}
export interface IStatementCoverage {
    type: DetailType.Statement;
    count: number;
    location: IRange | IPosition;
    branches?: IBranchCoverage[];
}
export declare const enum TestDiffOpType {
    /** Adds a new test (with children) */
    Add = 0,
    /** Shallow-updates an existing test */
    Update = 1,
    /** Ranges of some tests in a document were synced, so it should be considered up-to-date */
    DocumentSynced = 2,
    /** Removes a test (and all its children) */
    Remove = 3,
    /** Changes the number of controllers who are yet to publish their collection roots. */
    IncrementPendingExtHosts = 4,
    /** Retires a test/result */
    Retire = 5,
    /** Add a new test tag */
    AddTag = 6,
    /** Remove a test tag */
    RemoveTag = 7
}
export declare type TestsDiffOp = {
    op: TestDiffOpType.Add;
    item: InternalTestItem;
} | {
    op: TestDiffOpType.Update;
    item: ITestItemUpdate;
} | {
    op: TestDiffOpType.Remove;
    itemId: string;
} | {
    op: TestDiffOpType.Retire;
    itemId: string;
} | {
    op: TestDiffOpType.IncrementPendingExtHosts;
    amount: number;
} | {
    op: TestDiffOpType.AddTag;
    tag: ITestTagDisplayInfo;
} | {
    op: TestDiffOpType.RemoveTag;
    id: string;
} | {
    op: TestDiffOpType.DocumentSynced;
    uri: URI;
    docv?: number;
};
export declare namespace TestsDiffOp {
    type Serialized = {
        op: TestDiffOpType.Add;
        item: InternalTestItem.Serialized;
    } | {
        op: TestDiffOpType.Update;
        item: ITestItemUpdate.Serialized;
    } | {
        op: TestDiffOpType.Remove;
        itemId: string;
    } | {
        op: TestDiffOpType.Retire;
        itemId: string;
    } | {
        op: TestDiffOpType.IncrementPendingExtHosts;
        amount: number;
    } | {
        op: TestDiffOpType.AddTag;
        tag: ITestTagDisplayInfo;
    } | {
        op: TestDiffOpType.RemoveTag;
        id: string;
    } | {
        op: TestDiffOpType.DocumentSynced;
        uri: UriComponents;
        docv?: number;
    };
    const deserialize: (u: Serialized) => TestsDiffOp;
    const serialize: (u: TestsDiffOp) => Serialized;
}
/**
 * Context for actions taken in the test explorer view.
 */
export interface ITestItemContext {
    /** Marshalling marker */
    $mid: MarshalledId.TestItemContext;
    /** Tests and parents from the root to the current items */
    tests: InternalTestItem.Serialized[];
}
/**
 * Request from the ext host or main thread to indicate that tests have
 * changed. It's assumed that any item upserted *must* have its children
 * previously also upserted, or upserted as part of the same operation.
 * Children that no longer exist in an upserted item will be removed.
 */
export declare type TestsDiff = TestsDiffOp[];
/**
 * @private
 */
export interface IncrementalTestCollectionItem extends InternalTestItem {
    children: Set<string>;
}
/**
 * The IncrementalChangeCollector is used in the IncrementalTestCollection
 * and called with diff changes as they're applied. This is used in the
 * ext host to create a cohesive change event from a diff.
 */
export declare class IncrementalChangeCollector<T> {
    /**
     * A node was added.
     */
    add(node: T): void;
    /**
     * A node in the collection was updated.
     */
    update(node: T): void;
    /**
     * A node was removed.
     */
    remove(node: T, isNestedOperation: boolean): void;
    /**
     * Called when the diff has been applied.
     */
    complete(): void;
}
/**
 * Maintains tests in this extension host sent from the main thread.
 */
export declare abstract class AbstractIncrementalTestCollection<T extends IncrementalTestCollectionItem> {
    private readonly _tags;
    /**
     * Map of item IDs to test item objects.
     */
    protected readonly items: Map<string, T>;
    /**
     * ID of test root items.
     */
    protected readonly roots: Set<T>;
    /**
     * Number of 'busy' controllers.
     */
    protected busyControllerCount: number;
    /**
     * Number of pending roots.
     */
    protected pendingRootCount: number;
    /**
     * Known test tags.
     */
    readonly tags: ReadonlyMap<string, ITestTagDisplayInfo>;
    /**
     * Applies the diff to the collection.
     */
    apply(diff: TestsDiff): void;
    /**
     * Called when the extension signals a test result should be retired.
     */
    protected retireTest(testId: string): void;
    /**
     * Updates the number of test root sources who are yet to report. When
     * the total pending test roots reaches 0, the roots for all controllers
     * will exist in the collection.
     */
    updatePendingRoots(delta: number): void;
    /**
     * Called before a diff is applied to create a new change collector.
     */
    protected createChangeCollector(): IncrementalChangeCollector<T>;
    /**
     * Creates a new item for the collection from the internal test item.
     */
    protected abstract createItem(internal: InternalTestItem, parent?: T): T;
}
