/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { mapFind } from 'vs/base/common/arrays';
import { VSBuffer } from 'vs/base/common/buffer';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { Emitter, Event } from 'vs/base/common/event';
import { once } from 'vs/base/common/functional';
import { hash } from 'vs/base/common/hash';
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { deepFreeze } from 'vs/base/common/objects';
import { isDefined } from 'vs/base/common/types';
import { generateUuid } from 'vs/base/common/uuid';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { ExtHostTestItemCollection, TestItemImpl, TestItemRootImpl, toItemFromContext } from 'vs/workbench/api/common/extHostTestItem';
import * as Convert from 'vs/workbench/api/common/extHostTypeConverters';
import { TestRunProfileKind, TestRunRequest } from 'vs/workbench/api/common/extHostTypes';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
import { InvalidTestItemError } from 'vs/workbench/contrib/testing/common/testItemCollection';
import { AbstractIncrementalTestCollection, IncrementalChangeCollector, TestsDiffOp } from 'vs/workbench/contrib/testing/common/testTypes';
let ExtHostTesting = class ExtHostTesting {
    editors;
    resultsChangedEmitter = new Emitter();
    controllers = new Map();
    proxy;
    runTracker;
    observer;
    onResultsChanged = this.resultsChangedEmitter.event;
    results = [];
    constructor(rpc, commands, editors) {
        this.editors = editors;
        this.proxy = rpc.getProxy(MainContext.MainThreadTesting);
        this.observer = new TestObservers(this.proxy);
        this.runTracker = new TestRunCoordinator(this.proxy);
        commands.registerArgumentProcessor({
            processArgument: arg => {
                if (arg?.$mid !== 14 /* MarshalledId.TestItemContext */) {
                    return arg;
                }
                const cast = arg;
                const targetTest = cast.tests[cast.tests.length - 1].item.extId;
                const controller = this.controllers.get(TestId.root(targetTest));
                return controller?.collection.tree.get(targetTest)?.actual ?? toItemFromContext(arg);
            }
        });
    }
    /**
     * Implements vscode.test.registerTestProvider
     */
    createTestController(controllerId, label, refreshHandler) {
        if (this.controllers.has(controllerId)) {
            throw new Error(`Attempt to insert a duplicate controller with ID "${controllerId}"`);
        }
        const disposable = new DisposableStore();
        const collection = disposable.add(new ExtHostTestItemCollection(controllerId, label, this.editors));
        collection.root.label = label;
        const profiles = new Map();
        const proxy = this.proxy;
        const controller = {
            items: collection.root.children,
            get label() {
                return label;
            },
            set label(value) {
                label = value;
                collection.root.label = value;
                proxy.$updateController(controllerId, { label });
            },
            get refreshHandler() {
                return refreshHandler;
            },
            set refreshHandler(value) {
                refreshHandler = value;
                proxy.$updateController(controllerId, { canRefresh: !!value });
            },
            get id() {
                return controllerId;
            },
            createRunProfile: (label, group, runHandler, isDefault, tag) => {
                // Derive the profile ID from a hash so that the same profile will tend
                // to have the same hashes, allowing re-run requests to work across reloads.
                let profileId = hash(label);
                while (profiles.has(profileId)) {
                    profileId++;
                }
                return new TestRunProfileImpl(this.proxy, profiles, controllerId, profileId, label, group, runHandler, isDefault, tag);
            },
            createTestItem(id, label, uri) {
                return new TestItemImpl(controllerId, id, label, uri);
            },
            createTestRun: (request, name, persist = true) => {
                return this.runTracker.createTestRun(controllerId, collection, request, name, persist);
            },
            set resolveHandler(fn) {
                collection.resolveHandler = fn;
            },
            get resolveHandler() {
                return collection.resolveHandler;
            },
            dispose: () => {
                disposable.dispose();
            },
        };
        proxy.$registerTestController(controllerId, label, !!refreshHandler);
        disposable.add(toDisposable(() => proxy.$unregisterTestController(controllerId)));
        const info = { controller, collection, profiles: profiles };
        this.controllers.set(controllerId, info);
        disposable.add(toDisposable(() => this.controllers.delete(controllerId)));
        disposable.add(collection.onDidGenerateDiff(diff => proxy.$publishDiff(controllerId, diff.map(TestsDiffOp.serialize))));
        return controller;
    }
    /**
     * Implements vscode.test.createTestObserver
     */
    createTestObserver() {
        return this.observer.checkout();
    }
    /**
     * Implements vscode.test.runTests
     */
    async runTests(req, token = CancellationToken.None) {
        const profile = tryGetProfileFromTestRunReq(req);
        if (!profile) {
            throw new Error('The request passed to `vscode.test.runTests` must include a profile');
        }
        const controller = this.controllers.get(profile.controllerId);
        if (!controller) {
            throw new Error('Controller not found');
        }
        await this.proxy.$runTests({
            isUiTriggered: false,
            targets: [{
                    testIds: req.include?.map(t => TestId.fromExtHostTestItem(t, controller.collection.root.id).toString()) ?? [controller.collection.root.id],
                    profileGroup: profileGroupToBitset[profile.kind],
                    profileId: profile.profileId,
                    controllerId: profile.controllerId,
                }],
            exclude: req.exclude?.map(t => t.id),
        }, token);
    }
    /**
     * @inheritdoc
     */
    $syncTests() {
        for (const { collection } of this.controllers.values()) {
            collection.flushDiff();
        }
        return Promise.resolve();
    }
    /**
     * @inheritdoc
     */
    $provideFileCoverage(runId, taskId, token) {
        const coverage = mapFind(this.runTracker.trackers, t => t.id === runId ? t.getCoverage(taskId) : undefined);
        return coverage?.provideFileCoverage(token) ?? Promise.resolve([]);
    }
    /**
     * @inheritdoc
     */
    $resolveFileCoverage(runId, taskId, fileIndex, token) {
        const coverage = mapFind(this.runTracker.trackers, t => t.id === runId ? t.getCoverage(taskId) : undefined);
        return coverage?.resolveFileCoverage(fileIndex, token) ?? Promise.resolve([]);
    }
    /** @inheritdoc */
    $configureRunProfile(controllerId, profileId) {
        this.controllers.get(controllerId)?.profiles.get(profileId)?.configureHandler?.();
    }
    /** @inheritdoc */
    async $refreshTests(controllerId, token) {
        await this.controllers.get(controllerId)?.controller.refreshHandler?.(token);
    }
    /**
     * Updates test results shown to extensions.
     * @override
     */
    $publishTestResults(results) {
        this.results = Object.freeze(results
            .map(r => deepFreeze(Convert.TestResults.to(r)))
            .concat(this.results)
            .sort((a, b) => b.completedAt - a.completedAt)
            .slice(0, 32));
        this.resultsChangedEmitter.fire();
    }
    /**
     * Expands the nodes in the test tree. If levels is less than zero, it will
     * be treated as infinite.
     */
    async $expandTest(testId, levels) {
        const collection = this.controllers.get(TestId.fromString(testId).controllerId)?.collection;
        if (collection) {
            await collection.expand(testId, levels < 0 ? Infinity : levels);
            collection.flushDiff();
        }
    }
    /**
     * Receives a test update from the main thread. Called (eventually) whenever
     * tests change.
     */
    $acceptDiff(diff) {
        this.observer.applyDiff(diff.map(TestsDiffOp.deserialize));
    }
    /**
     * Runs tests with the given set of IDs. Allows for test from multiple
     * providers to be run.
     * @override
     */
    async $runControllerTests(reqs, token) {
        return Promise.all(reqs.map(req => this.runControllerTestRequest(req, token)));
    }
    async runControllerTestRequest(req, token) {
        const lookup = this.controllers.get(req.controllerId);
        if (!lookup) {
            return {};
        }
        const { collection, profiles } = lookup;
        const profile = profiles.get(req.profileId);
        if (!profile) {
            return {};
        }
        const includeTests = req.testIds
            .map((testId) => collection.tree.get(testId))
            .filter(isDefined);
        const excludeTests = req.excludeExtIds
            .map(id => lookup.collection.tree.get(id))
            .filter(isDefined)
            .filter(exclude => includeTests.some(include => include.fullId.compare(exclude.fullId) === 2 /* TestPosition.IsChild */));
        if (!includeTests.length) {
            return {};
        }
        const publicReq = new TestRunRequest(includeTests.some(i => i.actual instanceof TestItemRootImpl) ? undefined : includeTests.map(t => t.actual), excludeTests.map(t => t.actual), profile);
        const tracker = this.runTracker.prepareForMainThreadTestRun(publicReq, TestRunDto.fromInternal(req, lookup.collection), token);
        try {
            await profile.runHandler(publicReq, token);
            return {};
        }
        catch (e) {
            return { error: String(e) };
        }
        finally {
            if (tracker.isRunning && !token.isCancellationRequested) {
                await Event.toPromise(tracker.onEnd);
            }
            tracker.dispose();
        }
    }
    /**
     * Cancels an ongoing test run.
     */
    $cancelExtensionTestRun(runId) {
        if (runId === undefined) {
            this.runTracker.cancelAllRuns();
        }
        else {
            this.runTracker.cancelRunById(runId);
        }
    }
};
ExtHostTesting = __decorate([
    __param(0, IExtHostRpcService)
], ExtHostTesting);
export { ExtHostTesting };
class TestRunTracker extends Disposable {
    dto;
    proxy;
    tasks = new Map();
    sharedTestIds = new Set();
    cts;
    endEmitter = this._register(new Emitter());
    disposed = false;
    /**
     * Fires when a test ends, and no more tests are left running.
     */
    onEnd = this.endEmitter.event;
    /**
     * Gets whether there are any tests running.
     */
    get isRunning() {
        return this.tasks.size > 0;
    }
    /**
     * Gets the run ID.
     */
    get id() {
        return this.dto.id;
    }
    constructor(dto, proxy, parentToken) {
        super();
        this.dto = dto;
        this.proxy = proxy;
        this.cts = this._register(new CancellationTokenSource(parentToken));
        this._register(this.cts.token.onCancellationRequested(() => {
            for (const { run } of this.tasks.values()) {
                run.end();
            }
        }));
    }
    getCoverage(taskId) {
        return this.tasks.get(taskId)?.coverage;
    }
    createRun(name) {
        const runId = this.dto.id;
        const ctrlId = this.dto.controllerId;
        const taskId = generateUuid();
        const coverage = new TestRunCoverageBearer(this.proxy, runId, taskId);
        const guardTestMutation = (fn) => (test, ...args) => {
            if (ended) {
                console.warn(`Setting the state of test "${test.id}" is a no-op after the run ends.`);
                return;
            }
            if (!this.dto.isIncluded(test)) {
                return;
            }
            this.ensureTestIsKnown(test);
            fn(test, ...args);
        };
        const appendMessages = (test, messages) => {
            const converted = messages instanceof Array
                ? messages.map(Convert.TestMessage.from)
                : [Convert.TestMessage.from(messages)];
            if (test.uri && test.range) {
                const defaultLocation = { range: Convert.Range.from(test.range), uri: test.uri };
                for (const message of converted) {
                    message.location = message.location || defaultLocation;
                }
            }
            this.proxy.$appendTestMessagesInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), converted);
        };
        let ended = false;
        const run = {
            isPersisted: this.dto.isPersisted,
            token: this.cts.token,
            name,
            get coverageProvider() {
                return coverage.coverageProvider;
            },
            set coverageProvider(provider) {
                coverage.coverageProvider = provider;
            },
            //#region state mutation
            enqueued: guardTestMutation(test => {
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 1 /* TestResultState.Queued */);
            }),
            skipped: guardTestMutation(test => {
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 5 /* TestResultState.Skipped */);
            }),
            started: guardTestMutation(test => {
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 2 /* TestResultState.Running */);
            }),
            errored: guardTestMutation((test, messages, duration) => {
                appendMessages(test, messages);
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 6 /* TestResultState.Errored */, duration);
            }),
            failed: guardTestMutation((test, messages, duration) => {
                appendMessages(test, messages);
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, ctrlId).toString(), 4 /* TestResultState.Failed */, duration);
            }),
            passed: guardTestMutation((test, duration) => {
                this.proxy.$updateTestStateInRun(runId, taskId, TestId.fromExtHostTestItem(test, this.dto.controllerId).toString(), 3 /* TestResultState.Passed */, duration);
            }),
            //#endregion
            appendOutput: (output, location, test) => {
                if (ended) {
                    return;
                }
                if (test) {
                    if (this.dto.isIncluded(test)) {
                        this.ensureTestIsKnown(test);
                    }
                    else {
                        test = undefined;
                    }
                }
                this.proxy.$appendOutputToRun(runId, taskId, VSBuffer.fromString(output), location && Convert.location.from(location), test && TestId.fromExtHostTestItem(test, ctrlId).toString());
            },
            end: () => {
                if (ended) {
                    return;
                }
                ended = true;
                this.proxy.$finishedTestRunTask(runId, taskId);
                this.tasks.delete(taskId);
                if (!this.isRunning) {
                    this.dispose();
                }
            }
        };
        this.tasks.set(taskId, { run, coverage });
        this.proxy.$startedTestRunTask(runId, { id: taskId, name, running: true });
        return run;
    }
    dispose() {
        if (!this.disposed) {
            this.disposed = true;
            this.endEmitter.fire();
            this.cts.cancel();
            super.dispose();
        }
    }
    ensureTestIsKnown(test) {
        if (!(test instanceof TestItemImpl)) {
            throw new InvalidTestItemError(test.id);
        }
        if (this.sharedTestIds.has(TestId.fromExtHostTestItem(test, this.dto.controllerId).toString())) {
            return;
        }
        const chain = [];
        const root = this.dto.colllection.root;
        while (true) {
            const converted = Convert.TestItem.from(test);
            chain.unshift(converted);
            if (this.sharedTestIds.has(converted.extId)) {
                break;
            }
            this.sharedTestIds.add(converted.extId);
            if (test === root) {
                break;
            }
            test = test.parent || root;
        }
        this.proxy.$addTestsToRun(this.dto.controllerId, this.dto.id, chain);
    }
}
/**
 * Queues runs for a single extension and provides the currently-executing
 * run so that `createTestRun` can be properly correlated.
 */
