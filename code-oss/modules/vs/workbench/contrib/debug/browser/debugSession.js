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
import * as aria from 'vs/base/browser/ui/aria/aria';
import { distinct } from 'vs/base/common/arrays';
import { Queue, RunOnceScheduler } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { canceled } from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import { normalizeDriveLetter } from 'vs/base/common/labels';
import { dispose } from 'vs/base/common/lifecycle';
import { mixin } from 'vs/base/common/objects';
import * as platform from 'vs/base/common/platform';
import * as resources from 'vs/base/common/resources';
import Severity from 'vs/base/common/severity';
import { generateUuid } from 'vs/base/common/uuid';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IProductService } from 'vs/platform/product/common/productService';
import { ICustomEndpointTelemetryService, ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { RawDebugSession } from 'vs/workbench/contrib/debug/browser/rawDebugSession';
import { IDebugService, VIEWLET_ID } from 'vs/workbench/contrib/debug/common/debug';
import { ExpressionContainer, MemoryRegion, Thread } from 'vs/workbench/contrib/debug/common/debugModel';
import { Source } from 'vs/workbench/contrib/debug/common/debugSource';
import { filterExceptionsFromTelemetry } from 'vs/workbench/contrib/debug/common/debugUtils';
import { ReplModel } from 'vs/workbench/contrib/debug/common/replModel';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
let DebugSession = class DebugSession {
    id;
    _configuration;
    root;
    model;
    debugService;
    telemetryService;
    hostService;
    configurationService;
    paneCompositeService;
    workspaceContextService;
    productService;
    notificationService;
    uriIdentityService;
    instantiationService;
    customEndpointTelemetryService;
    workbenchEnvironmentService;
    _subId;
    raw; // used in tests
    initialized = false;
    _options;
    sources = new Map();
    threads = new Map();
    threadIds = [];
    cancellationMap = new Map();
    rawListeners = [];
    fetchThreadsScheduler;
    passFocusScheduler;
    lastContinuedThreadId;
    repl;
    stoppedDetails = [];
    _onDidChangeState = new Emitter();
    _onDidEndAdapter = new Emitter();
    _onDidLoadedSource = new Emitter();
    _onDidCustomEvent = new Emitter();
    _onDidProgressStart = new Emitter();
    _onDidProgressUpdate = new Emitter();
    _onDidProgressEnd = new Emitter();
    _onDidInvalidMemory = new Emitter();
    _onDidChangeREPLElements = new Emitter();
    _name;
    _onDidChangeName = new Emitter();
    constructor(id, _configuration, root, model, options, debugService, telemetryService, hostService, configurationService, paneCompositeService, workspaceContextService, productService, notificationService, lifecycleService, uriIdentityService, instantiationService, customEndpointTelemetryService, workbenchEnvironmentService) {
        this.id = id;
        this._configuration = _configuration;
        this.root = root;
        this.model = model;
        this.debugService = debugService;
        this.telemetryService = telemetryService;
        this.hostService = hostService;
        this.configurationService = configurationService;
        this.paneCompositeService = paneCompositeService;
        this.workspaceContextService = workspaceContextService;
        this.productService = productService;
        this.notificationService = notificationService;
        this.uriIdentityService = uriIdentityService;
        this.instantiationService = instantiationService;
        this.customEndpointTelemetryService = customEndpointTelemetryService;
        this.workbenchEnvironmentService = workbenchEnvironmentService;
        this._options = options || {};
        if (this.hasSeparateRepl()) {
            this.repl = new ReplModel(this.configurationService);
        }
        else {
            this.repl = this.parentSession.repl;
        }
        const toDispose = [];
        toDispose.push(this.repl.onDidChangeElements(() => this._onDidChangeREPLElements.fire()));
        if (lifecycleService) {
            toDispose.push(lifecycleService.onWillShutdown(() => {
                this.shutdown();
                dispose(toDispose);
            }));
        }
        const compoundRoot = this._options.compoundRoot;
        if (compoundRoot) {
            toDispose.push(compoundRoot.onDidSessionStop(() => this.terminate()));
        }
        this.passFocusScheduler = new RunOnceScheduler(() => {
            // If there is some session or thread that is stopped pass focus to it
            if (this.debugService.getModel().getSessions().some(s => s.state === 2 /* State.Stopped */) || this.getAllThreads().some(t => t.stopped)) {
                if (typeof this.lastContinuedThreadId === 'number') {
                    const thread = this.debugService.getViewModel().focusedThread;
                    if (thread && thread.threadId === this.lastContinuedThreadId && !thread.stopped) {
                        const toFocusThreadId = this.getStoppedDetails()?.threadId;
                        const toFocusThread = typeof toFocusThreadId === 'number' ? this.getThread(toFocusThreadId) : undefined;
                        this.debugService.focusStackFrame(undefined, toFocusThread);
                    }
                }
                else {
                    const session = this.debugService.getViewModel().focusedSession;
                    if (session && session.getId() === this.getId() && session.state !== 2 /* State.Stopped */) {
                        this.debugService.focusStackFrame(undefined);
                    }
                }
            }
        }, 800);
    }
    getId() {
        return this.id;
    }
    setSubId(subId) {
        this._subId = subId;
    }
    getMemory(memoryReference) {
        return new MemoryRegion(memoryReference, this);
    }
    get subId() {
        return this._subId;
    }
    get configuration() {
        return this._configuration.resolved;
    }
    get unresolvedConfiguration() {
        return this._configuration.unresolved;
    }
    get parentSession() {
        return this._options.parentSession;
    }
    get compact() {
        return !!this._options.compact;
    }
    get saveBeforeRestart() {
        return this._options.saveBeforeRestart ?? !this._options?.parentSession;
    }
    get compoundRoot() {
        return this._options.compoundRoot;
    }
    get suppressDebugStatusbar() {
        return this._options.suppressDebugStatusbar ?? false;
    }
    get suppressDebugToolbar() {
        return this._options.suppressDebugToolbar ?? false;
    }
    get suppressDebugView() {
        return this._options.suppressDebugView ?? false;
    }
    get autoExpandLazyVariables() {
        // This tiny helper avoids converting the entire debug model to use service injection
        return this.configurationService.getValue('debug').autoExpandLazyVariables;
    }
    setConfiguration(configuration) {
        this._configuration = configuration;
    }
    getLabel() {
        const includeRoot = this.workspaceContextService.getWorkspace().folders.length > 1;
        return includeRoot && this.root ? `${this.name} (${resources.basenameOrAuthority(this.root.uri)})` : this.name;
    }
    setName(name) {
        this._name = name;
        this._onDidChangeName.fire(name);
    }
    get name() {
        return this._name || this.configuration.name;
    }
    get state() {
        if (!this.initialized) {
            return 1 /* State.Initializing */;
        }
        if (!this.raw) {
            return 0 /* State.Inactive */;
        }
        const focusedThread = this.debugService.getViewModel().focusedThread;
        if (focusedThread && focusedThread.session === this) {
            return focusedThread.stopped ? 2 /* State.Stopped */ : 3 /* State.Running */;
        }
        if (this.getAllThreads().some(t => t.stopped)) {
            return 2 /* State.Stopped */;
        }
        return 3 /* State.Running */;
    }
    get capabilities() {
        return this.raw ? this.raw.capabilities : Object.create(null);
    }
    //---- events
    get onDidChangeState() {
        return this._onDidChangeState.event;
    }
    get onDidEndAdapter() {
        return this._onDidEndAdapter.event;
    }
    get onDidChangeReplElements() {
        return this._onDidChangeREPLElements.event;
    }
    get onDidChangeName() {
        return this._onDidChangeName.event;
    }
    //---- DAP events
    get onDidCustomEvent() {
        return this._onDidCustomEvent.event;
    }
    get onDidLoadedSource() {
        return this._onDidLoadedSource.event;
    }
    get onDidProgressStart() {
        return this._onDidProgressStart.event;
    }
    get onDidProgressUpdate() {
        return this._onDidProgressUpdate.event;
    }
    get onDidProgressEnd() {
        return this._onDidProgressEnd.event;
    }
    get onDidInvalidateMemory() {
        return this._onDidInvalidMemory.event;
    }
    //---- DAP requests
    /**
     * create and initialize a new debug adapter for this session
     */
    async initialize(dbgr) {
        if (this.raw) {
            // if there was already a connection make sure to remove old listeners
            await this.shutdown();
        }
        try {
            const debugAdapter = await dbgr.createDebugAdapter(this);
            this.raw = this.instantiationService.createInstance(RawDebugSession, debugAdapter, dbgr, this.id, this.configuration.name);
            await this.raw.start();
            this.registerListeners();
            await this.raw.initialize({
                clientID: 'vscode',
                clientName: this.productService.nameLong,
                adapterID: this.configuration.type,
                pathFormat: 'path',
                linesStartAt1: true,
                columnsStartAt1: true,
                supportsVariableType: true,
                supportsVariablePaging: true,
                supportsRunInTerminalRequest: true,
                locale: platform.locale,
                supportsProgressReporting: true,
                supportsInvalidatedEvent: true,
                supportsMemoryReferences: true,
                supportsArgsCanBeInterpretedByShell: true,
                supportsMemoryEvent: true
            });
            this.initialized = true;
            this._onDidChangeState.fire();
            this.debugService.setExceptionBreakpoints((this.raw && this.raw.capabilities.exceptionBreakpointFilters) || []);
        }
        catch (err) {
            this.initialized = true;
            this._onDidChangeState.fire();
            await this.shutdown();
            throw err;
        }
    }
    /**
     * launch or attach to the debuggee
     */
    async launchOrAttach(config) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'launch or attach'));
        }
        if (this.parentSession && this.parentSession.state === 0 /* State.Inactive */) {
            throw canceled();
        }
        // __sessionID only used for EH debugging (but we add it always for now...)
        config.__sessionId = this.getId();
        try {
            await this.raw.launchOrAttach(config);
        }
        catch (err) {
            this.shutdown();
            throw err;
        }
    }
    /**
     * terminate the current debug adapter session
     */
    async terminate(restart = false) {
        if (!this.raw) {
            // Adapter went down but it did not send a 'terminated' event, simulate like the event has been sent
            this.onDidExitAdapter();
        }
        this.cancelAllRequests();
        if (this._options.lifecycleManagedByParent && this.parentSession) {
            await this.parentSession.terminate(restart);
        }
        else if (this.raw) {
            if (this.raw.capabilities.supportsTerminateRequest && this._configuration.resolved.request === 'launch') {
                await this.raw.terminate(restart);
            }
            else {
                await this.raw.disconnect({ restart, terminateDebuggee: true });
            }
        }
        if (!restart) {
            this._options.compoundRoot?.sessionStopped();
        }
    }
    /**
     * end the current debug adapter session
     */
    async disconnect(restart = false, suspend = false) {
        if (!this.raw) {
            // Adapter went down but it did not send a 'terminated' event, simulate like the event has been sent
            this.onDidExitAdapter();
        }
        this.cancelAllRequests();
        if (this._options.lifecycleManagedByParent && this.parentSession) {
            await this.parentSession.disconnect(restart, suspend);
        }
        else if (this.raw) {
            // TODO terminateDebuggee should be undefined by default?
            await this.raw.disconnect({ restart, terminateDebuggee: false, suspendDebuggee: suspend });
        }
        if (!restart) {
            this._options.compoundRoot?.sessionStopped();
        }
    }
    /**
     * restart debug adapter session
     */
    async restart() {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'restart'));
        }
        this.cancelAllRequests();
        if (this._options.lifecycleManagedByParent && this.parentSession) {
            await this.parentSession.restart();
        }
        else {
            await this.raw.restart({ arguments: this.configuration });
        }
    }
    async sendBreakpoints(modelUri, breakpointsToSend, sourceModified) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'breakpoints'));
        }
        if (!this.raw.readyForBreakpoints) {
            return Promise.resolve(undefined);
        }
        const rawSource = this.getRawSource(modelUri);
        if (breakpointsToSend.length && !rawSource.adapterData) {
            rawSource.adapterData = breakpointsToSend[0].adapterData;
        }
        // Normalize all drive letters going out from vscode to debug adapters so we are consistent with our resolving #43959
        if (rawSource.path) {
            rawSource.path = normalizeDriveLetter(rawSource.path);
        }
        const response = await this.raw.setBreakpoints({
            source: rawSource,
            lines: breakpointsToSend.map(bp => bp.sessionAgnosticData.lineNumber),
            breakpoints: breakpointsToSend.map(bp => ({ line: bp.sessionAgnosticData.lineNumber, column: bp.sessionAgnosticData.column, condition: bp.condition, hitCondition: bp.hitCondition, logMessage: bp.logMessage })),
            sourceModified
        });
        if (response && response.body) {
            const data = new Map();
            for (let i = 0; i < breakpointsToSend.length; i++) {
                data.set(breakpointsToSend[i].getId(), response.body.breakpoints[i]);
            }
            this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
        }
    }
    async sendFunctionBreakpoints(fbpts) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'function breakpoints'));
        }
        if (this.raw.readyForBreakpoints) {
            const response = await this.raw.setFunctionBreakpoints({ breakpoints: fbpts });
            if (response && response.body) {
                const data = new Map();
                for (let i = 0; i < fbpts.length; i++) {
                    data.set(fbpts[i].getId(), response.body.breakpoints[i]);
                }
                this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
            }
        }
    }
    async sendExceptionBreakpoints(exbpts) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'exception breakpoints'));
        }
        if (this.raw.readyForBreakpoints) {
            const args = this.capabilities.supportsExceptionFilterOptions ? {
                filters: [],
                filterOptions: exbpts.map(exb => {
                    if (exb.condition) {
                        return { filterId: exb.filter, condition: exb.condition };
                    }
                    return { filterId: exb.filter };
                })
            } : { filters: exbpts.map(exb => exb.filter) };
            const response = await this.raw.setExceptionBreakpoints(args);
            if (response && response.body && response.body.breakpoints) {
                const data = new Map();
                for (let i = 0; i < exbpts.length; i++) {
                    data.set(exbpts[i].getId(), response.body.breakpoints[i]);
                }
                this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
            }
        }
    }
    async dataBreakpointInfo(name, variablesReference) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'data breakpoints info'));
        }
        if (!this.raw.readyForBreakpoints) {
            throw new Error(localize('sessionNotReadyForBreakpoints', "Session is not ready for breakpoints"));
        }
        const response = await this.raw.dataBreakpointInfo({ name, variablesReference });
        return response?.body;
    }
    async sendDataBreakpoints(dataBreakpoints) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'data breakpoints'));
        }
        if (this.raw.readyForBreakpoints) {
            const response = await this.raw.setDataBreakpoints({ breakpoints: dataBreakpoints });
            if (response && response.body) {
                const data = new Map();
                for (let i = 0; i < dataBreakpoints.length; i++) {
                    data.set(dataBreakpoints[i].getId(), response.body.breakpoints[i]);
                }
                this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
            }
        }
    }
    async sendInstructionBreakpoints(instructionBreakpoints) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'instruction breakpoints'));
        }
        if (this.raw.readyForBreakpoints) {
            const response = await this.raw.setInstructionBreakpoints({ breakpoints: instructionBreakpoints });
            if (response && response.body) {
                const data = new Map();
                for (let i = 0; i < instructionBreakpoints.length; i++) {
                    data.set(instructionBreakpoints[i].getId(), response.body.breakpoints[i]);
                }
                this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
            }
        }
    }
    async breakpointsLocations(uri, lineNumber) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'breakpoints locations'));
        }
        const source = this.getRawSource(uri);
        const response = await this.raw.breakpointLocations({ source, line: lineNumber });
        if (!response || !response.body || !response.body.breakpoints) {
            return [];
        }
        const positions = response.body.breakpoints.map(bp => ({ lineNumber: bp.line, column: bp.column || 1 }));
        return distinct(positions, p => `${p.lineNumber}:${p.column}`);
    }
    getDebugProtocolBreakpoint(breakpointId) {
        return this.model.getDebugProtocolBreakpoint(breakpointId, this.getId());
    }
    customRequest(request, args) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", request));
        }
        return this.raw.custom(request, args);
    }
    stackTrace(threadId, startFrame, levels, token) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'stackTrace'));
        }
        const sessionToken = this.getNewCancellationToken(threadId, token);
        return this.raw.stackTrace({ threadId, startFrame, levels }, sessionToken);
    }
    async exceptionInfo(threadId) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'exceptionInfo'));
        }
        const response = await this.raw.exceptionInfo({ threadId });
        if (response) {
            return {
                id: response.body.exceptionId,
                description: response.body.description,
                breakMode: response.body.breakMode,
                details: response.body.details
            };
        }
        return undefined;
    }
    scopes(frameId, threadId) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'scopes'));
        }
        const token = this.getNewCancellationToken(threadId);
        return this.raw.scopes({ frameId }, token);
    }
    variables(variablesReference, threadId, filter, start, count) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'variables'));
        }
        const token = threadId ? this.getNewCancellationToken(threadId) : undefined;
        return this.raw.variables({ variablesReference, filter, start, count }, token);
    }
    evaluate(expression, frameId, context) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'evaluate'));
        }
        return this.raw.evaluate({ expression, frameId, context });
    }
    async restartFrame(frameId, threadId) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'restartFrame'));
        }
        await this.raw.restartFrame({ frameId }, threadId);
    }
    setLastSteppingGranularity(threadId, granularity) {
        const thread = this.getThread(threadId);
        if (thread) {
            thread.lastSteppingGranularity = granularity;
        }
    }
    async next(threadId, granularity) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'next'));
        }
        this.setLastSteppingGranularity(threadId, granularity);
        await this.raw.next({ threadId, granularity });
    }
    async stepIn(threadId, targetId, granularity) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepIn'));
        }
        this.setLastSteppingGranularity(threadId, granularity);
        await this.raw.stepIn({ threadId, targetId, granularity });
    }
    async stepOut(threadId, granularity) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepOut'));
        }
        this.setLastSteppingGranularity(threadId, granularity);
        await this.raw.stepOut({ threadId, granularity });
    }
    async stepBack(threadId, granularity) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepBack'));
        }
        this.setLastSteppingGranularity(threadId, granularity);
        await this.raw.stepBack({ threadId, granularity });
    }
    async continue(threadId) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'continue'));
        }
        await this.raw.continue({ threadId });
    }
    async reverseContinue(threadId) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'reverse continue'));
        }
        await this.raw.reverseContinue({ threadId });
    }
    async pause(threadId) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'pause'));
        }
        await this.raw.pause({ threadId });
    }
    async terminateThreads(threadIds) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'terminateThreads'));
        }
        await this.raw.terminateThreads({ threadIds });
    }
    setVariable(variablesReference, name, value) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'setVariable'));
        }
        return this.raw.setVariable({ variablesReference, name, value });
    }
    setExpression(frameId, expression, value) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'setExpression'));
        }
        return this.raw.setExpression({ expression, value, frameId });
    }
    gotoTargets(source, line, column) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'gotoTargets'));
        }
        return this.raw.gotoTargets({ source, line, column });
    }
    goto(threadId, targetId) {
        if (!this.raw) {
            throw new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'goto'));
        }
        return this.raw.goto({ threadId, targetId });
    }
    loadSource(resource) {
        if (!this.raw) {
            return Promise.reject(new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'loadSource')));
        }
        const source = this.getSourceForUri(resource);
        let rawSource;
        if (source) {
            rawSource = source.raw;
        }
        else {
            // create a Source
            const data = Source.getEncodedDebugData(resource);
            rawSource = { path: data.path, sourceReference: data.sourceReference };
        }
        return this.raw.source({ sourceReference: rawSource.sourceReference || 0, source: rawSource });
    }
    async getLoadedSources() {
        if (!this.raw) {
            return Promise.reject(new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'getLoadedSources')));
        }
        const response = await this.raw.loadedSources({});
        if (response && response.body && response.body.sources) {
            return response.body.sources.map(src => this.getSource(src));
        }
        else {
            return [];
        }
    }
    async completions(frameId, threadId, text, position, overwriteBefore, token) {
        if (!this.raw) {
            return Promise.reject(new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'completions')));
        }
        const sessionCancelationToken = this.getNewCancellationToken(threadId, token);
        return this.raw.completions({
            frameId,
            text,
            column: position.column,
            line: position.lineNumber,
        }, sessionCancelationToken);
    }
    async stepInTargets(frameId) {
        if (!this.raw) {
            return Promise.reject(new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'stepInTargets')));
        }
        const response = await this.raw.stepInTargets({ frameId });
        return response?.body.targets;
    }
    async cancel(progressId) {
        if (!this.raw) {
            return Promise.reject(new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'cancel')));
        }
        return this.raw.cancel({ progressId });
    }
    async disassemble(memoryReference, offset, instructionOffset, instructionCount) {
        if (!this.raw) {
            return Promise.reject(new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'disassemble')));
        }
        const response = await this.raw.disassemble({ memoryReference, offset, instructionOffset, instructionCount, resolveSymbols: true });
        return response?.body?.instructions;
    }
    readMemory(memoryReference, offset, count) {
        if (!this.raw) {
            return Promise.reject(new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'readMemory')));
        }
        return this.raw.readMemory({ count, memoryReference, offset });
    }
    writeMemory(memoryReference, offset, data, allowPartial) {
        if (!this.raw) {
            return Promise.reject(new Error(localize('noDebugAdapter', "No debugger available, can not send '{0}'", 'disassemble')));
        }
        return this.raw.writeMemory({ memoryReference, offset, allowPartial, data });
    }
    //---- threads
    getThread(threadId) {
        return this.threads.get(threadId);
    }
    getAllThreads() {
        const result = [];
        this.threadIds.forEach((threadId) => {
            const thread = this.threads.get(threadId);
            if (thread) {
                result.push(thread);
            }
        });
        return result;
    }
    clearThreads(removeThreads, reference = undefined) {
        if (reference !== undefined && reference !== null) {
            const thread = this.threads.get(reference);
            if (thread) {
                thread.clearCallStack();
                thread.stoppedDetails = undefined;
                thread.stopped = false;
                if (removeThreads) {
                    this.threads.delete(reference);
                }
            }
        }
        else {
            this.threads.forEach(thread => {
                thread.clearCallStack();
                thread.stoppedDetails = undefined;
                thread.stopped = false;
            });
            if (removeThreads) {
                this.threads.clear();
                this.threadIds = [];
                ExpressionContainer.allValues.clear();
            }
        }
    }
    getStoppedDetails() {
        return this.stoppedDetails.length >= 1 ? this.stoppedDetails[0] : undefined;
    }
    rawUpdate(data) {
        this.threadIds = [];
        data.threads.forEach(thread => {
            this.threadIds.push(thread.id);
            if (!this.threads.has(thread.id)) {
                // A new thread came in, initialize it.
                this.threads.set(thread.id, new Thread(this, thread.name, thread.id));
            }
            else if (thread.name) {
                // Just the thread name got updated #18244
                const oldThread = this.threads.get(thread.id);
                if (oldThread) {
                    oldThread.name = thread.name;
                }
            }
        });
        this.threads.forEach(t => {
            // Remove all old threads which are no longer part of the update #75980
            if (this.threadIds.indexOf(t.threadId) === -1) {
                this.threads.delete(t.threadId);
            }
        });
        const stoppedDetails = data.stoppedDetails;
        if (stoppedDetails) {
            // Set the availability of the threads' callstacks depending on
            // whether the thread is stopped or not
            if (stoppedDetails.allThreadsStopped) {
                this.threads.forEach(thread => {
                    thread.stoppedDetails = thread.threadId === stoppedDetails.threadId ? stoppedDetails : { reason: thread.stoppedDetails?.reason };
                    thread.stopped = true;
                    thread.clearCallStack();
                });
            }
            else {
                const thread = typeof stoppedDetails.threadId === 'number' ? this.threads.get(stoppedDetails.threadId) : undefined;
                if (thread) {
                    // One thread is stopped, only update that thread.
                    thread.stoppedDetails = stoppedDetails;
                    thread.clearCallStack();
                    thread.stopped = true;
                }
            }
        }
    }
    async fetchThreads(stoppedDetails) {
        if (this.raw) {
            const response = await this.raw.threads();
            if (response && response.body && response.body.threads) {
                this.model.rawUpdate({
                    sessionId: this.getId(),
                    threads: response.body.threads,
                    stoppedDetails
                });
            }
        }
    }
    initializeForTest(raw) {
        this.raw = raw;
        this.registerListeners();
    }
    //---- private
    registerListeners() {
        if (!this.raw) {
            return;
        }
        this.rawListeners.push(this.raw.onDidInitialize(async () => {
            aria.status(localize('debuggingStarted', "Debugging started."));
            const sendConfigurationDone = async () => {
                if (this.raw && this.raw.capabilities.supportsConfigurationDoneRequest) {
                    try {
                        await this.raw.configurationDone();
                    }
                    catch (e) {
                        // Disconnect the debug session on configuration done error #10596
                        this.notificationService.error(e);
                        this.raw?.disconnect({});
                    }
                }
                return undefined;
            };
            // Send all breakpoints
            try {
                await this.debugService.sendAllBreakpoints(this);
            }
            finally {
                await sendConfigurationDone();
                await this.fetchThreads();
            }
        }));
        this.rawListeners.push(this.raw.onDidStop(async (event) => {
            this.passFocusScheduler.cancel();
            this.stoppedDetails.push(event.body);
            await this.fetchThreads(event.body);
            // If the focus for the current session is on a non-existent thread, clear the focus.
            const focusedThread = this.debugService.getViewModel().focusedThread;
            const focusedThreadDoesNotExist = focusedThread !== undefined && focusedThread.session === this && !this.threads.has(focusedThread.threadId);
            if (focusedThreadDoesNotExist) {
                this.debugService.focusStackFrame(undefined, undefined);
            }
            const thread = typeof event.body.threadId === 'number' ? this.getThread(event.body.threadId) : undefined;
            if (thread) {
                // Call fetch call stack twice, the first only return the top stack frame.
                // Second retrieves the rest of the call stack. For performance reasons #25605
                const promises = this.model.refreshTopOfCallstack(thread);
                const focus = async () => {
                    if (focusedThreadDoesNotExist || (!event.body.preserveFocusHint && thread.getCallStack().length)) {
                        const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                        if (!focusedStackFrame || focusedStackFrame.thread.session === this) {
                            // Only take focus if nothing is focused, or if the focus is already on the current session
                            const preserveFocus = !this.configurationService.getValue('debug').focusEditorOnBreak;
                            await this.debugService.focusStackFrame(undefined, thread, undefined, { preserveFocus });
                        }
                        if (thread.stoppedDetails) {
                            if (thread.stoppedDetails.reason === 'breakpoint' && this.configurationService.getValue('debug').openDebug === 'openOnDebugBreak' && !this.suppressDebugView) {
                                await this.paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
                            }
                            if (this.configurationService.getValue('debug').focusWindowOnBreak && !this.workbenchEnvironmentService.extensionTestsLocationURI) {
                                await this.hostService.focus({ force: true /* Application may not be active */ });
                            }
                        }
                    }
                };
                await promises.topCallStack;
                focus();
                await promises.wholeCallStack;
                const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
                if (!focusedStackFrame || !focusedStackFrame.source || focusedStackFrame.source.presentationHint === 'deemphasize' || focusedStackFrame.presentationHint === 'deemphasize') {
                    // The top stack frame can be deemphesized so try to focus again #68616
                    focus();
                }
            }
            this._onDidChangeState.fire();
        }));
        this.rawListeners.push(this.raw.onDidThread(event => {
            if (event.body.reason === 'started') {
                // debounce to reduce threadsRequest frequency and improve performance
                if (!this.fetchThreadsScheduler) {
                    this.fetchThreadsScheduler = new RunOnceScheduler(() => {
                        this.fetchThreads();
                    }, 100);
                    this.rawListeners.push(this.fetchThreadsScheduler);
                }
                if (!this.fetchThreadsScheduler.isScheduled()) {
                    this.fetchThreadsScheduler.schedule();
                }
            }
            else if (event.body.reason === 'exited') {
                this.model.clearThreads(this.getId(), true, event.body.threadId);
                const viewModel = this.debugService.getViewModel();
                const focusedThread = viewModel.focusedThread;
                this.passFocusScheduler.cancel();
                if (focusedThread && event.body.threadId === focusedThread.threadId) {
                    // De-focus the thread in case it was focused
                    this.debugService.focusStackFrame(undefined, undefined, viewModel.focusedSession, { explicit: false });
                }
            }
        }));
        this.rawListeners.push(this.raw.onDidTerminateDebugee(async (event) => {
            aria.status(localize('debuggingStopped', "Debugging stopped."));
            if (event.body && event.body.restart) {
                await this.debugService.restartSession(this, event.body.restart);
            }
            else if (this.raw) {
                await this.raw.disconnect({ terminateDebuggee: false });
            }
        }));
        this.rawListeners.push(this.raw.onDidContinued(event => {
            const threadId = event.body.allThreadsContinued !== false ? undefined : event.body.threadId;
            if (typeof threadId === 'number') {
                this.stoppedDetails = this.stoppedDetails.filter(sd => sd.threadId !== threadId);
                const tokens = this.cancellationMap.get(threadId);
                this.cancellationMap.delete(threadId);
                tokens?.forEach(t => t.cancel());
            }
            else {
                this.stoppedDetails = [];
                this.cancelAllRequests();
            }
            this.lastContinuedThreadId = threadId;
            // We need to pass focus to other sessions / threads with a timeout in case a quick stop event occurs #130321
            this.passFocusScheduler.schedule();
            this.model.clearThreads(this.getId(), false, threadId);
            this._onDidChangeState.fire();
        }));
        const outputQueue = new Queue();
        this.rawListeners.push(this.raw.onDidOutput(async (event) => {
            // When a variables event is received, execute immediately to obtain the variables value #126967
            if (event.body.variablesReference) {
                const source = event.body.source && event.body.line ? {
                    lineNumber: event.body.line,
                    column: event.body.column ? event.body.column : 1,
                    source: this.getSource(event.body.source)
                } : undefined;
                const container = new ExpressionContainer(this, undefined, event.body.variablesReference, generateUuid());
                const children = container.getChildren();
                // we should put appendToRepl into queue to make sure the logs to be displayed in correct order
                // see https://github.com/microsoft/vscode/issues/126967#issuecomment-874954269
                outputQueue.queue(async () => {
                    const resolved = await children;
                    resolved.forEach((child) => {
                        // Since we can not display multiple trees in a row, we are displaying these variables one after the other (ignoring their names)
                        child.name = null;
                        this.appendToRepl(child, Severity.Info, event.body.category === 'important', source);
                    });
                });
                return;
            }
            outputQueue.queue(async () => {
                if (!event.body || !this.raw) {
                    return;
                }
                const outputSeverity = event.body.category === 'stderr' ? Severity.Error : event.body.category === 'console' ? Severity.Warning : Severity.Info;
                if (event.body.category === 'telemetry') {
                    // only log telemetry events from debug adapter if the debug extension provided the telemetry key
                    // and the user opted in telemetry
                    const telemetryEndpoint = this.raw.dbgr.getCustomTelemetryEndpoint();
                    if (telemetryEndpoint && this.telemetryService.telemetryLevel.value !== 0 /* TelemetryLevel.NONE */) {
                        // __GDPR__TODO__ We're sending events in the name of the debug extension and we can not ensure that those are declared correctly.
                        let data = event.body.data;
                        if (!telemetryEndpoint.sendErrorTelemetry && event.body.data) {
                            data = filterExceptionsFromTelemetry(event.body.data);
                        }
                        this.customEndpointTelemetryService.publicLog(telemetryEndpoint, event.body.output, data);
                    }
                    return;
                }
                // Make sure to append output in the correct order by properly waiting on preivous promises #33822
                const source = event.body.source && event.body.line ? {
                    lineNumber: event.body.line,
                    column: event.body.column ? event.body.column : 1,
                    source: this.getSource(event.body.source)
                } : undefined;
                if (event.body.group === 'start' || event.body.group === 'startCollapsed') {
                    const expanded = event.body.group === 'start';
                    this.repl.startGroup(event.body.output || '', expanded, source);
                    return;
                }
                if (event.body.group === 'end') {
                    this.repl.endGroup();
                    if (!event.body.output) {
                        // Only return if the end event does not have additional output in it
                        return;
                    }
                }
                if (typeof event.body.output === 'string') {
                    this.appendToRepl(event.body.output, outputSeverity, event.body.category === 'important', source);
                }
            });
        }));
        this.rawListeners.push(this.raw.onDidBreakpoint(event => {
            const id = event.body && event.body.breakpoint ? event.body.breakpoint.id : undefined;
            const breakpoint = this.model.getBreakpoints().find(bp => bp.getIdFromAdapter(this.getId()) === id);
            const functionBreakpoint = this.model.getFunctionBreakpoints().find(bp => bp.getIdFromAdapter(this.getId()) === id);
            const dataBreakpoint = this.model.getDataBreakpoints().find(dbp => dbp.getIdFromAdapter(this.getId()) === id);
            const exceptionBreakpoint = this.model.getExceptionBreakpoints().find(excbp => excbp.getIdFromAdapter(this.getId()) === id);
            if (event.body.reason === 'new' && event.body.breakpoint.source && event.body.breakpoint.line) {
                const source = this.getSource(event.body.breakpoint.source);
                const bps = this.model.addBreakpoints(source.uri, [{
                        column: event.body.breakpoint.column,
                        enabled: true,
                        lineNumber: event.body.breakpoint.line,
                    }], false);
                if (bps.length === 1) {
                    const data = new Map([[bps[0].getId(), event.body.breakpoint]]);
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
            if (event.body.reason === 'removed') {
                if (breakpoint) {
                    this.model.removeBreakpoints([breakpoint]);
                }
                if (functionBreakpoint) {
                    this.model.removeFunctionBreakpoints(functionBreakpoint.getId());
                }
                if (dataBreakpoint) {
                    this.model.removeDataBreakpoints(dataBreakpoint.getId());
                }
            }
            if (event.body.reason === 'changed') {
                if (breakpoint) {
                    if (!breakpoint.column) {
                        event.body.breakpoint.column = undefined;
                    }
                    const data = new Map([[breakpoint.getId(), event.body.breakpoint]]);
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
                if (functionBreakpoint) {
                    const data = new Map([[functionBreakpoint.getId(), event.body.breakpoint]]);
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
                if (dataBreakpoint) {
                    const data = new Map([[dataBreakpoint.getId(), event.body.breakpoint]]);
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
                if (exceptionBreakpoint) {
                    const data = new Map([[exceptionBreakpoint.getId(), event.body.breakpoint]]);
                    this.model.setBreakpointSessionData(this.getId(), this.capabilities, data);
                }
            }
        }));
        this.rawListeners.push(this.raw.onDidLoadedSource(event => {
            this._onDidLoadedSource.fire({
                reason: event.body.reason,
                source: this.getSource(event.body.source)
            });
        }));
        this.rawListeners.push(this.raw.onDidCustomEvent(event => {
            this._onDidCustomEvent.fire(event);
        }));
        this.rawListeners.push(this.raw.onDidProgressStart(event => {
            this._onDidProgressStart.fire(event);
        }));
        this.rawListeners.push(this.raw.onDidProgressUpdate(event => {
            this._onDidProgressUpdate.fire(event);
        }));
        this.rawListeners.push(this.raw.onDidProgressEnd(event => {
            this._onDidProgressEnd.fire(event);
        }));
        this.rawListeners.push(this.raw.onDidInvalidateMemory(event => {
            this._onDidInvalidMemory.fire(event);
        }));
        this.rawListeners.push(this.raw.onDidInvalidated(async (event) => {
            if (!(event.body.areas && event.body.areas.length === 1 && (event.body.areas[0] === 'variables' || event.body.areas[0] === 'watch'))) {
                // If invalidated event only requires to update variables or watch, do that, otherwise refatch threads https://github.com/microsoft/vscode/issues/106745
                this.cancelAllRequests();
                this.model.clearThreads(this.getId(), true);
                await this.fetchThreads(this.getStoppedDetails());
            }
            const viewModel = this.debugService.getViewModel();
            if (viewModel.focusedSession === this) {
                viewModel.updateViews();
            }
        }));
        this.rawListeners.push(this.raw.onDidExitAdapter(event => this.onDidExitAdapter(event)));
    }
    onDidExitAdapter(event) {
        this.initialized = true;
        this.model.setBreakpointSessionData(this.getId(), this.capabilities, undefined);
        this.shutdown();
        this._onDidEndAdapter.fire(event);
    }
    // Disconnects and clears state. Session can be initialized again for a new connection.
    shutdown() {
        dispose(this.rawListeners);
        if (this.raw) {
            // Send out disconnect and immediatly dispose (do not wait for response) #127418
            this.raw.disconnect({});
            this.raw.dispose();
            this.raw = undefined;
        }
        this.fetchThreadsScheduler?.dispose();
        this.fetchThreadsScheduler = undefined;
        this.passFocusScheduler.cancel();
        this.passFocusScheduler.dispose();
        this.model.clearThreads(this.getId(), true);
        this._onDidChangeState.fire();
    }
    //---- sources
    getSourceForUri(uri) {
        return this.sources.get(this.uriIdentityService.asCanonicalUri(uri).toString());
    }
    getSource(raw) {
        let source = new Source(raw, this.getId(), this.uriIdentityService);
        const uriKey = source.uri.toString();
        const found = this.sources.get(uriKey);
        if (found) {
            source = found;
            // merge attributes of new into existing
            source.raw = mixin(source.raw, raw);
            if (source.raw && raw) {
                // Always take the latest presentation hint from adapter #42139
                source.raw.presentationHint = raw.presentationHint;
            }
        }
        else {
            this.sources.set(uriKey, source);
        }
        return source;
    }
    getRawSource(uri) {
        const source = this.getSourceForUri(uri);
        if (source) {
            return source.raw;
        }
        else {
            const data = Source.getEncodedDebugData(uri);
            return { name: data.name, path: data.path, sourceReference: data.sourceReference };
        }
    }
    getNewCancellationToken(threadId, token) {
        const tokenSource = new CancellationTokenSource(token);
        const tokens = this.cancellationMap.get(threadId) || [];
        tokens.push(tokenSource);
        this.cancellationMap.set(threadId, tokens);
        return tokenSource.token;
    }
    cancelAllRequests() {
        this.cancellationMap.forEach(tokens => tokens.forEach(t => t.cancel()));
        this.cancellationMap.clear();
    }
    // REPL
    getReplElements() {
        return this.repl.getReplElements();
    }
    hasSeparateRepl() {
        return !this.parentSession || this._options.repl !== 'mergeWithParent';
    }
    removeReplExpressions() {
        this.repl.removeReplExpressions();
    }
    async addReplExpression(stackFrame, name) {
        await this.repl.addReplExpression(this, stackFrame, name);
        // Evaluate all watch expressions and fetch variables again since repl evaluation might have changed some.
        this.debugService.getViewModel().updateViews();
    }
    appendToRepl(data, severity, isImportant, source) {
        this.repl.appendToRepl(this, data, severity, source);
        if (isImportant) {
            this.notificationService.notify({ message: data.toString(), severity: severity, source: this.name });
        }
    }
};
DebugSession = __decorate([
    __param(5, IDebugService),
    __param(6, ITelemetryService),
    __param(7, IHostService),
    __param(8, IConfigurationService),
    __param(9, IPaneCompositePartService),
    __param(10, IWorkspaceContextService),
    __param(11, IProductService),
    __param(12, INotificationService),
    __param(13, ILifecycleService),
    __param(14, IUriIdentityService),
    __param(15, IInstantiationService),
    __param(16, ICustomEndpointTelemetryService),
    __param(17, IWorkbenchEnvironmentService)
], DebugSession);
export { DebugSession };
