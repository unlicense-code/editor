/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from 'vs/base/common/uri';
import { Range } from 'vs/editor/common/core/range';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
export var TestResultState;
(function (TestResultState) {
    TestResultState[TestResultState["Unset"] = 0] = "Unset";
    TestResultState[TestResultState["Queued"] = 1] = "Queued";
    TestResultState[TestResultState["Running"] = 2] = "Running";
    TestResultState[TestResultState["Passed"] = 3] = "Passed";
    TestResultState[TestResultState["Failed"] = 4] = "Failed";
    TestResultState[TestResultState["Skipped"] = 5] = "Skipped";
    TestResultState[TestResultState["Errored"] = 6] = "Errored";
})(TestResultState || (TestResultState = {}));
export var TestRunProfileBitset;
(function (TestRunProfileBitset) {
    TestRunProfileBitset[TestRunProfileBitset["Run"] = 2] = "Run";
    TestRunProfileBitset[TestRunProfileBitset["Debug"] = 4] = "Debug";
    TestRunProfileBitset[TestRunProfileBitset["Coverage"] = 8] = "Coverage";
    TestRunProfileBitset[TestRunProfileBitset["HasNonDefaultProfile"] = 16] = "HasNonDefaultProfile";
    TestRunProfileBitset[TestRunProfileBitset["HasConfigurable"] = 32] = "HasConfigurable";
})(TestRunProfileBitset || (TestRunProfileBitset = {}));
/**
 * List of all test run profile bitset values.
 */
export const testRunProfileBitsetList = [
    2 /* TestRunProfileBitset.Run */,
    4 /* TestRunProfileBitset.Debug */,
    8 /* TestRunProfileBitset.Coverage */,
    16 /* TestRunProfileBitset.HasNonDefaultProfile */,
];
export var IRichLocation;
(function (IRichLocation) {
    IRichLocation.serialize = (location) => ({
        range: location.range.toJSON(),
        uri: location.uri.toJSON(),
    });
    IRichLocation.deserialize = (location) => ({
        range: Range.lift(location.range),
        uri: URI.revive(location.uri),
    });
})(IRichLocation || (IRichLocation = {}));
export var TestMessageType;
(function (TestMessageType) {
    TestMessageType[TestMessageType["Error"] = 0] = "Error";
    TestMessageType[TestMessageType["Output"] = 1] = "Output";
})(TestMessageType || (TestMessageType = {}));
export var ITestErrorMessage;
(function (ITestErrorMessage) {
    ITestErrorMessage.serialize = (message) => ({
        message: message.message,
        type: 0 /* TestMessageType.Error */,
        expected: message.expected,
        actual: message.actual,
        location: message.location && IRichLocation.serialize(message.location),
    });
    ITestErrorMessage.deserialize = (message) => ({
        message: message.message,
        type: 0 /* TestMessageType.Error */,
        expected: message.expected,
        actual: message.actual,
        location: message.location && IRichLocation.deserialize(message.location),
    });
})(ITestErrorMessage || (ITestErrorMessage = {}));
/**
 * Gets the TTY marker ID for either starting or ending
 * an ITestOutputMessage.marker of the given ID.
 */
