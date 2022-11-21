import { TestExplorerTreeElement, TestItemTreeElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import { InternalTestItem, ITestItemUpdate } from 'vs/workbench/contrib/testing/common/testTypes';
/**
 * Test tree element element that groups be hierarchy.
 */
export declare class ByLocationTestItemElement extends TestItemTreeElement {
    protected readonly addedOrRemoved: (n: TestExplorerTreeElement) => void;
    private errorChild?;
    constructor(test: InternalTestItem, parent: null | ByLocationTestItemElement, addedOrRemoved: (n: TestExplorerTreeElement) => void);
    update(patch: ITestItemUpdate): void;
    private updateErrorVisiblity;
}
