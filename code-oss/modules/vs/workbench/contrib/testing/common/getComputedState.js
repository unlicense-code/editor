/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Iterable } from 'vs/base/common/iterator';
import { maxPriority, statePriority } from 'vs/workbench/contrib/testing/common/testingStates';
export const isDurationAccessor = (accessor) => 'getOwnDuration' in accessor;
/**
 * Gets the computed state for the node.
 * @param force whether to refresh the computed state for this node, even
 * if it was previously set.
 */
export const getComputedState = (accessor, node, force = false) => {
    let computed = accessor.getCurrentComputedState(node);
    if (computed === undefined || force) {
        computed = accessor.getOwnState(node) ?? 0 /* TestResultState.Unset */;
        for (const child of accessor.getChildren(node)) {
            const childComputed = getComputedState(accessor, child);
            // If all children are skipped, make the current state skipped too if unset (#131537)
            computed = childComputed === 5 /* TestResultState.Skipped */ && computed === 0 /* TestResultState.Unset */
                ? 5 /* TestResultState.Skipped */ : maxPriority(computed, childComputed);
        }
        accessor.setComputedState(node, computed);
    }
    return computed;
};
export const getComputedDuration = (accessor, node, force = false) => {
    let computed = accessor.getCurrentComputedDuration(node);
    if (computed === undefined || force) {
        const own = accessor.getOwnDuration(node);
        if (own !== undefined) {
            computed = own;
        }
        else {
            computed = undefined;
            for (const child of accessor.getChildren(node)) {
                const d = getComputedDuration(accessor, child);
                if (d !== undefined) {
                    computed = (computed || 0) + d;
                }
            }
        }
        accessor.setComputedDuration(node, computed);
    }
    return computed;
};
/**
 * Refreshes the computed state for the node and its parents. Any changes
 * elements cause `addUpdated` to be called.
 */
export const refreshComputedState = (accessor, node, explicitNewComputedState, refreshDuration = true) => {
    const oldState = accessor.getCurrentComputedState(node);
    const oldPriority = statePriority[oldState];
    const newState = explicitNewComputedState ?? getComputedState(accessor, node, true);
    const newPriority = statePriority[newState];
    const toUpdate = new Set();
    if (newPriority !== oldPriority) {
        accessor.setComputedState(node, newState);
        toUpdate.add(node);
        if (newPriority > oldPriority) {
            // Update all parents to ensure they're at least this priority.
            for (const parent of accessor.getParents(node)) {
                const prev = accessor.getCurrentComputedState(parent);
                if (prev !== undefined && statePriority[prev] >= newPriority) {
                    break;
                }
                accessor.setComputedState(parent, newState);
                toUpdate.add(parent);
            }
        }
        else if (newPriority < oldPriority) {
            // Re-render all parents of this node whose computed priority might have come from this node
            for (const parent of accessor.getParents(node)) {
                const prev = accessor.getCurrentComputedState(parent);
                if (prev === undefined || statePriority[prev] > oldPriority) {
                    break;
                }
                accessor.setComputedState(parent, getComputedState(accessor, parent, true));
                toUpdate.add(parent);
            }
        }
    }
    if (isDurationAccessor(accessor) && refreshDuration) {
        for (const parent of Iterable.concat(Iterable.single(node), accessor.getParents(node))) {
            const oldDuration = accessor.getCurrentComputedDuration(parent);
            const newDuration = getComputedDuration(accessor, parent, true);
            if (oldDuration === newDuration) {
                break;
            }
            accessor.setComputedDuration(parent, newDuration);
            toUpdate.add(parent);
        }
    }
    return toUpdate;
};
