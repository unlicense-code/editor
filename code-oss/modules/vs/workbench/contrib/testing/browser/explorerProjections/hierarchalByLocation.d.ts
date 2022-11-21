import { AbstractTreeViewState } from 'vs/base/browser/ui/tree/abstractTree';
import { ObjectTree } from 'vs/base/browser/ui/tree/objectTree';
import { FuzzyScore } from 'vs/base/common/filters';
import { Disposable } from 'vs/base/common/lifecycle';
import { ByLocationTestItemElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/hierarchalNodes';
import { IActionableTestTreeElement, ITestTreeProjection, TestExplorerTreeElement, TestItemTreeElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import { NodeChangeList, NodeRenderFn } from 'vs/workbench/contrib/testing/browser/explorerProjections/nodeHelper';
import { InternalTestItem } from 'vs/workbench/contrib/testing/common/testTypes';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
/**
 * Projection that lists tests in their traditional tree view.
 */
export declare class HierarchicalByLocationProjection extends Disposable implements ITestTreeProjection {
    private readonly lastState;
    private readonly testService;
    private readonly results;
    private readonly updateEmitter;
    protected readonly changes: NodeChangeList<ByLocationTestItemElement>;
    protected readonly items: Map<string, ByLocationTestItemElement>;
    /**
     * Gets root elements of the tree.
     */
    protected get roots(): Iterable<ByLocationTestItemElement>;
    /**
     * @inheritdoc
     */
    readonly onUpdate: import("vs/base/common/event").Event<void>;
    constructor(lastState: AbstractTreeViewState, testService: ITestService, results: ITestResultService);
    /**
     * Gets the depth of children to expanded automatically for the node,
     */
    protected getRevealDepth(element: ByLocationTestItemElement): number | undefined;
    /**
     * @inheritdoc
     */
    getElementByTestId(testId: string): TestItemTreeElement | undefined;
    /**
     * @inheritdoc
     */
    private applyDiff;
    /**
     * @inheritdoc
     */
    applyTo(tree: ObjectTree<TestExplorerTreeElement, FuzzyScore>): void;
    /**
     * @inheritdoc
     */
    expandElement(element: TestItemTreeElement, depth: number): void;
    protected createItem(item: InternalTestItem): ByLocationTestItemElement;
    protected readonly addUpdated: (item: IActionableTestTreeElement) => void;
    protected renderNode: NodeRenderFn;
    protected unstoreItem(items: Map<string, TestItemTreeElement>, treeElement: ByLocationTestItemElement): Set<TestExplorerTreeElement>;
    protected storeItem(treeElement: ByLocationTestItemElement): void;
}
