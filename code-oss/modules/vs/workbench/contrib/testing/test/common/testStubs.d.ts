import { URI } from 'vs/base/common/uri';
import { MainThreadTestCollection } from 'vs/workbench/contrib/testing/common/mainThreadTestCollection';
import { ITestItem, TestsDiff } from 'vs/workbench/contrib/testing/common/testTypes';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
import { ITestItemApi, ITestItemLike, TestItemCollection } from 'vs/workbench/contrib/testing/common/testItemCollection';
export declare class TestTestItem implements ITestItemLike {
    private readonly _extId;
    private readonly props;
    private _canResolveChildren;
    get tags(): {
        id: string;
    }[];
    set tags(value: {
        id: string;
    }[]);
    get canResolveChildren(): boolean;
    set canResolveChildren(value: boolean);
    get parent(): TestTestItem | undefined;
    get id(): string;
    api: ITestItemApi<TestTestItem>;
    children: import("vs/workbench/contrib/testing/common/testItemCollection").ITestItemChildren<TestTestItem>;
    constructor(_extId: TestId, label: string, uri?: URI);
    get<K extends keyof ITestItem>(key: K): ITestItem[K];
    set<K extends keyof ITestItem>(key: K, value: ITestItem[K]): void;
    toTestItem(): ITestItem;
}
export declare class TestTestCollection extends TestItemCollection<TestTestItem> {
    constructor(controllerId?: string);
    get currentDiff(): TestsDiff;
    setDiff(diff: TestsDiff): void;
}
/**
 * Gets a main thread test collection initialized with the given set of
 * roots/stubs.
 */
export declare const getInitializedMainTestCollection: (singleUse?: TestTestCollection) => Promise<MainThreadTestCollection>;
export declare const testStubs: {
    nested: (idPrefix?: string) => TestTestCollection;
};
