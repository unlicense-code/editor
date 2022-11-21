import { ObjectTree } from 'vs/base/browser/ui/tree/objectTree';
import { Event } from 'vs/base/common/event';
import { FuzzyScore } from 'vs/base/common/filters';
import { IMarkdownString } from 'vs/base/common/htmlContent';
import { IDisposable } from 'vs/base/common/lifecycle';
import { InternalTestItem, ITestItemContext, TestResultState } from 'vs/workbench/contrib/testing/common/testTypes';
/**
 * Describes a rendering of tests in the explorer view. Different
 * implementations of this are used for trees and lists, and groupings.
 * Originally this was implemented as inline logic within the ViewModel and
 * using a single IncrementalTestChangeCollector, but this became hairy
 * with status projections.
 */
export interface ITestTreeProjection extends IDisposable {
    /**
     * Event that fires when the projection changes.
     */
    onUpdate: Event<void>;
    /**
     * Fired when an element in the tree is expanded.
     */
    expandElement(element: TestItemTreeElement, depth: number): void;
    /**
     * Gets an element by its extension-assigned ID.
     */
    getElementByTestId(testId: string): TestItemTreeElement | undefined;
    /**
     * Applies pending update to the tree.
     */
    applyTo(tree: ObjectTree<TestExplorerTreeElement, FuzzyScore>): void;
}
/**
 * Interface describing the workspace folder and test item tree elements.
 */
export interface IActionableTestTreeElement {
    /**
     * Parent tree item.
     */
    parent: IActionableTestTreeElement | null;
    /**
     * Unique ID of the element in the tree.
     */
    treeId: string;
    /**
     * Test children of this item.
     */
    children: Set<TestExplorerTreeElement>;
    /**
     * Depth of the element in the tree.
     */
    depth: number;
    /**
     * Iterable of the tests this element contains.
     */
    tests: Iterable<InternalTestItem>;
    /**
     * State to show on the item. This is generally the item's computed state
     * from its children.
     */
    state: TestResultState;
    /**
     * Time it took this test/item to run.
     */
    duration: number | undefined;
    /**
     * Label for the item.
     */
    label: string;
}
export declare class TestItemTreeElement implements IActionableTestTreeElement {
    readonly test: InternalTestItem;
    readonly parent: TestItemTreeElement | null;
    /**
     * @inheritdoc
     */
    readonly children: Set<TestExplorerTreeElement>;
    /**
     * @inheritdoc
     */
    readonly treeId: string;
    /**
     * @inheritdoc
     */
    depth: number;
    get tests(): Iterable<InternalTestItem>;
    get description(): string | null;
    get sortText(): string | null;
    /**
     * Whether the node's test result is 'retired' -- from an outdated test run.
     */
    retired: boolean;
    /**
     * @inheritdoc
     */
    state: TestResultState;
    /**
     * Own, non-computed state.
     */
    ownState: TestResultState;
    /**
     * Own, non-computed duration.
     */
    ownDuration: number | undefined;
    /**
     * Time it took this test/item to run.
     */
    duration: number | undefined;
    /**
     * @inheritdoc
     */
    get label(): string;
    constructor(test: InternalTestItem, parent?: TestItemTreeElement | null);
    toJSON(): ITestItemContext | {
        controllerId: string;
    };
}
export declare class TestTreeErrorMessage {
    readonly message: string | IMarkdownString;
    readonly parent: TestExplorerTreeElement;
    readonly treeId: string;
    readonly children: Set<never>;
    get description(): string;
    constructor(message: string | IMarkdownString, parent: TestExplorerTreeElement);
}
export declare type TestExplorerTreeElement = TestItemTreeElement | TestTreeErrorMessage;