export const getMarkId = (marker, start) => `${start ? 's' : 'e'}${marker}`;
export var ITestOutputMessage;
(function (ITestOutputMessage) {
    ITestOutputMessage.serialize = (message) => ({
        message: message.message,
        type: 1 /* TestMessageType.Output */,
        offset: message.offset,
        length: message.length,
        location: message.location && IRichLocation.serialize(message.location),
    });
    ITestOutputMessage.deserialize = (message) => ({
        message: message.message,
        type: 1 /* TestMessageType.Output */,
        offset: message.offset,
        length: message.length,
        location: message.location && IRichLocation.deserialize(message.location),
    });
})(ITestOutputMessage || (ITestOutputMessage = {}));
export var ITestMessage;
(function (ITestMessage) {
    ITestMessage.serialize = (message) => message.type === 0 /* TestMessageType.Error */ ? ITestErrorMessage.serialize(message) : ITestOutputMessage.serialize(message);
    ITestMessage.deserialize = (message) => message.type === 0 /* TestMessageType.Error */ ? ITestErrorMessage.deserialize(message) : ITestOutputMessage.deserialize(message);
})(ITestMessage || (ITestMessage = {}));
export var ITestTaskState;
(function (ITestTaskState) {
    ITestTaskState.serializeWithoutMessages = (state) => ({
        state: state.state,
        duration: state.duration,
        messages: [],
    });
    ITestTaskState.serialize = (state) => ({
        state: state.state,
        duration: state.duration,
        messages: state.messages.map(ITestMessage.serialize),
    });
    ITestTaskState.deserialize = (state) => ({
        state: state.state,
        duration: state.duration,
        messages: state.messages.map(ITestMessage.deserialize),
    });
})(ITestTaskState || (ITestTaskState = {}));
const testTagDelimiter = '\0';
export const namespaceTestTag = (ctrlId, tagId) => ctrlId + testTagDelimiter + tagId;
export const denamespaceTestTag = (namespaced) => {
    const index = namespaced.indexOf(testTagDelimiter);
    return { ctrlId: namespaced.slice(0, index), tagId: namespaced.slice(index + 1) };
};
export var ITestItem;
(function (ITestItem) {
    ITestItem.serialize = (item) => ({
        extId: item.extId,
        label: item.label,
        tags: item.tags,
        busy: item.busy,
        children: undefined,
        uri: item.uri?.toJSON(),
        range: item.range?.toJSON() || null,
        description: item.description,
        error: item.error,
        sortText: item.sortText
    });
    ITestItem.deserialize = (serialized) => ({
        extId: serialized.extId,
        label: serialized.label,
        tags: serialized.tags,
        busy: serialized.busy,
        children: undefined,
        uri: serialized.uri ? URI.revive(serialized.uri) : undefined,
        range: serialized.range ? Range.lift(serialized.range) : null,
        description: serialized.description,
        error: serialized.error,
        sortText: serialized.sortText
    });
})(ITestItem || (ITestItem = {}));
export var TestItemExpandState;
(function (TestItemExpandState) {
    TestItemExpandState[TestItemExpandState["NotExpandable"] = 0] = "NotExpandable";
    TestItemExpandState[TestItemExpandState["Expandable"] = 1] = "Expandable";
    TestItemExpandState[TestItemExpandState["BusyExpanding"] = 2] = "BusyExpanding";
    TestItemExpandState[TestItemExpandState["Expanded"] = 3] = "Expanded";
})(TestItemExpandState || (TestItemExpandState = {}));
export var InternalTestItem;
(function (InternalTestItem) {
    InternalTestItem.serialize = (item) => ({
        expand: item.expand,
        item: ITestItem.serialize(item.item)
    });
    InternalTestItem.deserialize = (serialized) => ({
        // the `controllerId` is derived from the test.item.extId. It's redundant
        // in the non-serialized InternalTestItem too, but there just because it's
        // checked against in many hot paths.
        controllerId: TestId.root(serialized.item.extId),
        expand: serialized.expand,
        item: ITestItem.deserialize(serialized.item)
    });
})(InternalTestItem || (InternalTestItem = {}));
export var ITestItemUpdate;
(function (ITestItemUpdate) {
    ITestItemUpdate.serialize = (u) => {
        let item;
        if (u.item) {
            item = {};
            if (u.item.label !== undefined) {
                item.label = u.item.label;
            }
            if (u.item.tags !== undefined) {
                item.tags = u.item.tags;
            }
            if (u.item.busy !== undefined) {
                item.busy = u.item.busy;
            }
            if (u.item.uri !== undefined) {
                item.uri = u.item.uri?.toJSON();
            }
            if (u.item.range !== undefined) {
                item.range = u.item.range?.toJSON();
            }
            if (u.item.description !== undefined) {
                item.description = u.item.description;
            }
            if (u.item.error !== undefined) {
                item.error = u.item.error;
            }
            if (u.item.sortText !== undefined) {
                item.sortText = u.item.sortText;
            }
        }
        return { extId: u.extId, expand: u.expand, item };
    };
    ITestItemUpdate.deserialize = (u) => {
        let item;
        if (u.item) {
            item = {};
            if (u.item.label !== undefined) {
                item.label = u.item.label;
            }
            if (u.item.tags !== undefined) {
                item.tags = u.item.tags;
            }
            if (u.item.busy !== undefined) {
                item.busy = u.item.busy;
            }
            if (u.item.range !== undefined) {
                item.range = u.item.range ? Range.lift(u.item.range) : null;
            }
            if (u.item.description !== undefined) {
                item.description = u.item.description;
            }
            if (u.item.error !== undefined) {
                item.error = u.item.error;
            }
            if (u.item.sortText !== undefined) {
                item.sortText = u.item.sortText;
            }
        }
        return { extId: u.extId, expand: u.expand, item };
    };
})(ITestItemUpdate || (ITestItemUpdate = {}));
export const applyTestItemUpdate = (internal, patch) => {
    if (patch.expand !== undefined) {
        internal.expand = patch.expand;
    }
    if (patch.item !== undefined) {
        internal.item = internal.item ? Object.assign(internal.item, patch.item) : patch.item;
    }
};
export var TestResultItem;
(function (TestResultItem) {
    TestResultItem.serializeWithoutMessages = (original) => ({
        ...InternalTestItem.serialize(original),
        ownComputedState: original.ownComputedState,
        computedState: original.computedState,
        tasks: original.tasks.map(ITestTaskState.serializeWithoutMessages),
        retired: original.retired,
    });
    TestResultItem.serialize = (original) => ({
        ...InternalTestItem.serialize(original),
        ownComputedState: original.ownComputedState,
        computedState: original.computedState,
        tasks: original.tasks.map(ITestTaskState.serialize),
        retired: original.retired,
    });
    TestResultItem.deserialize = (serialized) => ({
        ...InternalTestItem.deserialize(serialized),
        ownComputedState: serialized.ownComputedState,
        computedState: serialized.computedState,
        tasks: serialized.tasks.map(ITestTaskState.deserialize),
        retired: true,
    });
})(TestResultItem || (TestResultItem = {}));
export var DetailType;
(function (DetailType) {
    DetailType[DetailType["Function"] = 0] = "Function";
    DetailType[DetailType["Statement"] = 1] = "Statement";
})(DetailType || (DetailType = {}));
export var TestDiffOpType;
(function (TestDiffOpType) {
    /** Adds a new test (with children) */
    TestDiffOpType[TestDiffOpType["Add"] = 0] = "Add";
    /** Shallow-updates an existing test */
    TestDiffOpType[TestDiffOpType["Update"] = 1] = "Update";
    /** Ranges of some tests in a document were synced, so it should be considered up-to-date */
    TestDiffOpType[TestDiffOpType["DocumentSynced"] = 2] = "DocumentSynced";
    /** Removes a test (and all its children) */
    TestDiffOpType[TestDiffOpType["Remove"] = 3] = "Remove";
    /** Changes the number of controllers who are yet to publish their collection roots. */
    TestDiffOpType[TestDiffOpType["IncrementPendingExtHosts"] = 4] = "IncrementPendingExtHosts";
    /** Retires a test/result */
    TestDiffOpType[TestDiffOpType["Retire"] = 5] = "Retire";
    /** Add a new test tag */
    TestDiffOpType[TestDiffOpType["AddTag"] = 6] = "AddTag";
    /** Remove a test tag */
    TestDiffOpType[TestDiffOpType["RemoveTag"] = 7] = "RemoveTag";
})(TestDiffOpType || (TestDiffOpType = {}));
export var TestsDiffOp;
(function (TestsDiffOp) {
    TestsDiffOp.deserialize = (u) => {
        if (u.op === 0 /* TestDiffOpType.Add */) {
            return { op: u.op, item: InternalTestItem.deserialize(u.item) };
        }
        else if (u.op === 1 /* TestDiffOpType.Update */) {
            return { op: u.op, item: ITestItemUpdate.deserialize(u.item) };
        }
        else if (u.op === 2 /* TestDiffOpType.DocumentSynced */) {
            return { op: u.op, uri: URI.revive(u.uri), docv: u.docv };
        }
        else {
            return u;
        }
    };
    TestsDiffOp.serialize = (u) => {
        if (u.op === 0 /* TestDiffOpType.Add */) {
            return { op: u.op, item: InternalTestItem.serialize(u.item) };
        }
        else if (u.op === 1 /* TestDiffOpType.Update */) {
            return { op: u.op, item: ITestItemUpdate.serialize(u.item) };
        }
        else {
            return u;
        }
    };
})(TestsDiffOp || (TestsDiffOp = {}));
/**
 * The IncrementalChangeCollector is used in the IncrementalTestCollection
 * and called with diff changes as they're applied. This is used in the
 * ext host to create a cohesive change event from a diff.
 */
