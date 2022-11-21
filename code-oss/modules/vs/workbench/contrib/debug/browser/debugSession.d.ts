import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import Severity from 'vs/base/common/severity';
import { URI } from 'vs/base/common/uri';
import { IPosition, Position } from 'vs/editor/common/core/position';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IProductService } from 'vs/platform/product/common/productService';
import { ICustomEndpointTelemetryService, ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { RawDebugSession } from 'vs/workbench/contrib/debug/browser/rawDebugSession';
import { AdapterEndEvent, IBreakpoint, IConfig, IDataBreakpoint, IDebugger, IDebugService, IDebugSession, IDebugSessionOptions, IExceptionBreakpoint, IExceptionInfo, IExpression, IFunctionBreakpoint, IInstructionBreakpoint, IMemoryRegion, IRawModelUpdate, IRawStoppedDetails, IReplElement, IReplElementSource, IStackFrame, IThread, LoadedSourceEvent, State } from 'vs/workbench/contrib/debug/common/debug';
import { DebugCompoundRoot } from 'vs/workbench/contrib/debug/common/debugCompoundRoot';
import { DebugModel, Thread } from 'vs/workbench/contrib/debug/common/debugModel';
import { Source } from 'vs/workbench/contrib/debug/common/debugSource';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export declare class DebugSession implements IDebugSession {
    private id;
    private _configuration;
    root: IWorkspaceFolder | undefined;
    private model;
    private readonly debugService;
    private readonly telemetryService;
    private readonly hostService;
    private readonly configurationService;
    private readonly paneCompositeService;
    private readonly workspaceContextService;
    private readonly productService;
    private readonly notificationService;
    private readonly uriIdentityService;
    private readonly instantiationService;
    private readonly customEndpointTelemetryService;
    private readonly workbenchEnvironmentService;
    private _subId;
    raw: RawDebugSession | undefined;
    private initialized;
    private _options;
    private sources;
    private threads;
    private threadIds;
    private cancellationMap;
    private rawListeners;
    private fetchThreadsScheduler;
    private passFocusScheduler;
    private lastContinuedThreadId;
    private repl;
    private stoppedDetails;
    private readonly _onDidChangeState;
    private readonly _onDidEndAdapter;
    private readonly _onDidLoadedSource;
    private readonly _onDidCustomEvent;
    private readonly _onDidProgressStart;
    private readonly _onDidProgressUpdate;
    private readonly _onDidProgressEnd;
    private readonly _onDidInvalidMemory;
    private readonly _onDidChangeREPLElements;
    private _name;
    private readonly _onDidChangeName;
    constructor(id: string, _configuration: {
        resolved: IConfig;
        unresolved: IConfig | undefined;
    }, root: IWorkspaceFolder | undefined, model: DebugModel, options: IDebugSessionOptions | undefined, debugService: IDebugService, telemetryService: ITelemetryService, hostService: IHostService, configurationService: IConfigurationService, paneCompositeService: IPaneCompositePartService, workspaceContextService: IWorkspaceContextService, productService: IProductService, notificationService: INotificationService, lifecycleService: ILifecycleService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService, customEndpointTelemetryService: ICustomEndpointTelemetryService, workbenchEnvironmentService: IWorkbenchEnvironmentService);
    getId(): string;
    setSubId(subId: string | undefined): void;
    getMemory(memoryReference: string): IMemoryRegion;
    get subId(): string | undefined;
    get configuration(): IConfig;
    get unresolvedConfiguration(): IConfig | undefined;
    get parentSession(): IDebugSession | undefined;
    get compact(): boolean;
    get saveBeforeRestart(): boolean;
    get compoundRoot(): DebugCompoundRoot | undefined;
    get suppressDebugStatusbar(): boolean;
    get suppressDebugToolbar(): boolean;
    get suppressDebugView(): boolean;
    get autoExpandLazyVariables(): boolean;
    setConfiguration(configuration: {
        resolved: IConfig;
        unresolved: IConfig | undefined;
    }): void;
    getLabel(): string;
    setName(name: string): void;
    get name(): string;
    get state(): State;
    get capabilities(): DebugProtocol.Capabilities;
    get onDidChangeState(): Event<void>;
    get onDidEndAdapter(): Event<AdapterEndEvent | undefined>;
    get onDidChangeReplElements(): Event<void>;
    get onDidChangeName(): Event<string>;
    get onDidCustomEvent(): Event<DebugProtocol.Event>;
    get onDidLoadedSource(): Event<LoadedSourceEvent>;
    get onDidProgressStart(): Event<DebugProtocol.ProgressStartEvent>;
    get onDidProgressUpdate(): Event<DebugProtocol.ProgressUpdateEvent>;
    get onDidProgressEnd(): Event<DebugProtocol.ProgressEndEvent>;
    get onDidInvalidateMemory(): Event<DebugProtocol.MemoryEvent>;
    /**
     * create and initialize a new debug adapter for this session
     */
    initialize(dbgr: IDebugger): Promise<void>;
    /**
     * launch or attach to the debuggee
     */
    launchOrAttach(config: IConfig): Promise<void>;
    /**
     * terminate the current debug adapter session
     */
    terminate(restart?: boolean): Promise<void>;
    /**
     * end the current debug adapter session
     */
    disconnect(restart?: boolean, suspend?: boolean): Promise<void>;
    /**
     * restart debug adapter session
     */
    restart(): Promise<void>;
    sendBreakpoints(modelUri: URI, breakpointsToSend: IBreakpoint[], sourceModified: boolean): Promise<void>;
    sendFunctionBreakpoints(fbpts: IFunctionBreakpoint[]): Promise<void>;
    sendExceptionBreakpoints(exbpts: IExceptionBreakpoint[]): Promise<void>;
    dataBreakpointInfo(name: string, variablesReference?: number): Promise<{
        dataId: string | null;
        description: string;
        canPersist?: boolean;
    } | undefined>;
    sendDataBreakpoints(dataBreakpoints: IDataBreakpoint[]): Promise<void>;
    sendInstructionBreakpoints(instructionBreakpoints: IInstructionBreakpoint[]): Promise<void>;
    breakpointsLocations(uri: URI, lineNumber: number): Promise<IPosition[]>;
    getDebugProtocolBreakpoint(breakpointId: string): DebugProtocol.Breakpoint | undefined;
    customRequest(request: string, args: any): Promise<DebugProtocol.Response | undefined>;
    stackTrace(threadId: number, startFrame: number, levels: number, token: CancellationToken): Promise<DebugProtocol.StackTraceResponse | undefined>;
    exceptionInfo(threadId: number): Promise<IExceptionInfo | undefined>;
    scopes(frameId: number, threadId: number): Promise<DebugProtocol.ScopesResponse | undefined>;
    variables(variablesReference: number, threadId: number | undefined, filter: 'indexed' | 'named' | undefined, start: number | undefined, count: number | undefined): Promise<DebugProtocol.VariablesResponse | undefined>;
    evaluate(expression: string, frameId: number, context?: string): Promise<DebugProtocol.EvaluateResponse | undefined>;
    restartFrame(frameId: number, threadId: number): Promise<void>;
    private setLastSteppingGranularity;
    next(threadId: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    stepIn(threadId: number, targetId?: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    stepOut(threadId: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    stepBack(threadId: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    continue(threadId: number): Promise<void>;
    reverseContinue(threadId: number): Promise<void>;
    pause(threadId: number): Promise<void>;
    terminateThreads(threadIds?: number[]): Promise<void>;
    setVariable(variablesReference: number, name: string, value: string): Promise<DebugProtocol.SetVariableResponse | undefined>;
    setExpression(frameId: number, expression: string, value: string): Promise<DebugProtocol.SetExpressionResponse | undefined>;
    gotoTargets(source: DebugProtocol.Source, line: number, column?: number): Promise<DebugProtocol.GotoTargetsResponse | undefined>;
    goto(threadId: number, targetId: number): Promise<DebugProtocol.GotoResponse | undefined>;
    loadSource(resource: URI): Promise<DebugProtocol.SourceResponse | undefined>;
    getLoadedSources(): Promise<Source[]>;
    completions(frameId: number | undefined, threadId: number, text: string, position: Position, overwriteBefore: number, token: CancellationToken): Promise<DebugProtocol.CompletionsResponse | undefined>;
    stepInTargets(frameId: number): Promise<{
        id: number;
        label: string;
    }[] | undefined>;
    cancel(progressId: string): Promise<DebugProtocol.CancelResponse | undefined>;
    disassemble(memoryReference: string, offset: number, instructionOffset: number, instructionCount: number): Promise<DebugProtocol.DisassembledInstruction[] | undefined>;
    readMemory(memoryReference: string, offset: number, count: number): Promise<DebugProtocol.ReadMemoryResponse | undefined>;
    writeMemory(memoryReference: string, offset: number, data: string, allowPartial?: boolean): Promise<DebugProtocol.WriteMemoryResponse | undefined>;
    getThread(threadId: number): Thread | undefined;
    getAllThreads(): IThread[];
    clearThreads(removeThreads: boolean, reference?: number | undefined): void;
    getStoppedDetails(): IRawStoppedDetails | undefined;
    rawUpdate(data: IRawModelUpdate): void;
    private fetchThreads;
    initializeForTest(raw: RawDebugSession): void;
    private registerListeners;
    private onDidExitAdapter;
    private shutdown;
    getSourceForUri(uri: URI): Source | undefined;
    getSource(raw?: DebugProtocol.Source): Source;
    private getRawSource;
    private getNewCancellationToken;
    private cancelAllRequests;
    getReplElements(): IReplElement[];
    hasSeparateRepl(): boolean;
    removeReplExpressions(): void;
    addReplExpression(stackFrame: IStackFrame | undefined, name: string): Promise<void>;
    appendToRepl(data: string | IExpression, severity: Severity, isImportant?: boolean, source?: IReplElementSource): void;
}
