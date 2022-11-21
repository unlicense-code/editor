import { TestResultState } from 'vs/workbench/contrib/testing/common/testTypes';
export declare type TreeStateNode = {
    statusNode: true;
    state: TestResultState;
    priority: number;
};
/**
 * List of display priorities for different run states. When tests update,
 * the highest-priority state from any of their children will be the state
 * reflected in the parent node.
 */
export declare const statePriority: {
    [K in TestResultState]: number;
};
export declare const isFailedState: (s: TestResultState) => boolean;
export declare const isStateWithResult: (s: TestResultState) => boolean;
export declare const stateNodes: {
    0: TreeStateNode;
    1: TreeStateNode;
    2: TreeStateNode;
    3: TreeStateNode;
    4: TreeStateNode;
    5: TreeStateNode;
    6: TreeStateNode;
};
export declare const cmpPriority: (a: TestResultState, b: TestResultState) => number;
export declare const maxPriority: (...states: TestResultState[]) => TestResultState;
export declare const statesInOrder: TestResultState[];
export declare const isRunningState: (s: TestResultState) => boolean;
/**
 * Some states are considered terminal; once these are set for a given test run, they
 * are not reset back to a non-terminal state, or to a terminal state with lower
 * priority.
 */
export declare const terminalStatePriorities: {
    [key in TestResultState]?: number;
};
