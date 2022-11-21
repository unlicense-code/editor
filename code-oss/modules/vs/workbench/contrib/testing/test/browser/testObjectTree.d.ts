import { ObjectTree } from 'vs/base/browser/ui/tree/objectTree';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkspaceFoldersChangeEvent } from 'vs/platform/workspace/common/workspace';
import { ITestTreeProjection, TestExplorerTreeElement } from 'vs/workbench/contrib/testing/browser/explorerProjections/index';
import { TestsDiffOp } from 'vs/workbench/contrib/testing/common/testTypes';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
declare type SerializedTree = {
    e: string;
    children?: SerializedTree[];
    data?: string;
};
export declare class TestObjectTree<T> extends ObjectTree<T, any> {
    constructor(serializer: (node: T) => string);
    getModel(): import("../../../../../base/browser/ui/tree/objectTreeModel").IObjectTreeModel<T, any>;
    getRendered(getProperty?: string): SerializedTree[] | undefined;
}
export declare class TestTreeTestHarness<T extends ITestTreeProjection = ITestTreeProjection> extends Disposable {
    readonly c: import("vs/workbench/contrib/testing/test/common/testStubs").TestTestCollection;
    private readonly onDiff;
    readonly onFolderChange: Emitter<IWorkspaceFoldersChangeEvent>;
    private isProcessingDiff;
    readonly projection: T;
    readonly tree: TestObjectTree<TestExplorerTreeElement>;
    constructor(makeTree: (listener: ITestService) => T, c?: import("vs/workbench/contrib/testing/test/common/testStubs").TestTestCollection);
    pushDiff(...diff: TestsDiffOp[]): void;
    flush(): SerializedTree[] | undefined;
}
export {};