export class TestRunCoordinator {
    proxy;
    tracked = new Map();
    get trackers() {
        return this.tracked.values();
    }
    constructor(proxy) {
        this.proxy = proxy;
    }
    /**
     * Registers a request as being invoked by the main thread, so
     * `$startedExtensionTestRun` is not invoked. The run must eventually
     * be cancelled manually.
     */
    prepareForMainThreadTestRun(req, dto, token) {
        return this.getTracker(req, dto, token);
    }
    /**
     * Cancels an existing test run via its cancellation token.
     */
    cancelRunById(runId) {
        for (const tracker of this.tracked.values()) {
            if (tracker.id === runId) {
                tracker.dispose();
                return;
            }
        }
    }
    /**
     * Cancels an existing test run via its cancellation token.
     */
    cancelAllRuns() {
        for (const tracker of this.tracked.values()) {
            tracker.dispose();
        }
    }
    /**
     * Implements the public `createTestRun` API.
     */
    createTestRun(controllerId, collection, request, name, persist) {
        const existing = this.tracked.get(request);
        if (existing) {
            return existing.createRun(name);
        }
        // If there is not an existing tracked extension for the request, start
        // a new, detached session.
        const dto = TestRunDto.fromPublic(controllerId, collection, request, persist);
        const profile = tryGetProfileFromTestRunReq(request);
        this.proxy.$startedExtensionTestRun({
            controllerId,
            profile: profile && { group: profileGroupToBitset[profile.kind], id: profile.profileId },
            exclude: request.exclude?.map(t => TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [],
            id: dto.id,
            include: request.include?.map(t => TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [collection.root.id],
            persist
        });
        const tracker = this.getTracker(request, dto);
        tracker.onEnd(() => this.proxy.$finishedExtensionTestRun(dto.id));
        return tracker.createRun(name);
    }
    getTracker(req, dto, token) {
        const tracker = new TestRunTracker(dto, this.proxy, token);
        this.tracked.set(req, tracker);
        tracker.onEnd(() => this.tracked.delete(req));
        return tracker;
    }
}
const tryGetProfileFromTestRunReq = (request) => {
    if (!request.profile) {
        return undefined;
    }
    if (!(request.profile instanceof TestRunProfileImpl)) {
        throw new Error(`TestRunRequest.profile is not an instance created from TestController.createRunProfile`);
    }
    return request.profile;
};
export class TestRunDto {
    controllerId;
    id;
    isPersisted;
    colllection;
    includePrefix;
    excludePrefix;
    static fromPublic(controllerId, collection, request, persist) {
        return new TestRunDto(controllerId, generateUuid(), request.include?.map(t => TestId.fromExtHostTestItem(t, controllerId).toString()) ?? [controllerId], request.exclude?.map(t => TestId.fromExtHostTestItem(t, controllerId).toString()) ?? [], persist, collection);
    }
    static fromInternal(request, collection) {
        return new TestRunDto(request.controllerId, request.runId, request.testIds, request.excludeExtIds, true, collection);
    }
    constructor(controllerId, id, include, exclude, isPersisted, colllection) {
        this.controllerId = controllerId;
        this.id = id;
        this.isPersisted = isPersisted;
        this.colllection = colllection;
        this.includePrefix = include.map(id => id + "\0" /* TestIdPathParts.Delimiter */);
        this.excludePrefix = exclude.map(id => id + "\0" /* TestIdPathParts.Delimiter */);
    }
    isIncluded(test) {
        const id = TestId.fromExtHostTestItem(test, this.controllerId).toString() + "\0" /* TestIdPathParts.Delimiter */;
        for (const prefix of this.excludePrefix) {
            if (id === prefix || id.startsWith(prefix)) {
                return false;
            }
        }
        for (const prefix of this.includePrefix) {
            if (id === prefix || id.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }
}
class TestRunCoverageBearer {
    proxy;
    runId;
    taskId;
    _coverageProvider;
    fileCoverage;
    set coverageProvider(provider) {
        if (this._coverageProvider) {
            throw new Error('The TestCoverageProvider cannot be replaced after being provided');
        }
        if (!provider) {
            return;
        }
        this._coverageProvider = provider;
        this.proxy.$signalCoverageAvailable(this.runId, this.taskId);
    }
    get coverageProvider() {
        return this._coverageProvider;
    }
    constructor(proxy, runId, taskId) {
        this.proxy = proxy;
        this.runId = runId;
        this.taskId = taskId;
    }
    async provideFileCoverage(token) {
        if (!this._coverageProvider) {
            return [];
        }
        if (!this.fileCoverage) {
            this.fileCoverage = (async () => this._coverageProvider.provideFileCoverage(token))();
        }
        try {
            const coverage = await this.fileCoverage;
            return coverage?.map(Convert.TestCoverage.fromFile) ?? [];
        }
        catch (e) {
            this.fileCoverage = undefined;
            throw e;
        }
    }
    async resolveFileCoverage(index, token) {
        const fileCoverage = await this.fileCoverage;
        let file = fileCoverage?.[index];
        if (!this._coverageProvider || !fileCoverage || !file) {
            return [];
        }
        if (!file.detailedCoverage) {
            file = fileCoverage[index] = await this._coverageProvider.resolveFileCoverage?.(file, token) ?? file;
        }
        return file.detailedCoverage?.map(Convert.TestCoverage.fromDetailed) ?? [];
    }
}
class MirroredChangeCollector extends IncrementalChangeCollector {
    emitter;
    added = new Set();
    updated = new Set();
    removed = new Set();
    alreadyRemoved = new Set();
    get isEmpty() {
        return this.added.size === 0 && this.removed.size === 0 && this.updated.size === 0;
    }
    constructor(emitter) {
        super();
        this.emitter = emitter;
    }
    /**
     * @override
     */
    add(node) {
        this.added.add(node);
    }
    /**
     * @override
     */
    update(node) {
        Object.assign(node.revived, Convert.TestItem.toPlain(node.item));
        if (!this.added.has(node)) {
            this.updated.add(node);
        }
    }
    /**
     * @override
     */
    remove(node) {
        if (this.added.has(node)) {
            this.added.delete(node);
            return;
        }
        this.updated.delete(node);
        const parentId = TestId.parentId(node.item.extId);
        if (parentId && this.alreadyRemoved.has(parentId.toString())) {
            this.alreadyRemoved.add(node.item.extId);
            return;
        }
        this.removed.add(node);
    }
    /**
     * @override
     */
    getChangeEvent() {
        const { added, updated, removed } = this;
        return {
            get added() { return [...added].map(n => n.revived); },
            get updated() { return [...updated].map(n => n.revived); },
            get removed() { return [...removed].map(n => n.revived); },
        };
    }
    complete() {
        if (!this.isEmpty) {
            this.emitter.fire(this.getChangeEvent());
        }
    }
}
/**
 * Maintains tests in this extension host sent from the main thread.
 * @private
 */
export class MirroredTestCollection extends AbstractIncrementalTestCollection {
    changeEmitter = new Emitter();
    /**
     * Change emitter that fires with the same semantics as `TestObserver.onDidChangeTests`.
     */
    onDidChangeTests = this.changeEmitter.event;
    /**
     * Gets a list of root test items.
     */
    get rootTests() {
        return super.roots;
    }
    /**
     *
     * If the test ID exists, returns its underlying ID.
     */
    getMirroredTestDataById(itemId) {
        return this.items.get(itemId);
    }
    /**
     * If the test item is a mirrored test item, returns its underlying ID.
     */
    getMirroredTestDataByReference(item) {
        return this.items.get(item.id);
    }
    /**
     * @override
     */
    createItem(item, parent) {
        return {
            ...item,
            // todo@connor4312: make this work well again with children
            revived: Convert.TestItem.toPlain(item.item),
            depth: parent ? parent.depth + 1 : 0,
            children: new Set(),
        };
    }
    /**
     * @override
     */
    createChangeCollector() {
        return new MirroredChangeCollector(this.changeEmitter);
    }
}
class TestObservers {
    proxy;
    current;
    constructor(proxy) {
        this.proxy = proxy;
    }
    checkout() {
        if (!this.current) {
            this.current = this.createObserverData();
        }
        const current = this.current;
        current.observers++;
        return {
            onDidChangeTest: current.tests.onDidChangeTests,
            get tests() { return [...current.tests.rootTests].map(t => t.revived); },
            dispose: once(() => {
                if (--current.observers === 0) {
                    this.proxy.$unsubscribeFromDiffs();
                    this.current = undefined;
                }
            }),
        };
    }
    /**
     * Gets the internal test data by its reference.
     */
    getMirroredTestDataByReference(ref) {
        return this.current?.tests.getMirroredTestDataByReference(ref);
    }
    /**
     * Applies test diffs to the current set of observed tests.
     */
    applyDiff(diff) {
        this.current?.tests.apply(diff);
    }
    createObserverData() {
        const tests = new MirroredTestCollection();
        this.proxy.$subscribeToDiffs();
        return { observers: 0, tests, };
    }
}
export class TestRunProfileImpl {
    controllerId;
    profileId;
    _label;
    kind;
    runHandler;
    _isDefault;
    _tag;
    #proxy;
    #profiles;
    _configureHandler;
    get label() {
        return this._label;
    }
    set label(label) {
        if (label !== this._label) {
            this._label = label;
            this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { label });
        }
    }
    get isDefault() {
        return this._isDefault;
    }
    set isDefault(isDefault) {
        if (isDefault !== this._isDefault) {
            this._isDefault = isDefault;
            this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { isDefault });
        }
    }
    get tag() {
        return this._tag;
    }
    set tag(tag) {
        if (tag?.id !== this._tag?.id) {
            this._tag = tag;
            this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, {
                tag: tag ? Convert.TestTag.namespace(this.controllerId, tag.id) : null,
            });
        }
    }
    get configureHandler() {
        return this._configureHandler;
    }
    set configureHandler(handler) {
        if (handler !== this._configureHandler) {
            this._configureHandler = handler;
            this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { hasConfigurationHandler: !!handler });
        }
    }
    constructor(proxy, profiles, controllerId, profileId, _label, kind, runHandler, _isDefault = false, _tag = undefined) {
        this.controllerId = controllerId;
        this.profileId = profileId;
        this._label = _label;
        this.kind = kind;
        this.runHandler = runHandler;
        this._isDefault = _isDefault;
        this._tag = _tag;
        this.#proxy = proxy;
        this.#profiles = profiles;
        profiles.set(profileId, this);
        const groupBitset = profileGroupToBitset[kind];
        if (typeof groupBitset !== 'number') {
            throw new Error(`Unknown TestRunProfile.group ${kind}`);
        }
        this.#proxy.$publishTestRunProfile({
            profileId: profileId,
            controllerId,
            tag: _tag ? Convert.TestTag.namespace(this.controllerId, _tag.id) : null,
            label: _label,
            group: groupBitset,
            isDefault: _isDefault,
            hasConfigurationHandler: false,
        });
    }
    dispose() {
        if (this.#profiles?.delete(this.profileId)) {
            this.#profiles = undefined;
            this.#proxy.$removeTestProfile(this.controllerId, this.profileId);
        }
    }
}
const profileGroupToBitset = {
    [TestRunProfileKind.Coverage]: 8 /* TestRunProfileBitset.Coverage */,
    [TestRunProfileKind.Debug]: 4 /* TestRunProfileBitset.Debug */,
    [TestRunProfileKind.Run]: 2 /* TestRunProfileBitset.Run */,
};
