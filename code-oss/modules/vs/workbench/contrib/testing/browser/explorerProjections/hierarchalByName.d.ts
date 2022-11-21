import { AbstractTreeViewState } from 'vs/base/browser/ui/tree/abstractTree';
import { TestExplorerTreeElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import { HierarchicalByLocationProjection as HierarchicalByLocationProjection } from 'vs/workbench/contrib/testing/browser/explorerProjections/hierarchalByLocation';
import { ByLocationTestItemElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/hierarchalNodes';
import { InternalTestItem } from 'vs/workbench/contrib/testing/common/testTypes';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
/**
 * Type of test element in the list.
 */
export declare const enum ListElementType {
    /** The element is a leaf test that should be shown in the list */
    Leaf = 0,
    /** The element is not runnable, but doesn't have any nested leaf tests */
    Branch = 1
}
/**
 * Version of the HierarchicalElement that is displayed as a list.
 */
export declare class ByNameTestItemElement extends ByLocationTestItemElement {
    readonly actualParent?: ByNameTestItemElement | undefined;
    elementType: ListElementType;
    readonly isTestRoot: boolean;
    readonly actualChildren: Set<ByNameTestItemElement>;
    get description(): string | null;
    /**
     * @param actualParent Parent of the item in the test heirarchy
     */
    constructor(internal: InternalTestItem, parentItem: null | ByLocationTestItemElement, addedOrRemoved: (n: TestExplorerTreeElement) => void, actualParent?: ByNameTestItemElement | undefined);
    /**
     * Should be called when the list element is removed.
     */
    remove(): void;
    private removeChild;
    private addChild;
}
/**
 * Projection that shows tests in a flat list (grouped by provider). The only
 * change is that, while creating the item, the item parent is set to the
 * test root rather than the heirarchal parent.
 */
export declare class HierarchicalByNameProjection extends HierarchicalByLocationProjection {
    constructor(lastState: AbstractTreeViewState, testService: ITestService, results: ITestResultService);
    /**
     * @override
     */
    protected createItem(item: InternalTestItem): ByLocationTestItemElement;
    /**
     * @override
     */
    protected unstoreItem(items: Map<string, ByLocationTestItemElement>, item: ByLocationTestItemElement): Set<TestExplorerTreeElement>;
    /**
     * @override
     */
    protected getRevealDepth(element: ByLocationTestItemElement): number | undefined;
}
