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
import { Disposable } from 'vs/base/common/lifecycle';
import { ILocalPtyService } from 'vs/platform/terminal/electron-sandbox/terminal';
import { URI } from 'vs/base/common/uri';
/**
 * Responsible for establishing and maintaining a connection with an existing terminal process
 * created on the local pty host.
 */
let LocalPty = class LocalPty extends Disposable {
    id;
    shouldPersist;
    _localPtyService;
    _inReplay = false;
    _properties = {
        cwd: '',
        initialCwd: '',
        fixedDimensions: { cols: undefined, rows: undefined },
        title: '',
        shellType: undefined,
        hasChildProcesses: true,
        resolvedShellLaunchConfig: {},
        overrideDimensions: undefined,
        failedShellIntegrationActivation: false,
        usedShellIntegrationInjection: undefined
    };
    _onProcessData = this._register(new Emitter());
    onProcessData = this._onProcessData.event;
    _onProcessReplay = this._register(new Emitter());
    onProcessReplay = this._onProcessReplay.event;
    _onProcessReady = this._register(new Emitter());
    onProcessReady = this._onProcessReady.event;
    _onDidChangeProperty = this._register(new Emitter());
    onDidChangeProperty = this._onDidChangeProperty.event;
    _onProcessExit = this._register(new Emitter());
    onProcessExit = this._onProcessExit.event;
    _onRestoreCommands = this._register(new Emitter());
    onRestoreCommands = this._onRestoreCommands.event;
    constructor(id, shouldPersist, _localPtyService) {
        super();
        this.id = id;
        this.shouldPersist = shouldPersist;
        this._localPtyService = _localPtyService;
    }
    start() {
        return this._localPtyService.start(this.id);
    }
    detach(forcePersist) {
        return this._localPtyService.detachFromProcess(this.id, forcePersist);
    }
    shutdown(immediate) {
        this._localPtyService.shutdown(this.id, immediate);
    }
    async processBinary(data) {
        if (this._inReplay) {
            return;
        }
        return this._localPtyService.processBinary(this.id, data);
    }
    input(data) {
        if (this._inReplay) {
            return;
        }
        this._localPtyService.input(this.id, data);
    }
    resize(cols, rows) {
        if (this._inReplay) {
            return;
        }
        this._localPtyService.resize(this.id, cols, rows);
    }
    freePortKillProcess(port) {
        if (!this._localPtyService.freePortKillProcess) {
            throw new Error('freePortKillProcess does not exist on the local pty service');
        }
        return this._localPtyService.freePortKillProcess(port);
    }
    async getInitialCwd() {
        return this._properties.initialCwd;
    }
    async getCwd() {
        return this._properties.cwd || this._properties.initialCwd;
    }
    async refreshProperty(type) {
        return this._localPtyService.refreshProperty(this.id, type);
    }
    async updateProperty(type, value) {
        return this._localPtyService.updateProperty(this.id, type, value);
    }
    getLatency() {
        // TODO: The idea here was to add the result plus the time it took to get the latency
        return this._localPtyService.getLatency(this.id);
    }
    acknowledgeDataEvent(charCount) {
        if (this._inReplay) {
            return;
        }
        this._localPtyService.acknowledgeDataEvent(this.id, charCount);
    }
    setUnicodeVersion(version) {
        return this._localPtyService.setUnicodeVersion(this.id, version);
    }
    handleData(e) {
        this._onProcessData.fire(e);
    }
    handleExit(e) {
        this._onProcessExit.fire(e);
    }
    handleReady(e) {
        this._onProcessReady.fire(e);
    }
    handleDidChangeProperty({ type, value }) {
        switch (type) {
            case "cwd" /* ProcessPropertyType.Cwd */:
                this._properties.cwd = value;
                break;
            case "initialCwd" /* ProcessPropertyType.InitialCwd */:
                this._properties.initialCwd = value;
                break;
            case "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */:
                if (value.cwd && typeof value.cwd !== 'string') {
                    value.cwd = URI.revive(value.cwd);
                }
        }
        this._onDidChangeProperty.fire({ type, value });
    }
    async handleReplay(e) {
        try {
            this._inReplay = true;
            for (const innerEvent of e.events) {
                if (innerEvent.cols !== 0 || innerEvent.rows !== 0) {
                    // never override with 0x0 as that is a marker for an unknown initial size
                    this._onDidChangeProperty.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: { cols: innerEvent.cols, rows: innerEvent.rows, forceExactSize: true } });
                }
                const e = { data: innerEvent.data, trackCommit: true };
                this._onProcessData.fire(e);
                await e.writePromise;
            }
        }
        finally {
            this._inReplay = false;
        }
        if (e.commands) {
            this._onRestoreCommands.fire(e.commands);
        }
        // remove size override
        this._onDidChangeProperty.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: undefined });
    }
    handleOrphanQuestion() {
        this._localPtyService.orphanQuestionReply(this.id);
    }
};
LocalPty = __decorate([
    __param(2, ILocalPtyService)
], LocalPty);
export { LocalPty };
