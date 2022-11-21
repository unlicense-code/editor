/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { newWriteableBufferStream, VSBuffer } from 'vs/base/common/buffer';
import { Emitter } from 'vs/base/common/event';
import { Lazy } from 'vs/base/common/lazy';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { refreshComputedState } from 'vs/workbench/contrib/testing/common/getComputedState';
import { MutableObservableValue, staticObservableValue } from 'vs/workbench/contrib/testing/common/observableValue';
import { getMarkId, TestResultItem } from 'vs/workbench/contrib/testing/common/testTypes';
import { maxPriority, statesInOrder, terminalStatePriorities } from 'vs/workbench/contrib/testing/common/testingStates';
import { removeAnsiEscapeCodes } from 'vs/base/common/strings';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
export const resultItemParents = function* (results, item) {
    for (const id of TestId.fromString(item.item.extId).idsToRoot()) {
        yield results.getStateById(id.toString());
    }
};
export const makeEmptyCounts = () => {
    const o = {};
    for (const state of statesInOrder) {
        o[state] = 0;
    }
    return o;
};
export const sumCounts = (counts) => {
    const total = makeEmptyCounts();
    for (const count of counts) {
        for (const state of statesInOrder) {
            total[state] += count[state];
        }
    }
    return total;
};
export const maxCountPriority = (counts) => {
    for (const state of statesInOrder) {
        if (counts[state] > 0) {
            return state;
        }
    }
    return 0 /* TestResultState.Unset */;
};
const getMarkCode = (marker, start) => `\x1b]633;SetMark;Id=${getMarkId(marker, start)};Hidden\x07`;
/**
 * Deals with output of a {@link LiveTestResult}. By default we pass-through
 * data into the underlying write stream, but if a client requests to read it
 * we splice in the written data and then continue streaming incoming data.
 */
export class LiveOutputController {
    writer;
    reader;
    rangeReader;
    /** Set on close() to a promise that is resolved once closing is complete */
    closed;
    /** Data written so far. This is available until the file closes. */
    previouslyWritten = [];
    dataEmitter = new Emitter();
    endEmitter = new Emitter();
    _offset = 0;
    /**
     * Gets the number of written bytes.
     */
    get offset() {
        return this._offset;
    }
    constructor(writer, reader, rangeReader) {
        this.writer = writer;
        this.reader = reader;
        this.rangeReader = rangeReader;
    }
    /**
     * Appends data to the output.
     */
    append(data, marker) {
        if (this.closed) {
            return this.closed;
        }
        if (marker !== undefined) {
            data = VSBuffer.concat([
                VSBuffer.fromString(getMarkCode(marker, true)),
                data,
                VSBuffer.fromString(getMarkCode(marker, false)),
            ]);
        }
        this.previouslyWritten?.push(data);
        this.dataEmitter.fire(data);
        this._offset += data.byteLength;
        return this.writer.getValue()[0].write(data);
    }
    /**
     * Reads a range of data from the output.
     */
    getRange(offset, length) {
        if (!this.previouslyWritten) {
            return this.rangeReader(offset, length);
        }
        const buffer = VSBuffer.alloc(length);
        let pos = 0;
        for (const chunk of this.previouslyWritten) {
            if (pos + chunk.byteLength < offset) {
                // no-op
            }
            else if (pos > offset + length) {
                break;
            }
            else {
                const cs = Math.max(0, offset - pos);
                const bs = Math.max(0, pos - offset);
                buffer.set(chunk.slice(cs, cs + Math.min(length - bs, chunk.byteLength - cs)), bs);
            }
            pos += chunk.byteLength;
        }
        const trailing = (offset + length) - pos;
        return Promise.resolve(trailing > 0 ? buffer.slice(0, -trailing) : buffer);
    }
    /**
     * Reads the value of the stream.
     */
    read() {
        if (!this.previouslyWritten) {
            return this.reader();
        }
        const stream = newWriteableBufferStream();
        for (const chunk of this.previouslyWritten) {
            stream.write(chunk);
        }
        const disposable = new DisposableStore();
        disposable.add(this.dataEmitter.event(d => stream.write(d)));
        disposable.add(this.endEmitter.event(() => stream.end()));
        stream.on('end', () => disposable.dispose());
        return Promise.resolve(stream);
    }
    /**
     * Closes the output, signalling no more writes will be made.
     * @returns a promise that resolves when the output is written
     */
    close() {
        if (this.closed) {
            return this.closed;
        }
        if (!this.writer.hasValue()) {
            this.closed = Promise.resolve();
        }
        else {
            const [stream, ended] = this.writer.getValue();
            stream.end();
            this.closed = ended;
        }
        this.endEmitter.fire();
        this.closed.then(() => {
            this.previouslyWritten = undefined;
            this.dataEmitter.dispose();
            this.endEmitter.dispose();
        });
        return this.closed;
    }
}
const itemToNode = (controllerId, item, parent) => ({
    controllerId,
    expand: 0 /* TestItemExpandState.NotExpandable */,
    item: { ...item },
    children: [],
    tasks: [],
    ownComputedState: 0 /* TestResultState.Unset */,
    computedState: 0 /* TestResultState.Unset */,
});
export var TestResultItemChangeReason;
(function (TestResultItemChangeReason) {
    TestResultItemChangeReason[TestResultItemChangeReason["ComputedStateChange"] = 0] = "ComputedStateChange";
    TestResultItemChangeReason[TestResultItemChangeReason["OwnStateChange"] = 1] = "OwnStateChange";
})(TestResultItemChangeReason || (TestResultItemChangeReason = {}));
/**
 * Results of a test. These are created when the test initially started running
 * and marked as "complete" when the run finishes.
 */
