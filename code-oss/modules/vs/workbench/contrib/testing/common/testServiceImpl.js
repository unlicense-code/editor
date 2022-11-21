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
import { groupBy } from 'vs/base/common/arrays';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { Emitter } from 'vs/base/common/event';
import { Iterable } from 'vs/base/common/iterator';
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { MainThreadTestCollection } from 'vs/workbench/contrib/testing/common/mainThreadTestCollection';
import { MutableObservableValue } from 'vs/workbench/contrib/testing/common/observableValue';
import { StoredValue } from 'vs/workbench/contrib/testing/common/storedValue';
import { TestExclusions } from 'vs/workbench/contrib/testing/common/testExclusions';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
import { TestingContextKeys } from 'vs/workbench/contrib/testing/common/testingContextKeys';
import { canUseProfileWithTest, ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { getTestingConfiguration } from 'vs/workbench/contrib/testing/common/configuration';
import { isDefined } from 'vs/base/common/types';
let TestService = class TestService extends Disposable {
    storage;
    editorService;
    testProfiles;
    notificationService;
    configurationService;
    testResults;
    workspaceTrustRequestService;
    testControllers = new Map();
    cancelExtensionTestRunEmitter = new Emitter();
    willProcessDiffEmitter = new Emitter();
    didProcessDiffEmitter = new Emitter();
    testRefreshCancellations = new Set();
    providerCount;
    canRefreshTests;
    isRefreshingTests;
    /**
     * Cancellation for runs requested by the user being managed by the UI.
     * Test runs initiated by extensions are not included here.
     */
    uiRunningTests = new Map();
    /**
     * @inheritdoc
     */
    onWillProcessDiff = this.willProcessDiffEmitter.event;
    /**
     * @inheritdoc
     */
    onDidProcessDiff = this.didProcessDiffEmitter.event;
    /**
     * @inheritdoc
     */
    onDidCancelTestRun = this.cancelExtensionTestRunEmitter.event;
    /**
     * @inheritdoc
     */
    collection = new MainThreadTestCollection(this.expandTest.bind(this));
    /**
     * @inheritdoc
     */
    excluded;
    /**
     * @inheritdoc
     */
    showInlineOutput = MutableObservableValue.stored(new StoredValue({
        key: 'inlineTestOutputVisible',
        scope: 1 /* StorageScope.WORKSPACE */,
        target: 0 /* StorageTarget.USER */
    }, this.storage), true);
    constructor(contextKeyService, instantiationService, storage, editorService, testProfiles, notificationService, configurationService, testResults, workspaceTrustRequestService) {
        super();
        this.storage = storage;
        this.editorService = editorService;
        this.testProfiles = testProfiles;
        this.notificationService = notificationService;
        this.configurationService = configurationService;
        this.testResults = testResults;
        this.workspaceTrustRequestService = workspaceTrustRequestService;
        this.excluded = instantiationService.createInstance(TestExclusions);
        this.providerCount = TestingContextKeys.providerCount.bindTo(contextKeyService);
        this.canRefreshTests = TestingContextKeys.canRefreshTests.bindTo(contextKeyService);
        this.isRefreshingTests = TestingContextKeys.isRefreshingTests.bindTo(contextKeyService);
    }
    /**
     * @inheritdoc
     */
    async expandTest(id, levels) {
        await this.testControllers.get(TestId.fromString(id).controllerId)?.expandTest(id, levels);
    }
    /**
     * @inheritdoc
     */
    cancelTestRun(runId) {
        this.cancelExtensionTestRunEmitter.fire({ runId });
        if (runId === undefined) {
            for (const runCts of this.uiRunningTests.values()) {
                runCts.cancel();
            }
        }
        else {
            this.uiRunningTests.get(runId)?.cancel();
        }
    }
    /**
     * @inheritdoc
     */
    async runTests(req, token = CancellationToken.None) {
        const resolved = {
            targets: [],
            exclude: req.exclude?.map(t => t.item.extId),
            isAutoRun: req.isAutoRun,
        };
        // First, try to run the tests using the default run profiles...
        for (const profile of this.testProfiles.getGroupDefaultProfiles(req.group)) {
            const testIds = req.tests.filter(t => canUseProfileWithTest(profile, t)).map(t => t.item.extId);
            if (testIds.length) {
                resolved.targets.push({
                    testIds: testIds,
                    profileGroup: profile.group,
                    profileId: profile.profileId,
                    controllerId: profile.controllerId,
                });
            }
        }
        // If no tests are covered by the defaults, just use whatever the defaults
        // for their controller are. This can happen if the user chose specific
        // profiles for the run button, but then asked to run a single test from the
        // explorer or decoration. We shouldn't no-op.
        if (resolved.targets.length === 0) {
            for (const byController of groupBy(req.tests, (a, b) => a.controllerId === b.controllerId ? 0 : 1)) {
                const profiles = this.testProfiles.getControllerProfiles(byController[0].controllerId);
                const withControllers = byController.map(test => ({
                    profile: profiles.find(p => p.group === req.group && canUseProfileWithTest(p, test)),
                    test,
                }));
                for (const byProfile of groupBy(withControllers, (a, b) => a.profile === b.profile ? 0 : 1)) {
                    const profile = byProfile[0].profile;
                    if (profile) {
                        resolved.targets.push({
                            testIds: byProfile.map(t => t.test.item.extId),
                            profileGroup: req.group,
                            profileId: profile.profileId,
                            controllerId: profile.controllerId,
                        });
                    }
                }
            }
        }
        return this.runResolvedTests(resolved, token);
    }
    /**
     * @inheritdoc
     */
    async runResolvedTests(req, token = CancellationToken.None) {
        if (!req.exclude) {
            req.exclude = [...this.excluded.all];
        }
        const result = this.testResults.createLiveResult(req);
        const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({
            message: localize('testTrust', "Running tests may execute code in your workspace."),
        });
        if (!trust) {
            result.markComplete();
            return result;
        }
        try {
            const cancelSource = new CancellationTokenSource(token);
            this.uiRunningTests.set(result.id, cancelSource);
            const byController = groupBy(req.targets, (a, b) => a.controllerId.localeCompare(b.controllerId));
            const requests = byController.map(group => this.testControllers.get(group[0].controllerId)?.runTests(group.map(controlReq => ({
                runId: result.id,
                excludeExtIds: req.exclude.filter(t => !controlReq.testIds.includes(t)),
                profileId: controlReq.profileId,
                controllerId: controlReq.controllerId,
                testIds: controlReq.testIds,
            })), cancelSource.token).then(result => {
                const errs = result.map(r => r.error).filter(isDefined);
                if (errs.length) {
                    this.notificationService.error(localize('testError', 'An error occurred attempting to run tests: {0}', errs.join(' ')));
                }
            }));
            await this.saveAllBeforeTest(req);
            await Promise.all(requests);
            return result;
        }
        finally {
            this.uiRunningTests.delete(result.id);
            result.markComplete();
        }
    }
    /**
     * @inheritdoc
     */
    publishDiff(_controllerId, diff) {
        this.willProcessDiffEmitter.fire(diff);
        this.collection.apply(diff);
        this.didProcessDiffEmitter.fire(diff);
    }
    /**
     * @inheritdoc
     */
    getTestController(id) {
        return this.testControllers.get(id);
    }
    /**
     * @inheritdoc
     */
    async syncTests() {
        const cts = new CancellationTokenSource();
        try {
            await Promise.all([...this.testControllers.values()].map(c => c.syncTests(cts.token)));
        }
        finally {
            cts.dispose(true);
        }
    }
    /**
     * @inheritdoc
     */
    async refreshTests(controllerId) {
        const cts = new CancellationTokenSource();
        this.testRefreshCancellations.add(cts);
        this.isRefreshingTests.set(true);
        try {
            if (controllerId) {
                await this.testControllers.get(controllerId)?.refreshTests(cts.token);
            }
            else {
                await Promise.all([...this.testControllers.values()].map(c => c.refreshTests(cts.token)));
            }
        }
        finally {
            this.testRefreshCancellations.delete(cts);
            this.isRefreshingTests.set(this.testRefreshCancellations.size > 0);
            cts.dispose(true);
        }
    }
    /**
     * @inheritdoc
     */
    cancelRefreshTests() {
        for (const cts of this.testRefreshCancellations) {
            cts.cancel();
        }
        this.testRefreshCancellations.clear();
        this.isRefreshingTests.set(false);
    }
    /**
     * @inheritdoc
     */
    registerTestController(id, controller) {
        this.testControllers.set(id, controller);
        this.providerCount.set(this.testControllers.size);
        this.updateCanRefresh();
        const disposable = new DisposableStore();
        disposable.add(toDisposable(() => {
            const diff = [];
            for (const root of this.collection.rootItems) {
                if (root.controllerId === id) {
                    diff.push({ op: 3 /* TestDiffOpType.Remove */, itemId: root.item.extId });
                }
            }
            this.publishDiff(id, diff);
            if (this.testControllers.delete(id)) {
                this.providerCount.set(this.testControllers.size);
                this.updateCanRefresh();
            }
        }));
        disposable.add(controller.canRefresh.onDidChange(this.updateCanRefresh, this));
        return disposable;
    }
    async saveAllBeforeTest(req, configurationService = this.configurationService, editorService = this.editorService) {
        if (req.isUiTriggered === false) {
            return;
        }
        const saveBeforeTest = getTestingConfiguration(this.configurationService, "testing.saveBeforeTest" /* TestingConfigKeys.SaveBeforeTest */);
        if (saveBeforeTest) {
            await editorService.saveAll();
        }
        return;
    }
    updateCanRefresh() {
        this.canRefreshTests.set(Iterable.some(this.testControllers.values(), t => t.canRefresh.value));
    }
};
TestService = __decorate([
    __param(0, IContextKeyService),
    __param(1, IInstantiationService),
    __param(2, IStorageService),
    __param(3, IEditorService),
    __param(4, ITestProfileService),
    __param(5, INotificationService),
    __param(6, IConfigurationService),
    __param(7, ITestResultService),
    __param(8, IWorkspaceTrustRequestService)
], TestService);
export { TestService };