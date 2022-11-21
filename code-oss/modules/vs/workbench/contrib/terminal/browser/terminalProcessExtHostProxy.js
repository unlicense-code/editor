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
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
let TerminalProcessExtHostProxy = class TerminalProcessExtHostProxy extends Disposable {
    instanceId;
    _cols;
    _rows;
    _terminalService;
    id = 0;
    shouldPersist = false;
    _onProcessData = this._register(new Emitter());
    onProcessData = this._onProcessData.event;
    _onProcessReady = this._register(new Emitter());
    get onProcessReady() { return this._onProcessReady.event; }
    _onStart = this._register(new Emitter());
    onStart = this._onStart.event;
    _onInput = this._register(new Emitter());
    onInput = this._onInput.event;
    _onBinary = this._register(new Emitter());
    onBinary = this._onBinary.event;
    _onResize = this._register(new Emitter());
    onResize = this._onResize.event;
    _onAcknowledgeDataEvent = this._register(new Emitter());
    onAcknowledgeDataEvent = this._onAcknowledgeDataEvent.event;
    _onShutdown = this._register(new Emitter());
    onShutdown = this._onShutdown.event;
    _onRequestInitialCwd = this._register(new Emitter());
    onRequestInitialCwd = this._onRequestInitialCwd.event;
    _onRequestCwd = this._register(new Emitter());
    onRequestCwd = this._onRequestCwd.event;
    _onRequestLatency = this._register(new Emitter());
    onRequestLatency = this._onRequestLatency.event;
    _onDidChangeProperty = this._register(new Emitter());
    onDidChangeProperty = this._onDidChangeProperty.event;
    _onProcessExit = this._register(new Emitter());
    onProcessExit = this._onProcessExit.event;
    _pendingInitialCwdRequests = [];
    _pendingCwdRequests = [];
    _pendingLatencyRequests = [];
    constructor(instanceId, _cols, _rows, _terminalService) {
        super();
        this.instanceId = instanceId;
        this._cols = _cols;
        this._rows = _rows;
        this._terminalService = _terminalService;
    }
    emitData(data) {
        this._onProcessData.fire(data);
    }
    emitTitle(title) {
        this._onDidChangeProperty.fire({ type: "title" /* ProcessPropertyType.Title */, value: title });
    }
    emitReady(pid, cwd) {
        this._onProcessReady.fire({ pid, cwd });
    }
    emitProcessProperty({ type, value }) {
        switch (type) {
            case "cwd" /* ProcessPropertyType.Cwd */:
                this.emitCwd(value);
                break;
            case "initialCwd" /* ProcessPropertyType.InitialCwd */:
                this.emitInitialCwd(value);
                break;
            case "title" /* ProcessPropertyType.Title */:
                this.emitTitle(value);
                break;
            case "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */:
                this.emitOverrideDimensions(value);
                break;
            case "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */:
                this.emitResolvedShellLaunchConfig(value);
                break;
        }
    }
    emitExit(exitCode) {
        this._onProcessExit.fire(exitCode);
        this.dispose();
    }
    emitOverrideDimensions(dimensions) {
        this._onDidChangeProperty.fire({ type: "overrideDimensions" /* ProcessPropertyType.OverrideDimensions */, value: dimensions });
    }
    emitResolvedShellLaunchConfig(shellLaunchConfig) {
        this._onDidChangeProperty.fire({ type: "resolvedShellLaunchConfig" /* ProcessPropertyType.ResolvedShellLaunchConfig */, value: shellLaunchConfig });
    }
    emitInitialCwd(initialCwd) {
        while (this._pendingInitialCwdRequests.length > 0) {
            this._pendingInitialCwdRequests.pop()(initialCwd);
        }
    }
    emitCwd(cwd) {
        while (this._pendingCwdRequests.length > 0) {
            this._pendingCwdRequests.pop()(cwd);
        }
    }
    emitLatency(latency) {
        while (this._pendingLatencyRequests.length > 0) {
            this._pendingLatencyRequests.pop()(latency);
        }
    }
    async start() {
        return this._terminalService.requestStartExtensionTerminal(this, this._cols, this._rows);
    }
    shutdown(immediate) {
        this._onShutdown.fire(immediate);
    }
    input(data) {
        this._onInput.fire(data);
    }
    resize(cols, rows) {
        this._onResize.fire({ cols, rows });
    }
    acknowledgeDataEvent() {
        // Flow control is disabled for extension terminals
    }
    async setUnicodeVersion(version) {
        // No-op
    }
    async processBinary(data) {
        // Disabled for extension terminals
        this._onBinary.fire(data);
    }
    getInitialCwd() {
        return new Promise(resolve => {
            this._onRequestInitialCwd.fire();
            this._pendingInitialCwdRequests.push(resolve);
        });
    }
    getCwd() {
        return new Promise(resolve => {
            this._onRequestCwd.fire();
            this._pendingCwdRequests.push(resolve);
        });
    }
    getLatency() {
        return new Promise(resolve => {
            this._onRequestLatency.fire();
            this._pendingLatencyRequests.push(resolve);
        });
    }
    async refreshProperty(type) {
        // throws if called in extHostTerminalService
    }
    async updateProperty(type, value) {
        // throws if called in extHostTerminalService
    }
};
TerminalProcessExtHostProxy = __decorate([
    __param(3, ITerminalService)
], TerminalProcessExtHostProxy);
export { TerminalProcessExtHostProxy };