export class LiveTestResult {
    id;
    output;
    persist;
    request;
    completeEmitter = new Emitter();
    changeEmitter = new Emitter();
    testById = new Map();
    testMarkerCounter = 0;
    _completedAt;
    onChange = this.changeEmitter.event;
    onComplete = this.completeEmitter.event;
    tasks = [];
    name = localize('runFinished', 'Test run at {0}', new Date().toLocaleString());
    /**
     * @inheritdoc
     */
    get completedAt() {
        return this._completedAt;
    }
    /**
     * @inheritdoc
     */
    counts = makeEmptyCounts();
    /**
     * @inheritdoc
     */
    get tests() {
        return this.testById.values();
    }
    computedStateAccessor = {
        getOwnState: i => i.ownComputedState,
        getCurrentComputedState: i => i.computedState,
        setComputedState: (i, s) => i.computedState = s,
        getChildren: i => i.children,
        getParents: i => {
            const { testById: testByExtId } = this;
            return (function* () {
                const parentId = TestId.fromString(i.item.extId).parentId;
                if (parentId) {
                    for (const id of parentId.idsToRoot()) {
                        yield testByExtId.get(id.toString());
                    }
                }
            })();
        },
    };
    constructor(id, output, persist, request) {
        this.id = id;
        this.output = output;
        this.persist = persist;
        this.request = request;
    }
    /**
     * @inheritdoc
     */
    getStateById(extTestId) {
        return this.testById.get(extTestId);
    }
    /**
     * Appends output that occurred during the test run.
     */
    appendOutput(output, taskId, location, testId) {
        const preview = output.byteLength > 100 ? output.slice(0, 100).toString() + '…' : output.toString();
        let marker;
        // currently, the UI only exposes jump-to-message from tests or locations,
        // so no need to mark outputs that don't come from either of those.
        if (testId || location) {
            marker = this.testMarkerCounter++;
        }
        const message = {
            location,
            message: removeAnsiEscapeCodes(preview),
            offset: this.output.offset,
            length: output.byteLength,
            marker: marker,
            type: 1 /* TestMessageType.Output */,
        };
        this.output.append(output, marker);
        const index = this.mustGetTaskIndex(taskId);
        if (testId) {
            this.testById.get(testId)?.tasks[index].messages.push(message);
        }
        else {
            this.tasks[index].otherMessages.push(message);
        }
    }
    /**
     * Adds a new run task to the results.
     */
    addTask(task) {
        const index = this.tasks.length;
        this.tasks.push({ ...task, coverage: new MutableObservableValue(undefined), otherMessages: [] });
        for (const test of this.tests) {
            test.tasks.push({ duration: undefined, messages: [], state: 0 /* TestResultState.Unset */ });
            this.fireUpdateAndRefresh(test, index, 1 /* TestResultState.Queued */);
        }
    }
    /**
     * Add the chain of tests to the run. The first test in the chain should
     * be either a test root, or a previously-known test.
     */
    addTestChainToRun(controllerId, chain) {
        let parent = this.testById.get(chain[0].extId);
        if (!parent) { // must be a test root
            parent = this.addTestToRun(controllerId, chain[0], null);
        }
        for (let i = 1; i < chain.length; i++) {
            parent = this.addTestToRun(controllerId, chain[i], parent.item.extId);
        }
        for (let i = 0; i < this.tasks.length; i++) {
            this.fireUpdateAndRefresh(parent, i, 1 /* TestResultState.Queued */);
        }
        return undefined;
    }
    /**
     * Updates the state of the test by its internal ID.
     */
    updateState(testId, taskId, state, duration) {
        const entry = this.testById.get(testId);
        if (!entry) {
            return;
        }
        const index = this.mustGetTaskIndex(taskId);
        const oldTerminalStatePrio = terminalStatePriorities[entry.tasks[index].state];
        const newTerminalStatePrio = terminalStatePriorities[state];
        // Ignore requests to set the state from one terminal state back to a
        // "lower" one, e.g. from failed back to passed:
        if (oldTerminalStatePrio !== undefined &&
            (newTerminalStatePrio === undefined || newTerminalStatePrio < oldTerminalStatePrio)) {
            return;
        }
        this.fireUpdateAndRefresh(entry, index, state, duration);
    }
    /**
     * Appends a message for the test in the run.
     */
    appendMessage(testId, taskId, message) {
        const entry = this.testById.get(testId);
        if (!entry) {
            return;
        }
        entry.tasks[this.mustGetTaskIndex(taskId)].messages.push(message);
        this.changeEmitter.fire({
            item: entry,
            result: this,
            reason: 1 /* TestResultItemChangeReason.OwnStateChange */,
            previousState: entry.ownComputedState,
            previousOwnDuration: entry.ownDuration,
        });
    }
    /**
     * @inheritdoc
     */
    getOutput() {
        return this.output.read();
    }
    /**
     * @inheritdoc
     */
    getOutputRange(offset, bytes) {
        return this.output.getRange(offset, bytes);
    }
    /**
     * Marks the task in the test run complete.
     */
    markTaskComplete(taskId) {
        this.tasks[this.mustGetTaskIndex(taskId)].running = false;
        this.setAllToState(0 /* TestResultState.Unset */, taskId, t => t.state === 1 /* TestResultState.Queued */ || t.state === 2 /* TestResultState.Running */);
    }
    /**
     * Notifies the service that all tests are complete.
     */
    markComplete() {
        if (this._completedAt !== undefined) {
            throw new Error('cannot complete a test result multiple times');
        }
        for (const task of this.tasks) {
            if (task.running) {
                this.markTaskComplete(task.id);
            }
        }
        this._completedAt = Date.now();
        this.completeEmitter.fire();
    }
    /**
     * @inheritdoc
     */
    toJSON() {
        return this.completedAt && this.persist ? this.doSerialize.getValue() : undefined;
    }
    /**
     * Updates all tests in the collection to the given state.
     */
    setAllToState(state, taskId, when) {
        const index = this.mustGetTaskIndex(taskId);
        for (const test of this.testById.values()) {
            if (when(test.tasks[index], test)) {
                this.fireUpdateAndRefresh(test, index, state);
            }
        }
    }
    fireUpdateAndRefresh(entry, taskIndex, newState, newOwnDuration) {
        const previousOwnComputed = entry.ownComputedState;
        const previousOwnDuration = entry.ownDuration;
        const changeEvent = {
            item: entry,
            result: this,
            reason: 1 /* TestResultItemChangeReason.OwnStateChange */,
            previousState: previousOwnComputed,
            previousOwnDuration: previousOwnDuration,
        };
        entry.tasks[taskIndex].state = newState;
        if (newOwnDuration !== undefined) {
            entry.tasks[taskIndex].duration = newOwnDuration;
            entry.ownDuration = Math.max(entry.ownDuration || 0, newOwnDuration);
        }
        const newOwnComputed = maxPriority(...entry.tasks.map(t => t.state));
        if (newOwnComputed === previousOwnComputed) {
            if (newOwnDuration !== previousOwnDuration) {
                this.changeEmitter.fire(changeEvent); // fire manually since state change won't do it
            }
            return;
        }
        entry.ownComputedState = newOwnComputed;
        this.counts[previousOwnComputed]--;
        this.counts[newOwnComputed]++;
        refreshComputedState(this.computedStateAccessor, entry).forEach(t => this.changeEmitter.fire(t === entry ? changeEvent : {
            item: t,
            result: this,
            reason: 0 /* TestResultItemChangeReason.ComputedStateChange */,
        }));
    }
    addTestToRun(controllerId, item, parent) {
        const node = itemToNode(controllerId, item, parent);
        this.testById.set(item.extId, node);
        this.counts[0 /* TestResultState.Unset */]++;
        if (parent) {
            this.testById.get(parent)?.children.push(node);
        }
        if (this.tasks.length) {
            for (let i = 0; i < this.tasks.length; i++) {
                node.tasks.push({ duration: undefined, messages: [], state: 1 /* TestResultState.Queued */ });
            }
        }
        return node;
    }
    mustGetTaskIndex(taskId) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index === -1) {
            throw new Error(`Unknown task ${taskId} in updateState`);
        }
        return index;
    }
    doSerialize = new Lazy(() => ({
        id: this.id,
        completedAt: this.completedAt,
        tasks: this.tasks.map(t => ({ id: t.id, name: t.name })),
        name: this.name,
        request: this.request,
        items: [...this.testById.values()].map(TestResultItem.serializeWithoutMessages),
    }));
}
/**
 * Test results hydrated from a previously-serialized test run.
 */
