/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { execFile, exec } from 'child_process';
import { AutoOpenBarrier, ProcessTimeRunOnceScheduler, Promises, Queue } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { isWindows, OS } from 'vs/base/common/platform';
import { getSystemShell } from 'vs/base/node/shell';
import { RequestStore } from 'vs/platform/terminal/common/requestStore';
import { TitleEventSource } from 'vs/platform/terminal/common/terminal';
import { TerminalDataBufferer } from 'vs/platform/terminal/common/terminalDataBuffering';
import { escapeNonWindowsPath } from 'vs/platform/terminal/common/terminalEnvironment';
import { Terminal as XtermTerminal } from 'xterm-headless';
import { getWindowsBuildNumber } from 'vs/platform/terminal/node/terminalEnvironment';
import { TerminalProcess } from 'vs/platform/terminal/node/terminalProcess';
import { localize } from 'vs/nls';
import { ignoreProcessNames } from 'vs/platform/terminal/node/childProcessMonitor';
import { TerminalAutoResponder } from 'vs/platform/terminal/common/terminalAutoResponder';
import { ErrorNoTelemetry } from 'vs/base/common/errors';
import { ShellIntegrationAddon } from 'vs/platform/terminal/common/xterm/shellIntegrationAddon';
import { formatMessageForTerminal } from 'vs/platform/terminal/common/terminalStrings';
let SerializeAddon;
let Unicode11Addon;
export class PtyService extends Disposable {
    _lastPtyId;
    _logService;
    _productService;
    _reconnectConstants;
    _ptys = new Map();
    _workspaceLayoutInfos = new Map();
    _detachInstanceRequestStore;
    _revivedPtyIdMap = new Map();
    _autoReplies = new Map();
    _onHeartbeat = this._register(new Emitter());
    onHeartbeat = this._onHeartbeat.event;
    _onProcessData = this._register(new Emitter());
    onProcessData = this._onProcessData.event;
    _onProcessReplay = this._register(new Emitter());
    onProcessReplay = this._onProcessReplay.event;
    _onProcessReady = this._register(new Emitter());
    onProcessReady = this._onProcessReady.event;
    _onProcessExit = this._register(new Emitter());
    onProcessExit = this._onProcessExit.event;
    _onProcessOrphanQuestion = this._register(new Emitter());
    onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
    _onDidRequestDetach = this._register(new Emitter());
    onDidRequestDetach = this._onDidRequestDetach.event;
    _onDidChangeProperty = this._register(new Emitter());
    onDidChangeProperty = this._onDidChangeProperty.event;
    constructor(_lastPtyId, _logService, _productService, _reconnectConstants) {
        super();
        this._lastPtyId = _lastPtyId;
        this._logService = _logService;
        this._productService = _productService;
        this._reconnectConstants = _reconnectConstants;
        this._register(toDisposable(() => {
            for (const pty of this._ptys.values()) {
                pty.shutdown(true);
            }
            this._ptys.clear();
        }));
        this._detachInstanceRequestStore = this._register(new RequestStore(undefined, this._logService));
        this._detachInstanceRequestStore.onCreateRequest(this._onDidRequestDetach.fire, this._onDidRequestDetach);
    }
    async refreshIgnoreProcessNames(names) {
        ignoreProcessNames.length = 0;
        ignoreProcessNames.push(...names);
    }
    onPtyHostExit;
    onPtyHostStart;
    onPtyHostUnresponsive;
    onPtyHostResponsive;
    onPtyHostRequestResolveVariables;
    async requestDetachInstance(workspaceId, instanceId) {
        return this._detachInstanceRequestStore.createRequest({ workspaceId, instanceId });
    }
    async acceptDetachInstanceReply(requestId, persistentProcessId) {
        let processDetails = undefined;
        const pty = this._ptys.get(persistentProcessId);
        if (pty) {
            processDetails = await this._buildProcessDetails(persistentProcessId, pty);
        }
        this._detachInstanceRequestStore.acceptReply(requestId, processDetails);
    }
    async freePortKillProcess(port) {
        const stdout = await new Promise((resolve, reject) => {
            exec(isWindows ? `netstat -ano | findstr "${port}"` : `lsof -nP -iTCP -sTCP:LISTEN | grep ${port}`, {}, (err, stdout) => {
                if (err) {
                    return reject('Problem occurred when listing active processes');
                }
                resolve(stdout);
            });
        });
        const processesForPort = stdout.split('\n');
        if (processesForPort.length >= 1) {
            const capturePid = /\s+(\d+)\s+/;
            const processId = processesForPort[0].match(capturePid)?.[1];
            if (processId) {
                try {
                    process.kill(Number.parseInt(processId));
                }
                catch { }
            }
            else {
                throw new Error(`Processes for port ${port} were not found`);
            }
            return { port, processId };
        }
        throw new Error(`Could not kill process with port ${port}`);
    }
    async serializeTerminalState(ids) {
        const promises = [];
        for (const [persistentProcessId, persistentProcess] of this._ptys.entries()) {
            // Only serialize persistent processes that have had data written or performed a replay
            if (persistentProcess.hasWrittenData && ids.indexOf(persistentProcessId) !== -1) {
                promises.push(Promises.withAsyncBody(async (r) => {
                    r({
                        id: persistentProcessId,
                        shellLaunchConfig: persistentProcess.shellLaunchConfig,
                        processDetails: await this._buildProcessDetails(persistentProcessId, persistentProcess),
                        processLaunchConfig: persistentProcess.processLaunchOptions,
                        unicodeVersion: persistentProcess.unicodeVersion,
                        replayEvent: await persistentProcess.serializeNormalBuffer(),
                        timestamp: Date.now()
                    });
                }));
            }
        }
        const serialized = {
            version: 1,
            state: await Promise.all(promises)
        };
        return JSON.stringify(serialized);
    }
    async reviveTerminalProcesses(state, dateTimeFormatLocale) {
        for (const terminal of state) {
            const restoreMessage = localize('terminal-history-restored', "History restored");
            // TODO: We may at some point want to show date information in a hover via a custom sequence:
            //   new Date(terminal.timestamp).toLocaleDateString(dateTimeFormatLocale)
            //   new Date(terminal.timestamp).toLocaleTimeString(dateTimeFormatLocale)
            const newId = await this.createProcess({
                ...terminal.shellLaunchConfig,
                cwd: terminal.processDetails.cwd,
                color: terminal.processDetails.color,
                icon: terminal.processDetails.icon,
                name: terminal.processDetails.titleSource === TitleEventSource.Api ? terminal.processDetails.title : undefined,
                initialText: terminal.replayEvent.events[0].data + formatMessageForTerminal(restoreMessage, { loudFormatting: true })
            }, terminal.processDetails.cwd, terminal.replayEvent.events[0].cols, terminal.replayEvent.events[0].rows, terminal.unicodeVersion, terminal.processLaunchConfig.env, terminal.processLaunchConfig.executableEnv, terminal.processLaunchConfig.options, true, terminal.processDetails.workspaceId, terminal.processDetails.workspaceName, true, terminal.replayEvent.events[0].data);
            // Don't start the process here as there's no terminal to answer CPR
            this._revivedPtyIdMap.set(terminal.id, { newId, state: terminal });
        }
    }
    async shutdownAll() {
        this.dispose();
    }
    async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName, isReviving, rawReviveBuffer) {
        if (shellLaunchConfig.attachPersistentProcess) {
            throw new Error('Attempt to create a process when attach object was provided');
        }
        const id = ++this._lastPtyId;
        const process = new TerminalProcess(shellLaunchConfig, cwd, cols, rows, env, executableEnv, options, this._logService, this._productService);
        process.onProcessData(event => this._onProcessData.fire({ id, event }));
        const processLaunchOptions = {
            env,
            executableEnv,
            options
        };
        const persistentProcess = new PersistentTerminalProcess(id, process, workspaceId, workspaceName, shouldPersist, cols, rows, processLaunchOptions, unicodeVersion, this._reconnectConstants, this._logService, isReviving && typeof shellLaunchConfig.initialText === 'string' ? shellLaunchConfig.initialText : undefined, rawReviveBuffer, shellLaunchConfig.icon, shellLaunchConfig.color, shellLaunchConfig.name, shellLaunchConfig.fixedDimensions);
        process.onDidChangeProperty(property => this._onDidChangeProperty.fire({ id, property }));
        process.onProcessExit(event => {
            persistentProcess.dispose();
            this._ptys.delete(id);
            this._onProcessExit.fire({ id, event });
        });
        persistentProcess.onProcessReplay(event => this._onProcessReplay.fire({ id, event }));
        persistentProcess.onProcessReady(event => this._onProcessReady.fire({ id, event }));
        persistentProcess.onProcessOrphanQuestion(() => this._onProcessOrphanQuestion.fire({ id }));
        persistentProcess.onDidChangeProperty(property => this._onDidChangeProperty.fire({ id, property }));
        persistentProcess.onPersistentProcessReady(() => {
            for (const e of this._autoReplies.entries()) {
                persistentProcess.installAutoReply(e[0], e[1]);
            }
        });
        this._ptys.set(id, persistentProcess);
        return id;
    }
    async attachToProcess(id) {
        try {
            await this._throwIfNoPty(id).attach();
            this._logService.info(`Persistent process reconnection "${id}"`);
        }
        catch (e) {
            this._logService.warn(`Persistent process reconnection "${id}" failed`, e.message);
            throw e;
        }
    }
    async updateTitle(id, title, titleSource) {
        this._throwIfNoPty(id).setTitle(title, titleSource);
    }
    async updateIcon(id, userInitiated, icon, color) {
        this._throwIfNoPty(id).setIcon(userInitiated, icon, color);
    }
    async refreshProperty(id, type) {
        return this._throwIfNoPty(id).refreshProperty(type);
    }
    async updateProperty(id, type, value) {
        return this._throwIfNoPty(id).updateProperty(type, value);
    }
    async detachFromProcess(id, forcePersist) {
        return this._throwIfNoPty(id).detach(forcePersist);
    }
    async reduceConnectionGraceTime() {
        for (const pty of this._ptys.values()) {
            pty.reduceGraceTime();
        }
    }
    async listProcesses() {
        const persistentProcesses = Array.from(this._ptys.entries()).filter(([_, pty]) => pty.shouldPersistTerminal);
        this._logService.info(`Listing ${persistentProcesses.length} persistent terminals, ${this._ptys.size} total terminals`);
        const promises = persistentProcesses.map(async ([id, terminalProcessData]) => this._buildProcessDetails(id, terminalProcessData));
        const allTerminals = await Promise.all(promises);
        return allTerminals.filter(entry => entry.isOrphan);
    }
    async start(id) {
        this._logService.trace('ptyService#start', id);
        const pty = this._ptys.get(id);
        return pty ? pty.start() : { message: `Could not find pty with id "${id}"` };
    }
    async shutdown(id, immediate) {
        // Don't throw if the pty is already shutdown
        this._logService.trace('ptyService#shutDown', id, immediate);
        return this._ptys.get(id)?.shutdown(immediate);
    }
    async input(id, data) {
        return this._throwIfNoPty(id).input(data);
    }
    async processBinary(id, data) {
        return this._throwIfNoPty(id).writeBinary(data);
    }
    async resize(id, cols, rows) {
        return this._throwIfNoPty(id).resize(cols, rows);
    }
    async getInitialCwd(id) {
        return this._throwIfNoPty(id).getInitialCwd();
    }
    async getCwd(id) {
        return this._throwIfNoPty(id).getCwd();
    }
    async acknowledgeDataEvent(id, charCount) {
        return this._throwIfNoPty(id).acknowledgeDataEvent(charCount);
    }
    async setUnicodeVersion(id, version) {
        return this._throwIfNoPty(id).setUnicodeVersion(version);
    }
    async getLatency(id) {
        return 0;
    }
    async orphanQuestionReply(id) {
        return this._throwIfNoPty(id).orphanQuestionReply();
    }
    async installAutoReply(match, reply) {
        this._autoReplies.set(match, reply);
        // If the auto reply exists on any existing terminals it will be overridden
        for (const p of this._ptys.values()) {
            p.installAutoReply(match, reply);
        }
    }
    async uninstallAllAutoReplies() {
        for (const match of this._autoReplies.keys()) {
            for (const p of this._ptys.values()) {
                p.uninstallAutoReply(match);
            }
        }
    }
    async uninstallAutoReply(match) {
        for (const p of this._ptys.values()) {
            p.uninstallAutoReply(match);
        }
    }
    async getDefaultSystemShell(osOverride = OS) {
        return getSystemShell(osOverride, process.env);
    }
    async getEnvironment() {
        return { ...process.env };
    }
    async getWslPath(original) {
        if (!isWindows) {
            return original;
        }
        if (getWindowsBuildNumber() < 17063) {
            return original.replace(/\\/g, '/');
        }
        return new Promise(c => {
            const proc = execFile('bash.exe', ['-c', `wslpath ${escapeNonWindowsPath(original)}`], {}, (error, stdout, stderr) => {
                c(escapeNonWindowsPath(stdout.trim()));
            });
            proc.stdin.end();
        });
    }
    async getRevivedPtyNewId(id) {
        try {
            return this._revivedPtyIdMap.get(id)?.newId;
        }
        catch (e) {
            this._logService.warn(`Couldn't find terminal ID ${id}`, e.message);
        }
        return undefined;
    }
    async setTerminalLayoutInfo(args) {
        this._logService.trace('ptyService#setLayoutInfo', args.tabs);
        this._workspaceLayoutInfos.set(args.workspaceId, args);
    }
    async getTerminalLayoutInfo(args) {
        const layout = this._workspaceLayoutInfos.get(args.workspaceId);
        this._logService.trace('ptyService#getLayoutInfo', args);
        if (layout) {
            const expandedTabs = await Promise.all(layout.tabs.map(async (tab) => this._expandTerminalTab(tab)));
            const tabs = expandedTabs.filter(t => t.terminals.length > 0);
            this._logService.trace('ptyService#returnLayoutInfo', tabs);
            return { tabs };
        }
        return undefined;
    }
    async _expandTerminalTab(tab) {
        const expandedTerminals = (await Promise.all(tab.terminals.map(t => this._expandTerminalInstance(t))));
        const filtered = expandedTerminals.filter(term => term.terminal !== null);
        return {
            isActive: tab.isActive,
            activePersistentProcessId: tab.activePersistentProcessId,
            terminals: filtered
        };
    }
    async _expandTerminalInstance(t) {
        try {
            const revivedPtyId = this._revivedPtyIdMap.get(t.terminal)?.newId;
            this._revivedPtyIdMap.delete(t.terminal);
            const persistentProcessId = revivedPtyId ?? t.terminal;
            const persistentProcess = this._throwIfNoPty(persistentProcessId);
            const processDetails = persistentProcess && await this._buildProcessDetails(t.terminal, persistentProcess, revivedPtyId !== undefined);
            return {
                terminal: { ...processDetails, id: persistentProcessId },
                relativeSize: t.relativeSize
            };
        }
        catch (e) {
            this._logService.warn(`Couldn't get layout info, a terminal was probably disconnected`, e.message);
            // this will be filtered out and not reconnected
            return {
                terminal: null,
                relativeSize: t.relativeSize
            };
        }
    }
    async _buildProcessDetails(id, persistentProcess, wasRevived = false) {
        // If the process was just revived, don't do the orphan check as it will
        // take some time
        const [cwd, isOrphan] = await Promise.all([persistentProcess.getCwd(), wasRevived ? true : persistentProcess.isOrphaned()]);
        return {
            id,
            title: persistentProcess.title,
            titleSource: persistentProcess.titleSource,
            pid: persistentProcess.pid,
            workspaceId: persistentProcess.workspaceId,
            workspaceName: persistentProcess.workspaceName,
            cwd,
            isOrphan,
            icon: persistentProcess.icon,
            color: persistentProcess.color,
            fixedDimensions: persistentProcess.fixedDimensions,
            environmentVariableCollections: persistentProcess.processLaunchOptions.options.environmentVariableCollections,
            reconnectionProperties: persistentProcess.shellLaunchConfig.reconnectionProperties,
            waitOnExit: persistentProcess.shellLaunchConfig.waitOnExit,
            hideFromUser: persistentProcess.shellLaunchConfig.hideFromUser,
            isFeatureTerminal: persistentProcess.shellLaunchConfig.isFeatureTerminal,
            type: persistentProcess.shellLaunchConfig.type
        };
    }
    _throwIfNoPty(id) {
        const pty = this._ptys.get(id);
        if (!pty) {
            throw new ErrorNoTelemetry(`Could not find pty on pty host`);
        }
        return pty;
    }
}
var InteractionState;
(function (InteractionState) {
    /** The terminal has not been interacted with. */
    InteractionState["None"] = "None";
    /** The terminal has only been interacted with by the replay mechanism. */
    InteractionState["ReplayOnly"] = "ReplayOnly";
    /** The terminal has been directly interacted with this session. */
    InteractionState["Session"] = "Session";
})(InteractionState || (InteractionState = {}));
export class PersistentTerminalProcess extends Disposable {
    _persistentProcessId;
    _terminalProcess;
    workspaceId;
    workspaceName;
    shouldPersistTerminal;
    processLaunchOptions;
    unicodeVersion;
    _logService;
    _icon;
    _color;
    _bufferer;
    _autoReplies = new Map();
    _pendingCommands = new Map();
    _isStarted = false;
    _interactionState;
    _orphanQuestionBarrier;
    _orphanQuestionReplyTime;
    _orphanRequestQueue = new Queue();
    _disconnectRunner1;
    _disconnectRunner2;
    _onProcessReplay = this._register(new Emitter());
    onProcessReplay = this._onProcessReplay.event;
    _onProcessReady = this._register(new Emitter());
    onProcessReady = this._onProcessReady.event;
    _onPersistentProcessReady = this._register(new Emitter());
    /** Fired when the persistent process has a ready process and has finished its replay. */
    onPersistentProcessReady = this._onPersistentProcessReady.event;
    _onProcessData = this._register(new Emitter());
    onProcessData = this._onProcessData.event;
    _onProcessOrphanQuestion = this._register(new Emitter());
    onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
    _onDidChangeProperty = this._register(new Emitter());
    onDidChangeProperty = this._onDidChangeProperty.event;
    _inReplay = false;
    _pid = -1;
    _cwd = '';
    _title;
    _titleSource = TitleEventSource.Process;
    _serializer;
    _wasRevived;
    _fixedDimensions;
    get pid() { return this._pid; }
    get shellLaunchConfig() { return this._terminalProcess.shellLaunchConfig; }
    get hasWrittenData() { return this._interactionState.value !== "None" /* InteractionState.None */; }
    get title() { return this._title || this._terminalProcess.currentTitle; }
    get titleSource() { return this._titleSource; }
    get icon() { return this._icon; }
    get color() { return this._color; }
    get fixedDimensions() { return this._fixedDimensions; }
    setTitle(title, titleSource) {
        if (titleSource === TitleEventSource.Api) {
            this._interactionState.setValue("Session" /* InteractionState.Session */, 'setTitle');
            this._serializer.freeRawReviveBuffer();
        }
        this._title = title;
        this._titleSource = titleSource;
    }
    setIcon(userInitiated, icon, color) {
        if (!this._icon || 'id' in icon && 'id' in this._icon && icon.id !== this._icon.id ||
            !this.color || color !== this._color) {
            this._serializer.freeRawReviveBuffer();
            if (userInitiated) {
                this._interactionState.setValue("Session" /* InteractionState.Session */, 'setIcon');
            }
        }
        this._icon = icon;
        this._color = color;
    }
    _setFixedDimensions(fixedDimensions) {
        this._fixedDimensions = fixedDimensions;
    }
    constructor(_persistentProcessId, _terminalProcess, workspaceId, workspaceName, shouldPersistTerminal, cols, rows, processLaunchOptions, unicodeVersion, reconnectConstants, _logService, reviveBuffer, rawReviveBuffer, _icon, _color, name, fixedDimensions) {
        super();
        this._persistentProcessId = _persistentProcessId;
        this._terminalProcess = _terminalProcess;
        this.workspaceId = workspaceId;
        this.workspaceName = workspaceName;
        this.shouldPersistTerminal = shouldPersistTerminal;
        this.processLaunchOptions = processLaunchOptions;
        this.unicodeVersion = unicodeVersion;
        this._logService = _logService;
        this._icon = _icon;
        this._color = _color;
        this._logService.trace('persistentTerminalProcess#ctor', _persistentProcessId, arguments);
        this._interactionState = new MutationLogger(`Persistent process "${this._persistentProcessId}" interaction state`, "None" /* InteractionState.None */, this._logService);
        this._wasRevived = reviveBuffer !== undefined;
        this._serializer = new XtermSerializer(cols, rows, reconnectConstants.scrollback, unicodeVersion, reviveBuffer, shouldPersistTerminal ? rawReviveBuffer : undefined, this._logService);
        if (name) {
            this.setTitle(name, TitleEventSource.Api);
        }
        this._fixedDimensions = fixedDimensions;
        this._orphanQuestionBarrier = null;
        this._orphanQuestionReplyTime = 0;
        this._disconnectRunner1 = this._register(new ProcessTimeRunOnceScheduler(() => {
            this._logService.info(`Persistent process "${this._persistentProcessId}": The reconnection grace time of ${printTime(reconnectConstants.graceTime)} has expired, shutting down pid "${this._pid}"`);
            this.shutdown(true);
        }, reconnectConstants.graceTime));
        this._disconnectRunner2 = this._register(new ProcessTimeRunOnceScheduler(() => {
            this._logService.info(`Persistent process "${this._persistentProcessId}": The short reconnection grace time of ${printTime(reconnectConstants.shortGraceTime)} has expired, shutting down pid ${this._pid}`);
            this.shutdown(true);
        }, reconnectConstants.shortGraceTime));
        this._register(this._terminalProcess.onProcessExit(() => this._bufferer.stopBuffering(this._persistentProcessId)));
        this._register(this._terminalProcess.onProcessReady(e => {
            this._pid = e.pid;
            this._cwd = e.cwd;
            this._onProcessReady.fire(e);
        }));
        this._register(this._terminalProcess.onDidChangeProperty(e => {
            this._onDidChangeProperty.fire(e);
        }));
        // Data buffering to reduce the amount of messages going to the renderer
        this._bufferer = new TerminalDataBufferer((_, data) => this._onProcessData.fire(data));
        this._register(this._bufferer.startBuffering(this._persistentProcessId, this._terminalProcess.onProcessData));
        // Data recording for reconnect
        this._register(this.onProcessData(e => this._serializer.handleData(e)));
        // Clean up other disposables
        this._register(toDisposable(() => {
            for (const e of this._autoReplies.values()) {
                e.dispose();
            }
            this._autoReplies.clear();
        }));
    }
    async attach() {
        this._logService.trace('persistentTerminalProcess#attach', this._persistentProcessId);
        // Something wrong happened if the disconnect runner is not canceled, this likely means
        // multiple windows attempted to attach.
        if (!await this._isOrphaned()) {
            throw new Error(`Cannot attach to persistent process "${this._persistentProcessId}", it is already adopted`);
        }
        if (!this._disconnectRunner1.isScheduled() && !this._disconnectRunner2.isScheduled()) {
            this._logService.warn(`Persistent process "${this._persistentProcessId}": Process had no disconnect runners but was an orphan`);
        }
        this._disconnectRunner1.cancel();
        this._disconnectRunner2.cancel();
    }
    async detach(forcePersist) {
        this._logService.trace('persistentTerminalProcess#detach', this._persistentProcessId, forcePersist);
        // Keep the process around if it was indicated to persist and it has had some iteraction or
        // was replayed
        if (this.shouldPersistTerminal && (this._interactionState.value !== "None" /* InteractionState.None */ || forcePersist)) {
            this._disconnectRunner1.schedule();
        }
        else {
            this.shutdown(true);
        }
    }
    serializeNormalBuffer() {
        return this._serializer.generateReplayEvent(true, this._interactionState.value !== "Session" /* InteractionState.Session */);
    }
    async refreshProperty(type) {
        return this._terminalProcess.refreshProperty(type);
    }
    async updateProperty(type, value) {
        if (type === "fixedDimensions" /* ProcessPropertyType.FixedDimensions */) {
            return this._setFixedDimensions(value);
        }
    }
    async start() {
        this._logService.trace('persistentTerminalProcess#start', this._persistentProcessId, this._isStarted);
        if (!this._isStarted) {
            const result = await this._terminalProcess.start();
            if (result) {
                // it's a terminal launch error
                return result;
            }
            this._isStarted = true;
            // If the process was revived, trigger a replay on first start. An alternative approach
            // could be to start it on the pty host before attaching but this fails on Windows as
            // conpty's inherit cursor option which is required, ends up sending DSR CPR which
            // causes conhost to hang when no response is received from the terminal (which wouldn't
            // be attached yet). https://github.com/microsoft/terminal/issues/11213
            if (this._wasRevived) {
                this.triggerReplay();
            }
            else {
                this._onPersistentProcessReady.fire();
            }
        }
        else {
            this._onProcessReady.fire({ pid: this._pid, cwd: this._cwd, requiresWindowsMode: isWindows && getWindowsBuildNumber() < 21376 });
            this._onDidChangeProperty.fire({ type: "title" /* ProcessPropertyType.Title */, value: this._terminalProcess.currentTitle });
            this._onDidChangeProperty.fire({ type: "shellType" /* ProcessPropertyType.ShellType */, value: this._terminalProcess.shellType });
            this.triggerReplay();
        }
        return undefined;
    }
    shutdown(immediate) {
        return this._terminalProcess.shutdown(immediate);
    }
    input(data) {
        this._interactionState.setValue("Session" /* InteractionState.Session */, 'input');
        this._serializer.freeRawReviveBuffer();
        if (this._inReplay) {
            return;
        }
        for (const listener of this._autoReplies.values()) {
            listener.handleInput();
        }
        return this._terminalProcess.input(data);
    }
    writeBinary(data) {
        return this._terminalProcess.processBinary(data);
    }
    resize(cols, rows) {
        if (this._inReplay) {
            return;
        }
        this._serializer.handleResize(cols, rows);
        // Buffered events should flush when a resize occurs
        this._bufferer.flushBuffer(this._persistentProcessId);
        for (const listener of this._autoReplies.values()) {
            listener.handleResize();
        }
        return this._terminalProcess.resize(cols, rows);
    }
    setUnicodeVersion(version) {
        this.unicodeVersion = version;
        this._serializer.setUnicodeVersion?.(version);
        // TODO: Pass in unicode version in ctor
    }
    acknowledgeDataEvent(charCount) {
        if (this._inReplay) {
            return;
        }
        return this._terminalProcess.acknowledgeDataEvent(charCount);
    }
    getInitialCwd() {
        return this._terminalProcess.getInitialCwd();
    }
    getCwd() {
        return this._terminalProcess.getCwd();
    }
    getLatency() {
        return this._terminalProcess.getLatency();
    }
    async triggerReplay() {
        if (this._interactionState.value === "None" /* InteractionState.None */) {
            this._interactionState.setValue("ReplayOnly" /* InteractionState.ReplayOnly */, 'triggerReplay');
        }
        const ev = await this._serializer.generateReplayEvent();
        let dataLength = 0;
        for (const e of ev.events) {
            dataLength += e.data.length;
        }
        this._logService.info(`Persistent process "${this._persistentProcessId}": Replaying ${dataLength} chars and ${ev.events.length} size events`);
        this._onProcessReplay.fire(ev);
        this._terminalProcess.clearUnacknowledgedChars();
        this._onPersistentProcessReady.fire();
    }
    installAutoReply(match, reply) {
        this._autoReplies.get(match)?.dispose();
        this._autoReplies.set(match, new TerminalAutoResponder(this._terminalProcess, match, reply, this._logService));
    }
    uninstallAutoReply(match) {
        const autoReply = this._autoReplies.get(match);
        autoReply?.dispose();
        this._autoReplies.delete(match);
    }
    sendCommandResult(reqId, isError, serializedPayload) {
        const data = this._pendingCommands.get(reqId);
        if (!data) {
            return;
        }
        this._pendingCommands.delete(reqId);
    }
    orphanQuestionReply() {
        this._orphanQuestionReplyTime = Date.now();
        if (this._orphanQuestionBarrier) {
            const barrier = this._orphanQuestionBarrier;
            this._orphanQuestionBarrier = null;
            barrier.open();
        }
    }
    reduceGraceTime() {
        if (this._disconnectRunner2.isScheduled()) {
            // we are disconnected and already running the short reconnection timer
            return;
        }
        if (this._disconnectRunner1.isScheduled()) {
            // we are disconnected and running the long reconnection timer
            this._disconnectRunner2.schedule();
        }
    }
    async isOrphaned() {
        return await this._orphanRequestQueue.queue(async () => this._isOrphaned());
    }
    async _isOrphaned() {
        // The process is already known to be orphaned
        if (this._disconnectRunner1.isScheduled() || this._disconnectRunner2.isScheduled()) {
            return true;
        }
        // Ask whether the renderer(s) whether the process is orphaned and await the reply
        if (!this._orphanQuestionBarrier) {
            // the barrier opens after 4 seconds with or without a reply
            this._orphanQuestionBarrier = new AutoOpenBarrier(4000);
            this._orphanQuestionReplyTime = 0;
            this._onProcessOrphanQuestion.fire();
        }
        await this._orphanQuestionBarrier.wait();
        return (Date.now() - this._orphanQuestionReplyTime > 500);
    }
}
class MutationLogger {
    _name;
    _value;
    _logService;
    get value() { return this._value; }
    setValue(value, reason) {
        if (this._value !== value) {
            this._value = value;
            this._log(reason);
        }
    }
    constructor(_name, _value, _logService) {
        this._name = _name;
        this._value = _value;
        this._logService = _logService;
        this._log('initialized');
    }
    _log(reason) {
        this._logService.debug(`MutationLogger "${this._name}" set to "${this._value}", reason: ${reason}`);
    }
}
class XtermSerializer {
    _rawReviveBuffer;
    _xterm;
    _shellIntegrationAddon;
    _unicodeAddon;
    constructor(cols, rows, scrollback, unicodeVersion, reviveBufferWithRestoreMessage, _rawReviveBuffer, logService) {
        this._rawReviveBuffer = _rawReviveBuffer;
        this._xterm = new XtermTerminal({
            cols,
            rows,
            scrollback,
            allowProposedApi: true
        });
        if (reviveBufferWithRestoreMessage) {
            this._xterm.writeln(reviveBufferWithRestoreMessage);
        }
        this.setUnicodeVersion(unicodeVersion);
        this._shellIntegrationAddon = new ShellIntegrationAddon(true, undefined, logService);
        this._xterm.loadAddon(this._shellIntegrationAddon);
    }
    freeRawReviveBuffer() {
        // Free the memory of the terminal if it will need to be re-serialized
        this._rawReviveBuffer = undefined;
    }
    handleData(data) {
        this._xterm.write(data);
    }
    handleResize(cols, rows) {
        this._xterm.resize(cols, rows);
    }
    async generateReplayEvent(normalBufferOnly, restoreToLastReviveBuffer) {
        const serialize = new (await this._getSerializeConstructor());
        this._xterm.loadAddon(serialize);
        const options = {
            scrollback: this._xterm.options.scrollback
        };
        if (normalBufferOnly) {
            options.excludeAltBuffer = true;
            options.excludeModes = true;
        }
        let serialized;
        if (restoreToLastReviveBuffer && this._rawReviveBuffer) {
            serialized = this._rawReviveBuffer;
        }
        else {
            serialized = serialize.serialize(options);
        }
        return {
            events: [
                {
                    cols: this._xterm.cols,
                    rows: this._xterm.rows,
                    data: serialized
                }
            ],
            commands: this._shellIntegrationAddon.serialize()
        };
    }
    async setUnicodeVersion(version) {
        if (this._xterm.unicode.activeVersion === version) {
            return;
        }
        if (version === '11') {
            this._unicodeAddon = new (await this._getUnicode11Constructor());
            this._xterm.loadAddon(this._unicodeAddon);
        }
        else {
            this._unicodeAddon?.dispose();
            this._unicodeAddon = undefined;
        }
        this._xterm.unicode.activeVersion = version;
    }
    async _getUnicode11Constructor() {
        if (!Unicode11Addon) {
            Unicode11Addon = (await import('xterm-addon-unicode11')).Unicode11Addon;
        }
        return Unicode11Addon;
    }
    async _getSerializeConstructor() {
        if (!SerializeAddon) {
            SerializeAddon = (await import('xterm-addon-serialize')).SerializeAddon;
        }
        return SerializeAddon;
    }
}
function printTime(ms) {
    let h = 0;
    let m = 0;
    let s = 0;
    if (ms >= 1000) {
        s = Math.floor(ms / 1000);
        ms -= s * 1000;
    }
    if (s >= 60) {
        m = Math.floor(s / 60);
        s -= m * 60;
    }
    if (m >= 60) {
        h = Math.floor(m / 60);
        m -= h * 60;
    }
    const _h = h ? `${h}h` : ``;
    const _m = m ? `${m}m` : ``;
    const _s = s ? `${s}s` : ``;
    const _ms = ms ? `${ms}ms` : ``;
    return `${_h}${_m}${_s}${_ms}`;
}
