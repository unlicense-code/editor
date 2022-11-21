import { AbstractIncrementalTestCollection, IncrementalTestCollectionItem, InternalTestItem, TestsDiff } from 'vs/workbench/contrib/testing/common/testTypes';
import { IMainThreadTestCollection } from 'vs/workbench/contrib/testing/common/testService';
export declare class MainThreadTestCollection extends AbstractIncrementalTestCollection<IncrementalTestCollectionItem> implements IMainThreadTestCollection {
    private readonly expandActual;
    private busyProvidersChangeEmitter;
    private expandPromises;
    /**
     * @inheritdoc
     */
    get busyProviders(): number;
    /**
     * @inheritdoc
     */
    get rootItems(): Set<IncrementalTestCollectionItem>;
    /**
     * @inheritdoc
     */
    get all(): Generator<IncrementalTestCollectionItem, void, unknown>;
    get rootIds(): Iterable<string>;
    readonly onBusyProvidersChange: import("vs/base/common/event").Event<number>;
    constructor(expandActual: (id: string, levels: number) => Promise<void>);
    /**
     * @inheritdoc
     */
    expand(testId: string, levels: number): Promise<void>;
    /**
     * @inheritdoc
     */
    getNodeById(id: string): IncrementalTestCollectionItem | undefined;
    /**
     * @inheritdoc
     */
    getReviverDiff(): TestsDiff;
    /**
     * Applies the diff to the collection.
     */
    apply(diff: TestsDiff): void;
    /**
     * Clears everything from the collection, and returns a diff that applies
     * that action.
     */
    clear(): TestsDiff;
    /**
     * @override
     */
    protected createItem(internal: InternalTestItem): IncrementalTestCollectionItem;
    private getIterator;
}
