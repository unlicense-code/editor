/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const VIEWLET_ID = 'workbench.view.debug';
export const VARIABLES_VIEW_ID = 'workbench.debug.variablesView';
export const WATCH_VIEW_ID = 'workbench.debug.watchExpressionsView';
export const CALLSTACK_VIEW_ID = 'workbench.debug.callStackView';
export const LOADED_SCRIPTS_VIEW_ID = 'workbench.debug.loadedScriptsView';
export const BREAKPOINTS_VIEW_ID = 'workbench.debug.breakPointsView';
export const DISASSEMBLY_VIEW_ID = 'workbench.debug.disassemblyView';
export const DEBUG_PANEL_ID = 'workbench.panel.repl';
export const REPL_VIEW_ID = 'workbench.panel.repl.view';
export const CONTEXT_DEBUG_TYPE = new RawContextKey('debugType', undefined, { type: 'string', description: nls.localize('debugType', "Debug type of the active debug session. For example 'python'.") });
export const CONTEXT_DEBUG_CONFIGURATION_TYPE = new RawContextKey('debugConfigurationType', undefined, { type: 'string', description: nls.localize('debugConfigurationType', "Debug type of the selected launch configuration. For example 'python'.") });
export const CONTEXT_DEBUG_STATE = new RawContextKey('debugState', 'inactive', { type: 'string', description: nls.localize('debugState', "State that the focused debug session is in. One of the following: 'inactive', 'initializing', 'stopped' or 'running'.") });
export const CONTEXT_DEBUG_UX_KEY = 'debugUx';
export const CONTEXT_DEBUG_UX = new RawContextKey(CONTEXT_DEBUG_UX_KEY, 'default', { type: 'string', description: nls.localize('debugUX', "Debug UX state. When there are no debug configurations it is 'simple', otherwise 'default'. Used to decide when to show welcome views in the debug viewlet.") });
export const CONTEXT_IN_DEBUG_MODE = new RawContextKey('inDebugMode', false, { type: 'boolean', description: nls.localize('inDebugMode', "True when debugging, false otherwise.") });
export const CONTEXT_IN_DEBUG_REPL = new RawContextKey('inDebugRepl', false, { type: 'boolean', description: nls.localize('inDebugRepl', "True when focus is in the debug console, false otherwise.") });
export const CONTEXT_BREAKPOINT_WIDGET_VISIBLE = new RawContextKey('breakpointWidgetVisible', false, { type: 'boolean', description: nls.localize('breakpointWidgetVisibile', "True when breakpoint editor zone widget is visible, false otherwise.") });
export const CONTEXT_IN_BREAKPOINT_WIDGET = new RawContextKey('inBreakpointWidget', false, { type: 'boolean', description: nls.localize('inBreakpointWidget', "True when focus is in the breakpoint editor zone widget, false otherwise.") });
export const CONTEXT_BREAKPOINTS_FOCUSED = new RawContextKey('breakpointsFocused', true, { type: 'boolean', description: nls.localize('breakpointsFocused', "True when the BREAKPOINTS view is focused, false otherwise.") });
export const CONTEXT_WATCH_EXPRESSIONS_FOCUSED = new RawContextKey('watchExpressionsFocused', true, { type: 'boolean', description: nls.localize('watchExpressionsFocused', "True when the WATCH view is focused, false otherwsie.") });
export const CONTEXT_WATCH_EXPRESSIONS_EXIST = new RawContextKey('watchExpressionsExist', false, { type: 'boolean', description: nls.localize('watchExpressionsExist', "True when at least one watch expression exists, false otherwise.") });
export const CONTEXT_VARIABLES_FOCUSED = new RawContextKey('variablesFocused', true, { type: 'boolean', description: nls.localize('variablesFocused', "True when the VARIABLES views is focused, false otherwsie") });
export const CONTEXT_EXPRESSION_SELECTED = new RawContextKey('expressionSelected', false, { type: 'boolean', description: nls.localize('expressionSelected', "True when an expression input box is open in either the WATCH or the VARIABLES view, false otherwise.") });
export const CONTEXT_BREAKPOINT_INPUT_FOCUSED = new RawContextKey('breakpointInputFocused', false, { type: 'boolean', description: nls.localize('breakpointInputFocused', "True when the input box has focus in the BREAKPOINTS view.") });
export const CONTEXT_CALLSTACK_ITEM_TYPE = new RawContextKey('callStackItemType', undefined, { type: 'string', description: nls.localize('callStackItemType', "Represents the item type of the focused element in the CALL STACK view. For example: 'session', 'thread', 'stackFrame'") });
export const CONTEXT_CALLSTACK_SESSION_IS_ATTACH = new RawContextKey('callStackSessionIsAttach', false, { type: 'boolean', description: nls.localize('callStackSessionIsAttach', "True when the session in the CALL STACK view is attach, false otherwise. Used internally for inline menus in the CALL STACK view.") });
export const CONTEXT_CALLSTACK_ITEM_STOPPED = new RawContextKey('callStackItemStopped', false, { type: 'boolean', description: nls.localize('callStackItemStopped', "True when the focused item in the CALL STACK is stopped. Used internaly for inline menus in the CALL STACK view.") });
export const CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD = new RawContextKey('callStackSessionHasOneThread', false, { type: 'boolean', description: nls.localize('callStackSessionHasOneThread', "True when the focused session in the CALL STACK view has exactly one thread. Used internally for inline menus in the CALL STACK view.") });
export const CONTEXT_WATCH_ITEM_TYPE = new RawContextKey('watchItemType', undefined, { type: 'string', description: nls.localize('watchItemType', "Represents the item type of the focused element in the WATCH view. For example: 'expression', 'variable'") });
export const CONTEXT_CAN_VIEW_MEMORY = new RawContextKey('canViewMemory', undefined, { type: 'boolean', description: nls.localize('canViewMemory', "Indicates whether the item in the view has an associated memory refrence.") });
export const CONTEXT_BREAKPOINT_ITEM_TYPE = new RawContextKey('breakpointItemType', undefined, { type: 'string', description: nls.localize('breakpointItemType', "Represents the item type of the focused element in the BREAKPOINTS view. For example: 'breakpoint', 'exceptionBreakppint', 'functionBreakpoint', 'dataBreakpoint'") });
export const CONTEXT_BREAKPOINT_SUPPORTS_CONDITION = new RawContextKey('breakpointSupportsCondition', false, { type: 'boolean', description: nls.localize('breakpointSupportsCondition', "True when the focused breakpoint supports conditions.") });
export const CONTEXT_LOADED_SCRIPTS_SUPPORTED = new RawContextKey('loadedScriptsSupported', false, { type: 'boolean', description: nls.localize('loadedScriptsSupported', "True when the focused sessions supports the LOADED SCRIPTS view") });
export const CONTEXT_LOADED_SCRIPTS_ITEM_TYPE = new RawContextKey('loadedScriptsItemType', undefined, { type: 'string', description: nls.localize('loadedScriptsItemType', "Represents the item type of the focused element in the LOADED SCRIPTS view.") });
export const CONTEXT_FOCUSED_SESSION_IS_ATTACH = new RawContextKey('focusedSessionIsAttach', false, { type: 'boolean', description: nls.localize('focusedSessionIsAttach', "True when the focused session is 'attach'.") });
export const CONTEXT_STEP_BACK_SUPPORTED = new RawContextKey('stepBackSupported', false, { type: 'boolean', description: nls.localize('stepBackSupported', "True when the focused session supports 'stepBack' requests.") });
export const CONTEXT_RESTART_FRAME_SUPPORTED = new RawContextKey('restartFrameSupported', false, { type: 'boolean', description: nls.localize('restartFrameSupported', "True when the focused session supports 'restartFrame' requests.") });
export const CONTEXT_STACK_FRAME_SUPPORTS_RESTART = new RawContextKey('stackFrameSupportsRestart', false, { type: 'boolean', description: nls.localize('stackFrameSupportsRestart', "True when the focused stack frame suppots 'restartFrame'.") });
export const CONTEXT_JUMP_TO_CURSOR_SUPPORTED = new RawContextKey('jumpToCursorSupported', false, { type: 'boolean', description: nls.localize('jumpToCursorSupported', "True when the focused session supports 'jumpToCursor' request.") });
export const CONTEXT_STEP_INTO_TARGETS_SUPPORTED = new RawContextKey('stepIntoTargetsSupported', false, { type: 'boolean', description: nls.localize('stepIntoTargetsSupported', "True when the focused session supports 'stepIntoTargets' request.") });
export const CONTEXT_BREAKPOINTS_EXIST = new RawContextKey('breakpointsExist', false, { type: 'boolean', description: nls.localize('breakpointsExist', "True when at least one breakpoint exists.") });
export const CONTEXT_DEBUGGERS_AVAILABLE = new RawContextKey('debuggersAvailable', false, { type: 'boolean', description: nls.localize('debuggersAvailable', "True when there is at least one debug extensions active.") });
export const CONTEXT_DEBUG_EXTENSION_AVAILABLE = new RawContextKey('debugExtensionAvailable', true, { type: 'boolean', description: nls.localize('debugExtensionsAvailable', "True when there is at least one debug extension installed and enabled.") });
export const CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT = new RawContextKey('debugProtocolVariableMenuContext', undefined, { type: 'string', description: nls.localize('debugProtocolVariableMenuContext', "Represents the context the debug adapter sets on the focused variable in the VARIABLES view.") });
export const CONTEXT_SET_VARIABLE_SUPPORTED = new RawContextKey('debugSetVariableSupported', false, { type: 'boolean', description: nls.localize('debugSetVariableSupported', "True when the focused session supports 'setVariable' request.") });
export const CONTEXT_SET_EXPRESSION_SUPPORTED = new RawContextKey('debugSetExpressionSupported', false, { type: 'boolean', description: nls.localize('debugSetExpressionSupported', "True when the focused session supports 'setExpression' request.") });
export const CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED = new RawContextKey('breakWhenValueChangesSupported', false, { type: 'boolean', description: nls.localize('breakWhenValueChangesSupported', "True when the focused session supports to break when value changes.") });
export const CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED = new RawContextKey('breakWhenValueIsAccessedSupported', false, { type: 'boolean', description: nls.localize('breakWhenValueIsAccessedSupported', "True when the focused breakpoint supports to break when value is accessed.") });
export const CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED = new RawContextKey('breakWhenValueIsReadSupported', false, { type: 'boolean', description: nls.localize('breakWhenValueIsReadSupported', "True when the focused breakpoint supports to break when value is read.") });
export const CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED = new RawContextKey('terminateDebuggeeSupported', false, { type: 'boolean', description: nls.localize('terminateDebuggeeSupported', "True when the focused session supports the terminate debuggee capability.") });
export const CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED = new RawContextKey('suspendDebuggeeSupported', false, { type: 'boolean', description: nls.localize('suspendDebuggeeSupported', "True when the focused session supports the suspend debuggee capability.") });
export const CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT = new RawContextKey('variableEvaluateNamePresent', false, { type: 'boolean', description: nls.localize('variableEvaluateNamePresent', "True when the focused variable has an 'evalauteName' field set.") });
export const CONTEXT_VARIABLE_IS_READONLY = new RawContextKey('variableIsReadonly', false, { type: 'boolean', description: nls.localize('variableIsReadonly', "True when the focused variable is readonly.") });
export const CONTEXT_EXCEPTION_WIDGET_VISIBLE = new RawContextKey('exceptionWidgetVisible', false, { type: 'boolean', description: nls.localize('exceptionWidgetVisible', "True when the exception widget is visible.") });
export const CONTEXT_MULTI_SESSION_REPL = new RawContextKey('multiSessionRepl', false, { type: 'boolean', description: nls.localize('multiSessionRepl', "True when there is more than 1 debug console.") });
export const CONTEXT_MULTI_SESSION_DEBUG = new RawContextKey('multiSessionDebug', false, { type: 'boolean', description: nls.localize('multiSessionDebug', "True when there is more than 1 active debug session.") });
export const CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED = new RawContextKey('disassembleRequestSupported', false, { type: 'boolean', description: nls.localize('disassembleRequestSupported', "True when the focused sessions supports disassemble request.") });
export const CONTEXT_DISASSEMBLY_VIEW_FOCUS = new RawContextKey('disassemblyViewFocus', false, { type: 'boolean', description: nls.localize('disassemblyViewFocus', "True when the Disassembly View is focused.") });
export const CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST = new RawContextKey('languageSupportsDisassembleRequest', false, { type: 'boolean', description: nls.localize('languageSupportsDisassembleRequest', "True when the language in the current editor supports disassemble request.") });
export const CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE = new RawContextKey('focusedStackFrameHasInstructionReference', false, { type: 'boolean', description: nls.localize('focusedStackFrameHasInstructionReference', "True when the focused stack frame has instruction pointer reference.") });
export const debuggerDisabledMessage = (debugType) => nls.localize('debuggerDisabled', "Configured debug type '{0}' is installed but not supported in this environment.", debugType);
export const EDITOR_CONTRIBUTION_ID = 'editor.contrib.debug';
export const BREAKPOINT_EDITOR_CONTRIBUTION_ID = 'editor.contrib.breakpoint';
export const DEBUG_SCHEME = 'debug';
export const INTERNAL_CONSOLE_OPTIONS_SCHEMA = {
    enum: ['neverOpen', 'openOnSessionStart', 'openOnFirstSessionStart'],
    default: 'openOnFirstSessionStart',
    description: nls.localize('internalConsoleOptions', "Controls when the internal Debug Console should open.")
};
export var State;
(function (State) {
    State[State["Inactive"] = 0] = "Inactive";
    State[State["Initializing"] = 1] = "Initializing";
    State[State["Stopped"] = 2] = "Stopped";
    State[State["Running"] = 3] = "Running";
})(State || (State = {}));
export function getStateLabel(state) {
    switch (state) {
        case 1 /* State.Initializing */: return 'initializing';
        case 2 /* State.Stopped */: return 'stopped';
        case 3 /* State.Running */: return 'running';
        default: return 'inactive';
    }
}
export var MemoryRangeType;
(function (MemoryRangeType) {
    MemoryRangeType[MemoryRangeType["Valid"] = 0] = "Valid";
    MemoryRangeType[MemoryRangeType["Unreadable"] = 1] = "Unreadable";
    MemoryRangeType[MemoryRangeType["Error"] = 2] = "Error";
})(MemoryRangeType || (MemoryRangeType = {}));
export const DEBUG_MEMORY_SCHEME = 'vscode-debug-memory';
export var DebugConfigurationProviderTriggerKind;
(function (DebugConfigurationProviderTriggerKind) {
    /**
     *	`DebugConfigurationProvider.provideDebugConfigurations` is called to provide the initial debug configurations for a newly created launch.json.
     */
    DebugConfigurationProviderTriggerKind[DebugConfigurationProviderTriggerKind["Initial"] = 1] = "Initial";
    /**
     * `DebugConfigurationProvider.provideDebugConfigurations` is called to provide dynamically generated debug configurations when the user asks for them through the UI (e.g. via the "Select and Start Debugging" command).
     */
    DebugConfigurationProviderTriggerKind[DebugConfigurationProviderTriggerKind["Dynamic"] = 2] = "Dynamic";
})(DebugConfigurationProviderTriggerKind || (DebugConfigurationProviderTriggerKind = {}));
export var DebuggerString;
(function (DebuggerString) {
    DebuggerString["UnverifiedBreakpoints"] = "unverifiedBreakpoints";
})(DebuggerString || (DebuggerString = {}));
// Debug service interfaces
export const IDebugService = createDecorator('debugService');
// Editor interfaces
export var BreakpointWidgetContext;
(function (BreakpointWidgetContext) {
    BreakpointWidgetContext[BreakpointWidgetContext["CONDITION"] = 0] = "CONDITION";
    BreakpointWidgetContext[BreakpointWidgetContext["HIT_COUNT"] = 1] = "HIT_COUNT";
    BreakpointWidgetContext[BreakpointWidgetContext["LOG_MESSAGE"] = 2] = "LOG_MESSAGE";
})(BreakpointWidgetContext || (BreakpointWidgetContext = {}));
