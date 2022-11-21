import { TestResultState } from 'vs/workbench/contrib/testing/common/testTypes';
/**
 * Accessor for nodes in get and refresh computed state.
 */
export interface IComputedStateAccessor<T> {
    getOwnState(item: T): TestResultState | undefined;
    getCurrentComputedState(item: T): TestResultState;
    setComputedState(item: T, state: TestResultState): void;
    getChildren(item: T): Iterable<T>;
    getParents(item: T): Iterable<T>;
}
export interface IComputedStateAndDurationAccessor<T> extends IComputedStateAccessor<T> {
    getOwnDuration(item: T): number | undefined;
    getCurrentComputedDuration(item: T): number | undefined;
    setComputedDuration(item: T, duration: number | undefined): void;
}
export declare const isDurationAccessor: <T>(accessor: IComputedStateAccessor<T>) => accessor is IComputedStateAndDurationAccessor<T>;
/**
 * Gets the computed state for the node.
 * @param force whether to refresh the computed state for this node, even
 * if it was previously set.
 */
export declare const getComputedState: <T>(accessor: IComputedStateAccessor<T>, node: T, force?: boolean) => TestResultState;
export declare const getComputedDuration: <T>(accessor: IComputedStateAndDurationAccessor<T>, node: T, force?: boolean) => number | undefined;
/**
 * Refreshes the computed state for the node and its parents. Any changes
 * elements cause `addUpdated` to be called.
 */
export declare const refreshComputedState: <T>(accessor: IComputedStateAccessor<T>, node: T, explicitNewComputedState?: TestResultState, refreshDuration?: boolean) => Set<T>;
