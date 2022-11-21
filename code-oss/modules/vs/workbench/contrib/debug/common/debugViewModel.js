/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED, CONTEXT_EXPRESSION_SELECTED, CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE, CONTEXT_JUMP_TO_CURSOR_SUPPORTED, CONTEXT_LOADED_SCRIPTS_SUPPORTED, CONTEXT_MULTI_SESSION_DEBUG, CONTEXT_RESTART_FRAME_SUPPORTED, CONTEXT_SET_EXPRESSION_SUPPORTED, CONTEXT_SET_VARIABLE_SUPPORTED, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_STEP_INTO_TARGETS_SUPPORTED, CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED } from 'vs/workbench/contrib/debug/common/debug';
import { isSessionAttach } from 'vs/workbench/contrib/debug/common/debugUtils';
export class ViewModel {
    contextKeyService;
    firstSessionStart = true;
    _focusedStackFrame;
    _focusedSession;
    _focusedThread;
    selectedExpression;
    _onDidFocusSession = new Emitter();
    _onDidFocusStackFrame = new Emitter();
    _onDidSelectExpression = new Emitter();
    _onDidEvaluateLazyExpression = new Emitter();
    _onWillUpdateViews = new Emitter();
    expressionSelectedContextKey;
    loadedScriptsSupportedContextKey;
    stepBackSupportedContextKey;
    focusedSessionIsAttach;
    restartFrameSupportedContextKey;
    stepIntoTargetsSupported;
    jumpToCursorSupported;
    setVariableSupported;
    setExpressionSupported;
    multiSessionDebug;
    terminateDebuggeeSupported;
    suspendDebuggeeSupported;
    disassembleRequestSupported;
    focusedStackFrameHasInstructionPointerReference;
    constructor(contextKeyService) {
        this.contextKeyService = contextKeyService;
        contextKeyService.bufferChangeEvents(() => {
            this.expressionSelectedContextKey = CONTEXT_EXPRESSION_SELECTED.bindTo(contextKeyService);
            this.loadedScriptsSupportedContextKey = CONTEXT_LOADED_SCRIPTS_SUPPORTED.bindTo(contextKeyService);
            this.stepBackSupportedContextKey = CONTEXT_STEP_BACK_SUPPORTED.bindTo(contextKeyService);
            this.focusedSessionIsAttach = CONTEXT_FOCUSED_SESSION_IS_ATTACH.bindTo(contextKeyService);
            this.restartFrameSupportedContextKey = CONTEXT_RESTART_FRAME_SUPPORTED.bindTo(contextKeyService);
            this.stepIntoTargetsSupported = CONTEXT_STEP_INTO_TARGETS_SUPPORTED.bindTo(contextKeyService);
            this.jumpToCursorSupported = CONTEXT_JUMP_TO_CURSOR_SUPPORTED.bindTo(contextKeyService);
            this.setVariableSupported = CONTEXT_SET_VARIABLE_SUPPORTED.bindTo(contextKeyService);
            this.setExpressionSupported = CONTEXT_SET_EXPRESSION_SUPPORTED.bindTo(contextKeyService);
            this.multiSessionDebug = CONTEXT_MULTI_SESSION_DEBUG.bindTo(contextKeyService);
            this.terminateDebuggeeSupported = CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED.bindTo(contextKeyService);
            this.suspendDebuggeeSupported = CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED.bindTo(contextKeyService);
            this.disassembleRequestSupported = CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED.bindTo(contextKeyService);
            this.focusedStackFrameHasInstructionPointerReference = CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE.bindTo(contextKeyService);
        });
    }
    getId() {
        return 'root';
    }
    get focusedSession() {
        return this._focusedSession;
    }
    get focusedThread() {
        return this._focusedThread;
    }
    get focusedStackFrame() {
        return this._focusedStackFrame;
    }
    setFocus(stackFrame, thread, session, explicit) {
        const shouldEmitForStackFrame = this._focusedStackFrame !== stackFrame;
        const shouldEmitForSession = this._focusedSession !== session;
        this._focusedStackFrame = stackFrame;
        this._focusedThread = thread;
        this._focusedSession = session;
        this.contextKeyService.bufferChangeEvents(() => {
            this.loadedScriptsSupportedContextKey.set(session ? !!session.capabilities.supportsLoadedSourcesRequest : false);
            this.stepBackSupportedContextKey.set(session ? !!session.capabilities.supportsStepBack : false);
            this.restartFrameSupportedContextKey.set(session ? !!session.capabilities.supportsRestartFrame : false);
            this.stepIntoTargetsSupported.set(session ? !!session.capabilities.supportsStepInTargetsRequest : false);
            this.jumpToCursorSupported.set(session ? !!session.capabilities.supportsGotoTargetsRequest : false);
            this.setVariableSupported.set(session ? !!session.capabilities.supportsSetVariable : false);
            this.setExpressionSupported.set(session ? !!session.capabilities.supportsSetExpression : false);
            this.terminateDebuggeeSupported.set(session ? !!session.capabilities.supportTerminateDebuggee : false);
            this.suspendDebuggeeSupported.set(session ? !!session.capabilities.supportSuspendDebuggee : false);
            this.disassembleRequestSupported.set(!!session?.capabilities.supportsDisassembleRequest);
            this.focusedStackFrameHasInstructionPointerReference.set(!!stackFrame?.instructionPointerReference);
            const attach = !!session && isSessionAttach(session);
            this.focusedSessionIsAttach.set(attach);
        });
        if (shouldEmitForSession) {
            this._onDidFocusSession.fire(session);
        }
        if (shouldEmitForStackFrame) {
            this._onDidFocusStackFrame.fire({ stackFrame, explicit });
        }
    }
    get onDidFocusSession() {
        return this._onDidFocusSession.event;
    }
    get onDidFocusStackFrame() {
        return this._onDidFocusStackFrame.event;
    }
    getSelectedExpression() {
        return this.selectedExpression;
    }
    setSelectedExpression(expression, settingWatch) {
        this.selectedExpression = expression ? { expression, settingWatch: settingWatch } : undefined;
        this.expressionSelectedContextKey.set(!!expression);
        this._onDidSelectExpression.fire(this.selectedExpression);
    }
    get onDidSelectExpression() {
        return this._onDidSelectExpression.event;
    }
    get onDidEvaluateLazyExpression() {
        return this._onDidEvaluateLazyExpression.event;
    }
    updateViews() {
        this._onWillUpdateViews.fire();
    }
    get onWillUpdateViews() {
        return this._onWillUpdateViews.event;
    }
    isMultiSessionView() {
        return !!this.multiSessionDebug.get();
    }
    setMultiSessionView(isMultiSessionView) {
        this.multiSessionDebug.set(isMultiSessionView);
    }
    async evaluateLazyExpression(expression) {
        await expression.evaluateLazy();
        this._onDidEvaluateLazyExpression.fire(expression);
    }
}
