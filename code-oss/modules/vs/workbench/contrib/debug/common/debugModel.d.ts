import { VSBuffer } from 'vs/base/common/buffer';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI, URI as uri } from 'vs/base/common/uri';
import { IRange } from 'vs/editor/common/core/range';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IEditorPane } from 'vs/workbench/common/editor';
import { IBaseBreakpoint, IBreakpoint, IBreakpointData, IBreakpointsChangeEvent, IBreakpointUpdateData, IDataBreakpoint, IDebugModel, IDebugSession, IEnablement, IExceptionBreakpoint, IExceptionInfo, IExpression, IExpressionContainer, IFunctionBreakpoint, IInstructionBreakpoint, IMemoryInvalidationEvent, IMemoryRegion, IRawModelUpdate, IRawStoppedDetails, IScope, IStackFrame, IThread, ITreeElement, MemoryRange } from 'vs/workbench/contrib/debug/common/debug';
import { Source } from 'vs/workbench/contrib/debug/common/debugSource';
import { DebugStorage } from 'vs/workbench/contrib/debug/common/debugStorage';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
export declare class ExpressionContainer implements IExpressionContainer {
    protected session: IDebugSession | undefined;
    protected readonly threadId: number | undefined;
    private _reference;
    private readonly id;
    namedVariables: number | undefined;
    indexedVariables: number | undefined;
    memoryReference: string | undefined;
    private startOfVariables;
    presentationHint: DebugProtocol.VariablePresentationHint | undefined;
    static readonly allValues: Map<string, string>;
    private static readonly BASE_CHUNK_SIZE;
    type: string | undefined;
    valueChanged: boolean;
    private _value;
    protected children?: Promise<IExpression[]>;
    constructor(session: IDebugSession | undefined, threadId: number | undefined, _reference: number | undefined, id: string, namedVariables?: number | undefined, indexedVariables?: number | undefined, memoryReference?: string | undefined, startOfVariables?: number | undefined, presentationHint?: DebugProtocol.VariablePresentationHint | undefined);
    get reference(): number | undefined;
    set reference(value: number | undefined);
    evaluateLazy(): Promise<void>;
    protected adoptLazyResponse(response: DebugProtocol.Variable): void;
    getChildren(): Promise<IExpression[]>;
    private doGetChildren;
    getId(): string;
    getSession(): IDebugSession | undefined;
    get value(): string;
    get hasChildren(): boolean;
    private fetchVariables;
    private get getChildrenInChunks();
    set value(value: string);
    toString(): string;
    evaluateExpression(expression: string, session: IDebugSession | undefined, stackFrame: IStackFrame | undefined, context: string, keepLazyVars?: boolean): Promise<boolean>;
}
export declare class Expression extends ExpressionContainer implements IExpression {
    name: string;
    static readonly DEFAULT_VALUE: string;
    available: boolean;
    constructor(name: string, id?: string);
    evaluate(session: IDebugSession | undefined, stackFrame: IStackFrame | undefined, context: string, keepLazyVars?: boolean): Promise<void>;
    toString(): string;
    setExpression(value: string, stackFrame: IStackFrame): Promise<void>;
}
export declare class Variable extends ExpressionContainer implements IExpression {
    readonly parent: IExpressionContainer;
    readonly name: string;
    evaluateName: string | undefined;
    readonly variableMenuContext: string | undefined;
    readonly available: boolean;
    errorMessage: string | undefined;
    constructor(session: IDebugSession | undefined, threadId: number | undefined, parent: IExpressionContainer, reference: number | undefined, name: string, evaluateName: string | undefined, value: string | undefined, namedVariables: number | undefined, indexedVariables: number | undefined, memoryReference: string | undefined, presentationHint: DebugProtocol.VariablePresentationHint | undefined, type?: string | undefined, variableMenuContext?: string | undefined, available?: boolean, startOfVariables?: number, idDuplicationIndex?: string);
    setVariable(value: string, stackFrame: IStackFrame): Promise<any>;
    setExpression(value: string, stackFrame: IStackFrame): Promise<void>;
    toString(): string;
    protected adoptLazyResponse(response: DebugProtocol.Variable): void;
    toDebugProtocolObject(): DebugProtocol.Variable;
}
export declare class Scope extends ExpressionContainer implements IScope {
    readonly name: string;
    expensive: boolean;
    readonly range?: IRange | undefined;
    constructor(stackFrame: IStackFrame, id: number, name: string, reference: number, expensive: boolean, namedVariables?: number, indexedVariables?: number, range?: IRange | undefined);
    toString(): string;
    toDebugProtocolObject(): DebugProtocol.Scope;
}
export declare class ErrorScope extends Scope {
    constructor(stackFrame: IStackFrame, index: number, message: string);
    toString(): string;
}
export declare class StackFrame implements IStackFrame {
    readonly thread: Thread;
    readonly frameId: number;
    readonly source: Source;
    readonly name: string;
    readonly presentationHint: string | undefined;
    readonly range: IRange;
    private readonly index;
    readonly canRestart: boolean;
    readonly instructionPointerReference?: string | undefined;
    private scopes;
    constructor(thread: Thread, frameId: number, source: Source, name: string, presentationHint: string | undefined, range: IRange, index: number, canRestart: boolean, instructionPointerReference?: string | undefined);
    getId(): string;
    getScopes(): Promise<IScope[]>;
    getMostSpecificScopes(range: IRange): Promise<IScope[]>;
    restart(): Promise<void>;
    forgetScopes(): void;
    toString(): string;
    openInEditor(editorService: IEditorService, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<IEditorPane | undefined>;
    equals(other: IStackFrame): boolean;
}
export declare class Thread implements IThread {
    readonly session: IDebugSession;
    name: string;
    readonly threadId: number;
    private callStack;
    private staleCallStack;
    private callStackCancellationTokens;
    stoppedDetails: IRawStoppedDetails | undefined;
    stopped: boolean;
    reachedEndOfCallStack: boolean;
    lastSteppingGranularity: DebugProtocol.SteppingGranularity | undefined;
    constructor(session: IDebugSession, name: string, threadId: number);
    getId(): string;
    clearCallStack(): void;
    getCallStack(): IStackFrame[];
    getStaleCallStack(): ReadonlyArray<IStackFrame>;
    getTopStackFrame(): IStackFrame | undefined;
    get stateLabel(): string;
    /**
     * Queries the debug adapter for the callstack and returns a promise
     * which completes once the call stack has been retrieved.
     * If the thread is not stopped, it returns a promise to an empty array.
     * Only fetches the first stack frame for performance reasons. Calling this method consecutive times
     * gets the remainder of the call stack.
     */
    fetchCallStack(levels?: number): Promise<void>;
    private getCallStackImpl;
    /**
     * Returns exception info promise if the exception was thrown, otherwise undefined
     */
    get exceptionInfo(): Promise<IExceptionInfo | undefined>;
    next(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    stepIn(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    stepOut(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    stepBack(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    continue(): Promise<any>;
    pause(): Promise<any>;
    terminate(): Promise<any>;
    reverseContinue(): Promise<any>;
}
/**
 * Gets a URI to a memory in the given session ID.
 */
export declare const getUriForDebugMemory: (sessionId: string, memoryReference: string, range?: {
    fromOffset: number;
    toOffset: number;
}, displayName?: string) => URI;
export declare class MemoryRegion extends Disposable implements IMemoryRegion {
    private readonly memoryReference;
    private readonly session;
    private readonly invalidateEmitter;
    /** @inheritdoc */
    readonly onDidInvalidate: Event<IMemoryInvalidationEvent>;
    /** @inheritdoc */
    readonly writable: boolean;
    constructor(memoryReference: string, session: IDebugSession);
    read(fromOffset: number, toOffset: number): Promise<MemoryRange[]>;
    write(offset: number, data: VSBuffer): Promise<number>;
    dispose(): void;
    private invalidate;
}
export declare class Enablement implements IEnablement {
    enabled: boolean;
    private readonly id;
    constructor(enabled: boolean, id: string);
    getId(): string;
}
interface IBreakpointSessionData extends DebugProtocol.Breakpoint {
    supportsConditionalBreakpoints: boolean;
    supportsHitConditionalBreakpoints: boolean;
    supportsLogPoints: boolean;
    supportsFunctionBreakpoints: boolean;
    supportsDataBreakpoints: boolean;
    supportsInstructionBreakpoints: boolean;
    sessionId: string;
}
export declare abstract class BaseBreakpoint extends Enablement implements IBaseBreakpoint {
    hitCondition: string | undefined;
    condition: string | undefined;
    logMessage: string | undefined;
    private sessionData;
    protected data: IBreakpointSessionData | undefined;
    constructor(enabled: boolean, hitCondition: string | undefined, condition: string | undefined, logMessage: string | undefined, id: string);
    setSessionData(sessionId: string, data: IBreakpointSessionData | undefined): void;
    get message(): string | undefined;
    get verified(): boolean;
    get sessionsThatVerified(): string[];
    abstract get supported(): boolean;
    getIdFromAdapter(sessionId: string): number | undefined;
    getDebugProtocolBreakpoint(sessionId: string): DebugProtocol.Breakpoint | undefined;
    toJSON(): any;
}
export declare class Breakpoint extends BaseBreakpoint implements IBreakpoint {
    private readonly _uri;
    private _lineNumber;
    private _column;
    private _adapterData;
    private readonly textFileService;
    private readonly uriIdentityService;
    constructor(_uri: uri, _lineNumber: number, _column: number | undefined, enabled: boolean, condition: string | undefined, hitCondition: string | undefined, logMessage: string | undefined, _adapterData: any, textFileService: ITextFileService, uriIdentityService: IUriIdentityService, id?: string);
    get lineNumber(): number;
    get verified(): boolean;
    get uri(): uri;
    get column(): number | undefined;
    get message(): string | undefined;
    get adapterData(): any;
    get endLineNumber(): number | undefined;
    get endColumn(): number | undefined;
    get sessionAgnosticData(): {
        lineNumber: number;
        column: number | undefined;
    };
    get supported(): boolean;
    setSessionData(sessionId: string, data: IBreakpointSessionData | undefined): void;
    toJSON(): any;
    toString(): string;
    update(data: IBreakpointUpdateData): void;
}
export declare class FunctionBreakpoint extends BaseBreakpoint implements IFunctionBreakpoint {
    name: string;
    constructor(name: string, enabled: boolean, hitCondition: string | undefined, condition: string | undefined, logMessage: string | undefined, id?: string);
    toJSON(): any;
    get supported(): boolean;
    toString(): string;
}
export declare class DataBreakpoint extends BaseBreakpoint implements IDataBreakpoint {
    readonly description: string;
    readonly dataId: string;
    readonly canPersist: boolean;
    readonly accessTypes: DebugProtocol.DataBreakpointAccessType[] | undefined;
    readonly accessType: DebugProtocol.DataBreakpointAccessType;
    constructor(description: string, dataId: string, canPersist: boolean, enabled: boolean, hitCondition: string | undefined, condition: string | undefined, logMessage: string | undefined, accessTypes: DebugProtocol.DataBreakpointAccessType[] | undefined, accessType: DebugProtocol.DataBreakpointAccessType, id?: string);
    toJSON(): any;
    get supported(): boolean;
    toString(): string;
}
export declare class ExceptionBreakpoint extends BaseBreakpoint implements IExceptionBreakpoint {
    readonly filter: string;
    readonly label: string;
    readonly supportsCondition: boolean;
    readonly description: string | undefined;
    readonly conditionDescription: string | undefined;
    constructor(filter: string, label: string, enabled: boolean, supportsCondition: boolean, condition: string | undefined, description: string | undefined, conditionDescription: string | undefined);
    toJSON(): any;
    get supported(): boolean;
    toString(): string;
}
export declare class InstructionBreakpoint extends BaseBreakpoint implements IInstructionBreakpoint {
    readonly instructionReference: string;
    readonly offset: number;
    readonly canPersist: boolean;
    constructor(instructionReference: string, offset: number, canPersist: boolean, enabled: boolean, hitCondition: string | undefined, condition: string | undefined, logMessage: string | undefined, id?: string);
    toJSON(): any;
    get supported(): boolean;
    toString(): string;
}
export declare class ThreadAndSessionIds implements ITreeElement {
    sessionId: string;
    threadId: number;
    constructor(sessionId: string, threadId: number);
    getId(): string;
}
export declare class Memory {
}
export declare class DebugModel implements IDebugModel {
    private readonly textFileService;
    private readonly uriIdentityService;
    private sessions;
    private schedulers;
    private breakpointsActivated;
    private readonly _onDidChangeBreakpoints;
    private readonly _onDidChangeCallStack;
    private readonly _onDidChangeWatchExpressions;
    private breakpoints;
    private functionBreakpoints;
    private exceptionBreakpoints;
    private dataBreakpoints;
    private watchExpressions;
    private instructionBreakpoints;
    constructor(debugStorage: DebugStorage, textFileService: ITextFileService, uriIdentityService: IUriIdentityService);
    getId(): string;
    getSession(sessionId: string | undefined, includeInactive?: boolean): IDebugSession | undefined;
    getSessions(includeInactive?: boolean): IDebugSession[];
    addSession(session: IDebugSession): void;
    get onDidChangeBreakpoints(): Event<IBreakpointsChangeEvent | undefined>;
    get onDidChangeCallStack(): Event<void>;
    get onDidChangeWatchExpressions(): Event<IExpression | undefined>;
    rawUpdate(data: IRawModelUpdate): void;
    clearThreads(id: string, removeThreads: boolean, reference?: number | undefined): void;
    /**
     * Update the call stack and notify the call stack view that changes have occurred.
     */
    fetchCallstack(thread: IThread, levels?: number): Promise<void>;
    refreshTopOfCallstack(thread: Thread): {
        topCallStack: Promise<void>;
        wholeCallStack: Promise<void>;
    };
    getBreakpoints(filter?: {
        uri?: uri;
        lineNumber?: number;
        column?: number;
        enabledOnly?: boolean;
    }): IBreakpoint[];
    getFunctionBreakpoints(): IFunctionBreakpoint[];
    getDataBreakpoints(): IDataBreakpoint[];
    getExceptionBreakpoints(): IExceptionBreakpoint[];
    getInstructionBreakpoints(): IInstructionBreakpoint[];
    setExceptionBreakpoints(data: DebugProtocol.ExceptionBreakpointsFilter[]): void;
    setExceptionBreakpointCondition(exceptionBreakpoint: IExceptionBreakpoint, condition: string | undefined): void;
    areBreakpointsActivated(): boolean;
    setBreakpointsActivated(activated: boolean): void;
    addBreakpoints(uri: uri, rawData: IBreakpointData[], fireEvent?: boolean): IBreakpoint[];
    removeBreakpoints(toRemove: IBreakpoint[]): void;
    updateBreakpoints(data: Map<string, IBreakpointUpdateData>): void;
    setBreakpointSessionData(sessionId: string, capabilites: DebugProtocol.Capabilities, data: Map<string, DebugProtocol.Breakpoint> | undefined): void;
    getDebugProtocolBreakpoint(breakpointId: string, sessionId: string): DebugProtocol.Breakpoint | undefined;
    private sortAndDeDup;
    setEnablement(element: IEnablement, enable: boolean): void;
    enableOrDisableAllBreakpoints(enable: boolean): void;
    addFunctionBreakpoint(functionName: string, id?: string): IFunctionBreakpoint;
    updateFunctionBreakpoint(id: string, update: {
        name?: string;
        hitCondition?: string;
        condition?: string;
    }): void;
    removeFunctionBreakpoints(id?: string): void;
    addDataBreakpoint(label: string, dataId: string, canPersist: boolean, accessTypes: DebugProtocol.DataBreakpointAccessType[] | undefined, accessType: DebugProtocol.DataBreakpointAccessType): void;
    removeDataBreakpoints(id?: string): void;
    addInstructionBreakpoint(address: string, offset: number, condition?: string, hitCondition?: string): void;
    removeInstructionBreakpoints(address?: string): void;
    getWatchExpressions(): Expression[];
    addWatchExpression(name?: string): IExpression;
    renameWatchExpression(id: string, newName: string): void;
    removeWatchExpressions(id?: string | null): void;
    moveWatchExpression(id: string, position: number): void;
    sourceIsNotAvailable(uri: uri): void;
}
export {};
