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
import { findFirstInSorted } from 'vs/base/common/arrays';
import { RunOnceScheduler } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { once } from 'vs/base/common/functional';
import { Iterable } from 'vs/base/common/iterator';
import { generateUuid } from 'vs/base/common/uuid';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TestingContextKeys } from 'vs/workbench/contrib/testing/common/testingContextKeys';
import { ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { LiveTestResult } from 'vs/workbench/contrib/testing/common/testResult';
import { ITestResultStorage, RETAIN_MAX_RESULTS } from 'vs/workbench/contrib/testing/common/testResultStorage';
export const allChangedResults = (evt) => 'completed' in evt
    ? Iterable.single(evt.completed)
    : 'started' in evt
        ? Iterable.single(evt.started)
        : 'inserted' in evt
            ? Iterable.single(evt.inserted)
            : evt.removed;
export const isRunningTests = (service) => service.results.length > 0 && service.results[0].completedAt === undefined;
export const ITestResultService = createDecorator('testResultService');
let TestResultService = class TestResultService {
    storage;
    testProfiles;
    changeResultEmitter = new Emitter();
    _results = [];
    testChangeEmitter = new Emitter();
    /**
     * @inheritdoc
     */
    get results() {
        this.loadResults();
        return this._results;
    }
    /**
     * @inheritdoc
     */
    onResultsChanged = this.changeResultEmitter.event;
    /**
     * @inheritdoc
     */
    onTestChanged = this.testChangeEmitter.event;
    isRunning;
    hasAnyResults;
    loadResults = once(() => this.storage.read().then(loaded => {
        for (let i = loaded.length - 1; i >= 0; i--) {
            this.push(loaded[i]);
        }
    }));
    persistScheduler = new RunOnceScheduler(() => this.persistImmediately(), 500);
    constructor(contextKeyService, storage, testProfiles) {
        this.storage = storage;
        this.testProfiles = testProfiles;
        this.isRunning = TestingContextKeys.isRunning.bindTo(contextKeyService);
        this.hasAnyResults = TestingContextKeys.hasAnyResults.bindTo(contextKeyService);
    }
    /**
     * @inheritdoc
     */
    getStateById(extId) {
        for (const result of this.results) {
            const lookup = result.getStateById(extId);
            if (lookup && lookup.computedState !== 0 /* TestResultState.Unset */) {
                return [result, lookup];
            }
        }
        return undefined;
    }
    /**
     * @inheritdoc
     */
    createLiveResult(req) {
        if ('targets' in req) {
            const id = generateUuid();
            return this.push(new LiveTestResult(id, this.storage.getOutputController(id), true, req));
        }
        let profile;
        if (req.profile) {
            const profiles = this.testProfiles.getControllerProfiles(req.controllerId);
            profile = profiles.find(c => c.profileId === req.profile.id);
        }
        const resolved = {
            isUiTriggered: false,
            targets: [],
            exclude: req.exclude,
            isAutoRun: false,
        };
        if (profile) {
            resolved.targets.push({
                profileGroup: profile.group,
                profileId: profile.profileId,
                controllerId: req.controllerId,
                testIds: req.include,
            });
        }
        return this.push(new LiveTestResult(req.id, this.storage.getOutputController(req.id), req.persist, resolved));
    }
    /**
     * @inheritdoc
     */
    push(result) {
        if (result.completedAt === undefined) {
            this.results.unshift(result);
        }
        else {
            const index = findFirstInSorted(this.results, r => r.completedAt !== undefined && r.completedAt <= result.completedAt);
            this.results.splice(index, 0, result);
            this.persistScheduler.schedule();
        }
        this.hasAnyResults.set(true);
        if (this.results.length > RETAIN_MAX_RESULTS) {
            this.results.pop();
        }
        if (result instanceof LiveTestResult) {
            result.onComplete(() => this.onComplete(result));
            result.onChange(this.testChangeEmitter.fire, this.testChangeEmitter);
            this.isRunning.set(true);
            this.changeResultEmitter.fire({ started: result });
        }
        else {
            this.changeResultEmitter.fire({ inserted: result });
            // If this is not a new result, go through each of its tests. For each
            // test for which the new result is the most recently inserted, fir
            // a change event so that UI updates.
            for (const item of result.tests) {
                for (const otherResult of this.results) {
                    if (otherResult === result) {
                        this.testChangeEmitter.fire({ item, result, reason: 0 /* TestResultItemChangeReason.ComputedStateChange */ });
                        break;
                    }
                    else if (otherResult.getStateById(item.item.extId) !== undefined) {
                        break;
                    }
                }
            }
        }
        return result;
    }
    /**
     * @inheritdoc
     */
    getResult(id) {
        return this.results.find(r => r.id === id);
    }
    /**
     * @inheritdoc
     */
    clear() {
        const keep = [];
        const removed = [];
        for (const result of this.results) {
            if (result.completedAt !== undefined) {
                removed.push(result);
            }
            else {
                keep.push(result);
            }
        }
        this._results = keep;
        this.persistScheduler.schedule();
        if (keep.length === 0) {
            this.hasAnyResults.set(false);
        }
        this.changeResultEmitter.fire({ removed });
    }
    onComplete(result) {
        this.resort();
        this.updateIsRunning();
        this.persistScheduler.schedule();
        this.changeResultEmitter.fire({ completed: result });
    }
    resort() {
        this.results.sort((a, b) => (b.completedAt ?? Number.MAX_SAFE_INTEGER) - (a.completedAt ?? Number.MAX_SAFE_INTEGER));
    }
    updateIsRunning() {
        this.isRunning.set(isRunningTests(this));
    }
    async persistImmediately() {
        // ensure results are loaded before persisting to avoid deleting once
        // that we don't have yet.
        await this.loadResults();
        this.storage.persist(this.results);
    }
};
TestResultService = __decorate([
    __param(0, IContextKeyService),
    __param(1, ITestResultStorage),
    __param(2, ITestProfileService)
], TestResultService);
export { TestResultService };
