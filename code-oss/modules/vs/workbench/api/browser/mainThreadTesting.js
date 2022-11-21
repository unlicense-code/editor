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
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { revive } from 'vs/base/common/marshalling';
import { URI } from 'vs/base/common/uri';
import { Range } from 'vs/editor/common/core/range';
import { MutableObservableValue } from 'vs/workbench/contrib/testing/common/observableValue';
import { ITestItem, ITestMessage, TestsDiffOp } from 'vs/workbench/contrib/testing/common/testTypes';
import { TestCoverage } from 'vs/workbench/contrib/testing/common/testCoverage';
import { ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { LiveTestResult } from 'vs/workbench/contrib/testing/common/testResult';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
let MainThreadTesting = class MainThreadTesting extends Disposable {
    testService;
    testProfiles;
    resultService;
    proxy;
    diffListener = this._register(new MutableDisposable());
    testProviderRegistrations = new Map();
    constructor(extHostContext, testService, testProfiles, resultService) {
        super();
        this.testService = testService;
        this.testProfiles = testProfiles;
        this.resultService = resultService;
        this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostTesting);
        this._register(this.testService.onDidCancelTestRun(({ runId }) => {
            this.proxy.$cancelExtensionTestRun(runId);
        }));
        this._register(resultService.onResultsChanged(evt => {
            const results = 'completed' in evt ? evt.completed : ('inserted' in evt ? evt.inserted : undefined);
            const serialized = results?.toJSON();
            if (serialized) {
                this.proxy.$publishTestResults([serialized]);
            }
        }));
    }
    /**
     * @inheritdoc
     */
    $publishTestRunProfile(profile) {
        const controller = this.testProviderRegistrations.get(profile.controllerId);
        if (controller) {
            this.testProfiles.addProfile(controller.instance, profile);
        }
    }
    /**
     * @inheritdoc
     */
    $updateTestRunConfig(controllerId, profileId, update) {
        this.testProfiles.updateProfile(controllerId, profileId, update);
    }
    /**
     * @inheritdoc
     */
    $removeTestProfile(controllerId, profileId) {
        this.testProfiles.removeProfile(controllerId, profileId);
    }
    /**
     * @inheritdoc
     */
    $addTestsToRun(controllerId, runId, tests) {
        this.withLiveRun(runId, r => r.addTestChainToRun(controllerId, tests.map(ITestItem.deserialize)));
    }
    /**
     * @inheritdoc
     */
    $signalCoverageAvailable(runId, taskId) {
        this.withLiveRun(runId, run => {
            const task = run.tasks.find(t => t.id === taskId);
            if (!task) {
                return;
            }
            task.coverage.value = new TestCoverage({
                provideFileCoverage: async (token) => revive(await this.proxy.$provideFileCoverage(runId, taskId, token)),
                resolveFileCoverage: (i, token) => this.proxy.$resolveFileCoverage(runId, taskId, i, token),
            });
        });
    }
    /**
     * @inheritdoc
     */
    $startedExtensionTestRun(req) {
        this.resultService.createLiveResult(req);
    }
    /**
     * @inheritdoc
     */
    $startedTestRunTask(runId, task) {
        this.withLiveRun(runId, r => r.addTask(task));
    }
    /**
     * @inheritdoc
     */
    $finishedTestRunTask(runId, taskId) {
        this.withLiveRun(runId, r => r.markTaskComplete(taskId));
    }
    /**
     * @inheritdoc
     */
    $finishedExtensionTestRun(runId) {
        this.withLiveRun(runId, r => r.markComplete());
    }
    /**
     * @inheritdoc
     */
    $updateTestStateInRun(runId, taskId, testId, state, duration) {
        this.withLiveRun(runId, r => r.updateState(testId, taskId, state, duration));
    }
    /**
     * @inheritdoc
     */
    $appendOutputToRun(runId, taskId, output, locationDto, testId) {
        const location = locationDto && {
            uri: URI.revive(locationDto.uri),
            range: Range.lift(locationDto.range)
        };
        this.withLiveRun(runId, r => r.appendOutput(output, taskId, location, testId));
    }
    /**
     * @inheritdoc
     */
    $appendTestMessagesInRun(runId, taskId, testId, messages) {
        const r = this.resultService.getResult(runId);
        if (r && r instanceof LiveTestResult) {
            for (const message of messages) {
                r.appendMessage(testId, taskId, ITestMessage.deserialize(message));
            }
        }
    }
    /**
     * @inheritdoc
     */
    $registerTestController(controllerId, labelStr, canRefreshValue) {
        const disposable = new DisposableStore();
        const label = disposable.add(new MutableObservableValue(labelStr));
        const canRefresh = disposable.add(new MutableObservableValue(canRefreshValue));
        const controller = {
            id: controllerId,
            label,
            canRefresh,
            syncTests: () => this.proxy.$syncTests(),
            refreshTests: token => this.proxy.$refreshTests(controllerId, token),
            configureRunProfile: id => this.proxy.$configureRunProfile(controllerId, id),
            runTests: (reqs, token) => this.proxy.$runControllerTests(reqs, token),
            expandTest: (testId, levels) => this.proxy.$expandTest(testId, isFinite(levels) ? levels : -1),
        };
        disposable.add(toDisposable(() => this.testProfiles.removeProfile(controllerId)));
        disposable.add(this.testService.registerTestController(controllerId, controller));
        this.testProviderRegistrations.set(controllerId, {
            instance: controller,
            label,
            canRefresh,
            disposable
        });
    }
    /**
     * @inheritdoc
     */
    $updateController(controllerId, patch) {
        const controller = this.testProviderRegistrations.get(controllerId);
        if (!controller) {
            return;
        }
        if (patch.label !== undefined) {
            controller.label.value = patch.label;
        }
        if (patch.canRefresh !== undefined) {
            controller.canRefresh.value = patch.canRefresh;
        }
    }
    /**
     * @inheritdoc
     */
    $unregisterTestController(controllerId) {
        this.testProviderRegistrations.get(controllerId)?.disposable.dispose();
        this.testProviderRegistrations.delete(controllerId);
    }
    /**
     * @inheritdoc
     */
    $subscribeToDiffs() {
        this.proxy.$acceptDiff(this.testService.collection.getReviverDiff().map(TestsDiffOp.serialize));
        this.diffListener.value = this.testService.onDidProcessDiff(this.proxy.$acceptDiff, this.proxy);
    }
    /**
     * @inheritdoc
     */
    $unsubscribeFromDiffs() {
        this.diffListener.clear();
    }
    /**
     * @inheritdoc
     */
    $publishDiff(controllerId, diff) {
        this.testService.publishDiff(controllerId, diff.map(TestsDiffOp.deserialize));
    }
    async $runTests(req, token) {
        const result = await this.testService.runResolvedTests(req, token);
        return result.id;
    }
    dispose() {
        super.dispose();
        for (const subscription of this.testProviderRegistrations.values()) {
            subscription.disposable.dispose();
        }
        this.testProviderRegistrations.clear();
    }
    withLiveRun(runId, fn) {
        const r = this.resultService.getResult(runId);
        return r && r instanceof LiveTestResult ? fn(r) : undefined;
    }
};
MainThreadTesting = __decorate([
    extHostNamedCustomer(MainContext.MainThreadTesting),
    __param(1, ITestService),
    __param(2, ITestProfileService),
    __param(3, ITestResultService)
], MainThreadTesting);
export { MainThreadTesting };
