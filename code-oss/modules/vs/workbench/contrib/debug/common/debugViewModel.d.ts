import { Event } from 'vs/base/common/event';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IDebugSession, IExpression, IExpressionContainer, IStackFrame, IThread, IViewModel } from 'vs/workbench/contrib/debug/common/debug';
export declare class ViewModel implements IViewModel {
    private contextKeyService;
    firstSessionStart: boolean;
    private _focusedStackFrame;
    private _focusedSession;
    private _focusedThread;
    private selectedExpression;
    private readonly _onDidFocusSession;
    private readonly _onDidFocusStackFrame;
    private readonly _onDidSelectExpression;
    private readonly _onDidEvaluateLazyExpression;
    private readonly _onWillUpdateViews;
    private expressionSelectedContextKey;
    private loadedScriptsSupportedContextKey;
    private stepBackSupportedContextKey;
    private focusedSessionIsAttach;
    private restartFrameSupportedContextKey;
    private stepIntoTargetsSupported;
    private jumpToCursorSupported;
    private setVariableSupported;
    private setExpressionSupported;
    private multiSessionDebug;
    private terminateDebuggeeSupported;
    private suspendDebuggeeSupported;
    private disassembleRequestSupported;
    private focusedStackFrameHasInstructionPointerReference;
    constructor(contextKeyService: IContextKeyService);
    getId(): string;
    get focusedSession(): IDebugSession | undefined;
    get focusedThread(): IThread | undefined;
    get focusedStackFrame(): IStackFrame | undefined;
    setFocus(stackFrame: IStackFrame | undefined, thread: IThread | undefined, session: IDebugSession | undefined, explicit: boolean): void;
    get onDidFocusSession(): Event<IDebugSession | undefined>;
    get onDidFocusStackFrame(): Event<{
        stackFrame: IStackFrame | undefined;
        explicit: boolean;
    }>;
    getSelectedExpression(): {
        expression: IExpression;
        settingWatch: boolean;
    } | undefined;
    setSelectedExpression(expression: IExpression | undefined, settingWatch: boolean): void;
    get onDidSelectExpression(): Event<{
        expression: IExpression;
        settingWatch: boolean;
    } | undefined>;
    get onDidEvaluateLazyExpression(): Event<IExpressionContainer>;
    updateViews(): void;
    get onWillUpdateViews(): Event<void>;
    isMultiSessionView(): boolean;
    setMultiSessionView(isMultiSessionView: boolean): void;
    evaluateLazyExpression(expression: IExpressionContainer): Promise<void>;
}