export class HydratedTestResult {
    serialized;
    outputLoader;
    outputRangeLoader;
    persist;
    /**
     * @inheritdoc
     */
    counts = makeEmptyCounts();
    /**
     * @inheritdoc
     */
    id;
    /**
     * @inheritdoc
     */
    completedAt;
    /**
     * @inheritdoc
     */
    tasks;
    /**
     * @inheritdoc
     */
    get tests() {
        return this.testById.values();
    }
    /**
     * @inheritdoc
     */
    name;
    /**
     * @inheritdoc
     */
    request;
    testById = new Map();
    constructor(serialized, outputLoader, outputRangeLoader, persist = true) {
        this.serialized = serialized;
        this.outputLoader = outputLoader;
        this.outputRangeLoader = outputRangeLoader;
        this.persist = persist;
        this.id = serialized.id;
        this.completedAt = serialized.completedAt;
        this.tasks = serialized.tasks.map((task, i) => ({
            id: task.id,
            name: task.name,
            running: false,
            coverage: staticObservableValue(undefined),
            otherMessages: []
        }));
        this.name = serialized.name;
        this.request = serialized.request;
        for (const item of serialized.items) {
            const de = TestResultItem.deserialize(item);
            this.counts[de.ownComputedState]++;
            this.testById.set(item.item.extId, de);
        }
    }
    /**
     * @inheritdoc
     */
    getOutputRange(offset, bytes) {
        return this.outputRangeLoader(offset, bytes);
    }
    /**
     * @inheritdoc
     */
    getStateById(extTestId) {
        return this.testById.get(extTestId);
    }
    /**
     * @inheritdoc
     */
    getOutput() {
        return this.outputLoader();
    }
    /**
     * @inheritdoc
     */
    toJSON() {
        return this.persist ? this.serialized : undefined;
    }
}