export class IncrementalChangeCollector {
    /**
     * A node was added.
     */
    add(node) { }
    /**
     * A node in the collection was updated.
     */
    update(node) { }
    /**
     * A node was removed.
     */
    remove(node, isNestedOperation) { }
    /**
     * Called when the diff has been applied.
     */
    complete() { }
}
/**
 * Maintains tests in this extension host sent from the main thread.
 */
export class AbstractIncrementalTestCollection {
    _tags = new Map();
    /**
     * Map of item IDs to test item objects.
     */
    items = new Map();
    /**
     * ID of test root items.
     */
    roots = new Set();
    /**
     * Number of 'busy' controllers.
     */
    busyControllerCount = 0;
    /**
     * Number of pending roots.
     */
    pendingRootCount = 0;
    /**
     * Known test tags.
     */
    tags = this._tags;
    /**
     * Applies the diff to the collection.
     */
    apply(diff) {
        const changes = this.createChangeCollector();
        for (const op of diff) {
            switch (op.op) {
                case 0 /* TestDiffOpType.Add */: {
                    const internalTest = InternalTestItem.deserialize(op.item);
                    const parentId = TestId.parentId(internalTest.item.extId)?.toString();
                    if (!parentId) {
                        const created = this.createItem(internalTest);
                        this.roots.add(created);
                        this.items.set(internalTest.item.extId, created);
                        changes.add(created);
                    }
                    else if (this.items.has(parentId)) {
                        const parent = this.items.get(parentId);
                        parent.children.add(internalTest.item.extId);
                        const created = this.createItem(internalTest, parent);
                        this.items.set(internalTest.item.extId, created);
                        changes.add(created);
                    }
                    if (internalTest.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                        this.busyControllerCount++;
                    }
                    break;
                }
                case 1 /* TestDiffOpType.Update */: {
                    const patch = ITestItemUpdate.deserialize(op.item);
                    const existing = this.items.get(patch.extId);
                    if (!existing) {
                        break;
                    }
                    if (patch.expand !== undefined) {
                        if (existing.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                            this.busyControllerCount--;
                        }
                        if (patch.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                            this.busyControllerCount++;
                        }
                    }
                    applyTestItemUpdate(existing, patch);
                    changes.update(existing);
                    break;
                }
                case 3 /* TestDiffOpType.Remove */: {
                    const toRemove = this.items.get(op.itemId);
                    if (!toRemove) {
                        break;
                    }
                    const parentId = TestId.parentId(toRemove.item.extId)?.toString();
                    if (parentId) {
                        const parent = this.items.get(parentId);
                        parent.children.delete(toRemove.item.extId);
                    }
                    else {
                        this.roots.delete(toRemove);
                    }
                    const queue = [[op.itemId]];
                    while (queue.length) {
                        for (const itemId of queue.pop()) {
                            const existing = this.items.get(itemId);
                            if (existing) {
                                queue.push(existing.children);
                                this.items.delete(itemId);
                                changes.remove(existing, existing !== toRemove);
                                if (existing.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                                    this.busyControllerCount--;
                                }
                            }
                        }
                    }
                    break;
                }
                case 5 /* TestDiffOpType.Retire */:
                    this.retireTest(op.itemId);
                    break;
                case 4 /* TestDiffOpType.IncrementPendingExtHosts */:
                    this.updatePendingRoots(op.amount);
                    break;
                case 6 /* TestDiffOpType.AddTag */:
                    this._tags.set(op.tag.id, op.tag);
                    break;
                case 7 /* TestDiffOpType.RemoveTag */:
                    this._tags.delete(op.id);
                    break;
            }
        }
        changes.complete();
    }
    /**
     * Called when the extension signals a test result should be retired.
     */
    retireTest(testId) {
        // no-op
    }
    /**
     * Updates the number of test root sources who are yet to report. When
     * the total pending test roots reaches 0, the roots for all controllers
     * will exist in the collection.
     */
    updatePendingRoots(delta) {
        this.pendingRootCount += delta;
    }
    /**
     * Called before a diff is applied to create a new change collector.
     */
    createChangeCollector() {
        return new IncrementalChangeCollector();
    }
}
