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
import * as nls from 'vs/nls';
import * as strings from 'vs/base/common/strings';
import { RunOnceScheduler } from 'vs/base/common/async';
import * as env from 'vs/base/common/platform';
import { visit } from 'vs/base/common/json';
import { setProperty } from 'vs/base/common/jsonEdit';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { distinct, flatten } from 'vs/base/common/arrays';
import { onUnexpectedExternalError } from 'vs/base/common/errors';
import { DEFAULT_WORD_REGEXP } from 'vs/editor/common/core/wordHelper';
import { Range } from 'vs/editor/common/core/range';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IDebugService, CONTEXT_EXCEPTION_WIDGET_VISIBLE } from 'vs/workbench/contrib/debug/common/debug';
import { ExceptionWidget } from 'vs/workbench/contrib/debug/browser/exceptionWidget';
import { Position } from 'vs/editor/common/core/position';
import { CoreEditingCommands } from 'vs/editor/browser/coreCommands';
import { memoize } from 'vs/base/common/decorators';
import { DebugHoverWidget } from 'vs/workbench/contrib/debug/browser/debugHover';
import { InjectedTextCursorStops } from 'vs/editor/common/model';
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { basename } from 'vs/base/common/path';
import { ModesHoverController } from 'vs/editor/contrib/hover/browser/hover';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { Event } from 'vs/base/common/event';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Expression } from 'vs/workbench/contrib/debug/common/debugModel';
import { registerColor } from 'vs/platform/theme/common/colorRegistry';
import { addDisposableListener } from 'vs/base/browser/dom';
import { DomEmitter } from 'vs/base/browser/event';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { ILanguageFeatureDebounceService } from 'vs/editor/common/services/languageFeatureDebounce';
const MAX_NUM_INLINE_VALUES = 100; // JS Global scope can have 700+ entries. We want to limit ourselves for perf reasons
const MAX_INLINE_DECORATOR_LENGTH = 150; // Max string length of each inline decorator when debugging. If exceeded ... is added
const MAX_TOKENIZATION_LINE_LEN = 500; // If line is too long, then inline values for the line are skipped
const DEAFULT_INLINE_DEBOUNCE_DELAY = 200;
export const debugInlineForeground = registerColor('editor.inlineValuesForeground', {
    dark: '#ffffff80',
    light: '#00000080',
    hcDark: '#ffffff80',
    hcLight: '#00000080'
}, nls.localize('editor.inlineValuesForeground', "Color for the debug inline value text."));
export const debugInlineBackground = registerColor('editor.inlineValuesBackground', {
    dark: '#ffc80033',
    light: '#ffc80033',
    hcDark: '#ffc80033',
    hcLight: '#ffc80033'
}, nls.localize('editor.inlineValuesBackground', "Color for the debug inline value background."));
class InlineSegment {
    column;
    text;
    constructor(column, text) {
        this.column = column;
        this.text = text;
    }
}
function createInlineValueDecoration(lineNumber, contentText, column = 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */) {
    // If decoratorText is too long, trim and add ellipses. This could happen for minified files with everything on a single line
    if (contentText.length > MAX_INLINE_DECORATOR_LENGTH) {
        contentText = contentText.substring(0, MAX_INLINE_DECORATOR_LENGTH) + '...';
    }
    return [
        {
            range: {
                startLineNumber: lineNumber,
                endLineNumber: lineNumber,
                startColumn: column,
                endColumn: column
            },
            options: {
                description: 'debug-inline-value-decoration-spacer',
                after: {
                    content: strings.noBreakWhitespace,
                    cursorStops: InjectedTextCursorStops.None
                },
                showIfCollapsed: true,
            }
        },
        {
            range: {
                startLineNumber: lineNumber,
                endLineNumber: lineNumber,
                startColumn: column,
                endColumn: column
            },
            options: {
                description: 'debug-inline-value-decoration',
                after: {
                    content: replaceWsWithNoBreakWs(contentText),
                    inlineClassName: 'debug-inline-value',
                    inlineClassNameAffectsLetterSpacing: true,
                    cursorStops: InjectedTextCursorStops.None
                },
                showIfCollapsed: true,
            }
        },
    ];
}
function replaceWsWithNoBreakWs(str) {
    return str.replace(/[ \t]/g, strings.noBreakWhitespace);
}
function createInlineValueDecorationsInsideRange(expressions, range, model, wordToLineNumbersMap) {
    const nameValueMap = new Map();
    for (const expr of expressions) {
        nameValueMap.set(expr.name, expr.value);
        // Limit the size of map. Too large can have a perf impact
        if (nameValueMap.size >= MAX_NUM_INLINE_VALUES) {
            break;
        }
    }
    const lineToNamesMap = new Map();
    // Compute unique set of names on each line
    nameValueMap.forEach((_value, name) => {
        const lineNumbers = wordToLineNumbersMap.get(name);
        if (lineNumbers) {
            for (const lineNumber of lineNumbers) {
                if (range.containsPosition(new Position(lineNumber, 0))) {
                    if (!lineToNamesMap.has(lineNumber)) {
                        lineToNamesMap.set(lineNumber, []);
                    }
                    if (lineToNamesMap.get(lineNumber).indexOf(name) === -1) {
                        lineToNamesMap.get(lineNumber).push(name);
                    }
                }
            }
        }
    });
    const decorations = [];
    // Compute decorators for each line
    lineToNamesMap.forEach((names, line) => {
        const contentText = names.sort((first, second) => {
            const content = model.getLineContent(line);
            return content.indexOf(first) - content.indexOf(second);
        }).map(name => `${name} = ${nameValueMap.get(name)}`).join(', ');
        decorations.push(...createInlineValueDecoration(line, contentText));
    });
    return decorations;
}
function getWordToLineNumbersMap(model) {
    const result = new Map();
    if (!model) {
        return result;
    }
    // For every word in every line, map its ranges for fast lookup
    for (let lineNumber = 1, len = model.getLineCount(); lineNumber <= len; ++lineNumber) {
        const lineContent = model.getLineContent(lineNumber);
        // If line is too long then skip the line
        if (lineContent.length > MAX_TOKENIZATION_LINE_LEN) {
            continue;
        }
        model.tokenization.forceTokenization(lineNumber);
        const lineTokens = model.tokenization.getLineTokens(lineNumber);
        for (let tokenIndex = 0, tokenCount = lineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
            const tokenType = lineTokens.getStandardTokenType(tokenIndex);
            // Token is a word and not a comment
            if (tokenType === 0 /* StandardTokenType.Other */) {
                DEFAULT_WORD_REGEXP.lastIndex = 0; // We assume tokens will usually map 1:1 to words if they match
                const tokenStartOffset = lineTokens.getStartOffset(tokenIndex);
                const tokenEndOffset = lineTokens.getEndOffset(tokenIndex);
                const tokenStr = lineContent.substring(tokenStartOffset, tokenEndOffset);
                const wordMatch = DEFAULT_WORD_REGEXP.exec(tokenStr);
                if (wordMatch) {
                    const word = wordMatch[0];
                    if (!result.has(word)) {
                        result.set(word, []);
                    }
                    result.get(word).push(lineNumber);
                }
            }
        }
    }
    return result;
}
let LazyDebugEditorContribution = class LazyDebugEditorContribution extends Disposable {
    _contrib;
    constructor(editor, instantiationService) {
        super();
        const listener = editor.onDidChangeModel(() => {
            if (editor.hasModel()) {
                listener.dispose();
                this._contrib = this._register(instantiationService.createInstance(DebugEditorContribution, editor));
            }
        });
    }
    showHover(position, focus) {
        return this._contrib ? this._contrib.showHover(position, focus) : Promise.resolve();
    }
    addLaunchConfiguration() {
        return this._contrib ? this._contrib.addLaunchConfiguration() : Promise.resolve();
    }
    closeExceptionWidget() {
        this._contrib?.closeExceptionWidget();
    }
};
LazyDebugEditorContribution = __decorate([
    __param(1, IInstantiationService)
], LazyDebugEditorContribution);
export { LazyDebugEditorContribution };
let DebugEditorContribution = class DebugEditorContribution {
    editor;
    debugService;
    instantiationService;
    commandService;
    configurationService;
    hostService;
    uriIdentityService;
    languageFeaturesService;
    toDispose;
    hoverWidget;
    hoverPosition = null;
    mouseDown = false;
    exceptionWidgetVisible;
    exceptionWidget;
    configurationWidget;
    altListener;
    altPressed = false;
    oldDecorations = this.editor.createDecorationsCollection();
    debounceInfo;
    constructor(editor, debugService, instantiationService, commandService, configurationService, hostService, uriIdentityService, contextKeyService, languageFeaturesService, featureDebounceService) {
        this.editor = editor;
        this.debugService = debugService;
        this.instantiationService = instantiationService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.hostService = hostService;
        this.uriIdentityService = uriIdentityService;
        this.languageFeaturesService = languageFeaturesService;
        this.debounceInfo = featureDebounceService.for(languageFeaturesService.inlineValuesProvider, 'InlineValues', { min: DEAFULT_INLINE_DEBOUNCE_DELAY });
        this.hoverWidget = this.instantiationService.createInstance(DebugHoverWidget, this.editor);
        this.toDispose = [];
        this.registerListeners();
        this.exceptionWidgetVisible = CONTEXT_EXCEPTION_WIDGET_VISIBLE.bindTo(contextKeyService);
        this.toggleExceptionWidget();
    }
    registerListeners() {
        this.toDispose.push(this.debugService.getViewModel().onDidFocusStackFrame(e => this.onFocusStackFrame(e.stackFrame)));
        // hover listeners & hover widget
        this.toDispose.push(this.editor.onMouseDown((e) => this.onEditorMouseDown(e)));
        this.toDispose.push(this.editor.onMouseUp(() => this.mouseDown = false));
        this.toDispose.push(this.editor.onMouseMove((e) => this.onEditorMouseMove(e)));
        this.toDispose.push(this.editor.onMouseLeave((e) => {
            const hoverDomNode = this.hoverWidget.getDomNode();
            if (!hoverDomNode) {
                return;
            }
            const rect = hoverDomNode.getBoundingClientRect();
            // Only hide the hover widget if the editor mouse leave event is outside the hover widget #3528
            if (e.event.posx < rect.left || e.event.posx > rect.right || e.event.posy < rect.top || e.event.posy > rect.bottom) {
                this.hideHoverWidget();
            }
        }));
        this.toDispose.push(this.editor.onKeyDown((e) => this.onKeyDown(e)));
        this.toDispose.push(this.editor.onDidChangeModelContent(() => {
            this._wordToLineNumbersMap = undefined;
            this.updateInlineValuesScheduler.schedule();
        }));
        this.toDispose.push(this.debugService.getViewModel().onWillUpdateViews(() => this.updateInlineValuesScheduler.schedule()));
        this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(() => this.updateInlineValuesScheduler.schedule()));
        this.toDispose.push(this.editor.onDidChangeModel(async () => {
            const stackFrame = this.debugService.getViewModel().focusedStackFrame;
            const model = this.editor.getModel();
            if (model) {
                this.applyHoverConfiguration(model, stackFrame);
            }
            this.toggleExceptionWidget();
            this.hideHoverWidget();
            this._wordToLineNumbersMap = undefined;
            await this.updateInlineValueDecorations(stackFrame);
        }));
        this.toDispose.push(this.editor.onDidScrollChange(() => {
            this.hideHoverWidget();
            // Inline value provider should get called on view port change
            const model = this.editor.getModel();
            if (model && this.languageFeaturesService.inlineValuesProvider.has(model)) {
                this.updateInlineValuesScheduler.schedule();
            }
        }));
        this.toDispose.push(this.debugService.onDidChangeState((state) => {
            if (state !== 2 /* State.Stopped */) {
                this.toggleExceptionWidget();
            }
        }));
    }
    _wordToLineNumbersMap = undefined;
    get wordToLineNumbersMap() {
        if (!this._wordToLineNumbersMap) {
            this._wordToLineNumbersMap = getWordToLineNumbersMap(this.editor.getModel());
        }
        return this._wordToLineNumbersMap;
    }
    applyHoverConfiguration(model, stackFrame) {
        if (stackFrame && this.uriIdentityService.extUri.isEqual(model.uri, stackFrame.source.uri)) {
            if (this.altListener) {
                this.altListener.dispose();
            }
            // When the alt key is pressed show regular editor hover and hide the debug hover #84561
            this.altListener = addDisposableListener(document, 'keydown', keydownEvent => {
                const standardKeyboardEvent = new StandardKeyboardEvent(keydownEvent);
                if (standardKeyboardEvent.keyCode === 6 /* KeyCode.Alt */) {
                    this.altPressed = true;
                    const debugHoverWasVisible = this.hoverWidget.isVisible();
                    this.hoverWidget.hide();
                    this.enableEditorHover();
                    if (debugHoverWasVisible && this.hoverPosition) {
                        // If the debug hover was visible immediately show the editor hover for the alt transition to be smooth
                        const hoverController = this.editor.getContribution(ModesHoverController.ID);
                        const range = new Range(this.hoverPosition.lineNumber, this.hoverPosition.column, this.hoverPosition.lineNumber, this.hoverPosition.column);
                        hoverController?.showContentHover(range, 1 /* HoverStartMode.Immediate */, 0 /* HoverStartSource.Mouse */, false);
                    }
                    const onKeyUp = new DomEmitter(document, 'keyup');
                    const listener = Event.any(this.hostService.onDidChangeFocus, onKeyUp.event)(keyupEvent => {
                        let standardKeyboardEvent = undefined;
                        if (keyupEvent instanceof KeyboardEvent) {
                            standardKeyboardEvent = new StandardKeyboardEvent(keyupEvent);
                        }
                        if (!standardKeyboardEvent || standardKeyboardEvent.keyCode === 6 /* KeyCode.Alt */) {
                            this.altPressed = false;
                            this.editor.updateOptions({ hover: { enabled: false } });
                            listener.dispose();
                            onKeyUp.dispose();
                        }
                    });
                }
            });
            this.editor.updateOptions({ hover: { enabled: false } });
        }
        else {
            this.altListener?.dispose();
            this.enableEditorHover();
        }
    }
    enableEditorHover() {
        if (this.editor.hasModel()) {
            const model = this.editor.getModel();
            const overrides = {
                resource: model.uri,
                overrideIdentifier: model.getLanguageId()
            };
            const defaultConfiguration = this.configurationService.getValue('editor.hover', overrides);
            this.editor.updateOptions({
                hover: {
                    enabled: defaultConfiguration.enabled,
                    delay: defaultConfiguration.delay,
                    sticky: defaultConfiguration.sticky
                }
            });
        }
    }
    async showHover(position, focus) {
        const sf = this.debugService.getViewModel().focusedStackFrame;
        const model = this.editor.getModel();
        if (sf && model && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri) && !this.altPressed) {
            return this.hoverWidget.showAt(position, focus);
        }
    }
    async onFocusStackFrame(sf) {
        const model = this.editor.getModel();
        if (model) {
            this.applyHoverConfiguration(model, sf);
            if (sf && this.uriIdentityService.extUri.isEqual(sf.source.uri, model.uri)) {
                await this.toggleExceptionWidget();
            }
            else {
                this.hideHoverWidget();
            }
        }
        await this.updateInlineValueDecorations(sf);
    }
    get showHoverScheduler() {
        const hoverOption = this.editor.getOption(54 /* EditorOption.hover */);
        const scheduler = new RunOnceScheduler(() => {
            if (this.hoverPosition) {
                this.showHover(this.hoverPosition, false);
            }
        }, hoverOption.delay * 2);
        this.toDispose.push(scheduler);
        return scheduler;
    }
    get hideHoverScheduler() {
        const scheduler = new RunOnceScheduler(() => {
            if (!this.hoverWidget.isHovered()) {
                this.hoverWidget.hide();
            }
        }, 0);
        this.toDispose.push(scheduler);
        return scheduler;
    }
    hideHoverWidget() {
        if (!this.hideHoverScheduler.isScheduled() && this.hoverWidget.willBeVisible()) {
            this.hideHoverScheduler.schedule();
        }
        this.showHoverScheduler.cancel();
    }
    // hover business
    onEditorMouseDown(mouseEvent) {
        this.mouseDown = true;
        if (mouseEvent.target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && mouseEvent.target.detail === DebugHoverWidget.ID) {
            return;
        }
        this.hideHoverWidget();
    }
    onEditorMouseMove(mouseEvent) {
        if (this.debugService.state !== 2 /* State.Stopped */) {
            return;
        }
        const target = mouseEvent.target;
        const stopKey = env.isMacintosh ? 'metaKey' : 'ctrlKey';
        if (target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && target.detail === DebugHoverWidget.ID && !mouseEvent.event[stopKey]) {
            // mouse moved on top of debug hover widget
            return;
        }
        if (target.type === 6 /* MouseTargetType.CONTENT_TEXT */) {
            if (target.position && !Position.equals(target.position, this.hoverPosition)) {
                this.hoverPosition = target.position;
                this.hideHoverScheduler.cancel();
                this.showHoverScheduler.schedule();
            }
        }
        else if (!this.mouseDown) {
            // Do not hide debug hover when the mouse is pressed because it usually leads to accidental closing #64620
            this.hideHoverWidget();
        }
    }
    onKeyDown(e) {
        const stopKey = env.isMacintosh ? 57 /* KeyCode.Meta */ : 5 /* KeyCode.Ctrl */;
        if (e.keyCode !== stopKey) {
            // do not hide hover when Ctrl/Meta is pressed
            this.hideHoverWidget();
        }
    }
    // end hover business
    // exception widget
    async toggleExceptionWidget() {
        // Toggles exception widget based on the state of the current editor model and debug stack frame
        const model = this.editor.getModel();
        const focusedSf = this.debugService.getViewModel().focusedStackFrame;
        const callStack = focusedSf ? focusedSf.thread.getCallStack() : null;
        if (!model || !focusedSf || !callStack || callStack.length === 0) {
            this.closeExceptionWidget();
            return;
        }
        // First call stack frame that is available is the frame where exception has been thrown
        const exceptionSf = callStack.find(sf => !!(sf && sf.source && sf.source.available && sf.source.presentationHint !== 'deemphasize'));
        if (!exceptionSf || exceptionSf !== focusedSf) {
            this.closeExceptionWidget();
            return;
        }
        const sameUri = this.uriIdentityService.extUri.isEqual(exceptionSf.source.uri, model.uri);
        if (this.exceptionWidget && !sameUri) {
            this.closeExceptionWidget();
        }
        else if (sameUri) {
            const exceptionInfo = await focusedSf.thread.exceptionInfo;
            if (exceptionInfo) {
                this.showExceptionWidget(exceptionInfo, this.debugService.getViewModel().focusedSession, exceptionSf.range.startLineNumber, exceptionSf.range.startColumn);
            }
        }
    }
    showExceptionWidget(exceptionInfo, debugSession, lineNumber, column) {
        if (this.exceptionWidget) {
            this.exceptionWidget.dispose();
        }
        this.exceptionWidget = this.instantiationService.createInstance(ExceptionWidget, this.editor, exceptionInfo, debugSession);
        this.exceptionWidget.show({ lineNumber, column }, 0);
        this.exceptionWidget.focus();
        this.editor.revealRangeInCenter({
            startLineNumber: lineNumber,
            startColumn: column,
            endLineNumber: lineNumber,
            endColumn: column,
        });
        this.exceptionWidgetVisible.set(true);
    }
    closeExceptionWidget() {
        if (this.exceptionWidget) {
            const shouldFocusEditor = this.exceptionWidget.hasFocus();
            this.exceptionWidget.dispose();
            this.exceptionWidget = undefined;
            this.exceptionWidgetVisible.set(false);
            if (shouldFocusEditor) {
                this.editor.focus();
            }
        }
    }
    async addLaunchConfiguration() {
        const model = this.editor.getModel();
        if (!model) {
            return;
        }
        let configurationsArrayPosition;
        let lastProperty;
        const getConfigurationPosition = () => {
            let depthInArray = 0;
            visit(model.getValue(), {
                onObjectProperty: (property) => {
                    lastProperty = property;
                },
                onArrayBegin: (offset) => {
                    if (lastProperty === 'configurations' && depthInArray === 0) {
                        configurationsArrayPosition = model.getPositionAt(offset + 1);
                    }
                    depthInArray++;
                },
                onArrayEnd: () => {
                    depthInArray--;
                }
            });
        };
        getConfigurationPosition();
        if (!configurationsArrayPosition) {
            // "configurations" array doesn't exist. Add it here.
            const { tabSize, insertSpaces } = model.getOptions();
            const eol = model.getEOL();
            const edit = (basename(model.uri.fsPath) === 'launch.json') ?
                setProperty(model.getValue(), ['configurations'], [], { tabSize, insertSpaces, eol })[0] :
                setProperty(model.getValue(), ['launch'], { 'configurations': [] }, { tabSize, insertSpaces, eol })[0];
            const startPosition = model.getPositionAt(edit.offset);
            const lineNumber = startPosition.lineNumber;
            const range = new Range(lineNumber, startPosition.column, lineNumber, model.getLineMaxColumn(lineNumber));
            model.pushEditOperations(null, [EditOperation.replace(range, edit.content)], () => null);
            // Go through the file again since we've edited it
            getConfigurationPosition();
        }
        if (!configurationsArrayPosition) {
            return;
        }
        this.editor.focus();
        const insertLine = (position) => {
            // Check if there are more characters on a line after a "configurations": [, if yes enter a newline
            if (model.getLineLastNonWhitespaceColumn(position.lineNumber) > position.column) {
                this.editor.setPosition(position);
                CoreEditingCommands.LineBreakInsert.runEditorCommand(null, this.editor, null);
            }
            this.editor.setPosition(position);
            return this.commandService.executeCommand('editor.action.insertLineAfter');
        };
        await insertLine(configurationsArrayPosition);
        await this.commandService.executeCommand('editor.action.triggerSuggest');
    }
    // Inline Decorations
    get removeInlineValuesScheduler() {
        return new RunOnceScheduler(() => {
            this.oldDecorations.clear();
        }, 100);
    }
    get updateInlineValuesScheduler() {
        const model = this.editor.getModel();
        return new RunOnceScheduler(async () => await this.updateInlineValueDecorations(this.debugService.getViewModel().focusedStackFrame), model ? this.debounceInfo.get(model) : DEAFULT_INLINE_DEBOUNCE_DELAY);
    }
    async updateInlineValueDecorations(stackFrame) {
        const var_value_format = '{0} = {1}';
        const separator = ', ';
        const model = this.editor.getModel();
        const inlineValuesSetting = this.configurationService.getValue('debug').inlineValues;
        const inlineValuesTurnedOn = inlineValuesSetting === true || inlineValuesSetting === 'on' || (inlineValuesSetting === 'auto' && model && this.languageFeaturesService.inlineValuesProvider.has(model));
        if (!inlineValuesTurnedOn || !model || !stackFrame || model.uri.toString() !== stackFrame.source.uri.toString()) {
            if (!this.removeInlineValuesScheduler.isScheduled()) {
                this.removeInlineValuesScheduler.schedule();
            }
            return;
        }
        this.removeInlineValuesScheduler.cancel();
        let allDecorations;
        if (this.languageFeaturesService.inlineValuesProvider.has(model)) {
            const findVariable = async (_key, caseSensitiveLookup) => {
                const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
                const key = caseSensitiveLookup ? _key : _key.toLowerCase();
                for (const scope of scopes) {
                    const variables = await scope.getChildren();
                    const found = variables.find(v => caseSensitiveLookup ? (v.name === key) : (v.name.toLowerCase() === key));
                    if (found) {
                        return found.value;
                    }
                }
                return undefined;
            };
            const ctx = {
                frameId: stackFrame.frameId,
                stoppedLocation: new Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1, stackFrame.range.endLineNumber, stackFrame.range.endColumn + 1)
            };
            const token = new CancellationTokenSource().token;
            const ranges = this.editor.getVisibleRangesPlusViewportAboveBelow();
            const providers = this.languageFeaturesService.inlineValuesProvider.ordered(model).reverse();
            allDecorations = [];
            const lineDecorations = new Map();
            const promises = flatten(providers.map(provider => ranges.map(range => Promise.resolve(provider.provideInlineValues(model, range, ctx, token)).then(async (result) => {
                if (result) {
                    for (const iv of result) {
                        let text = undefined;
                        switch (iv.type) {
                            case 'text':
                                text = iv.text;
                                break;
                            case 'variable': {
                                let va = iv.variableName;
                                if (!va) {
                                    const lineContent = model.getLineContent(iv.range.startLineNumber);
                                    va = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                                }
                                const value = await findVariable(va, iv.caseSensitiveLookup);
                                if (value) {
                                    text = strings.format(var_value_format, va, value);
                                }
                                break;
                            }
                            case 'expression': {
                                let expr = iv.expression;
                                if (!expr) {
                                    const lineContent = model.getLineContent(iv.range.startLineNumber);
                                    expr = lineContent.substring(iv.range.startColumn - 1, iv.range.endColumn - 1);
                                }
                                if (expr) {
                                    const expression = new Expression(expr);
                                    await expression.evaluate(stackFrame.thread.session, stackFrame, 'watch', true);
                                    if (expression.available) {
                                        text = strings.format(var_value_format, expr, expression.value);
                                    }
                                }
                                break;
                            }
                        }
                        if (text) {
                            const line = iv.range.startLineNumber;
                            let lineSegments = lineDecorations.get(line);
                            if (!lineSegments) {
                                lineSegments = [];
                                lineDecorations.set(line, lineSegments);
                            }
                            if (!lineSegments.some(iv => iv.text === text)) { // de-dupe
                                lineSegments.push(new InlineSegment(iv.range.startColumn, text));
                            }
                        }
                    }
                }
            }, err => {
                onUnexpectedExternalError(err);
            }))));
            const startTime = Date.now();
            await Promise.all(promises);
            // update debounce info
            this.updateInlineValuesScheduler.delay = this.debounceInfo.update(model, Date.now() - startTime);
            // sort line segments and concatenate them into a decoration
            lineDecorations.forEach((segments, line) => {
                if (segments.length > 0) {
                    segments = segments.sort((a, b) => a.column - b.column);
                    const text = segments.map(s => s.text).join(separator);
                    allDecorations.push(...createInlineValueDecoration(line, text));
                }
            });
        }
        else {
            // old "one-size-fits-all" strategy
            const scopes = await stackFrame.getMostSpecificScopes(stackFrame.range);
            // Get all top level variables in the scope chain
            const decorationsPerScope = await Promise.all(scopes.map(async (scope) => {
                const variables = await scope.getChildren();
                let range = new Range(0, 0, stackFrame.range.startLineNumber, stackFrame.range.startColumn);
                if (scope.range) {
                    range = range.setStartPosition(scope.range.startLineNumber, scope.range.startColumn);
                }
                return createInlineValueDecorationsInsideRange(variables, range, model, this.wordToLineNumbersMap);
            }));
            allDecorations = distinct(decorationsPerScope.reduce((previous, current) => previous.concat(current), []), 
            // Deduplicate decorations since same variable can appear in multiple scopes, leading to duplicated decorations #129770
            decoration => `${decoration.range.startLineNumber}:${decoration?.options.after?.content}`);
        }
        this.oldDecorations.set(allDecorations);
    }
    dispose() {
        if (this.hoverWidget) {
            this.hoverWidget.dispose();
        }
        if (this.configurationWidget) {
            this.configurationWidget.dispose();
        }
        this.toDispose = dispose(this.toDispose);
        this.oldDecorations.clear();
    }
};
__decorate([
    memoize
], DebugEditorContribution.prototype, "showHoverScheduler", null);
__decorate([
    memoize
], DebugEditorContribution.prototype, "hideHoverScheduler", null);
__decorate([
    memoize
], DebugEditorContribution.prototype, "removeInlineValuesScheduler", null);
__decorate([
    memoize
], DebugEditorContribution.prototype, "updateInlineValuesScheduler", null);
DebugEditorContribution = __decorate([
    __param(1, IDebugService),
    __param(2, IInstantiationService),
    __param(3, ICommandService),
    __param(4, IConfigurationService),
    __param(5, IHostService),
    __param(6, IUriIdentityService),
    __param(7, IContextKeyService),
    __param(8, ILanguageFeaturesService),
    __param(9, ILanguageFeatureDebounceService)
], DebugEditorContribution);
export { DebugEditorContribution };
