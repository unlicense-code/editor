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
import { distinct } from 'vs/base/common/arrays';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { Range } from 'vs/editor/common/core/range';
import { OverviewRulerLane } from 'vs/editor/common/model';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { registerColor } from 'vs/platform/theme/common/colorRegistry';
import { registerThemingParticipant, themeColorFromId, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { debugStackframe, debugStackframeFocused } from 'vs/workbench/contrib/debug/browser/debugIcons';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
export const topStackFrameColor = registerColor('editor.stackFrameHighlightBackground', { dark: '#ffff0033', light: '#ffff6673', hcDark: '#ffff0033', hcLight: '#ffff6673' }, localize('topStackFrameLineHighlight', 'Background color for the highlight of line at the top stack frame position.'));
export const focusedStackFrameColor = registerColor('editor.focusedStackFrameHighlightBackground', { dark: '#7abd7a4d', light: '#cee7ce73', hcDark: '#7abd7a4d', hcLight: '#cee7ce73' }, localize('focusedStackFrameLineHighlight', 'Background color for the highlight of line at focused stack frame position.'));
const stickiness = 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */;
// we need a separate decoration for glyph margin, since we do not want it on each line of a multi line statement.
const TOP_STACK_FRAME_MARGIN = {
    description: 'top-stack-frame-margin',
    glyphMarginClassName: ThemeIcon.asClassName(debugStackframe),
    stickiness,
    overviewRuler: {
        position: OverviewRulerLane.Full,
        color: themeColorFromId(topStackFrameColor)
    }
};
const FOCUSED_STACK_FRAME_MARGIN = {
    description: 'focused-stack-frame-margin',
    glyphMarginClassName: ThemeIcon.asClassName(debugStackframeFocused),
    stickiness,
    overviewRuler: {
        position: OverviewRulerLane.Full,
        color: themeColorFromId(focusedStackFrameColor)
    }
};
const TOP_STACK_FRAME_DECORATION = {
    description: 'top-stack-frame-decoration',
    isWholeLine: true,
    className: 'debug-top-stack-frame-line',
    stickiness
};
const FOCUSED_STACK_FRAME_DECORATION = {
    description: 'focused-stack-frame-decoration',
    isWholeLine: true,
    className: 'debug-focused-stack-frame-line',
    stickiness
};
export function createDecorationsForStackFrame(stackFrame, isFocusedSession, noCharactersBefore) {
    // only show decorations for the currently focused thread.
    const result = [];
    const columnUntilEOLRange = new Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
    const range = new Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1);
    // compute how to decorate the editor. Different decorations are used if this is a top stack frame, focused stack frame,
    // an exception or a stack frame that did not change the line number (we only decorate the columns, not the whole line).
    const topStackFrame = stackFrame.thread.getTopStackFrame();
    if (stackFrame.getId() === topStackFrame?.getId()) {
        if (isFocusedSession) {
            result.push({
                options: TOP_STACK_FRAME_MARGIN,
                range
            });
        }
        result.push({
            options: TOP_STACK_FRAME_DECORATION,
            range: columnUntilEOLRange
        });
        if (stackFrame.range.startColumn > 1) {
            result.push({
                options: {
                    description: 'top-stack-frame-inline-decoration',
                    before: {
                        content: '\uEB8B',
                        inlineClassName: noCharactersBefore ? 'debug-top-stack-frame-column start-of-line' : 'debug-top-stack-frame-column',
                        inlineClassNameAffectsLetterSpacing: true
                    },
                },
                range: columnUntilEOLRange
            });
        }
    }
    else {
        if (isFocusedSession) {
            result.push({
                options: FOCUSED_STACK_FRAME_MARGIN,
                range
            });
        }
        result.push({
            options: FOCUSED_STACK_FRAME_DECORATION,
            range: columnUntilEOLRange
        });
    }
    return result;
}
let LazyCallStackEditorContribution = class LazyCallStackEditorContribution extends Disposable {
    constructor(editor, instantiationService) {
        super();
        const listener = editor.onDidChangeModel(() => {
            if (editor.hasModel()) {
                listener.dispose();
                this._register(instantiationService.createInstance(CallStackEditorContribution, editor));
            }
        });
    }
};
LazyCallStackEditorContribution = __decorate([
    __param(1, IInstantiationService)
], LazyCallStackEditorContribution);
export { LazyCallStackEditorContribution };
let CallStackEditorContribution = class CallStackEditorContribution extends Disposable {
    editor;
    debugService;
    uriIdentityService;
    logService;
    decorations = this.editor.createDecorationsCollection();
    constructor(editor, debugService, uriIdentityService, logService) {
        super();
        this.editor = editor;
        this.debugService = debugService;
        this.uriIdentityService = uriIdentityService;
        this.logService = logService;
        const setDecorations = () => this.decorations.set(this.createCallStackDecorations());
        this._register(Event.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getModel().onDidChangeCallStack)(() => {
            setDecorations();
        }));
        this._register(this.editor.onDidChangeModel(e => {
            if (e.newModelUrl) {
                setDecorations();
            }
        }));
        setDecorations();
    }
    createCallStackDecorations() {
        const editor = this.editor;
        if (!editor.hasModel()) {
            return [];
        }
        const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
        const decorations = [];
        this.debugService.getModel().getSessions().forEach(s => {
            const isSessionFocused = s === focusedStackFrame?.thread.session;
            s.getAllThreads().forEach(t => {
                if (t.stopped) {
                    const callStack = t.getCallStack();
                    const stackFrames = [];
                    if (callStack.length > 0) {
                        // Always decorate top stack frame, and decorate focused stack frame if it is not the top stack frame
                        if (focusedStackFrame && !focusedStackFrame.equals(callStack[0])) {
                            stackFrames.push(focusedStackFrame);
                        }
                        stackFrames.push(callStack[0]);
                    }
                    stackFrames.forEach(candidateStackFrame => {
                        if (candidateStackFrame && this.uriIdentityService.extUri.isEqual(candidateStackFrame.source.uri, editor.getModel()?.uri)) {
                            if (candidateStackFrame.range.startLineNumber > editor.getModel()?.getLineCount() || candidateStackFrame.range.startLineNumber < 1) {
                                this.logService.warn(`CallStackEditorContribution: invalid stack frame line number: ${candidateStackFrame.range.startLineNumber}`);
                                return;
                            }
                            const noCharactersBefore = editor.getModel().getLineFirstNonWhitespaceColumn(candidateStackFrame.range.startLineNumber) >= candidateStackFrame.range.startColumn;
                            decorations.push(...createDecorationsForStackFrame(candidateStackFrame, isSessionFocused, noCharactersBefore));
                        }
                    });
                }
            });
        });
        // Deduplicate same decorations so colors do not stack #109045
        return distinct(decorations, d => `${d.options.className} ${d.options.glyphMarginClassName} ${d.range.startLineNumber} ${d.range.startColumn}`);
    }
    dispose() {
        super.dispose();
        this.decorations.clear();
    }
};
CallStackEditorContribution = __decorate([
    __param(1, IDebugService),
    __param(2, IUriIdentityService),
    __param(3, ILogService)
], CallStackEditorContribution);
registerThemingParticipant((theme, collector) => {
    const topStackFrame = theme.getColor(topStackFrameColor);
    if (topStackFrame) {
        collector.addRule(`.monaco-editor .view-overlays .debug-top-stack-frame-line { background: ${topStackFrame}; }`);
    }
    const focusedStackFrame = theme.getColor(focusedStackFrameColor);
    if (focusedStackFrame) {
        collector.addRule(`.monaco-editor .view-overlays .debug-focused-stack-frame-line { background: ${focusedStackFrame}; }`);
    }
});
