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
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { FileAccess } from 'vs/base/common/network';
import { isWindows } from 'vs/base/common/platform';
import { ProxyChannel } from 'vs/base/parts/ipc/common/ipc';
import { Client } from 'vs/base/parts/ipc/node/ipc.cp';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { parsePtyHostPort } from 'vs/platform/environment/common/environmentService';
import { getResolvedShellEnv } from 'vs/platform/shell/node/shellEnv';
import { ILogService } from 'vs/platform/log/common/log';
import { LogLevelChannelClient } from 'vs/platform/log/common/logIpc';
import { RequestStore } from 'vs/platform/terminal/common/requestStore';
import { HeartbeatConstants, TerminalIpcChannels } from 'vs/platform/terminal/common/terminal';
import { registerTerminalPlatformConfiguration } from 'vs/platform/terminal/common/terminalPlatformConfiguration';
import { detectAvailableProfiles } from 'vs/platform/terminal/node/terminalProfiles';
var Constants;
(function (Constants) {
    Constants[Constants["MaxRestarts"] = 5] = "MaxRestarts";
})(Constants || (Constants = {}));
/**
 * Tracks the last terminal ID from the pty host so we can give it to the new pty host if it's
 * restarted and avoid ID conflicts.
 */
let lastPtyId = 0;
/**
 * This service implements IPtyService by launching a pty host process, forwarding messages to and
 * from the pty host process and manages the connection.
 */
