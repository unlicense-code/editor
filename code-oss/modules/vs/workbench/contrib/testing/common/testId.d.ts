export declare const enum TestIdPathParts {
    /** Delimiter for path parts in test IDs */
    Delimiter = "\0"
}
/**
 * Enum for describing relative positions of tests. Similar to
 * `node.compareDocumentPosition` in the DOM.
 */
export declare const enum TestPosition {
    /** a === b */
    IsSame = 0,
    /** Neither a nor b are a child of one another. They may share a common parent, though. */
    Disconnected = 1,
    /** b is a child of a */
    IsChild = 2,
    /** b is a parent of a */
    IsParent = 3
}
declare type TestItemLike = {
    id: string;
    parent?: TestItemLike;
    _isRoot?: boolean;
};
/**
 * The test ID is a stringifiable client that
 */
export declare class TestId {
    readonly path: readonly string[];
    private readonly viewEnd;
    private stringifed?;
    /**
     * Creates a test ID from an ext host test item.
     */
    static fromExtHostTestItem(item: TestItemLike, rootId: string, parent?: TestItemLike | undefined): TestId;
    /**
     * Cheaply ets whether the ID refers to the root .
     */
    static isRoot(idString: string): boolean;
    /**
     * Cheaply gets whether the ID refers to the root .
     */
    static root(idString: string): string;
    /**
     * Creates a test ID from a serialized TestId instance.
     */
    static fromString(idString: string): TestId;
    /**
     * Gets the ID resulting from adding b to the base ID.
     */
    static join(base: TestId, b: string): TestId;
    /**
     * Gets the string ID resulting from adding b to the base ID.
     */
    static joinToString(base: string | TestId, b: string): string;
    /**
     * Cheaply gets the parent ID of a test identified with the string.
     */
    static parentId(idString: string): string | undefined;
    /**
     * Compares the position of the two ID strings.
     */
    static compare(a: string, b: string): TestPosition;
    constructor(path: readonly string[], viewEnd?: number);
    /**
     * Gets the ID of the parent test.
     */
    get parentId(): TestId | undefined;
    /**
     * Gets the local ID of the current full test ID.
     */
    get localId(): string;
    /**
     * Gets whether this ID refers to the root.
     */
    get controllerId(): string;
    /**
     * Gets whether this ID refers to the root.
     */
    get isRoot(): boolean;
    /**
     * Returns an iterable that yields IDs of all parent items down to and
     * including the current item.
     */
    idsFromRoot(): Generator<TestId, void, unknown>;
    /**
     * Returns an iterable that yields IDs of the current item up to the root
     * item.
     */
    idsToRoot(): Generator<TestId, void, unknown>;
    /**
     * Compares the other test ID with this one.
     */
    compare(other: TestId | string): TestPosition;
    /**
     * Serializes the ID.
     */
    toJSON(): string;
    /**
     * Serializes the ID to a string.
     */
    toString(): string;
}
export {};
