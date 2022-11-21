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
import { RunOnceScheduler } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { Disposable, DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { UnmanagedProgress } from 'vs/platform/progress/common/progress';
import { getTestingConfiguration } from 'vs/workbench/contrib/testing/common/configuration';
import { isFailedState } from 'vs/workbench/contrib/testing/common/testingStates';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export const ITestingProgressUiService = createDecorator('testingProgressUiService');
/** Workbench contribution that triggers updates in the TestingProgressUi service */
let TestingProgressTrigger = class TestingProgressTrigger extends Disposable {
    configurationService;
    paneCompositeService;
    constructor(resultService, progressService, configurationService, paneCompositeService) {
        super();
        this.configurationService = configurationService;
        this.paneCompositeService = paneCompositeService;
        const scheduler = this._register(new RunOnceScheduler(() => progressService.update(), 200));
        this._register(resultService.onResultsChanged((e) => {
            if ('started' in e) {
                this.attachAutoOpenForNewResults(e.started);
            }
            if (!scheduler.isScheduled()) {
                scheduler.schedule();
            }
        }));
        this._register(resultService.onTestChanged(() => {
            if (!scheduler.isScheduled()) {
                scheduler.schedule();
            }
        }));
    }
    attachAutoOpenForNewResults(result) {
        if (result.request.isUiTriggered === false) {
            return;
        }
        const cfg = getTestingConfiguration(this.configurationService, "testing.openTesting" /* TestingConfigKeys.OpenTesting */);
        if (cfg === "neverOpen" /* AutoOpenTesting.NeverOpen */) {
            return;
        }
        if (cfg === "openOnTestStart" /* AutoOpenTesting.OpenOnTestStart */) {
            return this.openTestView();
        }
        // open on failure
        const disposable = new DisposableStore();
        disposable.add(result.onComplete(() => disposable.dispose()));
        disposable.add(result.onChange(e => {
            if (e.reason === 1 /* TestResultItemChangeReason.OwnStateChange */ && isFailedState(e.item.ownComputedState)) {
                this.openTestView();
                disposable.dispose();
            }
        }));
    }
    openTestView() {
        this.paneCompositeService.openPaneComposite("workbench.view.extension.test" /* Testing.ViewletId */, 0 /* ViewContainerLocation.Sidebar */);
    }
};
TestingProgressTrigger = __decorate([
    __param(0, ITestResultService),
    __param(1, ITestingProgressUiService),
    __param(2, IConfigurationService),
    __param(3, IPaneCompositePartService)
], TestingProgressTrigger);
export { TestingProgressTrigger };
let TestingProgressUiService = class TestingProgressUiService extends Disposable {
    resultService;
    instantiaionService;
    windowProg = this._register(new MutableDisposable());
    testViewProg = this._register(new MutableDisposable());
    updateCountsEmitter = new Emitter();
    updateTextEmitter = new Emitter();
    lastRunSoFar = 0;
    onCountChange = this.updateCountsEmitter.event;
    onTextChange = this.updateTextEmitter.event;
    constructor(resultService, instantiaionService) {
        super();
        this.resultService = resultService;
        this.instantiaionService = instantiaionService;
    }
    /** @inheritdoc */
    update() {
        const allResults = this.resultService.results;
        const running = allResults.filter(r => r.completedAt === undefined);
        if (!running.length) {
            if (allResults.length) {
                const collected = collectTestStateCounts(false, allResults[0].counts);
                this.updateCountsEmitter.fire(collected);
                this.updateTextEmitter.fire(getTestProgressText(false, collected));
            }
            else {
                this.updateTextEmitter.fire('');
                this.updateCountsEmitter.fire(collectTestStateCounts(false));
            }
            this.windowProg.clear();
            this.testViewProg.clear();
            this.lastRunSoFar = 0;
            return;
        }
        if (!this.windowProg.value) {
            this.windowProg.value = this.instantiaionService.createInstance(UnmanagedProgress, {
                location: 10 /* ProgressLocation.Window */,
                type: 'loading'
            });
            this.testViewProg.value = this.instantiaionService.createInstance(UnmanagedProgress, {
                location: "workbench.view.extension.test" /* Testing.ViewletId */,
                total: 100,
            });
        }
        const collected = collectTestStateCounts(true, ...running.map(r => r.counts));
        this.updateCountsEmitter.fire(collected);
        const message = getTestProgressText(true, collected);
        this.updateTextEmitter.fire(message);
        this.windowProg.value.report({ message });
        this.testViewProg.value.report({ increment: collected.runSoFar - this.lastRunSoFar, total: collected.totalWillBeRun });
        this.lastRunSoFar = collected.runSoFar;
    }
};
TestingProgressUiService = __decorate([
    __param(0, ITestResultService),
    __param(1, IInstantiationService)
], TestingProgressUiService);
export { TestingProgressUiService };
const collectTestStateCounts = (isRunning, ...counts) => {
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let running = 0;
    let queued = 0;
    for (const count of counts) {
        failed += count[6 /* TestResultState.Errored */] + count[4 /* TestResultState.Failed */];
        passed += count[3 /* TestResultState.Passed */];
        skipped += count[5 /* TestResultState.Skipped */];
        running += count[2 /* TestResultState.Running */];
        queued += count[1 /* TestResultState.Queued */];
    }
    return {
        isRunning,
        passed,
        failed,
        runSoFar: passed + failed,
        totalWillBeRun: passed + failed + queued + running,
        skipped,
    };
};
const getTestProgressText = (running, { passed, runSoFar, totalWillBeRun, skipped, failed }) => {
    let percent = passed / runSoFar * 100;
    if (failed > 0) {
        // fix: prevent from rounding to 100 if there's any failed test
        percent = Math.min(percent, 99.9);
    }
    else if (runSoFar === 0) {
        percent = 0;
    }
    if (running) {
        if (runSoFar === 0) {
            return localize('testProgress.runningInitial', 'Running tests...');
        }
        else if (skipped === 0) {
            return localize('testProgress.running', 'Running tests, {0}/{1} passed ({2}%)', passed, totalWillBeRun, percent.toPrecision(3));
        }
        else {
            return localize('testProgressWithSkip.running', 'Running tests, {0}/{1} tests passed ({2}%, {3} skipped)', passed, totalWillBeRun, percent.toPrecision(3), skipped);
        }
    }
    else {
        if (skipped === 0) {
            return localize('testProgress.completed', '{0}/{1} tests passed ({2}%)', passed, runSoFar, percent.toPrecision(3));
        }
        else {
            return localize('testProgressWithSkip.completed', '{0}/{1} tests passed ({2}%, {3} skipped)', passed, runSoFar, percent.toPrecision(3), skipped);
        }
    }
};
