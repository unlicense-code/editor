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
import { Emitter } from 'vs/base/common/event';
import { Barrier } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { LifecyclePhaseToString } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { mark } from 'vs/base/common/performance';
import { IStorageService, WillSaveStateReason } from 'vs/platform/storage/common/storage';
let AbstractLifecycleService = class AbstractLifecycleService extends Disposable {
    logService;
    storageService;
    static LAST_SHUTDOWN_REASON_KEY = 'lifecyle.lastShutdownReason';
    _onBeforeShutdown = this._register(new Emitter());
    onBeforeShutdown = this._onBeforeShutdown.event;
    _onWillShutdown = this._register(new Emitter());
    onWillShutdown = this._onWillShutdown.event;
    _onDidShutdown = this._register(new Emitter());
    onDidShutdown = this._onDidShutdown.event;
    _onBeforeShutdownError = this._register(new Emitter());
    onBeforeShutdownError = this._onBeforeShutdownError.event;
    _onShutdownVeto = this._register(new Emitter());
    onShutdownVeto = this._onShutdownVeto.event;
    _startupKind;
    get startupKind() { return this._startupKind; }
    _phase = 1 /* LifecyclePhase.Starting */;
    get phase() { return this._phase; }
    phaseWhen = new Map();
    shutdownReason;
    constructor(logService, storageService) {
        super();
        this.logService = logService;
        this.storageService = storageService;
        // Resolve startup kind
        this._startupKind = this.resolveStartupKind();
        // Save shutdown reason to retrieve on next startup
        this.storageService.onWillSaveState(e => {
            if (e.reason === WillSaveStateReason.SHUTDOWN) {
                this.storageService.store(AbstractLifecycleService.LAST_SHUTDOWN_REASON_KEY, this.shutdownReason, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        });
    }
    resolveStartupKind() {
        // Retrieve and reset last shutdown reason
        const lastShutdownReason = this.storageService.getNumber(AbstractLifecycleService.LAST_SHUTDOWN_REASON_KEY, 1 /* StorageScope.WORKSPACE */);
        this.storageService.remove(AbstractLifecycleService.LAST_SHUTDOWN_REASON_KEY, 1 /* StorageScope.WORKSPACE */);
        // Convert into startup kind
        let startupKind;
        switch (lastShutdownReason) {
            case 3 /* ShutdownReason.RELOAD */:
                startupKind = 3 /* StartupKind.ReloadedWindow */;
                break;
            case 4 /* ShutdownReason.LOAD */:
                startupKind = 4 /* StartupKind.ReopenedWindow */;
                break;
            default:
                startupKind = 1 /* StartupKind.NewWindow */;
        }
        this.logService.trace(`[lifecycle] starting up (startup kind: ${startupKind})`);
        return startupKind;
    }
    set phase(value) {
        if (value < this.phase) {
            throw new Error('Lifecycle cannot go backwards');
        }
        if (this._phase === value) {
            return;
        }
        this.logService.trace(`lifecycle: phase changed (value: ${value})`);
        this._phase = value;
        mark(`code/LifecyclePhase/${LifecyclePhaseToString(value)}`);
        const barrier = this.phaseWhen.get(this._phase);
        if (barrier) {
            barrier.open();
            this.phaseWhen.delete(this._phase);
        }
    }
    async when(phase) {
        if (phase <= this._phase) {
            return;
        }
        let barrier = this.phaseWhen.get(phase);
        if (!barrier) {
            barrier = new Barrier();
            this.phaseWhen.set(phase, barrier);
        }
        await barrier.wait();
    }
};
AbstractLifecycleService = __decorate([
    __param(0, ILogService),
    __param(1, IStorageService)
], AbstractLifecycleService);
export { AbstractLifecycleService };