let PtyHostService = class PtyHostService extends Disposable {
    _reconnectConstants;
    _configurationService;
    _environmentService;
    _logService;
    _client;
    // ProxyChannel is not used here because events get lost when forwarding across multiple proxies
    _proxy;
    _shellEnv;
    _resolveVariablesRequestStore;
    _restartCount = 0;
    _isResponsive = true;
    _isDisposed = false;
    _heartbeatFirstTimeout;
    _heartbeatSecondTimeout;
    _onPtyHostExit = this._register(new Emitter());
    onPtyHostExit = this._onPtyHostExit.event;
    _onPtyHostStart = this._register(new Emitter());
    onPtyHostStart = this._onPtyHostStart.event;
    _onPtyHostUnresponsive = this._register(new Emitter());
    onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
    _onPtyHostResponsive = this._register(new Emitter());
    onPtyHostResponsive = this._onPtyHostResponsive.event;
    _onPtyHostRequestResolveVariables = this._register(new Emitter());
    onPtyHostRequestResolveVariables = this._onPtyHostRequestResolveVariables.event;
    _onProcessData = this._register(new Emitter());
    onProcessData = this._onProcessData.event;
    _onProcessReady = this._register(new Emitter());
    onProcessReady = this._onProcessReady.event;
    _onProcessReplay = this._register(new Emitter());
    onProcessReplay = this._onProcessReplay.event;
    _onProcessOrphanQuestion = this._register(new Emitter());
    onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
    _onDidRequestDetach = this._register(new Emitter());
    onDidRequestDetach = this._onDidRequestDetach.event;
    _onDidChangeProperty = this._register(new Emitter());
    onDidChangeProperty = this._onDidChangeProperty.event;
    _onProcessExit = this._register(new Emitter());
    onProcessExit = this._onProcessExit.event;
    constructor(_reconnectConstants, _configurationService, _environmentService, _logService) {
        super();
        this._reconnectConstants = _reconnectConstants;
        this._configurationService = _configurationService;
        this._environmentService = _environmentService;
        this._logService = _logService;
        // Platform configuration is required on the process running the pty host (shared process or
        // remote server).
        registerTerminalPlatformConfiguration();
        this._shellEnv = this._resolveShellEnv();
        this._register(toDisposable(() => this._disposePtyHost()));
        this._resolveVariablesRequestStore = this._register(new RequestStore(undefined, this._logService));
        this._resolveVariablesRequestStore.onCreateRequest(this._onPtyHostRequestResolveVariables.fire, this._onPtyHostRequestResolveVariables);
        [this._client, this._proxy] = this._startPtyHost();
        this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration("terminal.integrated.ignoreProcessNames" /* TerminalSettingId.IgnoreProcessNames */)) {
                await this._refreshIgnoreProcessNames();
            }
        }));
    }
    initialize() {
        this._refreshIgnoreProcessNames();
    }
    get _ignoreProcessNames() {
        return this._configurationService.getValue("terminal.integrated.ignoreProcessNames" /* TerminalSettingId.IgnoreProcessNames */);
    }
    async _refreshIgnoreProcessNames() {
        return this._proxy.refreshIgnoreProcessNames?.(this._ignoreProcessNames);
    }
    async _resolveShellEnv() {
        if (isWindows) {
            return process.env;
        }
        try {
            return await getResolvedShellEnv(this._logService, { _: [] }, process.env);
        }
        catch (error) {
            this._logService.error('ptyHost was unable to resolve shell environment', error);
            return {};
        }
    }
    _startPtyHost() {
        const opts = {
            serverName: 'Pty Host',
            args: ['--type=ptyHost', '--logsPath', this._environmentService.logsPath],
            env: {
                VSCODE_LAST_PTY_ID: lastPtyId,
                VSCODE_AMD_ENTRYPOINT: 'vs/platform/terminal/node/ptyHostMain',
                VSCODE_PIPE_LOGGING: 'true',
                VSCODE_VERBOSE_LOGGING: 'true',
                VSCODE_RECONNECT_GRACE_TIME: this._reconnectConstants.graceTime,
                VSCODE_RECONNECT_SHORT_GRACE_TIME: this._reconnectConstants.shortGraceTime,
                VSCODE_RECONNECT_SCROLLBACK: this._reconnectConstants.scrollback
            }
        };
        const ptyHostDebug = parsePtyHostPort(this._environmentService.args, this._environmentService.isBuilt);
        if (ptyHostDebug) {
            if (ptyHostDebug.break && ptyHostDebug.port) {
                opts.debugBrk = ptyHostDebug.port;
            }
            else if (!ptyHostDebug.break && ptyHostDebug.port) {
                opts.debug = ptyHostDebug.port;
            }
        }
        const client = new Client(FileAccess.asFileUri('bootstrap-fork').fsPath, opts);
        this._onPtyHostStart.fire();
        // Setup heartbeat service and trigger a heartbeat immediately to reset the timeouts
        const heartbeatService = ProxyChannel.toService(client.getChannel(TerminalIpcChannels.Heartbeat));
        heartbeatService.onBeat(() => this._handleHeartbeat());
        this._handleHeartbeat();
        // Handle exit
        this._register(client.onDidProcessExit(e => {
            this._onPtyHostExit.fire(e.code);
            if (!this._isDisposed) {
                if (this._restartCount <= Constants.MaxRestarts) {
                    this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}`);
                    this._restartCount++;
                    this.restartPtyHost();
                }
                else {
                    this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}, giving up`);
                }
            }
        }));
        // Setup logging
        const logChannel = client.getChannel(TerminalIpcChannels.Log);
        LogLevelChannelClient.setLevel(logChannel, this._logService.getLevel());
        this._register(this._logService.onDidChangeLogLevel(() => {
            LogLevelChannelClient.setLevel(logChannel, this._logService.getLevel());
        }));
        // Create proxy and forward events
        const proxy = ProxyChannel.toService(client.getChannel(TerminalIpcChannels.PtyHost));
        this._register(proxy.onProcessData(e => this._onProcessData.fire(e)));
        this._register(proxy.onProcessReady(e => this._onProcessReady.fire(e)));
        this._register(proxy.onProcessExit(e => this._onProcessExit.fire(e)));
        this._register(proxy.onDidChangeProperty(e => this._onDidChangeProperty.fire(e)));
        this._register(proxy.onProcessReplay(e => this._onProcessReplay.fire(e)));
        this._register(proxy.onProcessOrphanQuestion(e => this._onProcessOrphanQuestion.fire(e)));
        this._register(proxy.onDidRequestDetach(e => this._onDidRequestDetach.fire(e)));
        return [client, proxy];
    }
    dispose() {
        this._isDisposed = true;
        super.dispose();
    }
    async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName) {
        const timeout = setTimeout(() => this._handleUnresponsiveCreateProcess(), HeartbeatConstants.CreateProcessTimeout);
        const id = await this._proxy.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName);
        clearTimeout(timeout);
        lastPtyId = Math.max(lastPtyId, id);
        return id;
    }
    updateTitle(id, title, titleSource) {
        return this._proxy.updateTitle(id, title, titleSource);
    }
    updateIcon(id, userInitiated, icon, color) {
        return this._proxy.updateIcon(id, userInitiated, icon, color);
    }
    attachToProcess(id) {
        return this._proxy.attachToProcess(id);
    }
    detachFromProcess(id, forcePersist) {
        return this._proxy.detachFromProcess(id, forcePersist);
    }
    listProcesses() {
        return this._proxy.listProcesses();
    }
    reduceConnectionGraceTime() {
        return this._proxy.reduceConnectionGraceTime();
    }
    start(id) {
        return this._proxy.start(id);
    }
    shutdown(id, immediate) {
        return this._proxy.shutdown(id, immediate);
    }
    input(id, data) {
        return this._proxy.input(id, data);
    }
    processBinary(id, data) {
        return this._proxy.processBinary(id, data);
    }
    resize(id, cols, rows) {
        return this._proxy.resize(id, cols, rows);
    }
    acknowledgeDataEvent(id, charCount) {
        return this._proxy.acknowledgeDataEvent(id, charCount);
    }
    setUnicodeVersion(id, version) {
        return this._proxy.setUnicodeVersion(id, version);
    }
    getInitialCwd(id) {
        return this._proxy.getInitialCwd(id);
    }
    getCwd(id) {
        return this._proxy.getCwd(id);
    }
    getLatency(id) {
        return this._proxy.getLatency(id);
    }
    orphanQuestionReply(id) {
        return this._proxy.orphanQuestionReply(id);
    }
    installAutoReply(match, reply) {
        return this._proxy.installAutoReply(match, reply);
    }
    uninstallAllAutoReplies() {
        return this._proxy.uninstallAllAutoReplies();
    }
    uninstallAutoReply(match) {
        return this._proxy.uninstallAutoReply(match);
    }
    getDefaultSystemShell(osOverride) {
        return this._proxy.getDefaultSystemShell(osOverride);
    }
    async getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles = false) {
        const shellEnv = await this._shellEnv;
        return detectAvailableProfiles(profiles, defaultProfile, includeDetectedProfiles, this._configurationService, shellEnv, undefined, this._logService, this._resolveVariables.bind(this, workspaceId));
    }
    getEnvironment() {
        return this._proxy.getEnvironment();
    }
    getWslPath(original) {
        return this._proxy.getWslPath(original);
    }
    getRevivedPtyNewId(id) {
        return this._proxy.getRevivedPtyNewId(id);
    }
    setTerminalLayoutInfo(args) {
        return this._proxy.setTerminalLayoutInfo(args);
    }
    async getTerminalLayoutInfo(args) {
        return await this._proxy.getTerminalLayoutInfo(args);
    }
    async requestDetachInstance(workspaceId, instanceId) {
        return this._proxy.requestDetachInstance(workspaceId, instanceId);
    }
    async acceptDetachInstanceReply(requestId, persistentProcessId) {
        return this._proxy.acceptDetachInstanceReply(requestId, persistentProcessId);
    }
    async freePortKillProcess(port) {
        if (!this._proxy.freePortKillProcess) {
            throw new Error('freePortKillProcess does not exist on the pty proxy');
        }
        return this._proxy.freePortKillProcess(port);
    }
    async serializeTerminalState(ids) {
        return this._proxy.serializeTerminalState(ids);
    }
    async reviveTerminalProcesses(state, dateTimeFormatLocate) {
        return this._proxy.reviveTerminalProcesses(state, dateTimeFormatLocate);
    }
    async refreshProperty(id, property) {
        return this._proxy.refreshProperty(id, property);
    }
    async updateProperty(id, property, value) {
        return this._proxy.updateProperty(id, property, value);
    }
    async restartPtyHost() {
        this._isResponsive = true;
        this._disposePtyHost();
        [this._client, this._proxy] = this._startPtyHost();
    }
    _disposePtyHost() {
        this._proxy.shutdownAll?.();
        this._client.dispose();
    }
    _handleHeartbeat() {
        this._clearHeartbeatTimeouts();
        this._heartbeatFirstTimeout = setTimeout(() => this._handleHeartbeatFirstTimeout(), HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier);
        if (!this._isResponsive) {
            this._isResponsive = true;
            this._onPtyHostResponsive.fire();
        }
    }
    _handleHeartbeatFirstTimeout() {
        this._logService.warn(`No ptyHost heartbeat after ${HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier / 1000} seconds`);
        this._heartbeatFirstTimeout = undefined;
        this._heartbeatSecondTimeout = setTimeout(() => this._handleHeartbeatSecondTimeout(), HeartbeatConstants.BeatInterval * HeartbeatConstants.SecondWaitMultiplier);
    }
    _handleHeartbeatSecondTimeout() {
        this._logService.error(`No ptyHost heartbeat after ${(HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier + HeartbeatConstants.BeatInterval * HeartbeatConstants.FirstWaitMultiplier) / 1000} seconds`);
        this._heartbeatSecondTimeout = undefined;
        if (this._isResponsive) {
            this._isResponsive = false;
            this._onPtyHostUnresponsive.fire();
        }
    }
    _handleUnresponsiveCreateProcess() {
        this._clearHeartbeatTimeouts();
        this._logService.error(`No ptyHost response to createProcess after ${HeartbeatConstants.CreateProcessTimeout / 1000} seconds`);
        if (this._isResponsive) {
            this._isResponsive = false;
            this._onPtyHostUnresponsive.fire();
        }
    }
    _clearHeartbeatTimeouts() {
        if (this._heartbeatFirstTimeout) {
            clearTimeout(this._heartbeatFirstTimeout);
            this._heartbeatFirstTimeout = undefined;
        }
        if (this._heartbeatSecondTimeout) {
            clearTimeout(this._heartbeatSecondTimeout);
            this._heartbeatSecondTimeout = undefined;
        }
    }
    _resolveVariables(workspaceId, text) {
        return this._resolveVariablesRequestStore.createRequest({ workspaceId, originalText: text });
    }
    async acceptPtyHostResolvedVariables(requestId, resolved) {
        this._resolveVariablesRequestStore.acceptReply(requestId, resolved);
    }
};
PtyHostService = __decorate([
    __param(1, IConfigurationService),
    __param(2, IEnvironmentService),
    __param(3, ILogService)
], PtyHostService);
export { PtyHostService };
